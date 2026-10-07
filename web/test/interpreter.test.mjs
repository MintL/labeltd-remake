import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import test from 'node:test';
import { createServer } from 'vite';

const here = path.dirname(fileURLToPath(import.meta.url));
const legacy = path.resolve(here, '../../legacy');
const server = await createServer({
  configFile: false,
  root: path.resolve(here, '..'),
  cacheDir: path.resolve(here, '../.vite-cache'),
  optimizeDeps: { noDiscovery: true, include: [] },
  server: { middlewareMode: true, hmr: false, ws: false },
  appType: 'custom',
});

const [{ parseFormSource }, { VbVM }, { VirtualFileSystem }] = await Promise.all([
  server.ssrLoadModule('/src/vb/formParser.ts'),
  server.ssrLoadModule('/src/vb/vm.ts'),
  server.ssrLoadModule('/src/vb/virtualFs.ts'),
]);

async function sourceText(relative) {
  return new TextDecoder('windows-1252').decode(await readFile(path.join(legacy, relative)));
}

const originalSource = await sourceText('spel.frm');
const files = {};
for (const name of ['map1.txt', 'map2.txt', 'map3.txt', 'names.txt']) {
  files[`txt/${name}`] = await sourceText(`txt/${name}`);
}

function createVM(source = originalSource) {
  const parsed = parseFormSource(source);
  assert.deepEqual(parsed.diagnostics, []);
  return new VbVM({
    form: parsed.root,
    program: parsed.program,
    files: new VirtualFileSystem(files),
    inputBox: (_message, _title, defaultPath) => defaultPath,
    screen: { width: 18000, height: 12000 },
    randomSeed: 42,
  });
}

test('parses all executable procedures and executes startup file I/O', () => {
  const parsed = parseFormSource(originalSource);
  assert.equal(parsed.program.procedures.length, 41);
  assert.equal(parsed.diagnostics.length, 0);
  const vm = createVM();
  vm.start();
  assert.equal(vm.getGlobal('cash'), 40);
  assert.equal(vm.getGlobal('mobolvl'), 1);
  assert.equal(vm.getGlobal('lineantal'), 18);
});

test('changing a VB source literal changes interpreted tower cost', () => {
  const source = originalSource.replace('twrlvl.money = 10', 'twrlvl.money = 11');
  assert.notEqual(source, originalSource);
  const vm = createVM(source);
  vm.start();
  const tower = vm.getGlobal('twrlvl');
  tower.set('type', 'basic');
  tower.set('lvl', 1);
  vm.invoke('findlvl');
  assert.equal(tower.get('money'), 11);
});

test('difficulty and wave button execute source procedures', () => {
  const vm = createVM();
  vm.start();
  vm.dispatch('CmdLife10', 'Click', undefined);
  assert.equal(vm.getGlobal('UrLife'), 10);
  vm.dispatch('lblGo', 'Click', undefined);
  assert.equal(vm.getGlobal('nxtlvl'), 1);
  assert.equal(vm.getGlobal('cash'), 60);
});

test('source controls build, cancellation, and timed enemy movement', () => {
  const vm = createVM();
  vm.start();
  vm.dispatch('CmdLife10', 'Click', undefined);
  vm.dispatch('imgbuild', 'Click', 0);
  assert.equal(vm.getGlobal('placera'), true);
  vm.dispatch('Form', 'KeyDown', undefined, [67, 0]);
  assert.equal(vm.getGlobal('placera'), false);

  const enemy = vm.controls.find('Label1').get(0);
  const before = enemy.properties.Top;
  vm.dispatch('lblGo', 'Click', undefined);
  vm.advance(100);
  assert.equal(enemy.properties.Top, before + 200);
});

test('the original C handler cancels a pending tower before a different build', () => {
  const vm = createVM();
  vm.start();
  vm.dispatch('CmdLife10', 'Click', undefined);
  vm.dispatch('imgbuild', 'Click', 0);
  assert.equal(vm.getGlobal('placera'), true);
  vm.dispatch('Form', 'KeyDown', undefined, [67, 0]);
  assert.equal(vm.getGlobal('placera'), false);
  assert.equal(vm.controls.find('ImgTwr1').get(0).properties.Visible, false);
  vm.dispatch('imgbuild', 'Click', 1);
  assert.equal(vm.getGlobal('antal'), 0);
  assert.equal(vm.getGlobal('cash'), 40);
  assert.equal(vm.controls.find('ImgTwr1').get(0).properties.Visible, true);
  assert.equal(vm.getGlobal('lvl').get(0).get('type'), 'frost');

  vm.dispatch('Form', 'MouseMove', undefined, [0, 0, 5800, 1970]);
  vm.dispatch('ImgTwr1', 'Click', 0);
  assert.equal(vm.getGlobal('placera'), false);
  assert.equal(vm.getGlobal('cash'), 10);

  vm.dispatch('lblGo', 'Click', undefined);
  vm.dispatch('imgbuild', 'Click', 0);
  vm.dispatch('Form', 'KeyDown', undefined, [67, 0]);
  vm.dispatch('imgbuild', 'Click', 1);
  assert.equal(vm.getGlobal('antal'), 1);
  assert.equal(vm.controls.find('ImgTwr1').get(0).properties.Visible, true);
  assert.equal(vm.controls.find('ImgTwr1').get(1).properties.Visible, true);
  assert.equal(vm.controls.find('ImgTwr1').items.size, 2);
  assert.equal(vm.getGlobal('lvl').get(1).get('type'), 'frost');
});

test('Fire Tower unlock follows the source motherboard upgrade', () => {
  const vm = createVM();
  vm.start();
  vm.dispatch('CmdLife10', 'Click', undefined);
  assert.equal(vm.getGlobal('allowed').get(2), false);
  vm.dispatch('imgbuild', 'Click', 2);
  assert.notEqual(vm.getGlobal('placera'), true);

  vm.dispatch('imgcheat', 'Click', undefined);
  for (let wave = 0; wave < 5; wave++) vm.invoke('back');
  vm.dispatch('imgMobo', 'Click', undefined);
  vm.dispatch('imgUpmobo', 'Click', undefined);
  assert.equal(vm.getGlobal('mobolvl'), 2);
  assert.equal(vm.getGlobal('allowed').get(2), true);

  vm.dispatch('imgbuild', 'Click', 2);
  assert.equal(vm.getGlobal('placera'), true);
  assert.equal(vm.getGlobal('lvl').get(0).get('type'), 'aoe');
});

test('Dim inside a loop is procedure scoped, including the original AoE handler', () => {
  const source = `${originalSource}\nPrivate Sub loopDimProbe()\n` +
    'Dim counter As Integer\n' +
    'cash = 0\n' +
    'For counter = 1 To 3\n' +
    'Dim accumulated As Integer\n' +
    'accumulated = accumulated + 1\n' +
    'cash = cash + accumulated\n' +
    'Next counter\n' +
    'End Sub\n';
  const vm = createVM(source);
  vm.start();
  vm.invoke('loopDimProbe');
  assert.equal(vm.getGlobal('cash'), 6);
  vm.dispatch('CmdLife10', 'Click', undefined);
  vm.globals.get('i').value = 0;
  assert.doesNotThrow(() => vm.invoke('aetower'));
});

test.after(async () => { await server.close(); });
