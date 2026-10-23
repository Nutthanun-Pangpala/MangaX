
// src/pages/Reader.jsx
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

function Reader() {
    const { chapterId } = useParams();
    const navigate = useNavigate();

    const [pages, setPages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isMotionEnabled, setIsMotionEnabled] = useState(true);
    const [showControls, setShowControls] = useState(true);
    const [scrollProgress, setScrollProgress] = useState(0);
    const [chapterInfo, setChapterInfo] = useState(null);

    // Fetch chapter pages
    const fetchPages = useCallback(async (signal) => {
        setLoading(true);
        setError('');

        try {
            const apiUrl = import.meta.env.VITE_API_URL;

            if (!apiUrl) {
                throw new Error('ไม่พบการตั้งค่า API URL');
            }

            const response = await fetch(
                `${apiUrl}/api/chapters/${chapterId}/pages`,
                { signal }
            );

            if (!response.ok) {
                throw new Error(`ไม่สามารถโหลดข้อมูลได้ (${response.status})`);
            }

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.message || 'ไม่สามารถโหลดหน้ามังงะได้');
            }

            setPages(Array.isArray(result.data) ? result.data : []);
        } catch (err) {
            if (err.name === 'AbortError') return;

            console.error('Error fetching chapter pages:', err);
            setError(err.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
        } finally {
            if (!signal.aborted) {
                setLoading(false);
            }
        }
    }, [chapterId]);

    const fetchChapterInfo = useCallback(async (signal) => {
        try {
            const apiUrl = import.meta.env.VITE_API_URL || '';

            // ดึงข้อมูลตอนจาก MangaDex โดยใช้ Chapter ID
            const response = await fetch(
                `${apiUrl}/api/mangadex/chapters/${chapterId}`,
                { signal }
            );

            if (!response.ok) {
                return;
            }

            const result = await response.json();

            if (result.success && result.data) {
                setChapterInfo(result.data);
            }
        } catch (err) {
            if (err.name !== 'AbortError') {
                console.error('Error fetching chapter info:', err);
            }
        }
    }, [chapterId]);


    useEffect(() => {
        const controller = new AbortController();

        fetchPages(controller.signal);

        return () => controller.abort();
    }, [fetchPages]);

    // Reading progress
    useEffect(() => {
        const updateProgress = () => {
            const scrollableHeight =
                document.documentElement.scrollHeight - window.innerHeight;

            const progress = scrollableHeight > 0
                ? (window.scrollY / scrollableHeight) * 100
                : 0;

            setScrollProgress(Math.min(100, Math.max(0, progress)));
        };

        window.addEventListener('scroll', updateProgress, { passive: true });
        window.addEventListener('resize', updateProgress);
        updateProgress();

        return () => {
            window.removeEventListener('scroll', updateProgress);
            window.removeEventListener('resize', updateProgress);
        };
    }, [pages, loading]);

    // Retry after an error
    const handleRetry = () => {
        const controller = new AbortController();
        fetchPages(controller.signal);
    };

    // Scroll to top
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const displayChapter =
        chapterInfo?.chapter_number != null
            ? `ตอนที่ ${chapterInfo.chapter_number}`
            : chapterInfo?.title ||
            'ตอนพิเศษ';

    // Loading screen
    if (loading) {
        return (
            <div className="min-h-screen bg-[#08090c] text-white flex flex-col items-center justify-center gap-6">
                <div className="relative flex items-center justify-center">
                    <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                        <span className="text-3xl">漫</span>
                    </div>
                    <div className="absolute inset-0 rounded-2xl border-2 border-red-500 border-t-transparent animate-spin" />
                </div>

                <div className="text-center space-y-2">
                    <h2 className="text-lg font-bold tracking-wide">
                        กำลังเตรียมหน้าการ์ตูน
                    </h2>
                    <p className="text-sm text-neutral-500">
                        กำลังโหลดตอนที่ {displayChapter}...
                    </p>
                </div>

                <div className="w-36 h-1 rounded-full bg-neutral-800 overflow-hidden">
                    <div className="h-full w-1/2 bg-red-500 rounded-full animate-pulse" />
                </div>
            </div>
        );
    }

    // Error screen
    if (error) {
        return (
            <div className="min-h-screen bg-[#08090c] text-white flex items-center justify-center px-6">
                <div className="max-w-md w-full text-center p-8 rounded-3xl border border-white/10 bg-white/[0.03]">
                    <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-3xl">
                        !
                    </div>

                    <h2 className="text-xl font-bold mb-3">
                        โหลดมังงะไม่สำเร็จ
                    </h2>

                    <p className="text-sm text-neutral-400 leading-6 mb-7">
                        {error}
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <button
                            onClick={handleRetry}
                            className="px-5 py-3 rounded-xl bg-red-600 hover:bg-red-500 font-semibold text-sm transition-colors"
                        >
                            ลองอีกครั้ง
                        </button>

                        <button
                            onClick={() => navigate(-1)}
                            className="px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm transition-colors"
                        >
                            กลับหน้าก่อนหน้า
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#08090c] text-neutral-100 selection:bg-red-500/30">

            {/* Reading progress bar */}
            <div className="fixed top-0 inset-x-0 z-[60] h-[2px] bg-white/5">
                <div
                    className="h-full bg-gradient-to-r from-red-700 via-red-500 to-orange-400 transition-[width] duration-150"
                    style={{ width: `${scrollProgress}%` }}
                />
            </div>

            {/* Top navigation */}
            <header
                className={`fixed top-[2px] inset-x-0 z-50 transition-transform duration-300 ${showControls ? 'translate-y-0' : '-translate-y-full'
                    }`}
            >
                <div className="bg-[#0b0c10]/90 backdrop-blur-2xl border-b border-white/[0.07] shadow-lg shadow-black/10">
                    <div className="max-w-6xl mx-auto px-3 sm:px-6 h-[68px] flex items-center justify-between gap-3">

                        {/* Back button */}
                        <button
                            onClick={() => navigate(-1)}
                            aria-label="กลับหน้ารายละเอียด"
                            className="group flex items-center gap-2 px-3 py-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/[0.06] transition-all"
                        >
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform"
                            >
                                <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <span className="hidden sm:inline text-sm">
                                กลับ
                            </span>
                        </button>

                        {/* Chapter info */}
                        <div className="flex-1 text-center min-w-0">
                            <div className="flex items-center justify-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                                <h1 className="text-sm sm:text-base font-bold text-white truncate">
                                    ตอนที่ {displayChapter}
                                </h1>
                            </div>

                            <p className="text-[10px] sm:text-xs text-neutral-500 mt-1 tracking-wider">
                                {pages.length} PAGES
                            </p>
                        </div>

                        {/* Motion switch */}
                        <button
                            type="button"
                            onClick={() => setIsMotionEnabled((prev) => !prev)}
                            aria-pressed={isMotionEnabled}
                            className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all duration-200 ${isMotionEnabled
                                ? 'bg-red-500/10 border-red-500/30 text-red-400'
                                : 'bg-white/[0.03] border-white/10 text-neutral-400 hover:bg-white/[0.07]'
                                }`}
                        >
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                className="w-4 h-4"
                            >
                                <path
                                    d="M13 2 4.5 13H11l-1 9 9.5-12H13l0-8Z"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>

                            <span className="hidden sm:inline text-xs font-semibold">
                                AI Motion
                            </span>

                            <span
                                className={`w-2 h-2 rounded-full ${isMotionEnabled
                                    ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]'
                                    : 'bg-neutral-600'
                                    }`}
                            />
                        </button>
                    </div>
                </div>
            </header>

            {/* Reader background */}
            <main className="min-h-screen pt-[82px] pb-20">

                {/* Reading title */}
                <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-5 pb-6">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <p className="text-[10px] uppercase tracking-[0.3em] text-red-400 font-semibold mb-2">
                                Manga Reader
                            </p>
                            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                                Chapter {displayChapter}
                            </h2>
                            <p className="text-xs sm:text-sm text-neutral-500 mt-2">
                                เลื่อนลงเพื่ออ่านหน้าถัดไป
                            </p>
                        </div>

                        <div className="hidden sm:flex flex-col items-end gap-2">
                            <span className="text-xs text-neutral-500">
                                READING PROGRESS
                            </span>
                            <span className="text-lg font-semibold tabular-nums text-neutral-300">
                                {Math.round(scrollProgress)}%
                            </span>
                        </div>
                    </div>
                </div>

                {/* Manga pages */}
                <div className="max-w-3xl mx-auto px-2 sm:px-6 space-y-3 sm:space-y-5">
                    {pages.length === 0 ? (
                        <div className="py-28 text-center rounded-2xl border border-white/[0.06] bg-white/[0.02]">
                            <div className="text-4xl mb-5 opacity-40">冊</div>
                            <h3 className="font-semibold text-neutral-300">
                                ยังไม่มีหน้ามังงะ
                            </h3>
                            <p className="text-sm text-neutral-600 mt-2">
                                ไม่พบหน้าการ์ตูนในตอนนี้
                            </p>
                        </div>
                    ) : (
                        pages.map((page, index) => (
                            <section
                                key={page.id}
                                className="relative group bg-[#101115] rounded-sm sm:rounded-lg overflow-hidden shadow-[0_12px_50px_rgba(0,0,0,0.3)]"
                            >
                                {/* Page label */}
                                <div className="absolute top-2 left-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                    <span className="text-[10px] font-medium text-white/80 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md">
                                        {String(page.page_number ?? index + 1).padStart(2, '0')}
                                    </span>
                                </div>

                                {/* Original manga page */}
                                <img
                                    src={page.image_url}
                                    alt={`หน้าที่ ${page.page_number ?? index + 1}`}
                                    className="block w-full h-auto select-none"
                                    loading={index < 2 ? 'eager' : 'lazy'}
                                    decoding="async"
                                    draggable="false"
                                />

                                {/* Animated panels */}
                                {isMotionEnabled &&
                                    Array.isArray(page.animated_panels) &&
                                    page.animated_panels.map((panel) => (
                                        <div
                                            key={panel.id}
                                            className="absolute z-10 overflow-hidden"
                                            style={{
                                                left: `${panel.pos_x}%`,
                                                top: `${panel.pos_y}%`,
                                                width: `${panel.width}%`,
                                                height: `${panel.height}%`,
                                            }}
                                        >
                                            <video
                                                src={panel.video_url}
                                                autoPlay
                                                loop
                                                muted
                                                playsInline
                                                preload="metadata"
                                                className="block w-full h-full object-cover"
                                                style={{
                                                    outline: '1px solid rgba(239, 68, 68, 0.35)',
                                                    outlineOffset: '-1px',
                                                }}
                                            />
                                        </div>
                                    ))}
                            </section>
                        ))
                    )}
                </div>

                {/* End of chapter */}
                {pages.length > 0 && (
                    <div className="max-w-3xl mx-auto px-4 pt-14 pb-8 text-center">
                        <div className="w-12 h-px bg-gradient-to-r from-transparent via-red-500/60 to-transparent mx-auto mb-6" />

                        <p className="text-xs uppercase tracking-[0.25em] text-neutral-600 mb-3">
                            End of Chapter
                        </p>

                        <h3 className="text-lg font-semibold text-neutral-300">
                            อ่านจบแล้ว ✨
                        </h3>

                        <p className="text-sm text-neutral-600 mt-2 mb-7">
                            ขอบคุณที่อ่านจนจบ
                        </p>

                        <button
                            onClick={() => navigate(-1)}
                            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-sm font-medium transition-all"
                        >
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                className="w-4 h-4"
                            >
                                <path d="M19 12H5m7 7-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            กลับหน้ารายละเอียด
                        </button>
                    </div>
                )}
            </main>

            {/* Floating controls */}
            <div
                className={`fixed bottom-5 right-4 sm:right-7 z-40 flex flex-col gap-3 transition-all duration-300 ${showControls
                    ? 'translate-y-0 opacity-100'
                    : 'translate-y-4 opacity-0 pointer-events-none'
                    }`}
            >
                <button
                    onClick={scrollToTop}
                    aria-label="กลับไปด้านบน"
                    className="w-11 h-11 rounded-2xl bg-[#17181d]/90 backdrop-blur-xl border border-white/10 hover:border-red-500/40 hover:bg-red-500/10 text-neutral-300 hover:text-white shadow-xl flex items-center justify-center transition-all"
                >
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="w-5 h-5"
                    >
                        <path d="m18 15-6-6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>

                <button
                    onClick={() => setShowControls(false)}
                    aria-label="ซ่อนแถบควบคุม"
                    title="ซ่อนแถบควบคุม"
                    className="w-11 h-11 rounded-2xl bg-[#17181d]/90 backdrop-blur-xl border border-white/10 hover:bg-white/10 text-neutral-400 hover:text-white shadow-xl flex items-center justify-center transition-all"
                >
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        className="w-5 h-5"
                    >
                        <path d="M6 12h12" strokeLinecap="round" />
                    </svg>
                </button>
            </div>

            {/* Restore controls when hidden */}
            {!showControls && (
                <button
                    onClick={() => setShowControls(true)}
                    aria-label="แสดงแถบควบคุม"
                    className="fixed top-5 right-4 z-[70] px-3 py-2 rounded-xl bg-[#17181d]/95 backdrop-blur-xl border border-white/10 text-neutral-300 hover:text-white text-xs shadow-xl transition-colors"
                >
                    ☰ แสดงเมนู
                </button>
            )}
        </div>
    );
}

export default Reader;