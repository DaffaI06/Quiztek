"use client";
import React, { use, useEffect, useState } from 'react';
import Link from "next/link";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

function Page(props) {
    const { questionId, quizId } = use(props.params);
    const [question, setQuestion] = useState({});
    const [type, setType] = useState("");
    const [message, setMessage] = useState("");
    const [answerTF, setAnswerTF] = useState(false);
    const [choices, setChoices] = useState("");
    const [correctChoice, setCorrectChoice] = useState("");
    const [correctAnswers, setCorrectAnswers] = useState("");

    useEffect(() => {
        fetchQuestion();
    }, []);

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

    const renderCurrentDetails = () => {
        switch (question.type) {
            case "tf":
                return (
                    <div className="">
                        <div className="text-xl font-bold">Current Details (True/False):</div>
                        <div><strong>Message:</strong> {question.message}</div>
                        <div><strong>Answer:</strong> {question.answer_tf ? "True" : "False"}</div>
                    </div>
                );
            case "mc":
                return (
                    <div>
                        <div className="text-xl font-bold">Current Details (Multiple Choice):</div>
                        <div><strong>Message:</strong> {question.message}</div>
                        <div>
                            <strong>Choices:</strong>
                            {" "}{question.choices ? question.choices.join(", ") : ""}
                        </div>
                        <div>
                            <strong>Correct Choice:</strong>
                            {" "}{question.correct_choice}{" "}
                            {question.choices &&
                            question.correct_choice != null &&
                            question.choices[question.correct_choice]
                                ? `- ${question.choices[question.correct_choice]}`
                                : ""}
                        </div>
                    </div>
                );
            case "fib":
                return (
                    <div>
                        <div className="text-xl font-bold">Current Details (Fill in the Blank):</div>
                        <div>
                            <strong>Message:</strong> {question.message}
                        </div>
                        <div>
                            <strong>Correct Answers:</strong>{" "}
                            {question.correct_answers ? question.correct_answers.join(", ") : ""}
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const data: any = {};
        data.type = type.trim();
        data.message = message.trim();
        if (data.type === "") data.type = question.type;
        if (data.message === "") data.message = question.message;

        if (data.type === "tf") {
            data.answer_tf = answerTF;
        } else if (data.type === "mc") {
            data.choices = choices
                .split(",")
                .map((choice: string) => choice.trim())
                .filter((choice: string) => choice !== "");
            data.correct_choice = parseInt(correctChoice, 10);
        } else if (data.type === "fib") {
            data.correct_answers = correctAnswers
                .split(",")
                .map((ans: string) => ans.trim())
                .filter((ans: string) => ans !== "");
        }

        try {
            const res = await fetch(`${apiBaseUrl}/question/edit/${questionId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                console.log(questionId)
                throw new Error("Failed to update question");
            }

            console.log("Question updated successfully");
            fetchQuestion()
        } catch (error) {
            console.error("Error updating question:", error);
        }
    };


    useEffect(() => {
        if (question && Object.keys(question).length > 0) {
            setType(question.type || ""); // only allows string
            setMessage(question.message || ""); // only allows string
            setAnswerTF(question.answer_tf ?? false); // allows 0 and false
            setChoices(question.choices?.join(", ") || ""); // sets errors to undefined
            setCorrectChoice(question.correct_choice?.toString() || ""); // sets errors to undefined
            setCorrectAnswers(question.correct_answers?.join(", ") || ""); // sets errors to undefined
        }
    }, [question]);

    const handleDelete = async () => {
        try {
            const response = await fetch(`${apiBaseUrl}/question/delete/${questionId}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                window.location.href = `/edit/${quizId}`;
            } else {
                console.error('Failed to delete question');
            }
        } catch (error) {
            console.error('Error deleting question:', error);
        }
    };

    return (
        <div className="w-[85%] mx-auto p-4">
            <h1 className="text-3xl font-bold mb-4">Edit Question. {question.position}</h1>
            <div className="mb-6 p-4 border rounded">{renderCurrentDetails()}</div>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <label className="text-xl font-medium">Question Type</label>
                <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="border rounded p-2"
                >
                    <option value="tf">True/False</option>
                    <option value="mc">Multiple Choice</option>
                    <option value="fib">Fill in the Blank</option>
                </select>

                {/* <>, kalau <div> harus di flex col*/}
                {type === "tf" && (
                    <>
                        <label className="text-xl font-medium">Message</label>
                        <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="border rounded p-2"
                            placeholder="Is water wet?"
                        />
                        <label className="text-xl font-medium">Answer (True/False)</label>
                        <select
                            value={answerTF ? "true" : "false"}
                            onChange={(e) => setAnswerTF(e.target.value === "true")}
                            className="border rounded p-2"
                        >
                            <option value="true">True</option>
                            <option value="false">False</option>
                        </select>
                    </>
                )}

                {type === "mc" && (
                    <>
                        <label className="text-xl font-medium">Message</label>
                        <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="border rounded p-2"
                            placeholder="Which is true?"
                        />
                        <label className="text-xl font-medium">
                            Choices (seperated by commas)
                        </label>
                        <input
                            type="text"
                            value={choices}
                            onChange={(e) => setChoices(e.target.value)}
                            className="border rounded p-2"
                            placeholder="Answer1, Answer2, Answer3"
                        />

                        <label className="text-xl font-medium">
                            Correct Choice (index, starting from 0)
                        </label>
                        <input
                            type="number"
                            value={correctChoice}
                            onChange={(e) => setCorrectChoice(e.target.value)}
                            className="border rounded p-2"
                            placeholder="Type 0 for option 1, 1 for option 2, ..."
                        />
                    </>
                )}

                {type === "fib" && (
                    <>
                        <label className="text-xl font-medium">Message (mark blanks with _)</label>
                        <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="border rounded p-2"
                            placeholder="France is in the continent _, it's capital is _"
                        />
                        <label className="text-xl font-medium">
                            Correct Answers (Seperated by commas)
                        </label>
                        <input
                            type="text"
                            value={correctAnswers}
                            onChange={(e) => setCorrectAnswers(e.target.value)}
                            className="border rounded p-2"
                            placeholder="Europe, Paris"
                        />
                    </>
                )}
                <div className="flex justify-between">
                    <button
                        type="submit"
                        className="bg-[#5038bc] text-white p-3 rounded cursor-pointer"
                    >
                        Save Changes
                    </button>
                    <Link
                        href={`/edit/${question.quiz_id}`}
                        className="border-[#5038bc] border-3 p-3 px-7 rounded cursor-pointer"
                    >
                        Back
                    </Link>
                    <button
                        type="button"
                        onClick={handleDelete}
                        className="text-white bg-red-500 p-3 rounded cursor-pointer"
                    >
                        Delete Question
                    </button>
                </div>
            </form>
        </div>
    );
}

export default Page;
