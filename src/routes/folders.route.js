
const { Router } = require("express");
const { GET } =require("../controllers/folders.controller.js")

const folderRouter = Router();

folderRouter
    .get('/api/folders', GET)


module.exports = folderRouter