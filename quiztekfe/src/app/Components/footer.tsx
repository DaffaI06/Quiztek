"use client";
import React from 'react';
import Image from "next/image";
import {Github} from "lucide-react";
import Link from "next/link";

function Footer() {
    return (
        <div className="relative w-full h-[300px] sm:h-[700px]" style={{clipPath: "polygon(0% 0, 100% 0%, 100% 100%, 0 100%"}}>
            <div className="fixed w-full h-[700px] bottom-0">
                <div className="h-[700px] bg-[#5038bc] text-white p-8 sm:px-16 flex justify-between items-end">
                    <div className="flex flex-col items-start">
                        <div className="relative size-32 sm:size-42">
                            <Image src="/Q.png" fill sizes="(max-width: 640px) 128px, 168px" className="object-contain invert brightness-0" alt=""/>
                        </div>
                        <div className="flex mx-auto mt-4 sm:mt-8 text-sm sm:text-md">© Copyright Quiztek 2025</div>
                    </div>

                    <div className="absolute bottom-8 right-8 sm:right-16 flex gap-8">
                        <Link href="https://github.com/DaffaI06?tab=repositories"><Github className="size-12 sm:size-16"/></Link>
                    </div>
                </div>
            </div>
        </div>
    );
        }

        export default Footer;