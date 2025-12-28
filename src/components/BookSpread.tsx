'use client';

import { ReactNode, useState, useEffect } from 'react';

interface BookSpreadProps {
    leftPage: ReactNode;
    rightPage: ReactNode;
    onClose?: () => void;
    showNavbar?: boolean;
    navbarContent?: ReactNode;
}

export default function BookSpread({
    leftPage,
    rightPage,
    onClose,
    showNavbar = true,
    navbarContent,
}: BookSpreadProps) {
    const [isMobile, setIsMobile] = useState(false);
    const [activePage, setActivePage] = useState<'left' | 'right'>('left');

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 1024);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#FFF8E7] to-[#FFE4C4] flex flex-col">
            {/* Navbar */}
            {showNavbar && (
                <nav className="flex items-center justify-center gap-4 py-4 px-6">
                    {navbarContent}
                </nav>
            )}

            {/* Book Container */}
            <div className="flex-1 flex items-center justify-center p-4">
                <div className="relative w-full max-w-7xl">
                    {/* Book shadow */}
                    <div className="absolute inset-0 bg-black/10 rounded-lg blur-xl translate-y-4" />

                    {/* Mobile toggle buttons */}
                    {isMobile && (
                        <div className="flex justify-center gap-4 mb-4">
                            <button
                                onClick={() => setActivePage('left')}
                                className={`px-6 py-2 rounded-full font-medium transition-all ${activePage === 'left'
                                    ? 'bg-[#E9967A] text-white'
                                    : 'bg-white/50 text-[#8B4513]'
                                    }`}
                            >
                                Sol Sayfa
                            </button>
                            <button
                                onClick={() => setActivePage('right')}
                                className={`px-6 py-2 rounded-full font-medium transition-all ${activePage === 'right'
                                    ? 'bg-[#E9967A] text-white'
                                    : 'bg-white/50 text-[#8B4513]'
                                    }`}
                            >
                                Sağ Sayfa
                            </button>
                        </div>
                    )}

                    {/* Book spread */}
                    <div className={`relative bg-white rounded-lg shadow-2xl overflow-hidden ${isMobile ? '' : 'flex'}`}>
                        {/* Spiral binding */}
                        <div className="absolute left-0 top-0 bottom-0 w-10 bg-gradient-to-r from-[#D2691E] to-[#8B4513] z-20 flex flex-col justify-evenly py-6">
                            {Array.from({ length: 20 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="w-4 h-4 mx-auto rounded-full bg-[#2C1810] shadow-inner"
                                />
                            ))}
                        </div>

                        {/* Left page */}
                        <div
                            className={`relative bg-[#FFFAF0] ${isMobile
                                ? activePage === 'left' ? 'block' : 'hidden'
                                : 'w-1/2 border-r border-[#DEB887]/30'
                                }`}
                            style={{ minHeight: isMobile ? '75vh' : '85vh' }}
                        >
                            {/* Yellow stripe */}
                            <div className="absolute left-12 top-0 bottom-0 w-0.5 bg-[#FFD700]/50" />

                            {/* Page content */}
                            <div className="pl-16 pr-6 py-8 h-full">
                                {leftPage}
                            </div>

                            {/* Page shadow effect */}
                            <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-black/5 to-transparent" />
                        </div>

                        {/* Center binding line */}
                        {!isMobile && (
                            <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-r from-[#DEB887]/50 to-[#DEB887]/20 z-10" />
                        )}

                        {/* Right page */}
                        <div
                            className={`relative bg-[#FFFAF0] ${isMobile
                                ? activePage === 'right' ? 'block' : 'hidden'
                                : 'w-1/2'
                                }`}
                            style={{ minHeight: isMobile ? '75vh' : '85vh' }}
                        >
                            {/* Page content */}
                            <div className="px-6 py-8 h-full">
                                {rightPage}
                            </div>

                            {/* Page shadow effect */}
                            <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-black/5 to-transparent" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
