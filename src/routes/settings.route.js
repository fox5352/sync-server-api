const { Router } = require("express");
const {checker, GET, PUT} = require("../controllers/settings.controller");

const settingsRouter = Router();

settingsRouter.get("/api/settings", checker, GET)

settingsRouter.put("/api/settings", checker, PUT)

module.exports = settingsRouter