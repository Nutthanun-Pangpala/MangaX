// src/pages/Home.jsx
import React, { useEffect, useState } from 'react';
import MangaCard from '../component/mangaCard';
import MangaCarousel from '../component/mangaCarousel';
import NavBar from '../component/navBar';

const Home = () => {
    const [mangas, setMangas] = useState([]);
    const [loading, setLoading] = useState(true);

    // วิดีโอสำหรับทดสอบฟังก์ชัน Hover-to-Play
    const sampleMotionVideo = 'https://assets.mixkit.co/videos/preview/mixkit-fire-flame-animation-in-the-dark-40092-large.mp4';

    useEffect(() => {
        // ดึงข้อมูลมังงะจากเซิร์ฟเวอร์ Node.js (พอร์ต 3333)
        fetch('http://localhost:3333/api/mangas')
            .then((res) => res.json())
            .then((resData) => {
                if (resData.success) {
                    setMangas(resData.data);
                }
                setLoading(false);
            })
            .catch((err) => {
                console.error('Fetch error:', err);
                setLoading(false);
            });
    }, []);

    return (
        <div className="min-h-screen bg-neutral-950 text-neutral-100 pt-24 px-6 md:px-12 pb-16">
            <NavBar/>
            <MangaCarousel/>
            <div className="flex items-center justify-between mb-8 border-b border-neutral-800 pb-4 mt-8">
                <div>
                    <h2 className="text-2xl font-black tracking-wide text-white flex items-center gap-2">
                        ⚡ มังงะขยับได้ยอดนิยม <span className="text-sm font-semibold text-red-500 bg-red-950/60 border border-red-800/60 px-2 py-0.5 rounded-full">AI Powered</span>
                    </h2>
                    <p className="text-sm text-neutral-400 mt-1">
                        สัมผัสภาพมังงะมีชีวิต นำเมาส์ไปชี้ที่ปกเพื่อดูฉากโมชันตัวอย่าง
                    </p>
                </div>
            </div>

            {/* Grid แสดงการ์ดมังงะ */}
            {loading ? (
                <div className="text-center py-24 text-neutral-500 text-sm">กำลังโหลดมังงะ...</div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {mangas.map((manga) => (
                        <MangaCard
                            key={manga.id}
                            manga={manga}
                            hasMotion={true}
                            previewVideoUrl={sampleMotionVideo}
                            onClick={() => console.log('คลิกไปที่เรื่อง:', manga.title)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default Home;