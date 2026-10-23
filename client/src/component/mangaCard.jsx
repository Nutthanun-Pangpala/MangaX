
import React from 'react';

const MangaCard = ({ manga, onClick }) => {
    return (
        <div
            onClick={onClick}
            className="group flex h-full flex-col overflow-hidden rounded-2xl border border-neutral-800/80 bg-neutral-900/80 cursor-pointer select-none transition-colors duration-200 hover:border-red-600/60"
        >
            {/* Manga Cover */}
            <div className="relative aspect-[3/4] w-full overflow-hidden bg-neutral-950">
                <img
                    src={manga.cover_url}
                    alt={manga.title || 'Manga cover'}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover"
                    onError={(e) => {
                        e.currentTarget.style.display = 'none';
                    }}
                />

                {/* Latest Chapter */}
                <div className="absolute right-3 top-3 rounded-lg border border-white/10 bg-black/75 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
                    ตอนที่ {manga.latest_chapter || '1'}
                </div>

                {/* Bottom Gradient */}
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-neutral-900 to-transparent" />
            </div>

            {/* Manga Information */}
            <div className="flex flex-1 flex-col p-4">
                <h3 className="line-clamp-1 text-base font-bold text-neutral-100">
                    {manga.title || 'ไม่ระบุชื่อเรื่อง'}
                </h3>

                <p className="mt-2 line-clamp-2 min-h-10 text-xs leading-5 text-neutral-400">
                    {manga.description || 'ยังไม่มีเรื่องย่อ'}
                </p>

                {/* Footer */}
                <div className="mt-auto flex items-center justify-between gap-2 border-t border-neutral-800 pt-3 mt-4">
                    <span className="line-clamp-1 text-xs text-neutral-500">
                        {manga.genre || 'ไม่ระบุหมวดหมู่'}
                    </span>

                    <span className="shrink-0 text-xs font-semibold text-red-500">
                        อ่านเลย <span aria-hidden="true">›</span>
                    </span>
                </div>
            </div>
        </div>
    );
};

export default MangaCard;
