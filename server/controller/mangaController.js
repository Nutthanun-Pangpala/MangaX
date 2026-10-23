
const db = require('../db/db.js');

const MANGADEX_API = 'https://api.mangadex.org';
const REQUEST_TIMEOUT = 15000;
const MAX_LIMIT = 100;
const FEED_LIMIT = 500;
const MAX_FEED_OFFSET = 10000;

// ==========================================
// MangaDex API Helper
// ==========================================

async function mangaDexFetch(path) {
    const controller = new AbortController();

    const timeout = setTimeout(
        () => controller.abort(),
        REQUEST_TIMEOUT
    );

    try {
        const response = await fetch(`${MANGADEX_API}${path}`, {
            signal: controller.signal,
            headers: {
                'User-Agent': 'ProjectMangaTransX-Thai/1.0',
                Accept: 'application/json',
            },
        });

        if (!response.ok) {
            const error = new Error(
                `MangaDex API returned ${response.status}`
            );

            error.status = response.status;
            throw error;
        }

        return await response.json();
    } finally {
        clearTimeout(timeout);
    }
}

// MangaDex ใช้ UUID ส่วน Local ใช้ตัวเลข
function isMangaDexId(id) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        id
    );
}

function getMangaTitle(titleObj = {}) {
    return (
        titleObj.th ||
        titleObj.en ||
        titleObj['ja-ro'] ||
        Object.values(titleObj)[0] ||
        'ไม่มีชื่อเรื่อง'
    );
}

function getCoverUrl(mangaId, relationships = []) {
    const cover = relationships.find(
        (rel) => rel.type === 'cover_art'
    );

    const fileName = cover?.attributes?.fileName;

    if (!fileName) {
        return 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600';
    }

    return `https://uploads.mangadex.org/covers/${mangaId}/${encodeURIComponent(fileName)}.256.jpg`;
}

// ==========================================
// Local MySQL Fallback
// ==========================================

