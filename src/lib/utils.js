require("dotenv").config();
const path = require("path");
const os = require("os");
const { readFileSync, writeFileSync, appendFileSync, existsSync, mkdirSync } = require("node:fs")
const CryptoJS = require("crypto-js");

const DEBUG = process.env.DEBUG == "true" ? true : false;

function getCurrentDirectoryName() {
    const runningDir = process.pkg ? path.dirname(process.execPath) : process.cwd();
    return path.basename(runningDir);
}

function getAppDataPath() {

    const homedir = os.homedir();

    if (process.platform === 'win32') {

        return `${homedir}\\AppData\\Roaming`;

    } else {

        return `${homedir}/.config`;

    }

}

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
    // TODO: add size checker to clear file if it gets to big
    if (DEBUG) return


    let appPath;

    // Check the operating system
    if (os.platform() === 'win32') {
        // Windows-specific path (keep your original logic)
        appPath = path.join(getAppDataPath(), getCurrentDirectoryName());
    } else {
        // Linux-specific path (user-writable directory)
        const homeDir = os.homedir(); // Get the home directory

        appPath = path.join(homeDir, '.local', 'share', 'sync-server-api');
    }

    if (!existsSync(appPath)) {
        mkdirSync(appPath);
    }

    const logPath = path.join(appPath, 'server.log');
    appendFileSync(logPath, `${new Date().toISOString()} - ${message}\n`);
}

/**
* Retrieves settings from a JSON file and processes them.
 *
 * This function reads a 'settings.json' file from the parent directory or a custom path,
 * parses its contents, and extracts specific settings. If certain settings
 * are not present in the file, empty arrays are used as default values.
 *
    * @returns {Object} An object containing the settings.
    * @property {string[]} allowList - List of allowed file types.
    * @property {string[]} imagePaths - List of paths to search for images.
    * @property {string[]} imageExt - List of image file extensions.
    * @property {string[]} audioPaths - List of paths to search for audio files.
    * @property {string[]} audioExt - List of audio file extensions.
    * @property {string[]} videoPaths - List of paths to search for video files.
    * @property {string[]} videoExt - List of video file extensions.
    * @property {Object} server - Server settings.
    * @property {string} server.host - The host to use for the server.
    * @property {number} server.port - The port to use for the server.
    * @property {string} key - The encryption key.
 */
function getSettings() {
    // create dir

    let appPath;

    if (DEBUG){
        appPath = path.join(process.cwd());
        console.log(appPath);
        
    }else {
        // Check the operating system
        if (os.platform() === 'win32') {
            // Windows-specific path (keep your original logic)
            appPath = path.join(getAppDataPath(), getCurrentDirectoryName());
        } else {
            // Linux-specific path (user-writable directory)
            const homeDir = os.homedir(); // Get the home directory

            appPath = path.join(homeDir, '.local', 'share', 'sync-server-api');
        }
    }

    if (!existsSync(appPath)) {
        mkdirSync(appPath);
    }

    const settingsPath = path.join(appPath, "settings.json");

    // Add logging
    logToFile(`Reading settings from: ${settingsPath}`);

    let allowList = [];

    let imagePaths = [];
    let imageExt = ["jpg", "png"];

    let audioPaths = [];
    let audioExt = ["mp3"];

    let videoPaths = [];
    let videoExt = ["mkv", "mp4"];

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
            videoPaths: settings.videoPaths || videoPaths,
            imageExt: settings.imageExt || imageExt,
            audioExt: settings.audioExt || audioExt,
            videoExt: settings.videoExt || videoExt,
            server: settings.server || server,
            key: settings.key || key,
        };
    } catch (error) {
        logToFile(`Failed to read settings: ${error.message}`);
        // Create a new settings.json with default values if it doesn't exist
        const defaultSettings = {
            allowList,
            imagePaths,
            audioPaths,
            videoPaths,
            imageExt,
            audioExt,
            videoExt,
            server,
            key,
        };
        writeFileSync(settingsPath, JSON.stringify(defaultSettings, null, 2), "utf-8");

        return getSettings();
    }
}

function updateSettings(newSettings) {
    let appPath;

    if (DEBUG){
        appPath = path.join(process.cwd());
    }else {
        // Check the operating system
        if (os.platform() === 'win32') {
            // Windows-specific path (keep your original logic)
            appPath = path.join(getAppDataPath(), getCurrentDirectoryName());
        } else {
            // Linux-specific path (user-writable directory)
            const homeDir = os.homedir(); // Get the home directory

            appPath = path.join(homeDir, '.local', 'share', 'sync-server-api');
        }
    }

    if (!existsSync(appPath)) {
        mkdirSync(appPath);
    }

    const settingsPath = path.join(appPath, "settings.json");

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


function encrypt(data, key) {
    return CryptoJS.AES.encrypt(JSON.stringify(data), key).toString();    
}

function decrypt(data, key) {
    try {
        const bytes = CryptoJS.AES.decrypt(data, key);
        const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
        return decryptedData ? JSON.parse(decryptedData) : null;
    } catch (error) {
        return null; // Return null if decryption fails
    }
}

function base64ToUint8Array(base64) {
  const binaryString = atob(base64);
  const uint8Array = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    uint8Array[i] = binaryString.charCodeAt(i);
  }
  return uint8Array;
}

function splitByLastDot(str) {
  const lastDotIndex = str.lastIndexOf(".");
  if (lastDotIndex === -1) return [str]; // no dot found
  const before = str.slice(0, lastDotIndex);
  const after = str.slice(lastDotIndex + 1);
  return [before, after];
}

module.exports = {
    getIpAddress,
    logToFile,
    getSettings,
    updateSettings,
    getCurrentDirectoryName,
    getAppDataPath,
    encrypt,
    decrypt,
    base64ToUint8Array,splitByLastDot
};
