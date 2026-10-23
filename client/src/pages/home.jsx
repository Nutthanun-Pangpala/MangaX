
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../component/footer';
import MangaCard from '../component/mangaCard';
import Carousel from '../component/mangaCarousel';
import NavBar from '../component/navBar';

const PAGE_SIZE = 15;

const sampleMotionVideo =
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';

const Home = () => {
    const navigate = useNavigate();

    const [mangas, setMangas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [searchInput, setSearchInput] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [contentType, setContentType] = useState('all');

    const apiUrl = import.meta.env.VITE_API_URL || '';
    const mangaListRef = useRef(null);


    // ==========================================
    // Fetch manga
    // ==========================================

    const fetchMangas = useCallback(async (signal) => {
        setLoading(true);
        setError('');

        try {
            const params = new URLSearchParams({
                page: String(page),
                limit: String(PAGE_SIZE),
                search: searchQuery,
                type: contentType,
            });

            const response = await fetch(
                `${apiUrl}/api/mangas?${params.toString()}`,
                { signal }
            );

            if (!response.ok) {
                throw new Error(
                    `ไม่สามารถโหลดรายการมังงะได้ (${response.status})`
                );
            }

            const result = await response.json();

            if (!result.success) {
                throw new Error(
                    result.message || 'เกิดข้อผิดพลาดในการโหลดมังงะ'
                );
            }

            setMangas(Array.isArray(result.data) ? result.data : []);

            const pages = Number(result.pagination?.totalPages);

            setTotalPages(
                Number.isFinite(pages) && pages > 0 ? pages : 1
            );
        } catch (err) {
            if (err.name === 'AbortError') return;

            console.error('Fetch manga error:', err);
            setError(
                err.message || 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้'
            );
            setMangas([]);
            setTotalPages(1);
        } finally {
            if (!signal.aborted) {
                setLoading(false);
            }
        }
    }, [apiUrl, page, searchQuery, contentType]);

    useEffect(() => {
        const controller = new AbortController();

        fetchMangas(controller.signal);

        return () => controller.abort();
    }, [fetchMangas]);

    // เลื่อนกลับขึ้นไปยังรายการเมื่อเปลี่ยนหน้า
    useEffect(() => {
        if (!loading) {
            window.scrollTo({
                top: 0,
                behavior: 'smooth',
            });
        }
    }, [apiUrl, page, searchQuery, contentType]);


    // ==========================================
    // Search
    // ==========================================

    const handleSearch = (event) => {
        event.preventDefault();

        const nextQuery = searchInput.trim();

        if (nextQuery === searchQuery) return;

        setPage(1);
        setSearchQuery(nextQuery);
    };

    const clearSearch = () => {
        setSearchInput('');
        setSearchQuery('');
        setPage(1);
    };


    const getMangaCover = (manga) => {
        const cover =
            manga.coverImage ??
            manga.coverUrl ??
            manga.cover_url ??
            manga.cover ??
            manga.thumbnail ??
            manga.image ??
            manga.attributes?.coverImage ??
            manga.attributes?.coverUrl;

        if (typeof cover === 'string') return cover;
        if (typeof cover === 'object' && cover !== null) {
            return cover.url ?? cover.src ?? cover.large ?? cover.original ?? '';
        }

        return '';
    };

    const carouselSlides = mangas.slice(0, 5).map((manga) => ({
        id: manga.id,
        title:
            typeof manga.title === 'string'
                ? manga.title
                : manga.title?.th ??
                manga.title?.en ??
                manga.attributes?.title?.en ??
                'ไม่ระบุชื่อเรื่อง',
        image: getMangaCover(manga),
        tag: 'แนะนำสำหรับคุณ',
        link: `/manga/${manga.id}`,
    }));
    // เลื่อนมายังหัวรายการมังงะเมื่อเปลี่ยนหน้า
    const hasMountedPagination = useRef(false);

    useEffect(() => {
        // ไม่เลื่อนหน้าจอเมื่อเปิดเว็บครั้งแรก
        if (!hasMountedPagination.current) {
            hasMountedPagination.current = true;
            return;
        }

        const target = mangaListRef.current;
        if (!target) return;

        const top =
            target.getBoundingClientRect().top +
            window.scrollY -
            100;

        window.scrollTo({
            top: Math.max(0, top),
            behavior: 'smooth',
        });
    }, [page, searchQuery]);



    const goToPage = (nextPage) => {
        if (nextPage < 1 || nextPage > totalPages) return;

        setPage(nextPage);
    };

    // สร้างเลขหน้าแบบย่อ ไม่แสดงปุ่มมากเกินไป
    const getPageNumbers = () => {
        const pages = new Set([
            1,
            totalPages,
            page - 1,
            page,
            page + 1,
        ]);

        return [...pages]
            .filter((number) => number >= 1 && number <= totalPages)
            .sort((a, b) => a - b);
    };

    // ==========================================
    // Loading skeleton
    // ==========================================

    const renderSkeletons = () => (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 2xl:grid-cols-6">
            {Array.from({ length: PAGE_SIZE }).map((_, index) => (
                <div
                    key={index}
                    className="overflow-hidden rounded-2xl border border-white/[0.06] bg-neutral-900/70"
                >
                    <div className="aspect-[3/4] animate-pulse bg-neutral-800" />

                    <div className="space-y-3 p-4">
                        <div className="h-4 w-4/5 animate-pulse rounded bg-neutral-800" />
                        <div className="h-3 w-2/3 animate-pulse rounded bg-neutral-800" />
                        <div className="h-8 w-full animate-pulse rounded-lg bg-neutral-800" />
                    </div>
                </div>
            ))}
        </div>
    );

    // ==========================================
    // Pagination
    // ==========================================

    const renderPagination = () => {
        if (totalPages <= 1) return null;

        const pageNumbers = getPageNumbers();

        return (
            <nav
                aria-label="เปลี่ยนหน้ารายการมังงะ"
                className="mt-14 flex flex-wrap items-center justify-center gap-2"
            >
                <button
                    type="button"
                    onClick={() => goToPage(page - 1)}
                    disabled={page === 1 || loading}
                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-neutral-900 px-4 py-3 text-sm font-semibold text-neutral-300 transition hover:border-red-500/50 hover:bg-neutral-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                >
                    <span aria-hidden="true">←</span>
                    <span className="hidden sm:inline">ก่อนหน้า</span>
                </button>

                {pageNumbers.map((number, index) => {
                    const previousNumber = pageNumbers[index - 1];

                    return (
                        <React.Fragment key={number}>
                            {previousNumber &&
                                number - previousNumber > 1 && (
                                    <span className="px-1 text-neutral-600">
                                        …
                                    </span>
                                )}

                            <button
                                type="button"
                                onClick={() => goToPage(number)}
                                disabled={loading}
                                aria-current={
                                    page === number ? 'page' : undefined
                                }
                                className={`h-11 min-w-11 rounded-xl border px-3 text-sm font-bold transition ${page === number
                                    ? 'border-red-500 bg-red-600 text-white shadow-lg shadow-red-950/40'
                                    : 'border-white/10 bg-neutral-900 text-neutral-400 hover:border-red-500/50 hover:text-white'
                                    } disabled:cursor-not-allowed disabled:opacity-50`}
                            >
                                {number}
                            </button>
                        </React.Fragment>
                    );
                })}

                <button
                    type="button"
                    onClick={() => goToPage(page + 1)}
                    disabled={page >= totalPages || loading}
                    className="inline-flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-30"
                >
                    <span className="hidden sm:inline">ถัดไป</span>
                    <span aria-hidden="true">→</span>
                </button>
            </nav>
        );
    };

    // ==========================================
    // Render
    // ==========================================

    return (
        <div className="relative min-h-screen overflow-hidden bg-[#080808] pb-20 pt-20 text-neutral-100">
            <NavBar />

            {/* Background decoration */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute left-1/2 top-0 -z-0 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-red-600/[0.07] blur-[140px]"
            />

            <main className="relative mx-auto max-w-[1800px] px-4 sm:px-6 lg:px-10">
                {/* Hero */}
                <section className="relative mb-10 overflow-hidden rounded-[28px] border border-white/[0.08] bg-neutral-950">
                    <div
                        aria-hidden="true"
                        className="absolute inset-0 bg-gradient-to-br from-red-950/60 via-neutral-950 to-neutral-950"
                    />

                    <div
                        aria-hidden="true"
                        className="absolute -right-20 -top-28 h-80 w-80 rounded-full border border-red-500/10"
                    />

                    <div
                        aria-hidden="true"
                        className="absolute -right-8 -top-16 h-64 w-64 rounded-full border border-red-500/[0.08]"
                    />

                    <div className="relative grid items-center gap-8 px-6 py-10 sm:px-10 sm:py-14 lg:grid-cols-[1.3fr_0.7fr] lg:px-14 lg:py-16">
                        <div>
                            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs font-bold tracking-wider text-red-400">
                                <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
                                YOUR MANGA DESTINATION
                            </div>

                            <h1 className="max-w-3xl text-4xl font-black leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
                                โลกของมังงะ
                                <br />
                                <span className="bg-gradient-to-r from-red-400 via-red-500 to-orange-400 bg-clip-text text-transparent">
                                    อยู่ตรงหน้าคุณ
                                </span>
                            </h1>

                            <p className="mt-5 max-w-xl text-sm leading-7 text-neutral-400 sm:text-base">
                                ค้นพบเรื่องโปรดเรื่องใหม่ สำรวจโลกแห่งการผจญภัย
                                และสนุกไปกับมังงะหลากหลายแนวในที่เดียว
                            </p>

                            <button
                                type="button"
                                onClick={() => {
                                    document.getElementById('manga-library')
                                        ?.scrollIntoView({
                                            behavior: 'smooth',
                                            block: 'start',
                                        });
                                }}
                                className="mt-7 inline-flex items-center gap-3 rounded-xl bg-red-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-red-950/40 transition hover:-translate-y-0.5 hover:bg-red-500"
                            >
                                <span>สำรวจมังงะ</span>
                                <span aria-hidden="true">↓</span>
                            </button>
                        </div>

                        <div className="hidden lg:block">
                            <div className="ml-auto max-w-sm rounded-2xl border border-white/10 bg-black/30 p-6 backdrop-blur-sm">
                                <div className="mb-4 flex items-center justify-between">
                                    <span className="text-xs font-bold tracking-widest text-neutral-500">
                                        MANGA LIBRARY
                                    </span>
                                    <span className="text-xl">✦</span>
                                </div>

                                <div className="space-y-3">
                                    {[
                                        {
                                            number: '01',
                                            title: 'ค้นหาเรื่องโปรด',
                                            detail: 'Find your next favorite',
                                        },
                                        {
                                            number: '02',
                                            title: 'สำรวจเรื่องใหม่',
                                            detail: 'Explore new adventures',
                                        },
                                        {
                                            number: '03',
                                            title: 'เริ่มอ่านได้ทันที',
                                            detail: 'Jump into the story',
                                        },
                                    ].map((item) => (
                                        <div
                                            key={item.number}
                                            className="flex items-center gap-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3"
                                        >
                                            <span className="text-lg font-black text-red-500">
                                                {item.number}
                                            </span>

                                            <div>
                                                <p className="text-sm font-bold text-neutral-200">
                                                    {item.title}
                                                </p>
                                                <p className="mt-1 text-xs text-neutral-500">
                                                    {item.detail}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Carousel */}
                <section className="mb-14">
                    <div className="mb-5 flex items-center gap-3">
                        <span className="h-7 w-1 rounded-full bg-red-500" />
                        <div>
                            <h2 className="text-lg font-black text-white sm:text-xl">
                                ไฮไลต์มังงะ
                            </h2>
                            <p className="mt-1 text-xs text-neutral-500">
                                เรื่องเด่นที่คุณไม่ควรพลาด
                            </p>
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-2xl">
                        <Carousel slides={carouselSlides} />
                    </div>
                </section>

                {/* Manga library */}
                <section
                    id="manga-library"
                    ref={mangaListRef}
                    className="scroll-mt-28"
                >
                    <div className="mb-7 flex flex-col gap-5 border-b border-white/[0.08] pb-6 xl:flex-row xl:items-end xl:justify-between">
                        <div>
                            <div className="mb-2 flex items-center gap-2 text-xs font-bold tracking-[0.2em] text-red-400">
                                <span>DISCOVER</span>
                                <span className="h-px w-8 bg-red-500/60" />
                                <span className="text-neutral-600">
                                    MANGA COLLECTION
                                </span>
                            </div>

                            <h2 className="flex flex-wrap items-center gap-3 text-2xl font-black text-white sm:text-3xl">
                                <span>คลังมังงะ</span>

                                <span className="rounded-lg border border-red-500/20 bg-red-500/10 px-2.5 py-1 text-xs font-bold text-red-400">
                                    {page} / {totalPages}
                                </span>
                            </h2>

                            <p className="mt-2 text-sm text-neutral-500">
                                {searchQuery
                                    ? `ผลการค้นหาสำหรับ "${searchQuery}"`
                                    : 'ค้นพบเรื่องราวใหม่ ๆ ที่รอให้คุณออกไปผจญภัย'}
                            </p>
                        </div>
                        {/* Manga Type Filter */}
                        <div className="mb-6 flex flex-wrap gap-3">
                            {[
                                { value: 'all', label: 'ทั้งหมด', icon: '🌐' },
                                { value: 'manga', label: 'Manga', icon: '🇯🇵' },
                                { value: 'manhwa', label: 'Manhwa', icon: '🇰🇷' },
                                { value: 'manhua', label: 'Manhua', icon: '🇨🇳' },
                            ].map((type) => (
                                <button
                                    key={type.value}
                                    type="button"
                                    onClick={() => {
                                        setContentType(type.value);
                                        setPage(1);
                                    }}
                                    aria-pressed={contentType === type.value}
                                    className={`rounded-xl border px-5 py-3 text-sm font-bold transition ${contentType === type.value
                                            ? 'border-red-500 bg-red-600 text-white shadow-lg shadow-red-950/30'
                                            : 'border-white/10 bg-neutral-900 text-neutral-400 hover:border-red-500/50 hover:text-white'
                                        }`}
                                >
                                    <span className="mr-2">{type.icon}</span>
                                    {type.label}
                                </button>
                            ))}
                        </div>

                        {/* Search */}
                        <form
                            onSubmit={handleSearch}
                            role="search"
                            className="flex w-full flex-col gap-2 sm:flex-row xl:max-w-xl"
                        >
                            <div className="relative min-w-0 flex-1">
                                <span
                                    aria-hidden="true"
                                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg text-neutral-500"
                                >
                                    ⌕
                                </span>

                                <input
                                    type="search"
                                    value={searchInput}
                                    onChange={(event) =>
                                        setSearchInput(event.target.value)
                                    }
                                    placeholder="ค้นหาชื่อมังงะ..."
                                    aria-label="ค้นหาชื่อมังงะ"
                                    className="w-full rounded-xl border border-white/10 bg-neutral-900/80 py-3.5 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-neutral-600 focus:border-red-500/60 focus:ring-4 focus:ring-red-500/10"
                                />
                            </div>

                            <button
                                type="submit"
                                className="rounded-xl bg-red-600 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-red-500"
                            >
                                ค้นหา
                            </button>

                            {(searchQuery || searchInput) && (
                                <button
                                    type="button"
                                    onClick={clearSearch}
                                    className="rounded-xl border border-white/10 bg-neutral-900 px-4 py-3.5 text-sm font-semibold text-neutral-300 transition hover:bg-neutral-800 hover:text-white"
                                >
                                    ล้าง
                                </button>
                            )}
                        </form>
                    </div>

                    {/* Results count */}
                    {!loading && !error && mangas.length > 0 && (
                        <div className="mb-5 flex items-center justify-between">
                            <p className="text-xs text-neutral-500">
                                หน้า {page} จาก {totalPages}
                            </p>

                            <span className="inline-flex items-center gap-2 text-xs text-neutral-500">
                                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                                พร้อมอ่าน
                            </span>
                        </div>
                    )}

                    {/* Loading */}
                    {loading ? (
                        renderSkeletons()
                    ) : error ? (
                        <div className="rounded-2xl border border-red-500/20 bg-red-950/10 px-5 py-16 text-center">
                            <div className="mb-4 text-4xl">⚠</div>

                            <h3 className="text-lg font-bold text-white">
                                โหลดมังงะไม่สำเร็จ
                            </h3>

                            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-neutral-400">
                                {error}
                            </p>

                            <button
                                type="button"
                                onClick={() => {
                                    const controller = new AbortController();
                                    fetchMangas(controller.signal);
                                }}
                                className="mt-6 rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-500"
                            >
                                ลองอีกครั้ง
                            </button>
                        </div>
                    ) : mangas.length === 0 ? (
                        <div className="rounded-2xl border border-white/[0.08] bg-neutral-900/30 px-5 py-20 text-center">
                            <div className="mb-4 text-5xl">⌕</div>

                            <h3 className="text-lg font-bold text-white">
                                ไม่พบมังงะที่ค้นหา
                            </h3>

                            <p className="mt-2 text-sm text-neutral-500">
                                ลองค้นหาด้วยชื่ออื่น หรือกลับไปสำรวจมังงะทั้งหมด
                            </p>

                            <button
                                type="button"
                                onClick={clearSearch}
                                className="mt-6 rounded-xl border border-red-500/30 bg-red-600/10 px-5 py-3 text-sm font-bold text-red-400 transition hover:bg-red-600 hover:text-white"
                            >
                                ดูมังงะทั้งหมด
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 2xl:grid-cols-6">
                                {mangas.map((manga) => (
                                    <div
                                        key={manga.id}
                                        className="scroll-mt-24"
                                    >
                                        <MangaCard
                                            manga={manga}
                                            hasMotion={true}
                                            previewVideoUrl={sampleMotionVideo}
                                            onClick={() =>
                                                navigate(`/manga/${manga.id}`)
                                            }
                                        />
                                    </div>
                                ))}
                            </div>

                            {renderPagination()}
                        </>
                    )}
                </section>

                {/* Footer */}
                <footer>
                    <Footer />
                </footer>
            </main>
        </div>
    );
};

export default Home;
