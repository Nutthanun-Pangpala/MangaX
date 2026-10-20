const express = require('express');
const db = require('./db/db.js');
const core = require('cors');


const app = express();
app.use(core());
app.use(express.json());

const testRouter = require('./routes/test.js');
app.use('/api', testRouter);

app.listen(process.env.PORT,() => {
    console.log('server is running on port '+ process.env.PORT)
})

