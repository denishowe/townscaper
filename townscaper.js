const { readFile, writeFile } = require('fs/promises');
const { parseStringPromise: parseXML } = require('xml2js');

const maxHeight = 10;
const blockCount = rand(3, 10 * maxHeight);
const colourCount = rand(1, 4);
const palette = nOf(colourCount, () => rand(0, 14));
const heights = nOf(rand(1, 6), () => rand(0, maxHeight, 2));

async function run() {
  const directory = 'c:/Users/denis/AppData/LocalLow/Oskar Stalberg/Townscaper';
  const settingsFile = directory + '/Sett.ings';
  const saveDirectory = directory + '/Saves';
  const saveFileName = 'Random.scape';
  const saveFile = saveDirectory + '/' + saveFileName;
  const schema = 'xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"';

  const gridFile = saveDirectory + '/' + 'Grid.scape';
  const gridText = await readFile(gridFile);
  const grid = (await parseXML(gridText))
    .SaveData.corners[0].C
    .map(g => ({ x: parseInt(g.x[0], 10), y: parseInt(g.y[0], 10) }));
  // console.log('grid', grid);


  const cornerHeightColour = new Map();
  nOf(blockCount, () =>
    cornerHeightColour.getMap(grid.any(2)).set(randomHeight(), randomColour())
  );
  // console.log('chc', cornerHeightColour);

  const cornerXmls = [];
  const voxelXmls = [];

  cornerHeightColour.forEach((heightColour, corner) => {
    cornerXmls.push(cornerXml(corner, heightColour.size));
    heightColour.forEach((colour, height) => voxelXmls.push(voxelXml(colour, height)));
  });

  const corners = '\n' + cornerXmls.join('') + '  ';
  const voxels = '\n' + voxelXmls.join('') + '  ';

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
  <cam><x>80</x><y>200</y><z>200</z>
  </cam>
  <corners>${corners}</corners>
  <voxels>${voxels}</voxels>
</SaveData>
`;
  await writeFile(saveFile, saveText);
}

function cornerXml({ x, y }, count) { return `    <C><x>${x}</x><y>${y}</y><count>${count}</count></C>\n` }

function voxelXml(colour, height) { return `    <V><t>${colour}</t><h>${height}</h></V>\n` }

function randomHeight() { return heights.any(2) }

function randomColour() { return palette.any(2) }

function rand(min, max, power = 1) { return Math.floor(min + (max-min+1) * Math.random()**power) }

function nOf(n, f) {
  const result = [];
  while (n-- > 0) result.push(f());
  return result;
}

Array.prototype.any = function any(power = 1) { return this[rand(0, this.length-1, power)] }

Map.prototype.getMap = function getMap(key) {
  let m = this.get(key);
  if (!m) this.set(key, m = new Map());
  return m;
}

run();
