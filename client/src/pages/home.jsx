// src/pages/Home.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../component/footer';
import MangaCard from '../component/mangaCard';
import MangaCarousel from '../component/mangaCarousel';
import NavBar from '../component/navBar';

const Home = () => {
    const [ mangas, setMangas] = useState([]);
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();

    // วิดีโอสำหรับทดสอบฟังก์ชัน Hover-to-Play
    const sampleMotionVideo = '/gemini_generated_video_6a701625.mp4';

    useEffect(() => {
        // ดึงข้อมูลมังงะจากเซิร์ฟเวอร์ Node.js (พอร์ต 3333)
        fetch(`${import.meta.env.VITE_API_URL}/api/manga`)
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
            <NavBar />
            <MangaCarousel />
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
            {loading ? (
                <div role="status">
                    <svg aria-hidden="true" className="inline w-8 h-8 text-neutral-tertiary animate-spin fill-danger" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                        <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
                    </svg>
                    <span className="sr-only">Loading...</span>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 mb-8">
                    {mangas.map((manga) => (
                        <MangaCard
                            key={manga.id}
                            manga={manga}
                            hasMotion={manga.motion_panel_count > 0}
                            previewVideoUrl={sampleMotionVideo}
                            onClick={() => navigate(`/manga/${manga.id}`)}
                        />
                    ))}
                </div>
            )}
            <Footer />
        </div>
    );
};

export default Home;