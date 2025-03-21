require("dotenv").config();
const cors = require("cors");
const morgan = require("morgan");
const express = require("express");
const CryptoJs = require("crypto-js");

const { getSettings, logToFile } = require("./lib/utils");

// routers
const { homeRouter, folderRouter, filesRouter, settingsRouter } = require("./routes/");
const fileRouter = require("./routes/file.route");

const SETTINGS = getSettings();


if (SETTINGS.allowList.length == 0) logToFile("audioPaths not configured in settings.json");

if (SETTINGS.imagePaths.length == 0) logToFile("imagePaths not configured in settings.json");

const app = express();

if (process.env.TOKEN == undefined) throw new Error("token not found");

app.use(morgan("combined"))

app.use(cors({
    origin: "*",
}))

// Add this middleware to parse JSON body
app.use(express.json({ limit: "3gb" }));
app.use(express.urlencoded({ extended: true }));

// TODO: encrypt data as it leaves and decrypt as it enters using bcryptjs inside a middleware function
app.use(async function(req,res,next) {
    const originalJson = res.json.bind(res); // Preserve original function

    res.json = function (data) {
        let newData = "";
        if (typeof data === 'object') {
            const encryptData = (data, key) => {
                return CryptoJs.AES.encrypt(JSON.stringify(data), key).toString();
            }
            newData = encryptData(data, process.env.TOKEN);
        }

        return originalJson(newData); // Call original method with modified data
    };

    next();
})

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
