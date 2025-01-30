const { Router } = require("express");
const { GET } = require("../controllers/home.controller");

const homeRouter = Router();

homeRouter.get('/', GET);

module.exports = homeRouter;