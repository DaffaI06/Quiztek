"use client";
import React, {use, useEffect, useState} from 'react';
import Link from "next/link";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

function Page(props) {
    const { quizId } = use(props.params)
    const [quizDetail, setQuizDetail] = useState([]);
    useEffect(() => {
        fetch(`${apiBaseUrl}/quiz/${quizId}`)
            .then((res) => res.json())
            .then((data) => setQuizDetail(data))
            .catch((err) => console.error("Error fetching quiz details:", err));
    }, []);

    const formattedDate = new Date(quizDetail.created_at).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
    return (
        <div>
            <div className="mt-20 mx-auto w-[80%] rounded-xl bg-white shadow-2xl border-2 border-gray-400 flex flex-col">
                <div className="bg-[#5038bc] rounded-t-lg flex">
                    <div className="flex-wrap text-4xl sm:text-6xl text-white font-medium p-4 overflow-hidden"> {quizDetail.title} </div>
                </div>
                <div className="flex flex-col text-md sm:text-2xl p-4">
                    <div className=""><span className="font-medium">Kategori:</span> {quizDetail.category}</div>
                    <div className=""><span className="font-medium">Created at:</span> {formattedDate}</div>
                    <div className=""><span className="font-medium">Made by:</span> {quizDetail.creator_email}</div>
                    <Link href="/"
                          className="border-[#5038bc] border-3 p-1 sm:p-2 px-5 rounded mt-4 text-center cursor-pointer"
                    >
                        Back
                    </Link>
                </div>

            </div>


        </div>
    );
}

export default Page;