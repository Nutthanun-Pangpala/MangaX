// src/components/Carousel.jsx
import React, { useEffect, useState } from 'react';

const defaultSlides = [
    {
        id: 1,
        title: 'ดาบพิฆาตอสูร',
        subtitle: 'สัมผัสประสบการณ์ฉากต่อสู้แบบมีชีวิตด้วยพลัง AI Motion',
        tag: '🔥 ไฮไลต์ประจำสัปดาห์',
        image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRzKRzitQkT5MPuj8cP5bXn6_c4ff8PEhC51x0nEByZpw&s=10',
        link: '#'
    },
    {
        id: 2,
        title: 'One Piec',
        subtitle: 'สัมผัสประสบการณ์ฉากต่อสู้แบบมีชีวิตด้วยพลัง AI Motion',
        tag: '✨ อัปเดตตอนใหม่',
        image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRTFGsj-pGrY4XwxH36WAmqdAjLm30XgRF5nCulHvqe9Ve0oWoGXbOIw0To&s=10',
        link: '#'
    },
    {
        id: 3,
        title: 'มหาเวทผนึกวิญญาณ',
        subtitle: 'การผจญภัยในโลกเวทมนตร์โบราณ คมชัดระดับ 4K Motion',
        tag: '⚡ มาแรงยอดนิยม',
        image: 'https://upload.wikimedia.org/wikipedia/th/c/c8/Jujutsu_Kaisen%2C_volume_1_thai_version.jpg?utm_source=th.wikipedia.org&utm_campaign=index&utm_content=original',
        link: '#'
    }
];

function MangaCarousel({ slides = defaultSlides, autoPlay = true, interval = 5000 }) {
    const [currentIndex, setCurrentIndex] = useState(0);

    // เลื่อนสไลด์อัตโนมัติ (Auto-play)
    useEffect(() => {
        if (!autoPlay) return;
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % slides.length);
        }, interval);
        return () => clearInterval(timer);
    }, [autoPlay, interval, slides.length]);

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
    };

    const handleNext = () => {
        setCurrentIndex((prev) => (prev + 1) % slides.length);
    };

    return (
        <div className="relative w-full overflow-hidden rounded-2xl border border-neutral-800 shadow-2xl">
            {/* 1. Wrapper แสดงรูปภาพสไลด์ */}
            <div className="relative h-64 sm:h-80 md:h-[420px] w-full">
                {slides.map((slide, index) => {
                    const isActive = index === currentIndex;
                    return (
                        <div
                            key={slide.id || index}
                            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                                }`}
                        >
                            {/* ภาพพื้นหลัง */}
                            <img
                                src={slide.image}
                                alt={slide.title}
                                className="w-full h-full object-cover"
                            />

                            {/* เลเยอร์เงาดำและแสงแดงเพื่อให้อ่านตัวหนังสือชัด */}
                            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent" />
                            <div className="absolute inset-0 bg-gradient-to-r from-neutral-950/80 via-transparent to-transparent" />

                            {/* ข้อความและปุ่มบนแบนเนอร์ */}
                            <div className="absolute bottom-10 left-6 md:left-12 max-w-lg z-20">
                                {slide.tag && (
                                    <span className="inline-block px-2.5 py-1 text-xs font-bold bg-red-600 text-white rounded mb-2 shadow">
                                        {slide.tag}
                                    </span>
                                )}
                                <h2 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight drop-shadow-md">
                                    {slide.title}
                                </h2>
                                <p className="text-xs md:text-sm text-neutral-300 mt-1.5 line-clamp-2 leading-relaxed">
                                    {slide.subtitle}
                                </p>
                                <div className="mt-4 flex gap-3">
                                    <a
                                        href={slide.link}
                                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs md:text-sm font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-lg shadow-red-950"
                                    >
                                        <span>▶</span> เริ่มอ่านเลย
                                    </a>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* 2. Slider indicators (จุดกลมบอกตำแหน่ง) */}
            <div className="absolute z-30 flex -translate-x-1/2 bottom-4 left-1/2 space-x-2.5">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        type="button"
                        onClick={() => setCurrentIndex(index)}
                        aria-label={`Slide ${index + 1}`}
                        className={`h-2 transition-all rounded-full ${currentIndex === index
                                ? 'w-7 bg-red-600'
                                : 'w-2 bg-white/40 hover:bg-white/70'
                            }`}
                    />
                ))}
            </div>

            {/* 3. Slider controls (ปุ่มเลื่อน ซ้าย-ขวา) */}
            <button
                type="button"
                onClick={handlePrev}
                className="absolute top-0 start-0 z-30 flex items-center justify-center h-full px-4 cursor-pointer group focus:outline-none"
            >
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-neutral-950/40 border border-neutral-700/50 text-white group-hover:bg-red-600/80 transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="m15 19-7-7 7-7" />
                    </svg>
                    <span className="sr-only">Previous</span>
                </span>
            </button>

            <button
                type="button"
                onClick={handleNext}
                className="absolute top-0 end-0 z-30 flex items-center justify-center h-full px-4 cursor-pointer group focus:outline-none"
            >
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-neutral-950/40 border border-neutral-700/50 text-white group-hover:bg-red-600/80 transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="m9 5 7 7-7 7" />
                    </svg>
                    <span className="sr-only">Next</span>
                </span>
            </button>
        </div>
    );
}

export default MangaCarousel;