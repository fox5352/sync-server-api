const os = require('os');
const path = require('path');
const sharp = require('sharp');
const crypto = require('crypto');
const { promisify } = require('util');
const fs = require("node:fs/promises");
const { parseFile } = require("music-metadata");

const { execFile } = require('child_process');
const execFileAsync = promisify(execFile);

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
        console.log(path);
        
        const metaData = await parseFile(path)
        console.log(metaData);
        

        return {
            duration: metaData.format.duration,
            sampleRate: metaData.format.sampleRate
        };
    } catch (error) {
        // console.error('Error getting audio duration:', error);
        return null;
    }
}

async function generateThumbnailBuffer(filePath, mimeType, buffer) {
    try {
        if (mimeType.startsWith('image/')) {
            // For images, use Sharp
            return await sharp(buffer)
                .resize(255, 255, {
                    fit: 'inside',
                    withoutEnlargement: true
                })
                .jpeg()
                .toBuffer();
        } else if (mimeType.startsWith('video/')) {
            // For videos still need ffmpeg
            try {
                const tempDir = os.tmpdir();
                const tempFileName = `thumb_${crypto.randomBytes(16).toString('hex')}.jpg`;
                const tempFilePath = path.join(tempDir, tempFileName);

                await execFileAsync('ffmpeg', [
                    '-i', filePath,
                    '-vf', 'scale=255:255:force_original_aspect_ratio=decrease',
                    '-frames:v', '1',
                    '-y',
                    tempFilePath
                ]);

                const thumbnailBuffer = await fs.readFile(tempFilePath);
                await fs.unlink(tempFilePath).catch(() => {});
                return thumbnailBuffer;
            } catch (error) {
                console.error('Error generating video thumbnail:', error);
                return null;
            }
        }
        return null;
    } catch (error) {
        console.error('Error generating thumbnail:', error);
        return null;
    }
}

async function getFileMetadata(filePath) {
    try {
        const stats = await fs.stat(filePath);
        const buffer = await fs.readFile(filePath);
        const mimeType = await getMimeType(buffer);

        let metadata = {
            size: stats.size,
            created: stats.birthtime,
            modified: stats.mtime,
            type: mimeType
        };

        console.log(mimeType);
        

        // Generate thumbnails for images and videos
        if (mimeType.startsWith('image/') || mimeType.startsWith('video/')) {
            const thumbnailBuffer = await generateThumbnailBuffer(filePath, mimeType, buffer);
            if (thumbnailBuffer) {
                metadata = {
                    ...metadata,
                    imageMetaData: {
                        thumbnail: thumbnailBuffer
                    }
                }
                // metadata.thumbnail = thumbnailBuffer;
            }
        }

        // Get duration for audio files only
        if (!mimeType.startsWith('audio/')) {
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
        console.error('Error processing file:', error);
        throw error;
    }
}

// ------------------------------------------------------------------------------------------
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
        console.error(`Failed to read directory ${dirPath}: ${error.message}`);
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

        // The key change: specify 'binary' or 'buffer' encoding
        await fs.writeFile(fullPath, data, { encoding: 'binary' }); // Or { encoding: 'buffer' }

        return true;
    } catch (error) {
        throw new Error(`Failed to write file ${fullPath}: ${error.message}`);
    }
}


module.exports = {
    getFiles,
    writeFile,
    getFileMetadata
}