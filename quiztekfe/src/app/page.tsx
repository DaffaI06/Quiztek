"use client";
import React from "react";
import Card from "@/app/Components/card";
import {motion} from "framer-motion";
import { useEffect, useState } from "react";
import Link from "next/link";
import {Plus, Search} from "lucide-react";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function Home() {
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("title");
    const [quizzes, setQuizzes] = useState([]);
    const [isHovered, setIsHovered] = useState(false);
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('');

    useEffect(() => {
        fetchQuizzes();
    }, []);

    const fetchQuizzes = async () => {
        let url = `${apiBaseUrl}/quiz`;
        if (search.trim() !== "") {
            url += `?${filter}=${encodeURIComponent(search)}`; // makes spaces and etc into special codes
        }

        try {
            const res = await fetch(url);
            if (!res.ok) {
                throw new Error("Failed to fetch quizzes");
            }
            const data = await res.json();
            setQuizzes(data);
        } catch (err) {
            console.error("Error fetching quizzes:", err);
        }
    };


    const handleSubmitSearch = (e) => {
        e.preventDefault();
        fetchQuizzes();
    };

    // passed to card.tsx
    const handleDeleteQuiz = (quiz_id) => {
        setQuizzes((prevQuizzes) =>
            prevQuizzes.filter((quiz) => quiz.id !== quiz_id)
        );
    };

    const handleSubmitForm = async (e) => {
        e.preventDefault();

        const data = { title, category };

        try {
            const res = await fetch(`${apiBaseUrl}/quiz/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                throw new Error('Failed to submit the form');
            }

            setTitle('');
            setCategory('');
            fetchQuizzes()
        } catch (error) {
            console.error('Error submitting form:', error);
        }
    }

    return (
        <div className="flex flex-col">

            {/* Title */}
            <motion.div className="flex flex-col m-8 sm:m-12 lg:m-20 gap-1 sm:gap-6 text-center"
                        initial={{opacity: 0, y: 6}}
                        animate={{opacity: 100, y: [6, -12], }}
                        transition={{
                            opacity: {duration: 2,},
                            y: {repeat: Infinity, repeatType: "mirror", duration: 2, ease: "easeInOut",}
                        }}
            >
                <div className="text-2xl sm:text-5xl font-normal">Welcome</div>
                <div className="text-3xl sm:text-6xl font-bold">Try a <Link href="#quiz_list" className="text-[#5038bc]">Quiz</Link> or <Link
                    href="#create_form" className="text-[#5038bc]">Make one</Link>!
                </div>
            </motion.div>

            {/* Search bar */}
            <form id="quiz_list" onSubmit={handleSubmitSearch} className="flex flex-col w-max mx-auto pt-3 sm:pt-6 lg:pt-14">
                <div className="flex w-full text-md sm:text-xl">
                    <input
                        type="text"
                        placeholder="Search quiz..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="border-3 border-[#5038bc] bg-white w-[80vw] sm:w-[70vw] lg:w-[30vw] h-10 sm:h-12 p-2 px-3 placeholder-gray-400"
                    />
                    <button type="submit" className="bg-[#5038bc] rounded-r-full p-2 pl-0.75 justify-end round">
                        <Search color="#ffffff"/>
                    </button>
                </div>
                <div className="flex justify-center gap-7 mt-3 text-sm sm:text-lg text-gray-500">
                    <label className="flex items-center gap-2">
                        <input
                            type="radio"
                            name="filter"
                            value="title"
                            checked={filter === "title"} // if filter is title, check the radio, goofy ah react
                            onChange={(e) => setFilter(e.target.value)}
                            className="size-4"
                        />
                        Title
                    </label>
                    <label className="flex items-center gap-2">
                        <input
                            type="radio"
                            name="filter"
                            value="category"
                            checked={filter === "category"}
                            onChange={(e) => setFilter(e.target.value)}
                            className="size-4"
                        />
                        Category
                    </label>
                    <label className="flex items-center gap-2">
                        <input
                            type="radio"
                            name="filter"
                            value="date"
                            checked={filter === "date"}
                            onChange={(e) => setFilter(e.target.value)}
                            className="size-4"
                        />
                        Date
                    </label>
                </div>
            </form>

            {/* Cards */}
            <div className="flex w-max mx-auto mt-4 sm:mt-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 xl:gap-8 2xl:gap-12 mx-auto">
                    {quizzes && quizzes.length > 0 ? (quizzes.map((quiz) => (
                        <Card
                            key={quiz.id}
                            quiz_id={quiz.id}
                            category={quiz.category}
                            creator_email={quiz.creator_email}
                            created_at={quiz.created_at}
                            onDelete={handleDeleteQuiz}
                        >
                            {quiz.title}
                        </Card>
                    ))) : ""}


                    <Link href="#create_form">
                        <motion.div
                            onHoverStart={() => setIsHovered(true)}
                            onHoverEnd={() => setIsHovered(false)}
                            whileTap={{scale: 0.9}}
                            whileHover={{scale: 1.1}}
                            className="w-full h-52 sm:w-80 sm:h-88 rounded-xl border-5 sm:border-8 border-[#5038bc] flex flex-col items-center justify-center"

                        >
                            <motion.div
                                animate={isHovered ? {scale: 1.3, rotate: 90} : {scale: 1, rotate: 0}}
                                transition={{duration: 0.7, ease: "easeInOut"}}
                                className="flex"
                            >
                                <Plus className="size-16 sm:size-24" color="#5038bc"/>
                            </motion.div>
                        </motion.div>
                    </Link>

                </div>
            </div>

            {/* Create quiz form */}
            <form id="create_form" onSubmit={handleSubmitForm} className="flex justify-center h-[75vh] sm:h-screen items-center">
                <div className="flex flex-col gap-3 w-[75%] sm:w-[30%]">
                    <label className="text-3xl sm:text-4xl font-medium">Quiz Title</label>
                    <input id="title"
                           type="text"
                           value={title}
                           onChange={(e) => setTitle(e.target.value)}
                           required
                           className="border-3 border-[#5038bc] rounded-sm bg-white w-full h-12 px-3 text-xl"
                    />
                    <label className="text-3xl sm:text-4xl font-medium">Quiz Category</label>
                    <input id="category"
                           type="text"
                           value={category}
                           onChange={(e) => setCategory(e.target.value)}
                           required
                           className="border-3 border-[#5038bc] rounded-sm bg-white w-full h-12 px-3 text-xl"
                    />
                    <button type="submit"
                            className="text-white bg-[#5038bc] p-2 w-full text-2xl rounded-md cursor-pointer">Create
                        Quiz
                    </button>
                </div>
            </form>
        </div>
    )
}
