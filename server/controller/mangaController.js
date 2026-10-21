const db = require('../db/db');

exports.getallManga = async (req, res) => {
    try {
        const [mangas] = await db.query(`
            SELECT m.*, 
                (SELECT COUNT(*) FROM chapters c WHERE c.manga_id = m.id) AS total_chapters,
                (SELECT COUNT(*) FROM animated_panels ap 
                JOIN pages p ON ap.page_id = p.id 
                JOIN chapters c ON p.chapter_id = c.id 
                WHERE c.manga_id = m.id AND ap.ai_status = 'COMPLETED') AS motion_panel_count
            FROM mangas m
            ORDER BY m.id DESC
            `);
        res.json({ success: true, data: mangas });
        console.log("โหลดมังงะสำเร็จ")
    } catch (error) {
        console, log(error, "ไม่สมารถโหลข้อมูลได้");
        res.status(500).json({ success: false, data: mangas });
    }
};

exports.getMangaById = async(req, res) => {
    try{
        const { id } = req.params;
        const [mangas] = await db.query('SELECT * FROM `mangas` WHERE `id`= ?', [id]);
        if(mangas.length === 0){
        return res.status(404).json({success: false, message: "ไม่พบมังงะ"});
        }
        const [chapters] = await db.query(`
            SELECT c.*,
            (SELECT COUNT(*) FROM animated_panels ap 
            JOIN pages p ON ap.page_id = p.id 
            WHERE p.chapter_id = c.id AND ap.ai_status = 'COMPLETED') AS motion_count
            FROM chapters c
            WHERE c.manga_id = ?
            ORDER BY c.chapter_number ASC
        `, [id]);

        res.json({
            success: true,
            data: {
                ...mangas[0],
                chapters
            }
        });
    }catch (error) {
        res.status(500).json({success: false, message:"ไม่สามารถโหลดข้อมูลได้"});
        console.log("ไม่สามารถดึงมังงะได้");
    }
}
    
