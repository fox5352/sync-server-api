require("dotenv").config();
const { getSettings, updateSettings }  = require("../lib/utils");

function checker(req, res, next) {
    const token = process.env.TOKEN;

    if (!token) res.status(403).json({message: "token not found"})

    if (req.headers.authorization != `Bearer ${token}`) {
        return res.status(403).json({message: "Invalid token"})
    }

    next();
}


async function GET(req, res) {
    const settings = getSettings();
    
    res.json({
        data: {
            settings
        },
        message: "Settings fetched successfully"
    });
}

async function POST(req, res) {
    const updatedSettings = req.body.settings;

    const settings = getSettings();

    const newSettings = {
        ...settings,
        ...updatedSettings
    }
    
    try {
        updateSettings(newSettings);      

        res.json({
            data: {
                settings: newSettings
            },
            message: "Settings updated successfully"
        });

    } catch (error) {
        res.status(500).json({message: "Failed to update settings: " + error.message});
    }
}

module.exports = {
    checker,
    GET,
    POST
}