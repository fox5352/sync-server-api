const osPath = require("path");
const { getSettings } = require("../lib/utils.js");

const SETTINGS = getSettings();

async function GET(req,res) {
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
            case "image":
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
}

module.exports = {
    GET
}