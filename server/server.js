const express = require('express');
const db = require('./db/db.js');
const core = require('cors');

const mangaRouter = require('./routes/mangaRoute.js')


const app = express();
app.use(core());
app.use(express.json());


app.use('/api', mangaRouter);

app.listen(process.env.PORT,() => {
    console.log('server is running on port '+ process.env.PORT)
})