async function getLocalMangas({ page, limit, search }) {
    const offset = (page - 1) * limit;
    const searchPattern = `%${search}%`;

    const [countRows] = await db.query(
        `SELECT COUNT(*) AS total
         FROM mangas
         WHERE (? = '' OR title LIKE ?)`,
        [search, searchPattern]
    );

    const total = Number(countRows[0]?.total || 0);

    const [rows] = await db.query(
        `SELECT *
         FROM mangas
         WHERE (? = '' OR title LIKE ?)
         ORDER BY id DESC
         LIMIT ? OFFSET ?`,
        [search, searchPattern, limit, offset]
    );

    return {
        success: true,
        source: 'local',
        data: rows,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
}

// ==========================================
// 1. ดึงรายการมังงะทั้งหมด
// GET /api/mangas?page=1&limit=15&search=...
// ==========================================


exports.getAllMangas = async (req, res) => {
    const pageInput = Number.parseInt(req.query.page, 10);
    const limitInput = Number.parseInt(req.query.limit, 10);

    const page =
        Number.isSafeInteger(pageInput) && pageInput > 0
            ? pageInput
            : 1;

    const limit =
        Number.isSafeInteger(limitInput) && limitInput > 0
            ? Math.min(limitInput, MAX_LIMIT)
            : 15;

    const search = String(req.query.search || '')
        .trim()
        .slice(0, 100);

    // ประเภทการ์ตูนที่รองรับ
    const requestedType = String(req.query.type || 'all')
        .trim()
        .toLowerCase();

    const languageByType = {
        manga: ['ja'],
        manhwa: ['ko'],
        manhua: ['zh', 'zh-hk'],
    };

    if (
        requestedType !== 'all' &&
        !Object.hasOwn(languageByType, requestedType)
    ) {
        return res.status(400).json({
            success: false,
            message: 'ประเภทการ์ตูนไม่ถูกต้อง',
        });
    }

    const offset = (page - 1) * limit;

    if (!Number.isSafeInteger(offset)) {
        return res.status(400).json({
            success: false,
            message: 'หมายเลขหน้าไม่ถูกต้อง',
        });
    }

    try {
        const params = new URLSearchParams();

        params.set('limit', String(limit));
        params.set('offset', String(offset));

        // คงเงื่อนไขภาษาที่มีฉบับแปลไทย
        params.append('availableTranslatedLanguage[]', 'th');

        params.append('includes[]', 'cover_art');

        params.set('order[followedCount]', 'desc');

        params.append('contentRating[]', 'safe');
        params.append('contentRating[]', 'suggestive');

        // ค้นหาจากชื่อเรื่อง
        if (search) {
            params.set('title', search);
        }

        // กรองประเทศต้นทางตามประเภทการ์ตูน
        const languages = languageByType[requestedType] || [];

        for (const language of languages) {
            params.append('originalLanguage[]', language);
        }

        const result = await mangaDexFetch(
            `/manga?${params.toString()}`
        );

        const items = Array.isArray(result.data)
            ? result.data
            : [];

        const mangas = items.map((manga) => {
            const attributes = manga.attributes || {};
            const originalLanguage =
                attributes.originalLanguage || '';

            let contentType = 'other';

            if (originalLanguage === 'ja') {
                contentType = 'manga';
            } else if (originalLanguage === 'ko') {
                contentType = 'manhwa';
            } else if (
                originalLanguage === 'zh' ||
                originalLanguage === 'zh-hk'
            ) {
                contentType = 'manhua';
            }

            return {
                id: manga.id,

                title: getMangaTitle(attributes.title),

                description:
                    attributes.description?.th ||
                    attributes.description?.en ||
                    'ไม่มีคำอธิบายเรื่องย่อ',

                cover_url: getCoverUrl(
                    manga.id,
                    manga.relationships || []
                ),

                latest_chapter: attributes.lastChapter || '1',

                // ข้อมูลประเภทสำหรับ Frontend
                original_language: originalLanguage,
                type: contentType,

                genre: 'Thai Translated / MangaDex',
            };
        });

        const total = Number(result.total || 0);

        return res.json({
            success: true,
            source: 'mangadex',
            data: mangas,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error(
            'MangaDex list error:',
            error.message
        );

        // Local database ยังไม่มีเงื่อนไขแยกประเภทที่ยืนยันได้
        // จึงไม่ควรคืนรายการทั้งหมดมาแทนผลกรองประเภท
        if (requestedType !== 'all') {
            return res.status(503).json({
                success: false,
                message:
                    'ไม่สามารถโหลดการ์ตูนประเภทนี้จาก MangaDex ได้ในขณะนี้',
            });
        }

        try {
            const localResult = await getLocalMangas({
                page,
                limit,
                search,
            });

            return res.json({
                ...localResult,
                fallback: true,
            });
        } catch (dbError) {
            console.error(
                'MySQL fallback error:',
                dbError.message
            );

            return res.status(503).json({
                success: false,
                message: 'ไม่สามารถโหลดรายการมังงะได้ในขณะนี้',
            });
        }
    }
};

// ==========================================
// 2. ดึงรายละเอียดมังงะและรายการตอน
// GET /api/mangas/:id
// ==========================================

exports.getMangaById = async (req, res) => {
    const { id } = req.params;

    if (
        !id ||
        (!/^\d+$/.test(id) && !isMangaDexId(id))
    ) {
        return res.status(400).json({
            success: false,
            message: 'ID มังงะไม่ถูกต้อง',
        });
    }

    try {
        // ======================================
        // Local manga: ID เป็นตัวเลข
        // ======================================

        if (/^\d+$/.test(id)) {
            const [mangas] = await db.query(
                'SELECT * FROM mangas WHERE id = ? LIMIT 1',
                [id]
            );

            if (mangas.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'ไม่พบมังงะ',
                });
            }

            const [chapters] = await db.query(
                `SELECT *
                 FROM chapters
                 WHERE manga_id = ?
                 ORDER BY chapter_number ASC, id ASC`,
                [id]
            );

            return res.json({
                success: true,
                source: 'local',
                data: {
                    ...mangas[0],
                    chapters,
                    total_chapters: chapters.length,
                    chapters_truncated: false,
                },
            });
        }

        // ======================================
        // MangaDex manga: ID เป็น UUID
        // ======================================

        const mangaData = await mangaDexFetch(
            `/manga/${encodeURIComponent(id)}?includes[]=cover_art`
        );

        const manga = mangaData?.data;

        if (!manga) {
            return res.status(404).json({
                success: false,
                message: 'ไม่พบมังงะเรื่องนี้บน MangaDex',
            });
        }

        const attributes = manga.attributes || {};

        const title = getMangaTitle(attributes.title);

        const description =
            attributes.description?.th ||
            attributes.description?.en ||
            'ไม่มีคำอธิบาย';

        // ======================================
        // ดึงตอนภาษาไทยหลายหน้า
        // ======================================

        const chaptersById = new Map();

        let offset = 0;
        let total = null;

        while (offset < MAX_FEED_OFFSET) {
            // MangaDex จำกัด limit สูงสุด 500
            // และ offset + limit ต้องไม่เกิน 10,000
            const limit = Math.min(
                FEED_LIMIT,
                MAX_FEED_OFFSET - offset
            );

            const params = new URLSearchParams();

            params.set('limit', String(limit));
            params.set('offset', String(offset));
            params.append('translatedLanguage[]', 'th');
            params.append('order[chapter]', 'asc');
            params.append('order[volume]', 'asc');

            const feedData = await mangaDexFetch(
                `/manga/${encodeURIComponent(id)}/feed?${params.toString()}`
            );

            const batch = Array.isArray(feedData.data)
                ? feedData.data
                : [];

            const parsedTotal = Number(feedData.total);

            total =
                Number.isFinite(parsedTotal) && parsedTotal >= 0
                    ? parsedTotal
                    : null;

            // บันทึกตอนลง Map เพื่อป้องกัน ID ซ้ำ
            for (const chapter of batch) {
                if (!chapter?.id) continue;

                const chapterAttributes =
                    chapter.attributes || {};

                const rawChapterNumber =
                    chapterAttributes.chapter;

                const chapterNumber =
                    rawChapterNumber === null ||
                        rawChapterNumber === undefined ||
                        rawChapterNumber === ''
                        ? null
                        : Number.isFinite(Number(rawChapterNumber))
                            ? Number(rawChapterNumber)
                            : null;

                chaptersById.set(chapter.id, {
                    id: chapter.id,

                    chapter_number: chapterNumber,

                    title:
                        chapterAttributes.title ||
                        (
                            chapterNumber !== null
                                ? `ตอนที่ ${chapterNumber}`
                                : 'ตอนพิเศษ'
                        ),

                    volume: chapterAttributes.volume ?? null,

                    created_at:
                        chapterAttributes.publishAt ||
                        chapterAttributes.createdAt ||
                        null,

                    translated_language:
                        chapterAttributes.translatedLanguage || 'th',
                });
            }

            // ไม่มีข้อมูลแล้ว ให้หยุด
            if (total === null && batch.length < limit) {
                break;
            }

            // เพิ่ม offset ตามจำนวนที่ได้รับจริง
            offset += batch.length;

            // ดึงครบตามจำนวนที่ API แจ้งแล้ว
            if (total !== null && offset >= total) {
                break;
            }

            // ป้องกันลูปไม่สิ้นสุด
            if (batch.length < limit) {
                break;
            }
        }

        const chapters = [...chaptersById.values()];

        // ======================================
        // เรียงตอนจากน้อยไปมาก
        // ตอนที่ไม่มีเลขจะอยู่ท้ายรายการ
        // ======================================

        chapters.sort((a, b) => {
            const aNumber = a.chapter_number;
            const bNumber = b.chapter_number;

            if (aNumber === null && bNumber !== null) {
                return 1;
            }

            if (aNumber !== null && bNumber === null) {
                return -1;
            }

            if (aNumber !== null && bNumber !== null) {
                if (aNumber !== bNumber) {
                    return aNumber - bNumber;
                }
            }

            const aDate = new Date(
                a.created_at || 0
            ).getTime();

            const bDate = new Date(
                b.created_at || 0
            ).getTime();

            return aDate - bDate;
        });

        // หาก API แจ้ง total แต่ดึงได้ไม่ครบ
        // หรือถึงขีดจำกัด offset ให้แจ้ง Frontend
        const chaptersTruncated =
            total !== null
                ? offset < total
                : offset >= MAX_FEED_OFFSET;

        console.log('MangaDex Thai chapters:', {
            mangaId: id,
            apiTotal: total,
            fetched: offset,
            unique: chapters.length,
            truncated: chaptersTruncated,
        });

        return res.json({
            success: true,
            source: 'mangadex',
            data: {
                id: manga.id,
                title,
                description,

                cover_url: getCoverUrl(
                    manga.id,
                    manga.relationships || []
                ),

                chapters,
                chapters_truncated: chaptersTruncated,
                total_chapters: total ?? chapters.length,
            },
        });
    } catch (error) {
        console.error(
            'getMangaById error:',
            error.message
        );

        if (error.status === 404) {
            return res.status(404).json({
                success: false,
                message: 'ไม่พบมังงะหรือตอนที่ต้องการ',
            });
        }

        return res.status(503).json({
            success: false,
            message: 'ไม่สามารถดึงข้อมูลมังงะได้ในขณะนี้',
        });
    }
};

// ==========================================
// 3. ดึงหน้าสำหรับ Reader
// GET /api/chapters/:chapterId/pages
// ==========================================

exports.getChapterPages = async (req, res) => {
    const { chapterId } = req.params;
    

    if (
        !chapterId ||
        (!/^\d+$/.test(chapterId) &&
            !isMangaDexId(chapterId))
    ) {
        return res.status(400).json({
            success: false,
            message: 'Chapter ID ไม่ถูกต้อง',
        });
    }

    try {
        // ======================================
        // Local chapter
        // ======================================

        if (/^\d+$/.test(chapterId)) {
            const [pages] = await db.query(
                `SELECT id, chapter_id, page_number, image_url
                 FROM pages
                 WHERE chapter_id = ?
                 ORDER BY page_number ASC`,
                [chapterId]
            );

            return res.json({
                success: true,
                source: 'local',
                data: pages.map((page) => ({
                    ...page,
                    animated_panels: [],
                })),
            });
        }

        // ======================================
        // MangaDex chapter
        // ======================================

        const serverData = await getAtHomeServer(chapterId);
        const chapter = serverData.chapter;

        // ใช้ baseUrl ตามที่ MangaDex ส่งมาโดยตรง
        const baseUrl = serverData.baseUrl.replace(/\/+$/, "");
        const hash = chapter.hash;

        // ตรวจสอบว่ามีชื่อไฟล์ภาพ
        const filenames = chapter.data;

        if (!Array.isArray(filenames) || filenames.length === 0) {
            return res.status(502).json({
                success: false,
                message: "ตอนนี้ไม่มีข้อมูลหน้าการ์ตูนจาก MangaDex",
            });
        }

        const pages = filenames.map((filename, index) => ({
            id: `${chapterId}-${index + 1}`,
            chapter_id: chapterId,
            page_number: index + 1,

            // สร้าง URL โดยใช้ baseUrl และชื่อไฟล์ต้นฉบับ
            image_url: `${baseUrl}/data/${hash}/${filename}`,

            animated_panels: [],
        }));

        return res.json({
            success: true,
            source: "mangadex",
            data: pages,
        });
    } catch (error) {
        console.error('getChapterPages error:', error);

        if (error.status === 404) {
            return res.status(404).json({
                success: false,
                message: 'ไม่พบไฟล์หน้ากระดาษของตอนนี้',
            });
        }

        return res.status(503).json({
            success: false,
            message: 'ไม่สามารถโหลดหน้าการ์ตูนได้ กรุณาลองใหม่',
        });
    }
};

async function getAtHomeServer(chapterId) {
    let lastError;

    for (let attempt = 0; attempt < 2; attempt++) {
        try {
            const result = await mangaDexFetch(
                `/at-home/server/${encodeURIComponent(chapterId)}`
            );

            const isValid =
                typeof result?.baseUrl === 'string' &&
                result.baseUrl.length > 0 &&
                typeof result?.chapter?.hash === 'string' &&
                result.chapter.hash.length > 0 &&
                Array.isArray(result?.chapter?.data);

            if (isValid) {
                return result;
            }

            lastError = new Error(
                'MangaDex returned an unexpected At-Home response'
            );

            console.warn('Invalid MangaDex At-Home response', {
                attempt: attempt + 1,
                result: result?.result,
                keys: Object.keys(result || {}),
                chapterKeys: Object.keys(result?.chapter || {}),
            });
        } catch (error) {
            lastError = error;

            console.warn('MangaDex At-Home request failed', {
                attempt: attempt + 1,
                message: error.message,
                status: error.status || null,
            });
        }

        if (attempt === 0) {
            await new Promise(resolve => setTimeout(resolve, 300));
        }
    }

    throw lastError || new Error(
        'MangaDex At-Home request failed'
    );
}

