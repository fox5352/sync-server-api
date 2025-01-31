const { Router } = require("express");

const { GET } = require("../controllers/home.controller.js");

const homeRouter = Router();

homeRouter.get('/', GET);

module.exports = homeRouter;