const express = require('express');
const { getallManga } = require('../controller/mangaController');
const router = express.Router();

router.get('/mangas',getallManga);


module.exports = router;