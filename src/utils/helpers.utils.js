
const fs = require("fs");
const path = require("path")
function errorMessage(res, err, status = 400) {
    return res.status(status).json(err.message)
}

function deleteFullImagePath(filepath) {
    fs.unlinkSync(String(filepath.split("4000")[1]).slice(1), (error) => {
        console.log(error)
    })
}
function convertUrl(url = "") {
    return url.replace(/\\/g, "/")
}


module.exports = { errorMessage, deleteFullImagePath, convertUrl, }