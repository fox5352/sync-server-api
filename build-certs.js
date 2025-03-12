const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// Define certs directory
const certsDir = path.join(__dirname, "src", "certs");

// Ensure certs directory exists
if (!fs.existsSync(certsDir)) {
    fs.mkdirSync(certsDir);
}

// Define cert paths
const keyPath = path.join(certsDir, "server.key");
const certPath = path.join(certsDir, "server.crt");

if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
    console.log("Certificates already exist");
    process.exit(0);
}

try {
    const certJs = path.join(certsDir, "cert.js");

    if (!fs.existsSync(certJs)) {
        execSync(`openssl req -x509 -newkey rsa:2048 -nodes -sha256 \
        -subj "/C=US/ST=California/L=Mountain View/O=My Organization/CN=localhost" \
        -keyout ${keyPath} -out ${certPath} --days 3650`);

        const serverKey = fs.readFileSync(keyPath);
        const serverCrt = fs.readFileSync(certPath);

        fs.writeFileSync(certJs, `module.exports = {
            KEY: "${serverKey.toString("base64")}",
            CERT: "${serverCrt.toString("base64")}"
        }`);

        console.log("Certificates created successfully");
    }else {
        console.log("Certificates already exist");
    }

} catch (error) {
    console.error("Error creating certificates:", error);    
}

