
const express = require("express");

const { getSettings } = require("./lib/utils.js");

// routers
const {homeRouter, folderRouter, filesRouter} = require("./routes/");

const SETTINGS = getSettings();


if (SETTINGS.allowList.length == 0) throw new Error("audioPaths not configured in settings.json");

const app = express();

app.use(express.json());

// ------------------- sync route ------------------- 
app.use("/", homeRouter);

// ------------------- folder check ------------------- 
app.use("/", folderRouter);

// ------------------- file data routes ------------------- 
app.use("/", filesRouter)

module.exports = {
    app,
 };