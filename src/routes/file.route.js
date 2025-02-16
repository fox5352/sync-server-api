const { Router } = require("express");
const { getFiles, readFileData, getFileMetadata } = require("../lib/fileManagement");

const { GET } = require("../controllers/file.controller");

const fileRouter = Router();

fileRouter.get("/api/:filetype/file", GET)


module.exports = fileRouter;