const { Router } = require("express");
const { join } = require("path");

const { GET } = require(join(__dirname,"..","controllers", "home.controller.js"));

const homeRouter = Router();

homeRouter.get('/', GET);

module.exports = homeRouter;