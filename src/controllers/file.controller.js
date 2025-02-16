const { getFiles, readFileData, getFileMetadata } = require("../lib/fileManagement1");
const { getSettings } = require("../lib/utils");

const SETTINGS = getSettings();

async function GET(req, res) {
    const filetype = req.params.filetype;
    const {name, path:queryPath} = req.query
    

    if (!name || !queryPath) {
        res.status(400).json({message: "Invalid request payload requires both name and path in query"})
    }

    try {
        const pathsList = SETTINGS[filetype + "Paths"];

        if (!pathsList) {
            throw new Error("failed to get paths list");
        }        

        for (const path of pathsList) {
            const files = await getFiles(path);

            if (files.length == 0) throw new Error("no files found");
                        
            for (const file of files) {                

                if (file.name.toLowerCase().includes(name)) {

                    if (file.path == queryPath) {
                        const metaData = await getFileMetadata(file.path, filetype);
                        const fileBuffer = await readFileData(file.path);
                        
                        return res.json({
                            message: "file fetched successfully",
                            data: {
                                ...file,
                                ...metaData,
                                data: fileBuffer
                            }
                        });
                    }
                }
            }
        }


        res.status(404).json({message: "file not found"});
    } catch (error) {
        res.status(500).json({
            message: `Internal Server Error on attempt ${filetype} fetch in file route`
        })
    }
}

module.exports = {
    GET
}