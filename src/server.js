require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");

const { app } = require("./app.js");
const { getSettings, getIpAddress, logToFile, decrypt, base64ToUint8Array } = require("./lib/utils.js");
const { appendToFile, checkFileExists } = require("./lib/fileManagement.js");

const SETTINGS = getSettings();

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
    maxHttpBufferSize: 20 * 1024 * 1024, // 10MB
});

if (process.env.TOKEN == undefined) throw new Error("token not found");

io.on("connection", (socket)=>{
    let handshakeDetails = socket.handshake;

    const origin = handshakeDetails.headers.origin;
    const timestamp = new Date().toISOString();
    logToFile(`${origin} connected at ${timestamp}`);
    
    socket.on("UPLOAD", async (obj)=>{
        let parsedObj;

        try {
            parsedObj = JSON.parse(obj);
        } catch (error) {
            console.error("Invalid JSON received");
            socket.emit("error", "Invalid JSON format");
            return;
        }

        if (!parsedObj.encryptedData) {
            console.error("Missing encryptedData");
            socket.emit("error", "Missing encryptedData field");
            return;
        }

        const decryptedData = decrypt(parsedObj.encryptedData, process.env.TOKEN);

        if (!decryptedData) {
            console.error("Invalid decrypted data received");
            socket.emit("error", "Invalid decrypted data received");
            return;
        }

        if (!decryptedData.name){
            console.error("Missing file name");
            socket.emit("error", "Missing file name");
            return;
        }

        if (!decryptedData.type) {
            console.error("Missing file type");
            socket.emit("error", "Missing file type");
            return;
        }

        if (!decryptedData.data) {
            console.error("Missing file data");
            socket.emit("error", "Missing file data");
            return;
        }

        if (!typeof(decryptedData.packetIndex) == "number") {
            console.error("Missing packet packetIndex");
            console.log("packetIndex:", decryptedData?.packetIndex);
            
            socket.emit("error", "Missing packetIndex");
            return;
        }

        const data = decryptedData; // Use this from now on

        const [fileType, _] = data?.type.split("/");

        if (!fileType) {
            console.error("Invalid file type");
            socket.emit("error", "Invalid file type");
            return;
        }        
        
        const pathType = `${fileType}Paths`;
      

        if (!SETTINGS[pathType]) {
            console.error(`No paths found for file type ${fileType}`);
            socket.emit("error", `No paths found for file type ${fileType}`);
            return;
        }

        let selectedPath = "";
        if (data?.path) {
            selectedPath = SETTINGS[pathType].find((val)=> {
                return val == data?.path
            });
            
            if (selectedPath.length == 0) {
                console.error(`No valid path found for file type ${fileType} and path ${data?.path}`);
                selectedPath = SETTINGS[pathType][0]
            }

        }else {
            selectedPath = SETTINGS[pathType][0];
        }

        if (!selectedPath) {
            console.error(`No valid path found for file type ${fileType}`);
            socket.emit("error", `No valid path found for file type ${data.name} ${fileType}`);
            return;
        }

        const [nameWithoutExtension, extension] = data.name.split(".");

        if (data.packetIndex == 0) {
            // TODO: check if file already exits
            const exists = await checkFileExists(selectedPath, nameWithoutExtension, extension)           

            if (exists) {
                console.error("file already exists");                
                socket.emit("error", `file already exist`)
                return;
            }
        }        
        
        const res = await appendToFile(selectedPath, nameWithoutExtension, fileType, extension, base64ToUint8Array(data?.data))   

        if (res) {
            console.log(`File uploaded successfully name:${data.name} at path:${selectedPath}`);
        } else {
            console.error(`Failed to upload file: ${data.name}`);
        }

        socket.emit("UPLOAD_STATUS", {
            id: data?.id ? data.id : null,
            status: res? "success" : "error",
            message: res? "File uploaded successfully" : "Failed to upload file",
        });
    })

    socket.on("disconnect", () => {
        logToFile(`${origin} disconnected at ${new Date().toISOString()}`)
    });
});


const MODE = process.env.DEBUG  === "true"? true : false;

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