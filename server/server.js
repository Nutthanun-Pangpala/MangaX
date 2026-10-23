const express = require('express');
const cors = require('cors');

const mangaRouter = require('./routes/mangaRoute.js');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', mangaRouter);

module.exports = app;


if (require.main === module) {
    const PORT = process.env.PORT || 3000;

    app.listen(PORT, () => {
        console.log(`MangaX server is running on port ${PORT}`);
    });
}