const { Router } = require("express");
const { join } = require("path");

const { filetypeChecker } = require(join(__dirname,"..","middleware.js"));
const { GET,POST } = require(join(__dirname,"..","controllers","files.controller.js"));

const filesRouter = Router();

filesRouter
    .get("/api/:filetype",filetypeChecker, GET)
    .post("/api/:filetype",filetypeChecker, POST)
    

module.exports = filesRouter;