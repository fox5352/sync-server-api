const { getSettings } =require("./lib/utils.js");

const SETTINGS = getSettings();

// -------------------------------------- Middleware --------------------------------------
async function filetypeChecker(req, res, next) {
    const filetype = req.params.filetype;    

    if(!SETTINGS.allowList.includes(filetype)) {
        return res.status(403).json({message: "File type Forbidden"});
    }

    next();
}

module.exports = {
    filetypeChecker,
}