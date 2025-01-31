const { Router } = require("express");
const { join } =require("path");

const { GET } =require(join(__dirname, "..","controllers","folders.controller.js"));

const folderRouter = Router();

folderRouter
    .get('/api/folders', GET)


module.exports = folderRouter