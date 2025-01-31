const { Router } = require("express");
const { join } = require("path");

const {checker, GET, PUT} = require("../controllers/settings.controller.js");

const settingsRouter = Router();

settingsRouter.get("/api/settings", checker, GET)

settingsRouter.put("/api/settings", checker, PUT)

module.exports = settingsRouter