const path = require("path");
const os = require("os");
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

    let videoPaths = [];
    let videoExt= ["mkv", "mp4"];

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
    getSettings,
    updateSettings,
};