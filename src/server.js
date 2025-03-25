require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");

const { app } = require("./app.js");
const { getSettings, getIpAddress, logToFile, decrypt } = require("./lib/utils.js");
const { appendToFile } = require("./lib/fileManagement.js");

const SETTINGS = getSettings();

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});

if (process.env.TOKEN == undefined) throw new Error("token not found");

io.on("connection", (socket)=>{
    let handshakeDetails = socket.handshake;

    const origin = handshakeDetails.headers.origin;
    const timestamp = new Date().toISOString();
    logToFile(`${origin} connected at ${timestamp}`);

    socket.on("UPLOAD", async (obj)=>{
        const {id, name, type, path, data} = JSON.parse(decrypt(obj.encryptedData, process.env.TOKEN));

        if (!id || !name || !type || !data) {
            console.error("Invalid data received");
            socket.emit("error", "Invalid data received");
            return;
        }

        const [fileType, extension] = type.split("/");

        if (!fileType || !extension) {
            console.error("Invalid file type or extension");
            socket.emit("error", "Invalid file type or extension");
            return;
        }
        
        
        const pathType = `${fileType}Paths`;
      

        if (!SETTINGS[pathType]) {
            console.error(`No paths found for file type ${fileType}`);
            socket.emit("error", `No paths found for file type ${fileType}`);
            return;
        }

        let selectedPath = "";
        if (path) {
            selectedPath = SETTINGS[pathType].find((val)=> {
                return val == path
            });
            
            if (selectedPath.length == 0) {
                console.error(`No valid path found for file type ${fileType} and path ${path}`);
                selectedPath = SETTINGS[pathType][0]
            }

        }else {
            selectedPath = SETTINGS[pathType][0];
        }

        if (!selectedPath) {
            console.error(`No valid path found for file type ${fileType}`);
            socket.emit("error", `No valid path found for file type ${name} ${fileType}`);
            return;
        }
        
        const res = await appendToFile(selectedPath, name, fileType, extension, data)
        

        if (res) {
            console.log(`File uploaded successfully name:${name} at path:${selectedPath}`);
        } else {
            console.error(`Failed to upload file: ${name}`);
        }

        socket.emit("UPLOAD_STATUS", {
            id,
            status: res? "success" : "error",
            message: res? "File uploaded successfully" : "Failed to upload file",
        });
    })

    socket.on("disconnect", () => {
        logToFile(`${origin} disconnected at ${new Date().toISOString()}`)
    });
});


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