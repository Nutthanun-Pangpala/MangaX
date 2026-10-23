const express = require('express');
const mangaController = require('../controller/mangaController');
const router = express.Router();

router.get('/mangas',mangaController.getAllMangas);

router.get('/mangas/:id',mangaController.getMangaById);

router.get('/chapters/:chapterId/pages',mangaController.getChapterPages);

module.exports = router;