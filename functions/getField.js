const fs = require('fs');
const jimp = require('jimp');

module.exports = async (hit, exportPath) => {
  const hitImages = fs.readdirSync('./assets/field').filter(image => image.startsWith(`${hit}`));
  const hitImage = hitImages[Math.floor(Math.random() * hitImages.length)];
  const ballImages = fs.readdirSync('./assets/field').filter(image => image.startsWith('ball'));
  const ballImage = ballImages[Math.floor(Math.random() * ballImages.length)];
  
  try {
    const field = await (await jimp.read('./assets/field/field.png')).resize(128, 128);
    await field
      .composite(await (await jimp.read(`./assets/field/${ballImage}`)).resize(128, 128), 0, 0)
      .composite(await (await jimp.read(`./assets/field/${hitImage}`)), 0, 0)
      .write(exportPath);
    return;
  } catch (e) {
    console.log(e);
  }
}