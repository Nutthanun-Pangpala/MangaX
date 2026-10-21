const express = require('express');
const mangaController = require('../controller/mangaController');
const router = express.Router();

router.get('/manga',mangaController.getallManga);

router.get('/manga/:id',mangaController.getMangaById);


module.exports = router;