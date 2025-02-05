const { Router } = require("express");
const { join } = require("path");

const {checker, GET, POST} = require("../controllers/settings.controller.js");

const settingsRouter = Router();

settingsRouter.get("/api/settings", checker, GET)

settingsRouter.post("/api/settings", checker, POST)

module.exports = settingsRouter