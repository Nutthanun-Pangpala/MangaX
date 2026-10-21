// src/components/MangaCard.jsx
import React, { useRef, useState } from 'react';

const MangaCard = ({ manga, previewVideoUrl, hasMotion = true, onClick }) => {
    const [isHovered, setIsHovered] = useState(false);
    const videoRef = useRef(null);

    // ควบคุมการเล่น/หยุดวิดีโอเมื่อ Hover
    const handleMouseEnter = () => {
        setIsHovered(true);
        if (videoRef.current) {
            videoRef.current.currentTime = 0;
            videoRef.current.play().catch(() => { });
        }
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
        if (videoRef.current) {
            videoRef.current.pause();
        }
    };

    return (
        <div
            onClick={onClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className="group relative flex flex-col bg-neutral-900 rounded-xl overflow-hidden border border-neutral-800 hover:border-red-600/80 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-[0_12px_28px_rgba(220,38,38,0.25)] cursor-pointer select-none"
        >
            {/* 1. ส่วนรูปภาพปก & วิดีโอพรีวิว (Thumbnail Area) */}
            <div className="relative w-full aspect-[3/4] bg-neutral-950 overflow-hidden">

                {/* ป้ายกำกับ AI Motion */}
                {hasMotion && (
                    <div className="absolute top-2.5 left-2.5 z-20 flex items-center gap-1 px-2.5 py-1 text-[11px] font-extrabold tracking-wide text-white bg-gradient-to-r from-red-600 to-rose-600 rounded-md shadow-lg shadow-black/60">
                        <span>✨</span> AI MOTION
                    </div>
                )}

                {/* ป้ายเรตติ้งหรือตอนล่าสุด (มุมขวาบน) */}
                <div className="absolute top-2.5 right-2.5 z-20 px-2 py-0.5 text-[11px] font-semibold bg-neutral-950/80 backdrop-blur-md text-neutral-300 rounded border border-neutral-700/60">
                    ตอนที่ {manga.latest_chapter || '1'}
                </div>

                {/* ภาพนิ่งหน้าปก */}
                <img
                    src={manga.cover_url}
                    alt={manga.title}
                    loading="lazy"
                    className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${isHovered && previewVideoUrl ? 'opacity-0 scale-110' : 'opacity-100'
                        }`}
                />

                {/* วิดีโอเล่นวนเมื่อเอาเมาส์ชี้ (Hover-to-Play) */}
                {previewVideoUrl && (
                    <video
                        ref={videoRef}
                        src={previewVideoUrl}
                        loop
                        muted
                        playsInline
                        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'
                            }`}
                    />
                )}

                {/* เงา Gradient ด้านล่างภาพ */}
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-neutral-900 via-neutral-900/40 to-transparent pointer-events-none" />
            </div>

            {/* 2. รายละเอียดมังงะ (Card Information) */}
            <div className="p-4 flex flex-col flex-1 justify-between">
                <div>
                    {/* ชื่อเรื่อง */}
                    <h3 className="font-bold text-base text-neutral-100 group-hover:text-red-500 transition-colors line-clamp-1">
                        {manga.title}
                    </h3>

                    {/* เรื่องย่อ */}
                    <p className="text-xs text-neutral-400 mt-1.5 line-clamp-2 leading-relaxed">
                        {manga.description || 'ไม่มีคำอธิบายเรื่องย่อ'}
                    </p>
                </div>

                {/* แถบด้านล่าง: หมวดหมู่ / ปุ่มกดอ่าน */}
                <div className="mt-3 pt-3 border-t border-neutral-800/80 flex items-center justify-between text-xs text-neutral-500">
                    <span className="hover:text-neutral-300 transition-colors">
                        {manga.genre || 'Action / Fantasy'}
                    </span>
                    <span className="text-red-500 font-semibold group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
                        อ่านเลย <span>›</span>
                    </span>
                </div>
            </div>
        </div>
    );
};

export default MangaCard;