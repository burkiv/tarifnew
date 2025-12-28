'use client';

import { useState } from 'react';
import Image from 'next/image';

interface BookCoverProps {
    onOpen: () => void;
    coverImage?: string;
}

export default function BookCover({ onOpen, coverImage }: BookCoverProps) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FFF8E7] to-[#FFE4C4] p-4">
            <div
                className={`relative cursor-pointer transition-all duration-500 ${isHovered ? 'scale-105 rotate-1' : ''
                    }`}
                onClick={onOpen}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {/* Book shadow */}
                <div className="absolute inset-0 bg-black/20 rounded-lg blur-2xl translate-y-4 translate-x-2" />

                {/* Book spine/binding */}
                <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#8B4513] to-[#A0522D] rounded-l-lg shadow-inner" />

                {/* Spiral holes */}
                <div className="absolute left-3 top-0 bottom-0 flex flex-col justify-evenly py-8 z-10">
                    {Array.from({ length: 15 }).map((_, i) => (
                        <div
                            key={i}
                            className="w-3 h-3 rounded-full bg-[#2C1810] shadow-inner"
                        />
                    ))}
                </div>

                {/* Book cover */}
                <div className="relative w-[320px] h-[450px] md:w-[400px] md:h-[560px] bg-gradient-to-br from-[#FFB6C1] to-[#FFC0CB] rounded-lg shadow-2xl overflow-hidden">
                    {/* Yellow border stripe */}
                    <div className="absolute left-10 top-0 bottom-0 w-1 bg-[#FFD700]" />

                    {coverImage ? (
                        <Image
                            src={coverImage}
                            alt="Tarif Defteri"
                            fill
                            className="object-cover"
                            priority
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center pl-12">
                            <div className="text-center">
                                <h1 className="text-4xl md:text-5xl font-bold text-[#E75480] drop-shadow-lg" style={{ fontFamily: 'cursive' }}>
                                    Tarif
                                </h1>
                                <h1 className="text-4xl md:text-5xl font-bold text-[#E75480] drop-shadow-lg" style={{ fontFamily: 'cursive' }}>
                                    Defterim
                                </h1>
                            </div>
                        </div>
                    )}

                    {/* Hover overlay */}
                    <div className={`absolute inset-0 bg-white/10 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-white text-lg font-medium bg-black/20 px-6 py-3 rounded-full backdrop-blur-sm">
                                Defteri Aç
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
