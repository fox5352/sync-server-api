const { Router } = require("express");

const { GET, POST } = require("../controllers/files.controller.js");

const filesRouter = Router();

filesRouter
    .get("/api/:filetype", GET)
    .post("/api/:filetype", POST)

module.exports = filesRouter;