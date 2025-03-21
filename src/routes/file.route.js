const { Router } = require("express");

const { GET } = require("../controllers/file.controller");

const fileRouter = Router();

fileRouter.get("/api/:filetype/file", GET)


module.exports = fileRouter;