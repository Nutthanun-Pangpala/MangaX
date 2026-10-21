// src/pages/MangaDetail.jsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Footer from '../component/footer';
import NavBar from '../component/navBar';

function MangaDetail() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [manga, setManga] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sortDesc, setSortDesc] = useState(true);
    const [isBookmarked, setIsBookmarked] = useState(false);

    const [tiltStyle, setTiltStyle] = useState({});

    useEffect(() => {
        setLoading(true);
        fetch(import.meta.env.VITE_API_URL+`/api/manga/${id}`)
            .then((res) => res.json())
            .then((resData) => {
                if (resData.success) {
                    setManga(resData.data);
                } else {
                    setError(resData.message || 'ไม่พบข้อมูลมังงะ');
                }
                setLoading(false);
            })
            .catch((err) => {
                console.error('Error fetching manga detail:', err);
                setError('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
                setLoading(false);
            });
    }, [id]);

    const handleMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const rotateY = ((x / rect.width) - 0.5) * 18;
        const rotateX = ((0.5 - (y / rect.height)) * 18);

        setTiltStyle({
            transform: `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.04, 1.04, 1.04)`,
            transition: 'transform 0.1s ease-out',
        });
    };

    const handleMouseLeave = () => {
        setTiltStyle({
            transform: 'perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
            transition: 'transform 0.4s ease-out',
        });
    };
    if (loading) {
        return (
            <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">
                <div className="animate-pulse text-neutral-400">กำลังโหลดข้อมูลมังงะ...</div>
            </div>
        );
    }

    if (error || !manga) {
        return (
            <div className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center gap-4">
                <p className="text-red-500 text-lg font-semibold">{error}</p>
                <Link to="/" className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-sm">
                    &lt; กลับหน้าหลัก
                </Link>
            </div>
        );
    }

    const chapters = manga.chapters || [];
    const sortedChapters = [...chapters].sort((a, b) =>
        sortDesc ? b.chapter_number - a.chapter_number : a.chapter_number - b.chapter_number
    );

    const firstChapter = chapters.length > 0 ? chapters[0] : null;
    const totalMotionScenes = chapters.reduce((sum, ch) => sum + (ch.motion_count || 0), 0);

    return (
        <div className="min-h-screen bg-neutral-950 text-neutral-100 pb-20">
            <NavBar />

            {/* พื้นหลังเบลอซ้อนด้านหลัง (Ambient Backdrop) */}
            <div className="relative pt-24 pb-12 overflow-hidden border-b border-neutral-800/80">
                <div
                    className="absolute inset-0 bg-cover bg-center opacity-15 blur-2xl scale-110 pointer-events-none"
                    style={{ backgroundImage: `url(${manga.cover_url})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/80 to-neutral-950/40 pointer-events-none" />

                <div className="relative z-10 max-w-5xl mx-auto px-6">
                    {/* ปุ่มกลับหน้าหลัก */}
                    <Link
                        to="/"
                        className="inline-flex items-center gap-1.5 text-sm text-neutral-400 hover:text-red-500 transition-colors mb-6"
                    >
                        <span>&lt;</span> กลับหน้าหลัก
                    </Link>

                    {/* ส่วนข้อมูลหลัก (Hero Detail) */}
                    <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                        {/* ภาพปกแบบ Parallax ขยับตามเมาส์ */}
                        <div
                            onMouseMove={handleMouseMove}
                            onMouseLeave={handleMouseLeave}
                            style={tiltStyle}
                            className="w-56 sm:w-64 aspect-[3/4] rounded-xl overflow-hidden border border-neutral-700/80 shadow-[0_15px_35px_rgba(220,38,38,0.2)] shrink-0 bg-neutral-900 cursor-pointer"
                        >
                            <img
                                src={manga.cover_url}
                                alt={manga.title}
                                className="w-full h-full object-cover"
                            />
                        </div>

                        {/* รายละเอียดเรื่อง */}
                        <div className="flex-1 text-center md:text-left">
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-3">
                                <span className="px-2.5 py-1 text-xs font-extrabold bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-md shadow">
                                    ✨ AI MOTION SERIES
                                </span>
                                <span className="px-2.5 py-1 text-xs font-medium bg-neutral-800 text-neutral-300 rounded-md border border-neutral-700">
                                    ทั้งหมด {chapters.length} ตอน
                                </span>
                                {totalMotionScenes > 0 && (
                                    <span className="px-2.5 py-1 text-xs font-semibold bg-red-950/60 text-red-400 border border-red-800/50 rounded-md">
                                        🔥 รวม {totalMotionScenes} ฉากเคลื่อนไหว
                                    </span>
                                )}
                            </div>

                            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white mb-2">
                                {manga.title}
                            </h1>

                            <p className="text-xs sm:text-sm text-neutral-400 mb-4">
                                หมวดหมู่: <span className="text-neutral-200">แอ็กชัน, แฟนตาซี</span> | สถานะ:{' '}
                                <span className="text-emerald-400 font-medium">กำลังดำเนินเรื่อง</span>
                            </p>

                            <p className="text-sm sm:text-base text-neutral-300 leading-relaxed mb-8 max-w-2xl">
                                {manga.description || 'ไม่มีคำอธิบายเรื่องย่อสำหรับมังงะเรื่องนี้'}
                            </p>

                            {/* ปุ่ม Action */}
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                                {firstChapter && (
                                    <button
                                        onClick={() => navigate(`/read/${firstChapter.id}`)}
                                        className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-red-950/80 transition-all transform hover:-translate-y-0.5 flex items-center gap-2 cursor-pointer"
                                    >
                                        <span>▶</span> อ่านตอนแรก (ตอนที่ {firstChapter.chapter_number})
                                    </button>
                                )}

                                <button
                                    onClick={() => setIsBookmarked(!isBookmarked)}
                                    className={`px-5 py-3 text-sm font-semibold rounded-xl border transition-all flex items-center gap-2 cursor-pointer ${isBookmarked
                                            ? 'bg-rose-950/50 border-rose-600 text-rose-400'
                                            : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-700 text-neutral-200'
                                        }`}
                                >
                                    <span>{isBookmarked ? '❤️' : '🤍'}</span>
                                    {isBookmarked ? 'เก็บในชั้นหนังสือแล้ว' : 'เก็บเข้าชั้นหนังสือ'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ส่วนรายการตอนทั้งหมด (Chapter Selection List) */}
            <div className="max-w-5xl mx-auto px-6 mt-10">
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        📑 รายการตอนทั้งหมด
                        <span className="text-sm font-normal text-neutral-400">({chapters.length} ตอน)</span>
                    </h2>

                    <button
                        onClick={() => setSortDesc(!sortDesc)}
                        className="text-xs sm:text-sm px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-lg text-neutral-300 transition-colors cursor-pointer"
                    >
                        {sortDesc ? '🔽 เรียง: ตอนล่าสุด -> ตอนแรก' : '🔼 เรียง: ตอนแรก -> ตอนล่าสุด'}
                    </button>
                </div>

                {sortedChapters.length === 0 ? (
                    <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-12 text-center text-neutral-500">
                        ยังไม่มีตอนที่อัปโหลดในขณะนี้
                    </div>
                ) : (
                    <div className="space-y-3">
                        {sortedChapters.map((chapter) => {
                            const hasMotion = chapter.motion_count > 0;
                            const formattedDate = chapter.created_at
                                ? new Date(chapter.created_at).toLocaleDateString('th-TH', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                })
                                : '';

                            return (
                                <div
                                    key={chapter.id}
                                    onClick={() => navigate(`/read/${chapter.id}`)}
                                    className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-neutral-900/90 hover:bg-neutral-800/90 border border-neutral-800 hover:border-red-600/70 rounded-xl transition-all cursor-pointer gap-3"
                                >
                                    {/* ชื่อตอน */}
                                    <div className="flex items-center gap-3">
                                        <span className="w-10 h-10 rounded-lg bg-neutral-950 border border-neutral-800 group-hover:border-red-600/50 flex items-center justify-center font-bold text-sm text-neutral-300 group-hover:text-red-500 transition-colors">
                                            #{chapter.chapter_number}
                                        </span>
                                        <div>
                                            <h3 className="font-semibold text-neutral-100 group-hover:text-red-500 transition-colors">
                                                ตอนที่ {chapter.chapter_number}
                                                {chapter.title ? `: ${chapter.title}` : ''}
                                            </h3>
                                            <span className="text-xs text-neutral-500">{formattedDate}</span>
                                        </div>
                                    </div>

                                    {/* ป้ายบอกจำนวนฉากเคลื่อนไหว AI */}
                                    <div className="flex items-center justify-between sm:justify-end gap-4">
                                        {hasMotion ? (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold bg-gradient-to-r from-red-600/20 to-rose-600/20 text-red-400 border border-red-600/40 rounded-full shadow-sm">
                                                <span>✨</span> มีฉากเคลื่อนไหว AI {chapter.motion_count} ฉาก!
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium bg-neutral-800 text-neutral-400 rounded-full">
                                                <span>📖</span> ภาพนิ่งปกติ
                                            </span>
                                        )}

                                        <span className="text-xs font-semibold text-neutral-400 group-hover:text-white group-hover:translate-x-1 transition-all">
                                            อ่านเลย &gt;
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
            <Footer/>
        </div>
    );
}

export default MangaDetail;