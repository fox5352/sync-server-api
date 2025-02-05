require("dotenv").config();
const express = require("express");
const cors = require("cors");

const { getSettings } = require("./lib/utils");

// routers
const { homeRouter, folderRouter, filesRouter, settingsRouter } = require("./routes/");

const SETTINGS = getSettings();


if (SETTINGS.allowList.length == 0) console.error("audioPaths not configured in settings.json");

if (SETTINGS.imagePaths.length == 0) console.error("imagePaths not configured in settings.json");


const app = express();

app.use(cors({
    origin: "*",
    optionsSuccessStatus: 200,
}))

// Add this middleware to parse JSON body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
