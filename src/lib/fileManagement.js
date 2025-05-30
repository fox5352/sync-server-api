const path = require('path');
// const sharp = require('sharp');
const fs = require("node:fs/promises");
const { parseFile } = require("music-metadata");
const { logToFile } = require("../lib/utils")

function base64ToUint8Array(base64) {
    const binaryString = atob(base64);
    const length = binaryString.length;
    const bytes = new Uint8Array(length);

    for (let i = 0; i < length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }

    return bytes;
}

async function getMimeType(buffer) {
    // Magic numbers for common file types
    const signatures = {
        'ffd8ffe0': 'image/jpeg',
        '89504e47': 'image/png',
        '47494638': 'image/gif',
        '52494646': 'audio/wav',  // RIFF header
        '4944332e': 'audio/mp3',  // ID3v2
        '66747970': 'video/mp4',  // ftyp
        '1a45dfa3': 'video/webm', // EBML
    };

    // Get first 4 bytes as hex
    const hex = buffer.slice(0, 4).toString('hex').toLowerCase();

    for (const [signature, mimeType] of Object.entries(signatures)) {
        if (hex.startsWith(signature.toLowerCase())) {
            return mimeType;
        }
    }

    return 'application/octet-stream';
}

async function getAudioDuration(path) {
    try {

        const metaData = await parseFile(path)


        return {
            duration: metaData.format.duration,
            sampleRate: metaData.format.sampleRate
        };
    } catch (error) {
        // logToFile('Error getting audio duration:', error);
        return null;
    }
}

async function generateThumbnailBuffer(imagePath, width = 155, height = 155) {
    try {
        const file = Buffer.from(await fs.readFile(imagePath));

        return file;
    } catch (err) {
        logToFile('Error creating thumbnail:', err);
        return null; // Re-throw the error for handling elsewhere if needed.
    }
}

async function getFileMetadata(filePath, type) {
    try {
        const stats = await fs.stat(filePath);

        let metadata = {
            size: stats.size,
            created: stats.birthtime,
            modified: stats.mtime
        };

        // Generate thumbnails for images and videos
        // FIX: impl image processing package
        if (type == "image") {
            const thumbnailBuffer = await generateThumbnailBuffer(filePath);

            if (thumbnailBuffer) {
                metadata = {
                    ...metadata,
                    imageMetaData: {
                        thumbnail: thumbnailBuffer
                    }
                }
            }
        }

        // Get duration for audio files only
        if (type == "audio" || type == "video") {
            const audioMetaData = await getAudioDuration(filePath);
            if (audioMetaData) {
                metadata = {
                    ...metadata,
                    audioMetaData: audioMetaData
                };
            }
        }

        return metadata;
    } catch (error) {
        logToFile('Error processing file:', error);
        throw error;
    }
}

// ------------------------------------------------------------------------------------------

async function readFileData(filePath) {
    try {
        if (!filePath) throw new Error("File path is required");

        const fileData = await fs.readFile(filePath, { encoding: null }); // Or { encoding: 'buffer' }

        return fileData;
    } catch (error) {
        logToFile("Error reading file:", error);
        return null;
    }
}

/**
 * Retrieves a list of files from a specified directory.//+
 * //+
 * @async//+
 * @param {string} dirPath - The path to the directory to read files from.//+
 * @returns {Promise<Array<Object|null>>} A promise that resolves to an array of file objects.//+
 *                                   Each object contains://+
 *                                   - name: The name of the file.//+
 *                                   - path: The full path to the file.//+
 *                                   - extension: The file extension.//+
 *///
async function getFiles(dirPath) {
    try {
        if (!dirPath) {
            throw new Error("Directory path is required");
        }


        const entries = await fs.readdir(dirPath, { withFileTypes: true });

        return entries
            .filter(entry => entry.isFile())
            .map(entry => ({
                name: entry.name.split(".")[0],
                path: path.join(dirPath, entry.name),
                extension: path.extname(entry.name)
            }));
    } catch (error) {
        logToFile(`Failed to read directory ${dirPath}: ${error.message}`);
        return null
    }
}

async function writeFile(dirPath, name, extension, data) {
    try {
        if (!name || !extension) {
            throw new Error("Name and extension are required");
        }
        if (!data) {
            throw new Error("Data is required");
        }
        if (!dirPath) {
            throw new Error("Directory path is required");
        }

        const fullPath = path.join(dirPath, `${name}.${extension}`);

        await fs.writeFile(fullPath, new Uint8Array(data));

        return true;
    } catch (error) {
        throw new Error(`Failed to write file ${fullPath}: ${error.message}`);
    }
}

async function checkFileExists(dirPath, name, extension) {
    try {
        await fs.access(path.join(dirPath, `${name}.${extension}`));
        return true;
    } catch (error) {
        return false;
    }
}

async function appendToFile(dirPath, name, type, extension, data) {
    try {
        if (!name || !extension) {
            throw new Error("Name and extension are required");
        }
        if (!data) {
            throw new Error("Data is required");
        }
        if (!dirPath) {
            throw new Error("Directory path is required");
        }

        const fullPath = path.join(dirPath, `${name}.${extension}`);

        let buffer = ""
        let encoding = "binary"
        switch (type) {
            case "document":
                buffer = data.toString()
                encoding = "utf-8"
                break;
            default:
                buffer = new Uint8Array(data)
                encoding = "binary"
                break;
        }

        await fs.appendFile(fullPath, buffer, {
            encoding,
            extension
        })

        return true;
    } catch (error) {
        throw new Error(`Failed to append ${name} to ${fullPath}: ${error.message}`);
    }
}


module.exports = {
    readFileData,
    getFiles,
    writeFile,
    appendToFile,
    getFileMetadata,
    checkFileExists,
    base64ToUint8Array
}
