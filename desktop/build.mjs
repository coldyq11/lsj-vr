// Buduje wersję desktop z TEGO SAMEGO index.html co wersja web/VR.
// Oryginał w katalogu głównym nie jest ruszany — zmiany robimy na kopii w desktop/app/.
// Każda podmiana musi trafić; jeśli index.html się zmieni i coś nie pasuje, build się wywali (zamiast cicho zepsuć grę).
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, rmSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const out = join(here, 'app');

rmSync(out, { recursive: true, force: true });
mkdirSync(join(out, 'vendor/three/addons/controls'), { recursive: true });
mkdirSync(join(out, 'vendor/three/addons/webxr'), { recursive: true });
mkdirSync(join(out, 'vendor/three/addons/utils'), { recursive: true });

// --- biblioteki lokalnie (te same wersje co CDN w index.html), żeby gra nie zależała od jsdelivr ---
const threeDir = join(here, 'node_modules/three');
const mqttDir = join(here, 'node_modules/mqtt');
const ver = (d) => JSON.parse(readFileSync(join(d, 'package.json'), 'utf8')).version;
const need = (v, want, name) => { if (v !== want) throw new Error(`${name}: jest ${v}, index.html używa ${want}`); };
need(ver(threeDir), '0.160.0', 'three');
need(ver(mqttDir), '5.16.1', 'mqtt');
copyFileSync(join(threeDir, 'build/three.module.js'), join(out, 'vendor/three/three.module.js'));
for (const f of ['controls/OrbitControls.js', 'webxr/VRButton.js', 'utils/BufferGeometryUtils.js'])
  copyFileSync(join(threeDir, 'examples/jsm', f), join(out, 'vendor/three/addons', f));
copyFileSync(join(mqttDir, 'dist/mqtt.min.js'), join(out, 'vendor/mqtt.min.js'));
if (existsSync(join(root, 'chaser.png'))) copyFileSync(join(root, 'chaser.png'), join(out, 'chaser.png'));

// --- index.html: CDN -> lokalnie, VR wyłączone ---
let html = readFileSync(join(root, 'index.html'), 'utf8');
const rep = (from, to, all = false) => {
  const n = html.split(from).length - 1;
  if (!n) throw new Error('Nie znaleziono w index.html: ' + from);
  html = all ? html.split(from).join(to) : html.replace(from, to);
};
rep('https://cdn.jsdelivr.net/npm/mqtt@5.16.1/dist/mqtt.min.js', 'vendor/mqtt.min.js');
rep('https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js', './vendor/three/three.module.js');
rep('https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/', './vendor/three/addons/');
rep('<title>Little Saint James — mapa 3D WebXR</title>', '<title>Little Saint James</title>');
// WebXR off: renderer.xr.isPresenting zawsze false => cała logika VR jest martwa, reszta gry bez zmian
rep('renderer.xr.enabled = true;', 'renderer.xr.enabled = false;');
rep('document.body.appendChild(VRButton.createButton(renderer));', '');
// teksty pomocy bez instrukcji VR
html = html.replace(/\s*<p><b>VR \(Quest 2\):<\/b>[\s\S]*?<\/p>/, () => '');
rep('<kbd>E</kbd>/spust.', '<kbd>E</kbd>.');
rep(' VR: lewa gałka, <kbd>B</kbd>/<kbd>Y</kbd> wysiądź.', '');
rep(' W VR: lewa gałka, B/Y wysiądź.', '');
const before = html.length;
html = html.replace(/ ?\((?:w )?VR:[^)]*\)/g, '');
if (html.length === before) throw new Error('Brak wzmianek "(VR: ...)" do usunięcia');
if (/VR \(Quest 2\)|\(w VR:|\(VR:/.test(html)) throw new Error('Zostały teksty VR');

writeFileSync(join(out, 'index.html'), html);
console.log('OK: desktop/app zbudowane');
