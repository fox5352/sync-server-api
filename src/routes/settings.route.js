const { Router } = require("express");
const { GET, POST} = require("../controllers/settings.controller.js");

const settingsRouter = Router();

settingsRouter.get("/api/settings", GET)

settingsRouter.post("/api/settings", POST)

module.exports = settingsRouter