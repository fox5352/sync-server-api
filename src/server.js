const http = require("http");
const { app } = require("./app.js");
const { getSettings, getIpAddress } = require("./lib/utils.js")


const SETTINGS = getSettings();

// TODO: get env from process called token

const server = http.createServer(app);

server.listen(SETTINGS.server.port, SETTINGS.server.host, () => {
    let address = '';
    if (SETTINGS.server.host == "0.0.0.0") {
        address = `http://${getIpAddress()}:${SETTINGS.server.port}`
    } else {
        address = `http://localhost:${SETTINGS.server.port}`
    }
    console.log(`Server is running on ${address}`);
})
