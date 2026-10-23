
import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';

function NavBar() {
    const [isOpen, setIsOpen] = useState(false);

    const navItems = [
        { name: 'หน้าแรก', path: '/', icon: '⌂', end: true },
        { name: 'ยอดนิยม', path: '/popular', icon: '♛' },
        { name: 'AI Motion', path: '/motion', icon: '✦', special: true },
        { name: 'คอมมูนิตี้', path: '/community', icon: '◎' },
    ];

    const closeMenu = () => setIsOpen(false);

    return (
        <nav className="fixed inset-x-0 top-0 z-50 border-b border-white/[0.08] bg-neutral-950/85 shadow-[0_8px_30px_rgba(0,0,0,0.25)] backdrop-blur-2xl">
            {/* แสงตกแต่งด้านบน */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-500/60 to-transparent" />

            <div className="mx-auto flex max-w-screen-2xl flex-wrap items-center justify-between px-4 py-3 sm:px-6 lg:px-8">

                {/* Logo */}
                <Link
                    to="/"
                    onClick={closeMenu}
                    className="group flex items-center gap-3"
                    aria-label="MangaX หน้าแรก"
                >
                    <div className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-red-500/25 bg-gradient-to-br from-red-500/20 to-rose-950/40 shadow-[0_0_20px_rgba(239,68,68,0.12)] transition-all duration-300 group-hover:border-red-500/60 group-hover:shadow-[0_0_28px_rgba(239,68,68,0.25)]">
                        <img
                            src="/xicon.svg"
                            className="h-8 w-8 object-contain transition-transform duration-300 group-hover:scale-110"
                            alt="MangaX"
                        />
                    </div>

                    <div className="flex flex-col">
                        <span className="text-xl font-black tracking-tight text-white sm:text-2xl">
                            Manga<span className="text-red-500">X</span>
                        </span>
                        <span className="-mt-0.5 text-[9px] font-bold uppercase tracking-[0.28em] text-neutral-500">
                            Read beyond limits
                        </span>
                    </div>
                </Link>

                {/* Mobile menu button */}
                <button
                    type="button"
                    onClick={() => setIsOpen((prev) => !prev)}
                    className="group flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-neutral-300 transition hover:border-red-500/40 hover:bg-red-500/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 md:hidden"
                    aria-label={isOpen ? 'ปิดเมนู' : 'เปิดเมนู'}
                    aria-expanded={isOpen}
                    aria-controls="main-navigation"
                >
                    <svg
                        className="h-5 w-5 transition-transform duration-300"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.8}
                    >
                        {isOpen ? (
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M6 6l12 12M18 6L6 18"
                            />
                        ) : (
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M4 7h16M4 12h16M4 17h16"
                            />
                        )}
                    </svg>
                </button>

                {/* Navigation */}
                <div
                    id="main-navigation"
                    className={`${
                        isOpen ? 'mt-4 block' : 'hidden'
                    } w-full md:mt-0 md:block md:w-auto`}
                >
                    <ul className="flex flex-col gap-1 rounded-2xl border border-white/[0.08] bg-neutral-900/95 p-2 shadow-2xl md:flex-row md:items-center md:gap-1 md:border-0 md:bg-transparent md:p-0 md:shadow-none">
                        {navItems.map((item) => (
                            <li key={item.path}>
                                <NavLink
                                    to={item.path}
                                    end={item.end}
                                    onClick={closeMenu}
                                    className={({ isActive }) =>
                                        [
                                            'group relative flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 md:px-4 md:py-2.5',
                                            item.special
                                                ? 'text-rose-400 hover:bg-rose-500/10 hover:text-rose-300'
                                                : 'text-neutral-400 hover:bg-white/[0.05] hover:text-white',
                                            isActive
                                                ? item.special
                                                    ? 'bg-rose-500/10 text-rose-300'
                                                    : 'bg-white/[0.06] text-white md:bg-transparent'
                                                : '',
                                        ].join(' ')
                                    }
                                >
                                    {({ isActive }) => (
                                        <>
                                            <span
                                                className={`flex h-7 w-7 items-center justify-center rounded-lg text-base transition-all duration-200 ${
                                                    item.special
                                                        ? 'bg-rose-500/10 text-rose-400 group-hover:bg-rose-500/20'
                                                        : isActive
                                                        ? 'bg-red-500/15 text-red-400'
                                                        : 'bg-white/[0.04] text-neutral-500 group-hover:text-white'
                                                }`}
                                            >
                                                {item.icon}
                                            </span>

                                            <span>
                                                {item.special
                                                    ? 'การ์ตูนขยับได้'
                                                    : item.name}
                                            </span>

                                            {item.special && (
                                                <span className="rounded-md border border-rose-500/25 bg-rose-500/10 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-rose-400">
                                                    AI
                                                </span>
                                            )}

                                            {isActive && (
                                                <span className="absolute bottom-0 left-4 right-4 hidden h-0.5 rounded-full bg-gradient-to-r from-red-500 to-rose-400 md:block" />
                                            )}
                                        </>
                                    )}
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </nav>
    );
}

export default NavBar;
