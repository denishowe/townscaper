const { readFile, writeFile } = require('fs/promises');
const { parseStringPromise: parseXML } = require('xml2js');

const maxHeight = 10;
const schema = 'xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"';
const directory = 'c:/Users/denis/AppData/LocalLow/Oskar Stalberg/Townscaper';
const settingsFile = directory + '/Sett.ings';
const saveDirectory = directory + '/Saves';
const gridFile = saveDirectory + '/' + 'Grid.scape';
const saveFileName = 'Random.scape';
const saveFile = saveDirectory + '/' + saveFileName;

async function run() {
  const grid = await getGrid(gridFile);
  // Choose a set of corners, heights and colours
  const cornerCount = rand(2, 10);
  const heightCount = rand(2, 6);
  const colourCount = rand(1, 15, 2);
  const corners = nOf(cornerCount, () => grid.any());
  const heights = nOf(heightCount, () => rand(0, maxHeight, 2));
  const colours = nOf(colourCount, () => rand(0, 15));
  const spaceCount = cornerCount * heightCount;
  const addCount = rand(4, 10 * spaceCount);

  const cornerHeightColour = new Map();
  nOf(addCount, () =>
    cornerHeightColour.getMap(corners.any()).set(heights.any(), colours.any())
  );

  const blockCount = cornerHeightColour.totalSize();
  const density = blockCount / spaceCount;
  console.log(cornerCount, 'corners', heightCount, 'heights', colourCount, 'colours',
    addCount, 'blocks added', blockCount, 'unique blocks',
    Math.floor(100 * density), '% occupied');

  await writeFile(settingsFile, settingsText());
  await writeFile(saveFile, saveText(cornerHeightColour));
}

function settingsText() { return `<?xml version="1.0" encoding="utf-8"?>
<SettingsData ${schema}>
  <version>1</version>
  <lastSave>${saveFileName}</lastSave>
  <saveIterator>0</saveIterator>
  <currentColor>0</currentColor>
  <audioVolume>255</audioVolume>
  <screenshot><path /><x>1280</x><y>1024</y></screenshot>
</SettingsData>
`;
}

async function getGrid(gridFile) {
  const gridText = await readFile(gridFile);

  return (await parseXML(gridText))
    .SaveData.corners[0].C
    .map(g => ({ x: parseInt(g.x[0], 10), y: parseInt(g.y[0], 10) }));
}

function saveText(cornerHeightColour) {
  const cornerXmls = [];
  const voxelXmls = [];

  cornerHeightColour.forEach((heightColour, corner) => {
    cornerXmls.push(cornerXml(corner, heightColour.size));
    heightColour.forEach((colour, height) => voxelXmls.push(voxelXml(colour, height)));
  });

  const cornersXml = '\n' + cornerXmls.join('') + '  ';
  const voxelsXml = '\n' + voxelXmls.join('') + '  ';

  return `<?xml version="1.0" encoding="utf-8"?>
<SaveData ${schema}>
<cam><x>80</x><y>200</y><z>200</z>
</cam>
<corners>${cornersXml}</corners>
<voxels>${voxelsXml}</voxels>
</SaveData>
`;
}

function cornerXml({ x, y }, count) { return `    <C><x>${x}</x><y>${y}</y><count>${count}</count></C>\n` }

function voxelXml(colour, height) { return `    <V><t>${colour}</t><h>${height}</h></V>\n` }

function rand(min, max, power = 1) { return Math.floor(min + (max-min+1) * Math.random()**power) }

function nOf(n, f) {
  const result = [];
  while (n-- > 0) result.push(f());
  return result;
}

Array.prototype.any = function any(power = 1) { return this[rand(0, this.length-1, power)] }

Array.prototype.sum = function sum() { return this.reduce((a, b) => a + b, 0) }

// Map of Maps

Map.prototype.getMap = function getMap(key) {
  let m = this.get(key);
  if (!m) this.set(key, m = new Map());
  return m;
}

Map.prototype.totalSize = function totalSize() { return [...this.values()].map(m => m.size).sum() }

run();
