
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function MangaCarousel({
    slides = [],
    autoPlay = true,
    interval = 5000,
}) {
    const [currentIndex, setCurrentIndex] = useState(0);

    const hasSlides = slides.length > 0;

    useEffect(() => {
        setCurrentIndex(0);
    }, [slides.length]);

    useEffect(() => {
        if (!autoPlay || slides.length <= 1) return;

        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % slides.length);
        }, interval);

        return () => clearInterval(timer);
    }, [autoPlay, interval, slides.length]);

    const handlePrev = () => {
        if (slides.length <= 1) return;

        setCurrentIndex((prev) =>
            prev === 0 ? slides.length - 1 : prev - 1
        );
    };

    const handleNext = () => {
        if (slides.length <= 1) return;

        setCurrentIndex((prev) => (prev + 1) % slides.length);
    };

    const activeSlide = slides[currentIndex];



    return (
        <section
            className="relative isolate w-full overflow-hidden rounded-3xl border border-white/[0.08] bg-neutral-950 shadow-[0_20px_70px_rgba(0,0,0,0.4)]"
            aria-label="MangaX featured carousel"
        >
            {/* Decorative glow */}
            <div className="pointer-events-none absolute -right-24 -top-24 -z-10 h-80 w-80 rounded-full bg-red-600/15 blur-[100px]" />
            <div className="pointer-events-none absolute -bottom-32 -left-20 -z-10 h-72 w-72 rounded-full bg-rose-600/10 blur-[100px]" />

            {/* Top accent */}
            <div className="absolute inset-x-0 top-0 z-20 h-px bg-gradient-to-r from-transparent via-red-500/70 to-transparent" />

            {hasSlides ? (
                <>
                    {/* Slides */}
                    <div className="relative h-[340px] w-full sm:h-[400px] md:h-[460px] lg:h-[500px]">
                        {slides.map((slide, index) => {
                            const isActive = index === currentIndex;

                            return (
                                <div
                                    key={slide.id ?? index}
                                    aria-hidden={!isActive}
                                    className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${isActive
                                            ? 'z-10 opacity-100'
                                            : 'pointer-events-none z-0 opacity-0'
                                        }`}
                                >
                                    {slide.image ? (
                                        <img
                                            src={slide.image}
                                            alt={slide.title || 'MangaX featured'}
                                            className={`h-full w-full object-cover transition-transform duration-[6000ms] ${isActive ? 'scale-105' : 'scale-100'
                                                }`}
                                            loading={index === 0 ? 'eager' : 'lazy'}
                                        />
                                    ) : (
                                        <div className="h-full w-full bg-gradient-to-br from-neutral-900 via-neutral-950 to-red-950/40" />
                                    )}

                                    {/* Image overlays */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/50 to-neutral-950/10" />
                                    <div className="absolute inset-0 bg-gradient-to-r from-neutral-950/90 via-neutral-950/35 to-transparent" />
                                    <div className="absolute inset-0 bg-red-950/[0.08]" />

                                    {/* Content */}
                                    <div className="absolute inset-x-0 bottom-0 z-20 p-6 pb-14 sm:p-10 sm:pb-16 md:p-14 md:pb-16">
                                        <div className="max-w-2xl">
                                            {slide.tag && (
                                                <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-red-400/25 bg-red-500/10 px-3.5 py-2 text-[10px] font-extrabold uppercase tracking-[0.15em] text-red-300 backdrop-blur-md sm:text-xs">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-red-400 shadow-[0_0_10px_rgba(248,113,113,0.8)]" />
                                                    {slide.tag}
                                                </span>
                                            )}

                                            {slide.title && (
                                                <h2 className="text-3xl font-black leading-tight tracking-tight text-white drop-shadow-lg sm:text-4xl md:text-5xl lg:text-6xl">
                                                    {slide.title}
                                                </h2>
                                            )}

                                            {slide.subtitle && (
                                                <p className="mt-3 max-w-xl text-sm leading-7 text-neutral-300 sm:text-base">
                                                    {slide.subtitle}
                                                </p>
                                            )}

                                            {slide.link && (
                                                <Link
                                                    to={slide.link}
                                                    className="group mt-6 inline-flex items-center gap-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-red-950/40 transition-all duration-300 hover:-translate-y-0.5 hover:from-red-500 hover:to-rose-500 hover:shadow-[0_8px_30px_rgba(239,68,68,0.25)] focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-neutral-950"
                                                >
                                                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/15 text-xs">
                                                        ▶
                                                    </span>
                                                    สำรวจเลย
                                                    <span className="transition-transform duration-200 group-hover:translate-x-1">
                                                        →
                                                    </span>
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {/* Slide counter */}
                        <div className="absolute right-5 top-5 z-30 rounded-xl border border-white/10 bg-neutral-950/50 px-3 py-2 font-mono text-xs text-neutral-300 backdrop-blur-md sm:right-8 sm:top-8">
                            <span className="font-bold text-white">
                                {String(currentIndex + 1).padStart(2, '0')}
                            </span>
                            <span className="mx-2 text-neutral-600">/</span>
                            {String(slides.length).padStart(2, '0')}
                        </div>

                        {/* Navigation arrows */}
                        {slides.length > 1 && (
                            <>
                                <button
                                    type="button"
                                    onClick={handlePrev}
                                    aria-label="สไลด์ก่อนหน้า"
                                    className="absolute left-3 top-1/2 z-30 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-xl border border-white/10 bg-neutral-950/50 text-white backdrop-blur-md transition hover:border-red-500/50 hover:bg-red-600/80 sm:left-6 sm:h-12 sm:w-12"
                                >
                                    <svg
                                        className="h-5 w-5"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth={2}
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="m15 19-7-7 7-7"
                                        />
                                    </svg>
                                </button>

                                <button
                                    type="button"
                                    onClick={handleNext}
                                    aria-label="สไลด์ถัดไป"
                                    className="absolute right-3 top-1/2 z-30 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-xl border border-white/10 bg-neutral-950/50 text-white backdrop-blur-md transition hover:border-red-500/50 hover:bg-red-600/80 sm:right-6 sm:h-12 sm:w-12"
                                >
                                    <svg
                                        className="h-5 w-5"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth={2}
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="m9 5 7 7-7 7"
                                        />
                                    </svg>
                                </button>
                            </>
                        )}
                    </div>

                    {/* Slide indicators */}
                    {slides.length > 1 && (
                        <div className="absolute bottom-5 left-6 z-30 flex items-center gap-2 sm:bottom-7 sm:left-10 md:left-14">
                            {slides.map((slide, index) => (
                                <button
                                    key={slide.id ?? index}
                                    type="button"
                                    onClick={() => setCurrentIndex(index)}
                                    aria-label={`ไปยังสไลด์ที่ ${index + 1}`}
                                    aria-current={currentIndex === index ? 'true' : undefined}
                                    className={`h-1.5 rounded-full transition-all duration-300 ${currentIndex === index
                                            ? 'w-9 bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.6)]'
                                            : 'w-2 bg-white/30 hover:bg-white/70'
                                        }`}
                                />
                            ))}
                        </div>
                    )}
                </>
            ) : (
                /* Empty state — no preset manga */
                <div className="relative flex min-h-[340px] flex-col items-center justify-center overflow-hidden px-6 py-12 text-center sm:min-h-[400px] md:min-h-[460px]">
                    <div className="pointer-events-none absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-600/10 blur-[90px]" />

                    <div className="relative mb-6 flex h-20 w-20 items-center justify-center rounded-3xl border border-red-500/20 bg-gradient-to-br from-red-500/10 to-neutral-900 shadow-[0_0_40px_rgba(239,68,68,0.08)] sm:h-24 sm:w-24">
                        <img
                            src="/xicon.svg"
                            alt="MangaX"
                            className="h-12 w-12 object-contain sm:h-14 sm:w-14"
                        />
                    </div>

                    <span className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-red-400">
                        Welcome to MangaX
                    </span>

                    <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl md:text-5xl">
                        Your next <span className="text-red-500">adventure</span>
                    </h2>

                    <p className="mt-4 max-w-md text-sm leading-7 text-neutral-400 sm:text-base">
                        ค้นพบโลกแห่งมังงะในแบบของคุณ
                        แล้วเริ่มต้นการผจญภัยครั้งต่อไปได้เลย
                    </p>

                    <Link
                        to="/"
                        className="mt-7 inline-flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-3 text-sm font-bold text-red-300 transition hover:border-red-500/60 hover:bg-red-500/20 hover:text-white"
                    >
                        สำรวจมังงะ
                        <span aria-hidden="true">→</span>
                    </Link>

                    <div className="mt-10 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-600">
                        <span className="h-px w-8 bg-neutral-800" />
                        MangaX
                        <span className="h-px w-8 bg-neutral-800" />
                    </div>
                </div>
            )}
        </section>
    );
}

export default MangaCarousel;
