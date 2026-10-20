const { response, json } = require("express");


exports.testController = async (req, res) => {
    console.log("good");
    return res.json({ user: 'Tiger' });
};