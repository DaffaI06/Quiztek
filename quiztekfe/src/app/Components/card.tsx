"use client";
import React from 'react';
import {Info} from 'lucide-react';
import Link from "next/link";
import {motion} from "framer-motion";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

function Card(props) {
    const formattedDate = new Date(props.created_at).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
    const loggedIn = true;
    const noSubmissionYet = true;
    const deleteQuiz = async (quiz_id) => {
        try {
            const response = await fetch(`${apiBaseUrl}/quiz/delete/${quiz_id}`, {
                method: "DELETE",
            });
            if (!response.ok) {
                throw new Error("Failed to delete quiz");
            }
            // Instead of reloading the page, update the state via the callback.
            props.onDelete(quiz_id);
            // Optionally, trigger any animations here before removing from view.
        } catch (error) {
            console.error("Error deleting quiz:", error);
            alert("Failed to delete quiz.");
        }
    };
    return (
        <motion.div whileHover={{scale:1.1}} className="w-full h-52 sm:w-80 sm:h-88 rounded-xl bg-white shadow-2xl border-1 border-gray-400 flex flex-col">
            <div className="bg-[#5038bc] rounded-t-xl flex h-18 border-4 border-white">
                <div className="flex-wrap text-lg sm:text-2xl text-white sm:mx-auto p-1 px-2 sm:p-4 font-medium overflow-hidden"> {props.children} </div>
            </div>

            <div className="flex sm:flex-col justify-between px-8 pb-4 sm:p-0 w-full sm:justify-center my-auto">
                {props.category === "" ? "" :
                    <div className="text-sm sm:text-lg flex justify-center my-auto"> Category: {props.category}</div>}
                <div className="text-sm sm:text-lg flex justify-center my-auto">{formattedDate}</div>
            </div>


            <div className="flex flex-col my-auto scale-90 sm:scale-100">
                <Link href={`/detail/${props.quiz_id}`} className="flex gap-2 justify-center mb-3">
                    <Info/>
                    <div> More information</div>
                </Link>

                {loggedIn && noSubmissionYet ? (
                    <div className="flex flex-col justify-center gap-1 items-center">
                        <Link href={`/quiz/${props.quiz_id}`}
                              className="bg-[#5038bc] rounded-lg text-white text-center text-lg p-2 w-[85%]">Try
                            Quiz</Link>
                        <div className="flex w-[85%] gap-1">
                            <Link href={`/edit/${props.quiz_id}`}
                                  className="bg-white border-3 rounded-lg text-[#5038bc] text-center text-lg p-1 w-[50%]">Edit</Link>
                            <div onClick={() => deleteQuiz(props.quiz_id)}
                                 className="cursor-pointer bg-red-500 border-3 border-red-500 rounded-lg rounded-lg text-white text-center text-lg p-1 w-[50%]">Delete
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col justify-center gap-1 items-center">
                        <Link href={`/quiz/${props.quiz_id}`}
                              className="bg-[#5038bc] rounded-lg text-white text-center text-lg p-2 w-[85%]">Try
                            Quiz</Link>
                    </div>
                )}
            </div>
        </motion.div>
    );
}

export default Card;