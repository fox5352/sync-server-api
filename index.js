const osPath = require("path");
const express = require("express");
const { writeFile, getFiles, getSettings } = require("./lib/utils");

const CONFIG_DATA = {
    filetypes: ["images", "audio"],
    audioExt: [".mp3"],
    imageExt: [".png", ".jpg"]
}

const SETTINGS = getSettings()


if (SETTINGS.allowList.length == 0) throw new Error("audioPaths not configured in settings.json");

// -------------------------------------- Middleware --------------------------------------
async function filetypeChecker(req, res, next) {
    const filetype = req.params.filetype;

    if(!SETTINGS.allowList.includes(filetype)) {
        return res.status(403).json({message: "File type Forbidden"});
    }

    next();
}

const app = express();

app.use(express.json());

// GET all products
app.get('/', (req, res) => {
  res.json({message:"testing"}); // Send the products array as JSON
});

app.route("/api/folders")
    .get(async (req,res)=> {
        const allowed = SETTINGS.allowList;

        let data = allowed.map(filetype=>{
            let buffer;
            switch (filetype) {
                case "audio":
                    buffer = SETTINGS.audioPaths.map(path=>{
                        if (path == "./") {
                            return osPath.basename(process.cwd())
                        }else {
                            return osPath.basename(path)
                        }
                    })
                    break;
                case "images":
                    buffer = SETTINGS.imagePaths
                    break
                default:
                    break;
            }

            return {
                type: filetype,
                folders: buffer
            }
        })

        return res.json({
            data: data,
            message: "Successfully fetched folders"
        })
    })

app.route("/api/:filetype")
    .all(filetypeChecker)
    .get(async (req,res)=> {
        const filetype = req.params.filetype;

        let buffer = [];
    
        try {
            
            for (const path of SETTINGS.audioPaths) {
                buffer.push(...(await getFiles(path)).filter(item=> {
                    
                    if (filetype == "audio") {                     
                        return SETTINGS.audioExt.includes(item.extension.replace(".", "").toLowerCase())? true : false;
                    }else if (filetype = "images") {
                        
                        return SETTINGS.imageExt.includes(item.extension.replace(".", "").toLowerCase())? true : false;
                    }else {
                        return false;
                    }
                }))
            }

            const cleanedData = buffer.filter(item => item != null).map(item=>({
                name: item.name,
                extension: item.extension
            }));
            
            return res.json({
                data: cleanedData,
                message: "successfully fetched data from file path"
            })
        } catch (error) {
            console.error(`failed in ${filetype} GET ${error.message}`);
            return res.status(500).json({message: `Internal Server Error on attempt ${filetype} fetch`});
        }
    })
    .post(async (req,res)=> {
        const filetype = req.params.filetype;
        const { data, name, type } = req.body;


        console.log(req.body);
        

        if (!data || !name|| !type) {
            return res.status(400).json({message: "Invalid request payload"})
        }

        const [_, ext] = type.split("/")

        try {
            
            if (filetype == "audio") {
                // TODO: add path select bt query in future
                
                await writeFile(SETTINGS.audioPaths[0], name, ext, data)

                
            }else if (filetype == "images") {
                // TODO: add path select bt query in future
                
                await writeFile(SETTINGS.imagePaths[0], name, ext, data)
            }

            return res.json({message: "file saved successfully"})
        } catch (error) {
            console.error(`failed to save ${filetype} ${error.message}`);
            res.status(500).json({message: "failed to save file"})
        }
    })

app.listen(9090, ()=>{
    console.log("Server is running on port 9090");
})

module.exports = {
    CONFIG_DATA,
    app,
 };