const { readFile, writeFile } = require('fs/promises');
const { parseStringPromise: parseXML } = require('xml2js');

const maxHeight = 10;

async function run() {
  const directory = 'c:/Users/denis/AppData/LocalLow/Oskar Stalberg/Townscaper';
  const settingsFile = directory + '/Sett.ings';
  const saveDirectory = directory + '/Saves';
  const saveFileName = 'Random.scape';
  const saveFile = saveDirectory + '/' + saveFileName;
  const schema = 'xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"';

  const gridFile = saveDirectory + '/' + 'Grid.scape';
  const grid = (await parseXML(await readFile(gridFile))).SaveData.corners[0].C;

  const corners = grid.map(g => `    <C><x>${g.x}</x><y>${g.y}</y><count>1</count></C>`).join('\n');

  const voxels = grid.map(_g => `    <V><t>${randomColour()}</t><h>${randomHeight()}</h></V>`).join('\n');

  const settingsText = `<?xml version="1.0" encoding="utf-8"?>
<SettingsData ${schema}>
  <version>1</version>
  <lastSave>${saveFileName}</lastSave>
  <saveIterator>0</saveIterator>
  <currentColor>0</currentColor>
  <audioVolume>255</audioVolume>
  <screenshot><path /><x>1280</x><y>1024</y></screenshot>
</SettingsData>
`;
  await writeFile(settingsFile, settingsText);

  const saveText = `<?xml version="1.0" encoding="utf-8"?>
<SaveData ${schema}>
  <corners>
${corners}
  </corners>
  <voxels>
${voxels}
  </voxels>
</SaveData>
`;
  await writeFile(saveFile, saveText);
}

function randomHeight() { return Math.floor(maxHeight * Math.random()) }

function randomColour() { return Math.floor(16 * Math.random()) }

Array.prototype.any = function any() { return this[Math.random(this.length)] }

run();
