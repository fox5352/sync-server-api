
const path = require("path");
const os = require("os");
const fs = require("node:fs/promises");
const { readFileSync, writeFileSync, appendFileSync } = require("node:fs")



function getIpAddress() {

  const interfaces = os.networkInterfaces();

  for (const key in interfaces) {

    for (const details of interfaces[key]) {

      if (details.family === 'IPv4' && !details.internal) {

        return details.address;

      }

    }

  }

  return 'No IPv4 address found';

}

function logToFile(message) {
    if (!process.env.DEBUG == "true") return;
    
    const logPath = path.join(process.pkg ? path.dirname(process.execPath) : process.cwd(), 'server.log');
    appendFileSync(logPath, `${new Date().toISOString()} - ${message}\n`);
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


/**
 * Retrieves settings from a JSON file and processes them.
 * 
 * This function reads a 'settings.json' file from the parent directory or a custom path,
 * parses its contents, and extracts specific settings. If certain settings
 * are not present in the file, empty arrays are used as default values.
 * 
 * @returns {Object} An object containing processed settings:
 *                   - allowList: An array of allowed items. Empty if not specified in settings.
 *                   - imagePaths: An array of image paths. Empty if not specified in settings.
 *                   - audioPaths: An array of audio paths. Empty if not specified in settings.
 */
function getSettings() {
    // Default path to settings.json (can be overridden by an environment variable)
    
    const runningDir = process.pkg ? path.dirname(process.execPath) : process.cwd();
    

    const settingsPath = path.join(runningDir, "settings.json");
    
    // Add logging
    logToFile(`Reading settings from: ${settingsPath}`);

    let allowList = [];

    let imagePaths = [];
    let imageExt = ["jpg", "png"];

    let audioPaths = [];
    let audioExt = ["mp3"];

    let server = {
        host: "0.0.0.0",
        port: 9090,
    }
    let key = undefined;

    try {
        const settings = JSON.parse(readFileSync(settingsPath, "utf-8"));
    
        return {
            allowList: settings.allowList || allowList,
            imagePaths: settings.imagePaths || imagePaths,
            audioPaths: settings.audioPaths || audioPaths,
            imageExt: settings.imageExt || imageExt,
            audioExt: settings.audioExt || audioExt,
            server: settings.server || server,
            key: settings.key || key,
        };
    } catch (error) {
        // Create a new settings.json with default values if it doesn't exist
        const defaultSettings = {
            allowList,
            imagePaths,
            audioPaths,
            imageExt,
            audioExt,
            server,
            key,
        };
        writeFileSync(settingsPath, JSON.stringify(defaultSettings, null, 2), "utf-8");

        return getSettings();
    }
}

function updateSettings(newSettings) {
    // Default path to settings.json (can be overridden by an environment variable)
    const runningDir = process.pkg ? path.dirname(process.execPath) : process.cwd();

    const settingsPath = path.join(runningDir, "settings.json");

    const oldSettings = getSettings();

    const updatedSettings = {
       ...oldSettings,
       ...newSettings,
    };

    try {
        writeFileSync(settingsPath, JSON.stringify(updatedSettings, null, 2), "utf-8");

        logToFile(`Updated settings: ${JSON.stringify(updatedSettings, null, 2)}`);
        return true;
    } catch (error) {
        logToFile("`Failed to update settings: ${error.message}`")
        return false;
    }
}

module.exports = {
    getIpAddress,
    logToFile,
    getFiles,
    writeFile,
    getSettings,
    updateSettings,
};