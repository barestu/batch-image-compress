const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

function getOutputPath(inputPath) {
  const fileLocation = inputPath.split('/').slice(0, -1).join('/');
  const fileName = inputPath.split('/').pop();
  const fileExtension = path.extname(fileName);
  const fileNameWithoutExtension = fileName.replace(fileExtension, '');
  return `${fileLocation}/${fileNameWithoutExtension}_compressed.jpg`;
}

async function compressImage(filePath) {
  console.log('⌛️ Compressing image:', filePath);
  return new Promise(async (resolve) => {
    const outputPath = getOutputPath(filePath);
    const buffer = fs.readFileSync(filePath);
    const outputInfo = await sharp(buffer)
      .jpeg({ quality: 80 })
      .toFile(outputPath);
    resolve(outputInfo);
  });
}

function scanDirectory(inputDir) {
  return new Promise((resolve, reject) => {
    fs.readdir(inputDir, async (err, files) => {
      if (err) {
        console.log(`Invalid directory: ${inputDir}`);
        reject(err);
      }

      for (const file of files) {
        const filePath = `${inputDir}/${file}`;
        const isDirectory = fs.lstatSync(filePath).isDirectory();
        const isImage = file.endsWith('.jpg') || file.endsWith('.png');
        const isNotCompressed = file.endsWith('_compressed.jpg');
        if (isDirectory) {
          await scanDirectory(filePath);
        } else if (isImage && !isNotCompressed) {
          await compressImage(filePath);
        }
      }

      resolve();
    });
  });
}

async function main() {
  const inputDir = process.argv[2];
  if (!inputDir) {
    console.log('Please provide an input directory!');
    return;
  }
  try {
    console.log('📁 Scanning directory:', inputDir);
    await scanDirectory(inputDir);
    console.log('✅ All process completed!');
  } catch (error) {
    console.log('❌ Process failed:', error);
  }
}

main();
