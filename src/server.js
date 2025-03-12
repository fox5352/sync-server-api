 const fs = require("fs");
const path = require("path");
const https = require("https");
const { app } = require("./app.js");
const { getSettings, getIpAddress } = require("./lib/utils.js");
const { KEY, CERT } = require("./certs/cert.js");

const SETTINGS = getSettings();


const options = {
  key: Buffer.from(KEY, 'base64').toString('utf-8'),
  cert: Buffer.from(CERT, "base64").toString("utf-8"),
};

https.createServer(options, app).listen(SETTINGS.server.port, SETTINGS.server.host, () => {
    let address = '';
    if (SETTINGS.server.host == "0.0.0.0") {
        address = `https://${getIpAddress()}:${SETTINGS.server.port}`;
    } else {
        address = `https://localhost:${SETTINGS.server.port}`;
    }
    console.log(`Server is running on ${address}`);
});