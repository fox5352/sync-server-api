require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");

const { app } = require("./app.js");
const { getSettings, getIpAddress, logToFile, decrypt, base64ToUint8Array, splitByLastDot } = require("./lib/utils.js");
const { appendToFile, checkFileExists } = require("./lib/fileManagement.js");


const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
    maxHttpBufferSize: 20 * 1024 * 1024, // 10MB
});

if (process.env.TOKEN == undefined) throw new Error("token not found");

io.on("connection", (socket) => {
    let handshakeDetails = socket.handshake;

    const origin = handshakeDetails.headers.origin;
    const timestamp = new Date().toISOString();
    logToFile(`${origin} connected at ${timestamp}`);

    let fileBuffer = {};

    socket.on("UPLOAD", async (obj) => {
        let parsedObj;

        try {
            parsedObj = JSON.parse(obj);

            if (!parsedObj) {
                throw new Error("Invalid data received");
            }

            if (!parsedObj.id) {
                throw new Error("Invalid id data recived");
            }

            const packetProperties = ["name", "type", "data", "packetIndex"];

            let errorMessage = "";

            for (let i = 0; i < packetProperties.length; i++) {
                const property = packetProperties[i]
                if (!parsedObj[property] === undefined) errorMessage += `${property}, `;
            }

            if (errorMessage.length > 0) {
                throw new Error(`the following properties are missing the in packet ${errorMessage}`)
            }

            const lastIndex = fileBuffer[parsedObj.id]?.endIndex > parsedObj.packetIndex ? fileBuffer[parsedObj.id].endIndex : parsedObj.packetIndex;


            fileBuffer[parsedObj.id] = {
                name: parsedObj.name,
                type: parsedObj.type,
                endIndex: lastIndex,
                buffer: {
                    ...fileBuffer[parsedObj.id]?.buffer,
                    [parsedObj.packetIndex]: parsedObj.data
                }
            }

        } catch (error) {
            console.error(error);
            socket.emit("error", { id: parsedObj.id, message: `${error}` });
        }
    })

    socket.on("UPLOAD_COMPLETE", async (obj) => {
        const SETTINGS = getSettings();
        let parsedObj;

        try {
            parsedObj = JSON.parse(obj);

            if (!parsedObj) {
                throw new Error("Invalid data received");
            }

            if (!parsedObj.id) {
                throw new Error("Invalid id data received");
            }

            const data = fileBuffer[parsedObj.id];

            if (!data) {
                throw new Error("failed to retrieve data by id");
            }

            const [fileType, _] = data.type.split("/");

            if (!fileType) {
                throw new Error("invalid fileType");
            }

            // TODO: get path from user later
            const pathType = `${fileType}Paths`;

            if (!SETTINGS[pathType]) {
                throw new Error(`No paths found for file type ${fileType}`);
            }

            let selectedPath = "";

            if (parsedObj?.path) {
                console.log("data path found", parsedObj?.path)
                selectedPath = SETTINGS[pathType].find((val) => {
                    return val == parsedObj?.path
                });

                if (selectedPath.length == 0) {
                    console.error(`No valid path found for file type ${fileType} and path ${parsedObj?.path}`);
                    selectedPath = SETTINGS[pathType][0]
                }

            } else {
                console.log("default path selected")
                selectedPath = SETTINGS[pathType][0];
            }

            if (!selectedPath) {
                throw new Error(`No valid path found for file type ${fileType}`);
            }

            const [nameWithoutExtension, extension] = splitByLastDot(data.name);

            // check if file already exits
            const exists = await checkFileExists(selectedPath, nameWithoutExtension, extension)

            if (exists) {
                throw new Error("file already exists");
            }

            for (let idx = 0; data && idx < data.endIndex; idx++) {
                const uint8Buffer = base64ToUint8Array(data.buffer[idx]);
                const res = await appendToFile(selectedPath, nameWithoutExtension, fileType, extension, uint8Buffer);
                if (!res) throw new Error("failed to write file");
            }

            fileBuffer[parsedObj.id] = null;// clean up the buffer

            // TODO: maybe add a finish event
        } catch (error) {
            console.error(error);
            socket.emit("error", { id: parsedObj.id, message: `${error}` });
        }

    })

    socket.on("disconnect", () => {
        logToFile(`${origin} disconnected at ${new Date().toISOString()}`)
    });
});



const MODE = process.env.DEBUG === "true" ? true : false;

const SETTINGS = getSettings();
server.listen(SETTINGS.server.port, MODE ? ("localhost") : (SETTINGS.server.host), () => {
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
