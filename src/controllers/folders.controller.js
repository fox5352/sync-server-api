const { getSettings } = require("../lib/utils.js");


async function GET(req, res) {
    const SETTINGS = getSettings();

    const allowed = SETTINGS.allowList;

    let data = allowed.map(filetype => {
        let buffer;
        switch (filetype) {
            case "audio":
                buffer = SETTINGS.audioPaths;
                break;
            case "image":
                buffer = SETTINGS.imagePaths;
                break
            case "video":
                buffer = SETTINGS.videoPaths;
                break;
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
