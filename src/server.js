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

io.on("connection", (socket)=>{
    let handshakeDetails = socket.handshake;

    const origin = handshakeDetails.headers.origin;
    const timestamp = new Date().toISOString();
    logToFile(`${origin} connected at ${timestamp}`);

    let fileBuffer = {};
    
    socket.on("UPLOAD", async (obj)=>{
        let parsedObj;

        try {
            parsedObj = JSON.parse(obj);
        } catch (error) {
            console.error("Invalid JSON received");
            socket.emit("error", "Invalid JSON format");
            return;
        }
        
        // if (!parsedObj.encryptedData) {
        //     console.error("Missing encryptedData");
        //     socket.emit("error", "Missing encryptedData field");
        //     return;
        // }

        // const decryptedData = decrypt(parsedObj.encryptedData, process.env.TOKEN);

        if (!parsedObj) {
            console.error("Invalid data received");
            return;
        }

        if (!parsedObj.id){
            console.error("Invalid id data received");
            return;
        }

        const packetProperties = ["name", "type", "data", "packetIndex"];
        
        let errorMessage = "";

        for (let i = 0; i < packetProperties.length; i++) {
            const property = packetProperties[i]
            if (!parsedObj[property] === undefined ) errorMessage += `${property}, `;
        }

        if (errorMessage.length > 0) {
            console.error(`the following properties are missing the in packet ${errorMessage}`);
            socket.emit("error", { id:parsedObj.id, message: `the following properties are missing the in packet ${errorMessage}`});
            return;
        }

        const lastIndex = fileBuffer[parsedObj.id]?.endIndex > parsedObj.packetIndex? fileBuffer[parsedObj.id].endIndex : parsedObj.packetIndex;

        fileBuffer[parsedObj.id] = {
            name: parsedObj.name,
            type:parsedObj.type,
            endIndex: lastIndex,
            buffer : {
                ...fileBuffer[parsedObj.id]?.buffer,
                [parsedObj.packetIndex]: parsedObj.data
            }
        }
        
    })

    socket.on("UPLOAD_COMPLETE", async (obj) => {
        const SETTINGS = getSettings();
        let parsedObj;

        try {
            parsedObj = JSON.parse(obj);
        } catch (error) {
            console.error("Invalid JSON received");
            socket.emit("error", "Invalid JSON format");
            return;
        }

        if (!parsedObj) {
            console.error("Invalid data received");
            return;
        }

        if (!parsedObj.id){
            console.error("Invalid id data received");
            return;
        }

        const data = fileBuffer[parsedObj.id];
        fileBuffer[parsedObj.id] = null;// clean up the buffer

        if (!data) {
            console.error("failed to retrieve data by id");
            socket.emit("error", {id:parsedObj.id, message:"failed to retrieve data by id"});
            return;
        }

        const [fileType, _] = data.type.split("/");

        if (!fileType) {
            console.error("invalid fileType");
            socket.emit("error", {id: parsedObj.id, message:"invalid fileType"});
            return;
        }

        // TODO: get path from user later
        const pathType = `${fileType}Paths`;        

        if (!SETTINGS[pathType]) {
            console.error(`No paths found for file type ${fileType}`);
            socket.emit("error", {id: parsedObj.id, message:`No paths found for file type ${fileType}`});
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
            socket.emit("error", {id: parsedObj.id, message:`No valid path found for file type ${data.name} ${fileType}`});
            return;
        }

        
        const [nameWithoutExtension, extension] = splitByLastDot(data.name);
        
        // check if file already exits
        const exists = await checkFileExists(selectedPath, nameWithoutExtension, extension)           

        if (exists) {
            console.error("file already exists");                
            socket.emit("error", `file already exist`)
            return;
        }
        

        try {
            for (const index of Object.keys(data?.buffer)) {
                const res = await appendToFile(selectedPath, nameWithoutExtension, fileType, extension, data?.buffer[index]);   
                
                if (!res) throw new Error("failed to write file");
            }
            
            // TODO: maybe add a finish event
        } catch (error) {
            console.error(`failed to write file name:${data.name}:${obj.id}, error: ${error.message}`);            
            return
        }

    })

    socket.on("disconnect", () => {
        logToFile(`${origin} disconnected at ${new Date().toISOString()}`)
    });
});



const MODE = process.env.DEBUG  === "true"? true : false;

const SETTINGS = getSettings();
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