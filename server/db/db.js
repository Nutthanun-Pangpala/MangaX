const mysql = require('mysql2/promise');
require('dotenv').config();

const db = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    waitForConnections : (true),
    connectionLimit : (10),
    queueLimit : (0)
});

async function connectionDB() {
    try{
        const connection = await db.getConnection();
        console.log("DB Connection Success");
        connection.release();
        }catch (error) {
            console.log("DB Connection False",error.massage);
        }
    
}
connectionDB();


module.exports = db;