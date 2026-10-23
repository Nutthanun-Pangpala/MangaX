
// src/pages/MangaDetail.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import NavBar from '../component/navBar';

const FALLBACK_COVER =
    'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600';

function getChapterNumber(chapter) {
    const value = chapter.chapter_number;

    if (value === null || value === undefined || value === '') {
        return null;
    }

    const number = Number(value);
    return Number.isFinite(number) ? number : null;
}

function formatChapterNumber(chapter) {
    const number = getChapterNumber(chapter);
    return number === null ? 'พิเศษ' : number;
}

function MangaDetail() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [manga, setManga] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [sortDesc, setSortDesc] = useState(true);
    const [searchChapter, setSearchChapter] = useState('');
    const [coverError, setCoverError] = useState(false);

    // Fetch manga detail
    useEffect(() => {
        const controller = new AbortController();

        async function fetchManga() {
            setLoading(true);
            setError('');
            setManga(null);
            setCoverError(false);

            try {
                const apiUrl = import.meta.env.VITE_API_URL;

                if (!apiUrl) {
                    throw new Error('ไม่พบการตั้งค่า API URL');
                }

                const response = await fetch(
                    `${apiUrl}/api/mangas/${encodeURIComponent(id)}`,
                    { signal: controller.signal }
                );

                if (!response.ok) {
                    throw new Error(
                        response.status === 404
                            ? 'ไม่พบมังงะเรื่องนี้'
                            : 'ไม่สามารถโหลดข้อมูลมังงะได้'
                    );
                }

                const result = await response.json();

                if (!result.success || !result.data) {
                    throw new Error(
                        result.message || 'ไม่พบข้อมูลมังงะ'
                    );
                }

                setManga(result.data);
            } catch (err) {
                if (err.name === 'AbortError') return;

                console.error('Error fetching manga detail:', err);
                setError(
                    err.message || 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้'
                );
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        }

        fetchManga();

        return () => controller.abort();
    }, [id]);

    // Chapters: sort and search
    const chapters = useMemo(
        () => Array.isArray(manga?.chapters) ? manga.chapters : [],
        [manga]
    );

    const sortedChapters = useMemo(() => {
        const query = searchChapter.trim().toLowerCase();

        return [...chapters]
            .filter((chapter) => {
                if (!query) return true;

                const number = formatChapterNumber(chapter);
                const title = String(chapter.title || '').toLowerCase();

                return (
                    title.includes(query) ||
                    String(number).includes(query)
                );
            })
            .sort((a, b) => {
                const aNumber = getChapterNumber(a);
                const bNumber = getChapterNumber(b);

                // ตอนที่ไม่มีเลขให้แสดงท้ายรายการเสมอ
                if (aNumber === null && bNumber !== null) return 1;
                if (aNumber !== null && bNumber === null) return -1;

                if (aNumber !== null && bNumber !== null) {
                    if (aNumber !== bNumber) {
                        return sortDesc
                            ? bNumber - aNumber
                            : aNumber - bNumber;
                    }
                }

                // ตอนเลขเดียวกันหรือตอนพิเศษ
                const aDate = Date.parse(a.created_at || '') || 0;
                const bDate = Date.parse(b.created_at || '') || 0;

                if (aDate !== bDate) {
                    return sortDesc ? bDate - aDate : aDate - bDate;
                }

                return String(a.id).localeCompare(String(b.id));
            });
    }, [chapters, sortDesc, searchChapter]);

    // Find the earliest numbered chapter for the main read button
    const firstChapter = useMemo(() => {
        return [...chapters]
            .filter((chapter) => getChapterNumber(chapter) !== null)
            .sort(
                (a, b) =>
                    getChapterNumber(a) - getChapterNumber(b)
            )[0] || chapters[0] || null;
    }, [chapters]);

    // Loading screen
    if (loading) {
        return (
            <div className="min-h-screen bg-[#08090c] text-white">
                <NavBar />
                <div className="min-h-[80vh] flex flex-col items-center justify-center gap-5">
                    <div className="relative w-16 h-16">
                        <div className="absolute inset-0 rounded-2xl border border-red-500/30 bg-red-500/10 flex items-center justify-center text-2xl">
                            漫
                        </div>
                        <div className="absolute inset-0 rounded-2xl border-2 border-red-500 border-t-transparent animate-spin" />
                    </div>

                    <div className="text-center">
                        <p className="font-semibold text-neutral-200">
                            กำลังโหลดข้อมูลมังงะ
                        </p>
                        <p className="text-sm text-neutral-500 mt-2">
                            กรุณารอสักครู่...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // Error screen
    if (error || !manga) {
        return (
            <div className="min-h-screen bg-[#08090c] text-white">
                <NavBar />
                <div className="min-h-[75vh] px-5 flex items-center justify-center">
                    <div className="w-full max-w-md text-center rounded-3xl border border-white/[0.08] bg-white/[0.03] p-8">
                        <div className="w-16 h-16 mx-auto rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-2xl text-red-400 mb-5">
                            !
                        </div>

                        <h2 className="text-xl font-bold">
                            ไม่สามารถเปิดเรื่องนี้ได้
                        </h2>

                        <p className="text-sm text-neutral-400 mt-3 mb-7">
                            {error || 'ไม่พบข้อมูลมังงะ'}
                        </p>

                        <div className="flex justify-center gap-3">
                            <button
                                onClick={() => navigate(0)}
                                className="px-5 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-sm font-semibold transition-colors"
                            >
                                ลองอีกครั้ง
                            </button>

                            <Link
                                to="/"
                                className="px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm transition-colors"
                            >
                                กลับหน้าหลัก
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const coverUrl = coverError
        ? FALLBACK_COVER
        : manga.cover_url || FALLBACK_COVER;

    const description =
        manga.description || 'ยังไม่มีเรื่องย่อสำหรับมังงะเรื่องนี้';

    return (
        <div className="min-h-screen bg-[#08090c] text-neutral-100 pb-20">
            <NavBar />

            {/* Hero */}
            <section className="relative isolate overflow-hidden">
                {/* Blurred cover background */}
                <div className="absolute inset-0 -z-20 overflow-hidden">
                    <img
                        src={coverUrl}
                        alt=""
                        aria-hidden="true"
                        className="w-full h-full object-cover blur-3xl scale-110 opacity-20"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-[#08090c]/65 via-[#08090c]/90 to-[#08090c]" />
                    <div className="absolute inset-0 bg-gradient-to-r from-red-950/20 via-transparent to-transparent" />
                </div>

                <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-28 sm:pt-32 pb-12 sm:pb-16">
                    {/* Breadcrumb */}
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors mb-8"
                    >
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            className="w-4 h-4"
                        >
                            <path
                                d="M19 12H5m7 7-7-7 7-7"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                        กลับหน้าหลัก
                    </Link>

                    <div className="flex flex-col md:flex-row items-center md:items-start gap-7 sm:gap-10">
                        {/* Cover */}
                        <div className="relative w-48 sm:w-60 md:w-64 shrink-0 group">
                            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-red-500/40 via-red-900/10 to-transparent blur-xl opacity-60 group-hover:opacity-100 transition-opacity" />

                            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-[#15161b] border border-white/10 shadow-2xl">
                                <img
                                    src={coverUrl}
                                    alt={`ปก ${manga.title}`}
                                    referrerPolicy="no-referrer"
                                    onError={() => setCoverError(true)}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                                />

                                <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />

                                <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/10">
                                    <span className="text-[10px] uppercase tracking-widest font-semibold text-neutral-200">
                                        Manga
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0 w-full text-center md:text-left md:pt-4">
                            <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.25em] text-red-400">
                                    Manga Details
                                </span>
                            </div>

                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight break-words">
                                {manga.title || 'ไม่มีชื่อเรื่อง'}
                            </h1>

                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-5">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                    พร้อมอ่าน
                                </span>

                                <span className="px-3 py-1.5 rounded-full bg-white/[0.05] border border-white/10 text-neutral-300 text-xs">
                                    🇹🇭 ภาษาไทย
                                </span>

                                <span className="px-3 py-1.5 rounded-full bg-white/[0.05] border border-white/10 text-neutral-400 text-xs">
                                    {chapters.length} ตอน
                                </span>
                            </div>

                            {/* Description */}
                            <div className="mt-7 max-w-2xl mx-auto md:mx-0">
                                <h2 className="text-sm font-bold text-neutral-200 mb-2">
                                    เรื่องย่อ
                                </h2>
                                <p className="text-sm sm:text-base text-neutral-400 leading-7 whitespace-pre-line">
                                    {description}
                                </p>
                            </div>

                            {/* Main actions */}
                            <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-center md:justify-start gap-3">
                                {firstChapter ? (
                                    <button
                                        onClick={() =>
                                            navigate(`/read/${firstChapter.id}`)
                                        }
                                        className="group inline-flex items-center justify-center gap-3 px-7 py-3.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm shadow-lg shadow-red-950/30 hover:shadow-red-900/30 transition-all duration-200"
                                    >
                                        <svg
                                            viewBox="0 0 24 24"
                                            fill="currentColor"
                                            className="w-5 h-5"
                                        >
                                            <path d="M8 5.5a1 1 0 0 1 1.5-.86l9.2 5.5a1 1 0 0 1 0 1.72l-9.2 5.5A1 1 0 0 1 8 16.5v-11Z" />
                                        </svg>
                                        <span>
                                            อ่านตอนแรก
                                            <span className="block text-[10px] font-medium text-red-100/70 mt-0.5">
                                                ตอนที่ {formatChapterNumber(firstChapter)}
                                            </span>
                                        </span>
                                        <span className="transition-transform group-hover:translate-x-1">
                                            →
                                        </span>
                                    </button>
                                ) : (
                                    <div className="px-5 py-3.5 rounded-xl bg-white/5 border border-white/10 text-neutral-500 text-sm">
                                        ยังไม่มีตอนให้อ่าน
                                    </div>
                                )}

                                <button
                                    onClick={() =>
                                        document.getElementById('chapter-list')?.scrollIntoView({
                                            behavior: 'smooth',
                                            block: 'start',
                                        })
                                    }
                                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-neutral-200 font-semibold text-sm transition-colors"
                                >
                                    <svg
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.8"
                                        className="w-4 h-4"
                                    >
                                        <path
                                            d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                    ดูรายการตอน
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Chapter list */}
            <section
                id="chapter-list"
                className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 scroll-mt-24"
            >
                {/* Section heading */}
                <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 mb-7">
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-red-400 mb-2">
                            Start Reading
                        </p>

                        <h2 className="text-2xl sm:text-3xl font-black text-white">
                            รายการตอน
                        </h2>

                        <p className="text-sm text-neutral-500 mt-2">
                            ทั้งหมด {chapters.length.toLocaleString()} ตอน
                        </p>
                    </div>

                    {/* Search and sort */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1 sm:w-64">
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500"
                            >
                                <circle cx="11" cy="11" r="7" />
                                <path
                                    d="m16 16 4 4"
                                    strokeLinecap="round"
                                />
                            </svg>

                            <input
                                type="search"
                                value={searchChapter}
                                onChange={(event) =>
                                    setSearchChapter(event.target.value)
                                }
                                placeholder="ค้นหาตอน..."
                                aria-label="ค้นหาตอน"
                                className="w-full h-11 pl-10 pr-4 rounded-xl bg-white/[0.03] border border-white/10 focus:border-red-500/50 focus:outline-none focus:ring-2 focus:ring-red-500/10 text-sm text-white placeholder:text-neutral-600 transition-all"
                            />
                        </div>

                        <button
                            onClick={() => setSortDesc((prev) => !prev)}
                            className="h-11 inline-flex items-center justify-center gap-2 px-4 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 text-neutral-300 text-xs sm:text-sm font-medium transition-colors"
                        >
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                className="w-4 h-4"
                            >
                                <path
                                    d="M4 7h16M7 12h10M10 17h4"
                                    strokeLinecap="round"
                                />
                            </svg>
                            {sortDesc ? 'ตอนล่าสุดก่อน' : 'ตอนแรกก่อน'}
                            <span className="text-neutral-500">
                                {sortDesc ? '↓' : '↑'}
                            </span>
                        </button>
                    </div>
                </div>

                {/* Chapter count */}
                {chapters.length > 0 && (
                    <div className="flex items-center justify-between gap-3 mb-4">
                        <p className="text-xs text-neutral-500">
                            แสดง {sortedChapters.length.toLocaleString()} จาก{' '}
                            {chapters.length.toLocaleString()} ตอน
                        </p>

                        {searchChapter && (
                            <button
                                onClick={() => setSearchChapter('')}
                                className="text-xs text-red-400 hover:text-red-300 transition-colors"
                            >
                                ล้างการค้นหา ✕
                            </button>
                        )}
                    </div>
                )}

                {/* Empty states */}
                {chapters.length === 0 ? (
                    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] px-6 py-16 text-center">
                        <div className="text-4xl opacity-40 mb-5">冊</div>
                        <h3 className="text-base font-semibold text-neutral-300">
                            ยังไม่มีตอนให้อ่าน
                        </h3>
                        <p className="text-sm text-neutral-600 mt-2">
                            ยังไม่พบรายการตอนของมังงะเรื่องนี้
                        </p>
                    </div>
                ) : sortedChapters.length === 0 ? (
                    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] px-6 py-14 text-center">
                        <div className="text-3xl opacity-40 mb-4">⌕</div>
                        <h3 className="text-base font-semibold text-neutral-300">
                            ไม่พบตอนที่ค้นหา
                        </h3>
                        <p className="text-sm text-neutral-600 mt-2 mb-5">
                            ลองค้นหาด้วยเลขตอนหรือชื่ออื่น
                        </p>
                        <button
                            onClick={() => setSearchChapter('')}
                            className="px-4 py-2 rounded-lg bg-white/[0.05] hover:bg-white/10 border border-white/10 text-sm transition-colors"
                        >
                            แสดงทุกตอน
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {sortedChapters.map((chapter, index) => {
                            const number = formatChapterNumber(chapter);
                            const chapterTitle = String(
                                chapter.title || ''
                            ).trim();

                            const displayTitle =
                                chapterTitle &&
                                !/^ตอนที่\s*[\d.]+$/i.test(chapterTitle)
                                    ? chapterTitle
                                    : number === 'พิเศษ'
                                        ? 'ตอนพิเศษ'
                                        : `ตอนที่ ${number}`;

                            return (
                                <button
                                    key={chapter.id}
                                    type="button"
                                    onClick={() =>
                                        navigate(`/read/${chapter.id}`)
                                    }
                                    className="group w-full min-w-0 text-left flex items-center gap-4 p-4 rounded-2xl bg-white/[0.025] hover:bg-white/[0.055] border border-white/[0.07] hover:border-red-500/30 transition-all duration-200"
                                >
                                    {/* Chapter number */}
                                    <div className="w-12 h-14 shrink-0 rounded-xl bg-[#121318] border border-white/[0.07] group-hover:border-red-500/30 flex flex-col items-center justify-center transition-colors">
                                        <span className="text-[9px] text-neutral-600 uppercase tracking-wider">
                                            CH
                                        </span>
                                        <span className="text-sm font-bold text-neutral-300 group-hover:text-red-400 transition-colors">
                                            {number === 'พิเศษ'
                                                ? 'SP'
                                                : number}
                                        </span>
                                    </div>

                                    {/* Chapter info */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[10px] uppercase tracking-wider text-neutral-600 mb-1">
                                            Chapter {number}
                                        </p>

                                        <h3 className="font-semibold text-sm text-neutral-200 group-hover:text-white truncate transition-colors">
                                            {displayTitle}
                                        </h3>

                                        {chapter.volume != null && (
                                            <p className="text-[11px] text-neutral-600 mt-1">
                                                เล่ม {chapter.volume}
                                            </p>
                                        )}

                                        {chapter.created_at && (
                                            <p className="text-[11px] text-neutral-600 mt-1">
                                                {new Date(
                                                    chapter.created_at
                                                ).toLocaleDateString('th-TH', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric',
                                                })}
                                            </p>
                                        )}
                                    </div>

                                    {/* Read icon */}
                                    <div className="w-9 h-9 shrink-0 rounded-full bg-white/[0.04] group-hover:bg-red-500 flex items-center justify-center text-neutral-500 group-hover:text-white transition-all">
                                        <svg
                                            viewBox="0 0 24 24"
                                            fill="currentColor"
                                            className="w-4 h-4 translate-x-px"
                                        >
                                            <path d="M8 5.5a1 1 0 0 1 1.5-.86l9.2 5.5a1 1 0 0 1 0 1.72l-9.2 5.5A1 1 0 0 1 8 16.5v-11Z" />
                                        </svg>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}

                {/* Footer */}
                <div className="mt-12 pt-7 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-neutral-600 text-center sm:text-left">
                        กำลังอ่านเรื่อง {manga.title}
                    </p>

                    <button
                        onClick={() => window.scrollTo({
                            top: 0,
                            behavior: 'smooth',
                        })}
                        className="inline-flex items-center gap-2 text-xs text-neutral-500 hover:text-white transition-colors"
                    >
                        กลับด้านบน
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            className="w-4 h-4"
                        >
                            <path
                                d="m6 14 6-6 6 6"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </button>
                </div>
            </section>
        </div>
    );
}

export default MangaDetail;
