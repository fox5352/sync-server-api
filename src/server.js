const http = require("http");
const { app } = require("./app.js");
const { getSettings, getIpAddress } = require("./lib/utils.js")

const SETTINGS = getSettings();

const server = http.createServer(app);

const MODE = process.env.DEBUG  == "true"? true : false;

server.listen(SETTINGS.server.port, MODE ? ("localhost"):(SETTINGS.server.host), () => {
    let address = '';
    if (MODE) {
        console.log("server started in debug mode")
        address = `http://localhost:${SETTINGS.server.port}`

    } else if (SETTINGS.server.host == "0.0.0.0") {
        address = `http://${getIpAddress()}:${SETTINGS.server.port}`
    } else {
        address = `http://localhost:${SETTINGS.server.port}`
    }
    console.log(`Server is running on ${address}`);
})