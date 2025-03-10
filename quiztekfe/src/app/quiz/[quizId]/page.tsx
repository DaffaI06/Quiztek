"use client";
import React, {use, useEffect, useState } from "react";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

function Page(props) {
    const { quizId } = use(props.params);
    const [questionIds, setQuestionIds] = useState([]);
    const [latestSubs, setLatestSubs] = useState([]);


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

    const fetchLatestSubmissions = async () => {
        try {
            const res = await fetch(`${apiBaseUrl}/submission/latest/${quizId}`);
            if (!res.ok) {
                setLatestSubs([]);
                return;
            }
            const data = await res.json();
            setLatestSubs(data);
        } catch (err) {
            console.error("Error fetching latest submissions:", err);
            setLatestSubs([]);
        }
    };

    useEffect(() => {
        fetchQuestionIds();
        fetchLatestSubmissions();
    }, [quizId]);

    const handleStart = async () => {
        try {
            const res = await fetch(`${apiBaseUrl}/submission/attempt/${quizId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            if (!res.ok) {
                throw new Error("Failed to send request");
            }
            const data = await res.json();
            sessionStorage.setItem("attempt_id", data.attempt_id);
            window.location.href = `/quiz/${quizId}/${questionIds[0]}`;
        } catch (err) {
            console.log("Error starting quiz:", err);
        }
    };

    return (
        <div className="mt-40 content-center flex flex-col justify-center">
            {questionIds && questionIds.length > 0 ? (
                <button
                    onClick={handleStart}
                    className="flex w-max mx-auto my-auto text-2xl bg-[#5038bc] rounded text-white p-2 px-6 cursor-pointer"
                >
                    Start Quiz
                </button>
            ) : (
                "Error!"
            )}
            <div className="mt-10 mx-auto w-max">
                <h2 className="text-2xl font-bold mb-4 text-center">Latest Submissions</h2>
                {latestSubs && latestSubs.length > 0 ? (
                    latestSubs.map((sub, index) => (
                        <div key={index} className="mb-2 text-lg">
                            {sub.completed_at} - {sub.score}/{sub.total} Correct
                        </div>
                    ))
                ) : (
                    <div>No submissions yet.</div>
                )}
            </div>
        </div>
    );
}

export default Page;
