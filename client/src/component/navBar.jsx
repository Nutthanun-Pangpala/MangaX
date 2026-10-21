import React, { useState } from 'react';

function NavBar() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="bg-neutral-950/90 backdrop-blur-md fixed w-full z-50 top-0 start-0 border-b border-neutral-800">
            <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">

                <a href="/" className="flex items-center space-x-3 rtl:space-x-reverse">
                    <img
                        src="/xicon.svg"
                        className="h-10 w-10 object-contain"
                        alt="MangaX logo"
                    />
                    <span className="self-center text-2xl font-black tracking-wide text-white">
                        Manga
                    </span>
                </a>

                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-neutral-400 rounded-lg md:hidden hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-700"
                    aria-expanded={isOpen}
                >
                    <span className="sr-only">Open main menu</span>
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        {isOpen ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        )}
                    </svg>
                </button>
                <div className={`${isOpen ? 'block' : 'hidden'} w-full md:block md:w-auto`}>
                    <ul className="font-medium flex flex-col p-4 md:p-0 mt-4 border border-neutral-800 rounded-lg bg-neutral-900 md:flex-row md:space-x-8 rtl:space-x-reverse md:mt-0 md:border-0 md:bg-transparent">
                        <li>
                            <a
                                href="/"
                                className="block py-2 px-3 text-white rounded md:bg-transparent md:text-red-500 md:p-0 font-semibold"
                            >
                                หน้าแรก
                            </a>
                        </li>
                        <li>
                            <a
                                href="/popular"
                                className="block py-2 px-3 text-neutral-300 rounded hover:bg-neutral-800 md:hover:bg-transparent md:hover:text-red-500 md:p-0 transition-colors"
                            >
                                ยอดนิยม
                            </a>
                        </li>
                        <li>
                            <a
                                href="/motion"
                                className="block py-2 px-3 text-rose-500 rounded hover:bg-neutral-800 md:hover:bg-transparent md:hover:text-rose-400 md:p-0 font-medium transition-colors"
                            >
                                ✨ การ์ตูนขยับได้ (AI Motion)
                            </a>
                        </li>
                        <li>
                            <a
                                href="/community"
                                className="block py-2 px-3 text-neutral-300 rounded hover:bg-neutral-800 md:hover:bg-transparent md:hover:text-red-500 md:p-0 transition-colors"
                            >
                                คอมมูนิตี้
                            </a>
                        </li>
                    </ul>
                </div>

            </div>
        </nav>
    );
}

export default NavBar;