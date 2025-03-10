"use client";
import React, {use, useEffect, useState} from 'react';
import Link from "next/link";
import {Plus} from "lucide-react";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

function Page(props) {
    const { quizId } = use(props.params)
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('');
    const [quizDetail, setQuizDetail] = useState([]);
    const [questionIds,setQuestionIds] = useState([]);



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

    const fetchQuizDetail = async () => {
        try {
            const res = await fetch(`${apiBaseUrl}/quiz/${quizId}`);
            if (!res.ok) {
                throw new Error("Failed to fetch quiz details");
            }
            const data = await res.json();
            setQuizDetail(data);
        } catch (err) {
            console.error("Error fetching quiz details:", err);
        }
    };

    useEffect(() => {
        fetchQuestionIds()
        fetchQuizDetail()
    }, []);

    const handleSubmitChanges = async (e) => {
        e.preventDefault();

        const data = {};
        data.title = title.trim()
        data.category = category.trim()
        if (data.title === '') data.title = quizDetail.title;
        if (data.category === '') data.category = quizDetail.category;

        try {
            const res = await fetch(`${apiBaseUrl}/quiz/edit/${quizId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                throw new Error('Failed to update quiz');
            }

            console.log('Quiz updated successfully');
            fetchQuizDetail();

        } catch (error) {
            console.error('Error updating quiz:', error);
        }
    };

    const handleClickCreateQuestion = async () => {
        try {
            const response = await fetch(`${apiBaseUrl}/question/create/${quizId}`, {
                method: "POST",
            });

            if (!response.ok) {
                throw new Error("Failed to send request");
            }

            console.log("Question added successfully!");
            fetchQuestionIds()
        } catch (error) {
            console.error("Error adding question:", error);
        }
    };



    return (
        <div>
            <div className="flex flex-col mt-16 mb-20 gap-2">
                <div className="text-7xl font-semibold text-center">{quizDetail.title}</div>
                <div className="text-4xl text-slate-500 font-medium text-center">Category: {quizDetail.category}</div>
            </div>

            <form id="create_form" onSubmit={handleSubmitChanges} className="flex justify-center mt-20">
                <div className="flex flex-col gap-3 w-[30%]">
                    <div className="text-4xl font-medium">Change title</div>
                    <input
                        id="title"
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="border-3 border-[#5038bc] rounded-sm bg-white w-full h-12 px-3 text-xl"
                    />
                    <label className="text-4xl font-medium">Change category</label>
                    <div
                        id="category"
                        type="text"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="border-3 border-[#5038bc] rounded-sm bg-white w-full h-12 px-3 text-xl"
                    />
                    <button
                        type="submit"
                        className="text-white bg-[#5038bc] p-2 w-full text-2xl rounded-md cursor-pointer"
                    >
                        Save Changes
                    </button>
                </div>
            </form>

            <div className="flex flex-col justify-center gap-10 mt-20">
                <div className="grid grid-cols-10 w-max mx-auto gap-2">
                    {questionIds && questionIds.length > 0 ? (questionIds.map((question_id, index) => (
                        <Link className="border-3 border-[#5038bc] rounded-md text-3xl
                                size-14 text-center p-2 font-medium"
                              key={index}
                              href={`/edit/${quizId}/${question_id}`}
                        >
                            {index + 1}
                        </Link>
                    ))) : ""}
                    <button onClick={handleClickCreateQuestion}>
                        <Plus className="bg-[#5038bc] rounded-md size-14 p-2 cursor-pointer" color="#ffffff"/>
                    </button>
                </div>
                {questionIds && questionIds.length > 0 ? (
                    <Link
                        href={`/edit/${quizId}/${questionIds[0]}`}
                        className="text-center text-white bg-[#5038bc] p-2 w-[20%] mx-auto text-2xl rounded-md cursor-pointer">
                        Edit Questions...
                    </Link>
                ) : ""}

                <Link href="/"
                      className="mx-auto border-[#5038bc] border-3 p-2 w-[20%] text-2xl rounded-md text-center cursor-pointer"
                >
                    Back
                </Link>
            </div>
        </div>
    );
}

export default Page;