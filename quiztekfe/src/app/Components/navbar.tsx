"use client";
import React from 'react';
import Image from 'next/image'
import {motion} from "framer-motion"
import Link from "next/link";

function Navbar() {
    const loggedIn = false;
    return (
        <div className="flex bg-white w-full h-20 justify-between ">
            <Link href="/">
                <motion.div className="relative w-40 h-16 mt-2 ml-5" whileTap={{scale:0.9}} whileHover={{scale: 1.1}}>

                        <Image src="/Quiztek.png" fill sizes="160px" priority className=" object-contain" alt=""/>

                </motion.div>
            </Link>
            <div className="p-8 flex gap-20 text-sm">
                {loggedIn ? (<div>Logout</div>) : (<div className="">Login</div>)}
            </div>


        </div>
    );
}

export default Navbar;
