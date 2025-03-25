require("dotenv").config();
const cors = require("cors");
const morgan = require("morgan");
const express = require("express");
const CryptoJS = require("crypto-js");

const { getSettings, logToFile, decrypt, encrypt } = require("./lib/utils");

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



app.use(async function(req, res, next) {
    const TOKEN = process.env.TOKEN;

    // Handle incoming data
    if (req.body && req.body['encryptedData']) {        
        try {
            const decrypted = decrypt(req.body.encryptedData, TOKEN);
            if (decrypted === null) throw new Error("Decryption failed");
            
            req.body = JSON.parse(decrypted);   

        } catch (error) {
            logToFile(`Error decrypting data: ${error.message}`);
            return res.status(400).json({ message: "Invalid request payload, failed to decrypt." });
        }
    }

    // Preserve original res.json function
    const originalJson = res.json.bind(res);

    res.json = function (data) {
        try {
            return originalJson(encrypt(data, TOKEN)); // Wrap in an object
        } catch (error) {
            return originalJson(encrypt({ message: "Error encrypting response." }, TOKEN));
        }
    };

    next();
});


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
