require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const { getSettings, getCurrentDirectoryName, logToFile } = require("./lib/utils");

// routers
const { homeRouter, folderRouter, filesRouter, settingsRouter } = require("./routes/");
const fileRouter = require("./routes/file.route");

const SETTINGS = getSettings();


if (SETTINGS.allowList.length == 0) logToFile("audioPaths not configured in settings.json");

if (SETTINGS.imagePaths.length == 0) logToFile("imagePaths not configured in settings.json");

const app = express();

app.use(morgan("combined"))

app.use(cors({
    origin: "*",
}))

// Add this middleware to parse JSON body
app.use(express.json({ limit: "2gb" }));
app.use(express.urlencoded({ extended: true }));

// ------------------- sync route -------------------
app.use("/", homeRouter);

// ------------------- folder check -------------------
app.use("/", folderRouter);

// ------------------- settings routes -------------------
app.use("/", settingsRouter);

// ------------------- file data routes -------------------
app.use("/", filesRouter)

app.use("/", fileRouter);


module.exports = {
    app,
};
