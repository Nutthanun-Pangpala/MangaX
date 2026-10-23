
import React from 'react';
import { Link } from 'react-router-dom';

function Footer() {
    const currentYear = new Date().getFullYear();

    const categories = [
        { name: 'Manga', path: '/?type=manga' },
        { name: 'Manhwa', path: '/?type=manhwa' },
        { name: 'Manhua', path: '/?type=manhua' },
    ];

    const exploreLinks = [
        { name: 'หน้าแรก', path: '/' },
        { name: 'ยอดนิยม', path: '/popular' },
        { name: 'AI Motion', path: '/motion' },
        { name: 'คอมมูนิตี้', path: '/community' },
    ];

    const socialLinks = [
        {
            name: 'GitHub',
            href: 'https://github.com/Nutthanun-Pangpala/MangaX',
            icon: (
                <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M12 2a10 10 0 0 0-3.162 19.487c.5.092.682-.217.682-.48v-1.7c-2.782.605-3.369-1.177-3.369-1.177-.454-1.154-1.11-1.462-1.11-1.462-.908-.62.069-.607.069-.607 1.003.07 1.53 1.03 1.53 1.03.892 1.528 2.341 1.087 2.91.831.091-.646.35-1.087.636-1.337-2.22-.252-4.555-1.11-4.555-4.943 0-1.092.39-1.984 1.03-2.684-.104-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0 1 12 6.99c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.7 1.028 1.592 1.028 2.684 0 3.842-2.339 4.688-4.566 4.936.36.31.68.92.68 1.855v2.596c0 .265.18.576.688.478A10 10 0 0 0 12 2Z"
                />
            ),
        },
    ];

    const headingClass =
        'mb-5 text-xs font-black uppercase tracking-[0.2em] text-white';

    const linkClass =
        'inline-flex items-center gap-2 text-sm text-neutral-400 transition-colors duration-200 hover:text-red-400';

    return (
        <footer className="relative mt-16 overflow-hidden border-t border-white/[0.08] bg-neutral-950 text-neutral-300">
            {/* Decorative glow */}
            <div className="pointer-events-none absolute -top-32 left-1/4 h-64 w-64 rounded-full bg-red-600/[0.08] blur-[100px]" />
            <div className="pointer-events-none absolute -right-20 bottom-0 h-64 w-64 rounded-full bg-rose-600/[0.06] blur-[100px]" />

            {/* Top accent */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-500/70 to-transparent" />

            <div className="relative mx-auto max-w-screen-2xl px-5 pb-6 pt-12 sm:px-8 lg:px-10 lg:pt-16">
                <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-12 lg:gap-12">

                    {/* Brand */}
                    <div className="lg:col-span-5">
                        <Link
                            to="/"
                            className="group inline-flex items-center gap-3"
                            aria-label="MangaX หน้าแรก"
                        >
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-red-500/25 bg-gradient-to-br from-red-500/15 to-rose-950/40 shadow-[0_0_25px_rgba(239,68,68,0.10)] transition-all duration-300 group-hover:border-red-500/60 group-hover:shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                                <img
                                    src="/xicon.svg"
                                    alt="MangaX Logo"
                                    className="h-8 w-8 object-contain transition-transform duration-300 group-hover:scale-110"
                                />
                            </div>

                            <span className="text-3xl font-black tracking-tight text-white">
                                Manga<span className="text-red-500">X</span>
                            </span>
                        </Link>

                        <p className="mt-5 max-w-md text-sm leading-7 text-neutral-400">
                            โลกของมังงะที่คุณชื่นชอบ รวม Manga, Manhwa และ Manhua
                            พร้อมประสบการณ์การอ่านที่ออกแบบมาเพื่อคุณ
                        </p>

                        <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-red-500/15 bg-red-500/[0.06] px-3 py-2">
                            <span className="relative flex h-2 w-2">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-60" />
                                <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
                            </span>
                            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-red-300">
                                Read beyond limits
                            </span>
                        </div>
                    </div>

                    {/* Explore */}
                    <div className="lg:col-span-2">
                        <h2 className={headingClass}>Explore</h2>
                        <ul className="space-y-4">
                            {exploreLinks.map((item) => (
                                <li key={item.path}>
                                    <Link to={item.path} className={linkClass}>
                                        <span className="text-red-500/70">›</span>
                                        {item.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Categories */}
                    <div className="lg:col-span-2">
                        <h2 className={headingClass}>Categories</h2>
                        <ul className="space-y-4">
                            {categories.map((item) => (
                                <li key={item.name}>
                                    <Link to={item.path} className={linkClass}>
                                        <span className="text-red-500/70">›</span>
                                        {item.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Community */}
                    <div className="lg:col-span-3">
                        <h2 className={headingClass}>Community</h2>
                        <p className="mb-5 text-sm leading-6 text-neutral-400">
                            ติดตามโปรเจกต์และร่วมพัฒนา MangaX ไปด้วยกัน
                        </p>

                        <div className="flex flex-wrap gap-3">
                            {socialLinks.map((social) => (
                                <a
                                    key={social.name}
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={social.name}
                                    title={social.name}
                                    className="group flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-neutral-400 transition-all duration-300 hover:-translate-y-1 hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400 hover:shadow-[0_5px_20px_rgba(239,68,68,0.10)]"
                                >
                                    <svg
                                        className="h-5 w-5 fill-current transition-transform duration-300 group-hover:scale-110"
                                        viewBox="0 0 24 24"
                                        aria-hidden="true"
                                    >
                                        {social.icon}
                                    </svg>
                                </a>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <div className="my-10 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                {/* Bottom bar */}
                <div className="flex flex-col gap-4 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
                    <p className="text-xs leading-6 text-neutral-500">
                        © {currentYear}{' '}
                        <Link to="/" className="font-bold text-neutral-300 transition hover:text-red-400">
                            MangaX
                        </Link>
                        . All rights reserved.
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-neutral-500 sm:justify-end">
                        <span className="transition-colors hover:text-neutral-300">
                            Made for manga lovers
                        </span>
                        <span className="hidden h-1 w-1 rounded-full bg-red-500/70 sm:block" />
                        <span className="font-medium tracking-wide">
                            DARK <span className="text-red-500">MODE</span>
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
