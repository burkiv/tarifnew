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
            setIsMobile(window.innerWidth < 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#FFF8E7] to-[#FFE4C4] flex flex-col">
            {/* Navbar - Compact on mobile */}
            {showNavbar && (
                <nav className={`shrink-0 ${isMobile ? 'flex flex-wrap items-center justify-center gap-2 py-2 px-2' : 'flex items-center justify-center gap-4 py-4 px-6'}`}>
                    {navbarContent}
                </nav>
            )}

            {/* Mobile toggle buttons - Compact */}
            {isMobile && (
                <div className="shrink-0 flex justify-center gap-2 py-1.5 bg-white/30">
                    <button
                        onClick={() => setActivePage('left')}
                        className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${activePage === 'left'
                                ? 'bg-[#E9967A] text-white'
                                : 'bg-white/50 text-[#8B4513]'
                            }`}
                    >
                        Sol Sayfa
                    </button>
                    <button
                        onClick={() => setActivePage('right')}
                        className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${activePage === 'right'
                                ? 'bg-[#E9967A] text-white'
                                : 'bg-white/50 text-[#8B4513]'
                            }`}
                    >
                        Sağ Sayfa
                    </button>
                </div>
            )}

            {/* Book Container - flex-1 fills remaining space */}
            <div className={`flex-1 flex items-stretch justify-center ${isMobile ? 'p-1' : 'p-4 items-center'}`}>
                <div className={`relative w-full ${isMobile ? 'h-full' : 'max-w-7xl'}`}>
                    {/* Book shadow - only on desktop */}
                    {!isMobile && (
                        <div className="absolute inset-0 bg-black/10 rounded-lg blur-xl translate-y-4" />
                    )}

                    {/* Book spread */}
                    <div className={`relative bg-white rounded-lg shadow-2xl overflow-hidden h-full ${isMobile ? '' : 'flex'}`}>
                        {/* Spiral binding */}
                        <div className={`absolute left-0 top-0 bottom-0 ${isMobile ? 'w-6' : 'w-10'} bg-gradient-to-r from-[#D2691E] to-[#8B4513] z-20 flex flex-col justify-evenly ${isMobile ? 'py-2' : 'py-6'}`}>
                            {Array.from({ length: isMobile ? 18 : 20 }).map((_, i) => (
                                <div
                                    key={i}
                                    className={`${isMobile ? 'w-2.5 h-2.5' : 'w-4 h-4'} mx-auto rounded-full bg-[#2C1810] shadow-inner`}
                                />
                            ))}
                        </div>

                        {/* Left page */}
                        <div
                            className={`relative bg-[#FFFAF0] h-full ${isMobile
                                    ? activePage === 'left' ? 'block' : 'hidden'
                                    : 'w-1/2 border-r border-[#DEB887]/30'
                                }`}
                            style={{ minHeight: isMobile ? 'calc(100vh - 120px)' : '85vh' }}
                        >
                            {/* Yellow stripe */}
                            <div className={`absolute ${isMobile ? 'left-8' : 'left-12'} top-0 bottom-0 w-0.5 bg-[#FFD700]/50`} />

                            {/* Page content */}
                            <div className={`h-full overflow-y-auto ${isMobile ? 'pl-10 pr-3 py-3' : 'pl-16 pr-6 py-8'}`}>
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
                            className={`relative bg-[#FFFAF0] h-full ${isMobile
                                    ? activePage === 'right' ? 'block' : 'hidden'
                                    : 'w-1/2'
                                }`}
                            style={{ minHeight: isMobile ? 'calc(100vh - 120px)' : '85vh' }}
                        >
                            {/* Page content */}
                            <div className={`h-full overflow-y-auto ${isMobile ? 'px-3 py-3' : 'px-6 py-8'}`}>
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
