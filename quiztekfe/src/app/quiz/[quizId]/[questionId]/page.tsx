"use client";
import React, {use, useEffect, useState } from "react";
import Link from "next/link";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

function Page(props) {
    const { questionId, quizId } = use(props.params);
    const [question, setQuestion] = useState([]);
    const [userAnswer, setUserAnswer] = useState("");
    const [questionIds, setQuestionIds] = useState([]);

    const fetchQuestionIds = async () => {
        try {
            const res = await fetch(`${apiBaseUrl}/quiz/question/${quizId}`);
            if (!res.ok) {
                throw new Error("Failed to fetch question IDs");
            }
            const data = await res.json();
            setQuestionIds(data);
        } catch (err) {
            console.error("Error fetching question ids:", err);
        }
    };

    const fetchQuestion = async () => {
        try {
            const res = await fetch(`${apiBaseUrl}/question/${questionId}`);
            if (!res.ok) {
                throw new Error("Failed to fetch question details");
            }
            const data = await res.json();
            setQuestion(data);
        } catch (err) {
            console.error("Error fetching question details:", err);
        }
    };

    const fetchAnswer = async () => {
        const attemptId = sessionStorage.getItem("attempt_id");
        if (!attemptId) return;
        try {
            const res = await fetch(
                `${apiBaseUrl}/submission/${attemptId}/${questionId}`
            );
            const data = await res.json();
            if (data && Object.keys(data).length > 0) {
                if (question.type === "tf") {
                    setUserAnswer(data.answer_tf ? "true" : "false");
                } else if (question.type === "mc") {
                    setUserAnswer(data.correct_choice?.toString() || "");
                } else if (question.type === "fib") {
                    setUserAnswer(data.correct_answers ? data.correct_answers.join(",") : "");
                }
            } else {
                setUserAnswer("");
            }
        } catch (error) {
            console.error("Error fetching answer:", error);
        }
    };

    useEffect(() => {
        fetchQuestionIds();
        fetchQuestion();
    }, []);

    useEffect(() => {
        if (question && question.type) {
            fetchAnswer();
        }
    }, [question]);

    const submitAnswer = async (answerValue) => {
        const attemptId = sessionStorage.getItem("attempt_id");
        if (!attemptId) {
            console.error("No attempt ID found");
            return;
        }
        let payload = {
            question_id: questionId,
            answer_tf: null,
            correct_choice: null,
            correct_answers: null,
        };

        if (question && question.type === "tf") {
            payload.answer_tf = answerValue === "true";
        } else if (question && question.type === "mc") {
            payload.correct_choice = parseInt(answerValue, 10);
        } else if (question && question.type === "fib") {
            payload.correct_answers = answerValue.split(",").map((ans) => ans.trim());
        }

        try {
            const res = await fetch(`${apiBaseUrl}/submission/answer/${attemptId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });
            if (!res.ok) {
                throw new Error("Failed to update answer");
            }
            console.log("Answer updated");
        } catch (error) {
            console.error("Error updating answer:", error);
        }
    };

    const handleAnswerChange = (value) => {
        setUserAnswer(value);
        submitAnswer(value);
    };

    const handleFibChange = (e) => {
        const value = e.target.value;
        setUserAnswer(value);
        submitAnswer(value);
    };

    const finishQuiz = async () => {
        const attemptId = sessionStorage.getItem("attempt_id");
        if (!attemptId) {
            console.error("No attempt ID found");
            return;
        }
        try {
            const res = await fetch(`${apiBaseUrl}/submission/attempt/complete/${attemptId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                }
            });
            if (!res.ok) {
                throw new Error("Failed to finish quiz");
            }
            sessionStorage.removeItem("attempt_id");
            window.location.href = `/quiz/${quizId}`;
        } catch (error) {
            console.error("Error finishing quiz:", error);
        }
    };


    return (
        <div className="w-[80%] mx-auto p-4">
            <div className="grid grid-cols-20 w-max mx-auto gap-2 mt-5 mb-10">
                {questionIds && questionIds.length > 0
                    ? questionIds.map((qid, index) => (
                        <Link
                            key={index}
                            href={`/quiz/${quizId}/${qid}`}
                            className="border-3 border-[#5038bc] rounded-md text-xl size-10 p-1 text-center font-medium"
                            onClick={() => submitAnswer(userAnswer)}
                        >
                            {index + 1}
                        </Link>
                    ))
                    : ""}
            </div>
            <div className="flex justify-between mb-2">
                <div className="text-3xl font-bold">
                    Question {question.position}
                </div>
                <button
                    type="button"
                    className="rounded bg-[#5038bc] text-white p-2 px-4"
                    onClick={finishQuiz}
                >
                    Finish Quiz
                </button>
            </div>
            <div className="mb-6">
                <p className="text-xl">{question.message}</p>
            </div>
            <form>
                {question.type === "tf" && (
                    <div className="mb-4 text-lg">
                        <label className="mr-4">
                            <input
                                type="radio"
                                name="tf"
                                value="true"
                                checked={userAnswer === "true"}
                                onChange={() => handleAnswerChange("true")}
                                className="mx-3"
                            />
                            True
                        </label>
                        <label>
                            <input
                                type="radio"
                                name="tf"
                                value="false"
                                checked={userAnswer === "false"}
                                onChange={() => handleAnswerChange("false")}
                                className="mx-3"
                            />
                            False
                        </label>
                    </div>
                )}
                {question.type === "mc" && (
                    <div className="mb-4">
                        {question.choices &&
                            question.choices.map((choice, index) => (
                                <div key={index}>
                                    <label className="text-lg">
                                        <input
                                            type="radio"
                                            name="mc"
                                            value={index}
                                            checked={userAnswer === index.toString()}
                                            onChange={() => handleAnswerChange(index.toString())}
                                            className="mx-3"
                                        />
                                        {choice}
                                    </label>
                                </div>
                            ))}
                    </div>
                )}
                {question.type === "fib" && (
                    <div className="mb-4">
                        <p className="mb-2">
                            Fill in the blanks where "_" appears in the question above. Format: answer1, answer2, ...
                        </p>
                        <input
                            type="text"
                            value={userAnswer}
                            onChange={handleFibChange}
                            className="border rounded p-2 w-full"
                            placeholder="answer1, answer2, ..."
                        />
                    </div>
                )}
            </form>
        </div>
    );
}

export default Page;
