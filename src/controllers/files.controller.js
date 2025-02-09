const { getSettings, getFiles, writeFile } = require("../lib/utils");

const SETTINGS = getSettings();


// helpers
/**
 * 
  
 * @param {string} path 
 */
function getFolderName(path) {
    const splitPath = path.split("/");

    return splitPath[splitPath.length - 1];
}

async function GET(req,res) {
    const filetype = req.params.filetype;
    
    let buffer = [];

    try {
        for (const path of SETTINGS.audioPaths) {

            const files = await getFiles(path);

            const filteredFiles = files.filter(item=> {
                switch (filetype) {
                    case "audio":{
                        return SETTINGS.audioExt.includes(item.extension.replace(".", "").toLowerCase())? true : false;
                    }case "image":{
                        return SETTINGS.imageExt.includes(item.extension.replace(".", "").toLowerCase())? true : false;
                    }case "video": {
                        return SETTINGS.videoExt.includes(item.extension.replace(".", "").toLowerCase())? true : false;
                    }
                    default:
                        return false;
                }
            })

            const folderName = getFolderName(path);

            buffer.push({
                key:folderName,
                [folderName]: filteredFiles
            })
        }
        
        return res.json({
            data: buffer,
            message: "successfully fetched data from file path"
        })
    } catch (error) {
        console.error(`failed in ${filetype} GET ${error.message}`);
        return res.status(500).json({message: `Internal Server Error on attempt ${filetype} fetch`});
    }
}

async function POST(req,res) {
    const filetype = req.params.filetype;
    const { data, name, type } = req.body;

    if (!data || !name|| !type) {
        return res.status(400).json({message: "Invalid request payload"})
    }

    const [_, ext] = type.split("/")

    try {
        if (filetype == "audio") {
            // TODO: add path select bt query in future
            await writeFile(SETTINGS.audioPaths[0], name, ext, data)
        }else if (filetype == "image") {
            // TODO: add path select bt query in future
            await writeFile(SETTINGS.imagePaths[0], name, ext, data)
        }

        return res.json({message: "file saved successfully"})

    } catch (error) {
        console.error(`failed to save ${filetype} ${error.message}`);

        res.status(500).json({message: "failed to save file"})
    }
}

module.exports = {
    GET,
    POST
}