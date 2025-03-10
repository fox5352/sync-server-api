const { Router } = require("express");

const { filetypeChecker } = require("../middleware.js");
const { GET, POST } = require("../controllers/files.controller.js");

const filesRouter = Router();

function checker(req, res, next) {
    const token = process.env.TOKEN;

    if (!token) res.status(403).json({ message: "token not found" })

    if (req.headers.authorization != `Bearer ${token}`) {
        return res.status(403).json({ message: "Invalid token" })
    }

    next();
}

filesRouter
    .get("/api/:filetype", filetypeChecker, GET)
    .post("/api/:filetype", filetypeChecker, checker, POST)


module.exports = filesRouter;
