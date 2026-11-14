const { app, BrowserWindow, protocol, net, session, Menu, shell } = require('electron');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

// Własny protokół app:// zamiast file:// — działają moduły ES, importmap, localStorage (zapisy), mikrofon.
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { standard: true, secure: true, supportFetchAPI: true, stream: true } }
]);

const ROOT = path.join(__dirname, 'app');

function createWindow() {
  const win = new BrowserWindow({
    width: 1600, height: 900, show: false, backgroundColor: '#000000',
    title: 'Little Saint James', autoHideMenuBar: true,
    webPreferences: { contextIsolation: true, nodeIntegration: false, sandbox: true, backgroundThrottling: false }
  });
  win.once('ready-to-show', () => { win.maximize(); win.show(); });
  win.webContents.on('before-input-event', (e, input) => {
    if (input.type !== 'keyDown') return;
    if (input.key === 'F11' || (input.alt && input.key === 'Enter')) { win.setFullScreen(!win.isFullScreen()); e.preventDefault(); }
  });
  // linki zewnętrzne do przeglądarki, nie do okna gry
  win.webContents.setWindowOpenHandler(({ url }) => { shell.openExternal(url); return { action: 'deny' }; });
  win.loadURL('app://game/index.html');
}

app.whenReady().then(() => {
  Menu.setApplicationMenu(null);
  protocol.handle('app', (req) => {
    const p = decodeURIComponent(new URL(req.url).pathname);
    const file = path.normalize(path.join(ROOT, p));
    if (!file.startsWith(ROOT)) return new Response('Forbidden', { status: 403 });
    return net.fetch(pathToFileURL(file).toString());
  });
  // mikrofon (czat głosowy) i pointer lock bez pytania
  session.defaultSession.setPermissionRequestHandler((wc, perm, cb) => cb(['media', 'pointerLock', 'fullscreen'].includes(perm)));
  createWindow();
});

app.on('window-all-closed', () => app.quit());
