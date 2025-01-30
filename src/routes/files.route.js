const { Router } = require("express");
const { filetypeChecker } = require("../middleware.js");
const { GET,POST } = require("../controllers/files.controller");

const filesRouter = Router();

filesRouter
    .get("/api/:filetype",filetypeChecker, GET)
    .post("/api/:filetype",filetypeChecker, POST)
    

module.exports = filesRouter;