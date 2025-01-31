require("dotenv").config();
const express = require("express");
const { join } =require("path");

const { getSettings } = require(join(__dirname,"lib","utils.js"));

// routers
const {homeRouter, folderRouter, filesRouter, settingsRouter} = require("./routes/");

const SETTINGS = getSettings();


if (SETTINGS.allowList.length == 0) throw new Error("audioPaths not configured in settings.json");

const app = express();

app.use(express.json());

// ------------------- sync route ------------------- 
app.use("/", homeRouter);

// ------------------- folder check ------------------- 
app.use("/", folderRouter);

// ------------------- settings routes -------------------
app.use("/", settingsRouter);

// ------------------- file data routes ------------------- 
app.use("/", filesRouter)

module.exports = {
    app,
 };