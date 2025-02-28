const fs = require('fs');
const archiver = require('archiver');
const path = require('path');

async function createZip(outputPath, files) {
    try {
        if (!outputPath || !files || files.length == 0) {
            return {
                success: false
            }
        }
        const output = fs.createWriteStream(outputPath);
        const archive = archiver('zip', {
            zlib: { level: 9 }
        });

        output.on('close', () => {
            console.log(`ZIP file created. Total size: ${archive.pointer()} bytes`);
            resolve();
        });

        archive.on('error', (err) => {
            reject(err);
        });

        archive.pipe(output);

        files.forEach((file) => {
            const filePath = path.resolve(`${outputPath}/${file.Filename}`);
            archive.file(filePath, { name: file.Filename });
        });

        archive.finalize();

        return {
            success: true
        }
    } catch (error) {
        console.log(error);
        return {
            success: false
        }
    }
}

module.exports = createZip;