const { app, BrowserWindow, ipcMain, dialog, globalShortcut } = require('electron');
const path = require('path');
const fs = require('fs');

function getTodayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function defaultWorkspace(){ return 'default'; }

function getDataFile() {
  return path.join(app.getPath('userData'), 'todos.json');
}

function readTodos() {
  try {
    return JSON.parse(fs.readFileSync(getDataFile(), 'utf8'));
  } catch {
    return { workspaces: { [defaultWorkspace()]: {} }, meta: { version: 2 } };
  }
}

function writeTodos(data) {
  fs.writeFileSync(getDataFile(), JSON.stringify(data, null, 2));
}

function migrateStructure(data){
  if(!data.workspaces){
    const legacyKeys = Object.keys(data).filter(k=>/^[0-9]{4}-[0-9]+-[0-9]+$/.test(k));
    const ws = { [defaultWorkspace()]: {} };
    legacyKeys.forEach(k=>{ ws[defaultWorkspace()][k] = data[k]; delete data[k]; });
    data.workspaces = ws;
    data.meta = { version: 2 };
  }
  if(!data.meta) data.meta = { version: 2 };
  return data;
}

function migrateNotesStructure(list){
  let changed = false;
  list.forEach(t=>{
    if(Array.isArray(t.notes)){
      for(let i=0;i<t.notes.length;i++){
        const n = t.notes[i];
        if(typeof n === 'string') { t.notes[i] = { type:'text', text:n }; changed = true; }
      }
    }
    if(t.bannerOffset===undefined){ t.bannerOffset = 0; changed = true; }
    if(t.completed===undefined){ t.completed = false; changed = true; }
    if(t.priority===undefined){ t.priority = 'med'; changed = true; }
    if(t.dueDate===undefined){ t.dueDate = null; changed = true; }
    if(t.tags===undefined){ t.tags = []; changed = true; }
    if(t.archived===undefined){ t.archived = false; changed = true; }
    if(t.workspace===undefined){ t.workspace = defaultWorkspace(); changed = true; }
  });
  return changed;
}

function getWorkspaceData(data, workspace){
  migrateStructure(data);
  if(!data.workspaces[workspace]) data.workspaces[workspace] = {};
  return data.workspaces[workspace];
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 820,
    minWidth: 760,
    minHeight: 600,
    backgroundColor: '#050505',
    title: 'Günlük Görevler',
    frame: false,
    titleBarStyle: 'hidden',
    trafficLightPosition: { x: 20, y: 20 },
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  win.setMenuBarVisibility(false);
  win.loadFile('index.html');

  ipcMain.handle('win:minimize', () => { if(!win.isMinimized()) win.minimize(); });
  ipcMain.handle('win:toggle-maximize', () => {
    if(win.isMaximized()) { win.unmaximize(); } else { win.maximize(); }
    return win.isMaximized();
  });
  ipcMain.handle('win:close', () => { win.close(); });
}

app.whenReady().then(() => {
  createWindow();
  // Quick capture global shortcut
  globalShortcut.register('CommandOrControl+Alt+N', ()=>{
    const wins = BrowserWindow.getAllWindows();
    if(wins.length){
      const w = wins[0];
      if(w.isMinimized()) w.restore();
      w.show(); w.focus();
      w.webContents.send('quick-capture');
    }
  });
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('will-quit', ()=>{ globalShortcut.unregisterAll(); });

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// IPC --------------------------------------------------

ipcMain.handle('list-workspaces', () => {
  const data = migrateStructure(readTodos());
  return Object.keys(data.workspaces || {});
});

ipcMain.handle('get-todos', (event, workspace=defaultWorkspace(), dateKey=null) => {
  const data = migrateStructure(readTodos());
  const wsData = getWorkspaceData(data, workspace);
  const dayKey = dateKey || getTodayKey();
  const list = wsData[dayKey] || [];
  if(migrateNotesStructure(list)) { writeTodos(data); }
  return list;
});

ipcMain.handle('add-todo', (event, title, banner=null, workspace=defaultWorkspace(), dateKey=null) => {
  const data = migrateStructure(readTodos());
  const wsData = getWorkspaceData(data, workspace);
  const targetDate = dateKey || getTodayKey();
  if (!wsData[targetDate]) wsData[targetDate] = [];
  wsData[targetDate].push({ title, notes: [], banner, bannerOffset:0, completed:false, priority:'med', dueDate:null, tags:[], archived:false, workspace });
  writeTodos(data);
  return wsData[targetDate];
});

ipcMain.handle('add-note', (event, todoIndex, noteObj, workspace=defaultWorkspace(), dateKey=null) => {
  const data = migrateStructure(readTodos());
  const wsData = getWorkspaceData(data, workspace);
  const dayKey = dateKey || getTodayKey();
  if (wsData[dayKey] && wsData[dayKey][todoIndex]) {
    const todo = wsData[dayKey][todoIndex];
    if(migrateNotesStructure([todo])) writeTodos(data);
    todo.notes.push(noteObj);
    writeTodos(data);
    return todo;
  }
  return null;
});

ipcMain.handle('toggle-note', (event, todoIndex, noteIndex, workspace=defaultWorkspace(), dateKey=null) => {
  const data = migrateStructure(readTodos());
  const wsData = getWorkspaceData(data, workspace);
  const dayKey = dateKey || getTodayKey();
  if(wsData[dayKey] && wsData[dayKey][todoIndex]){
    const note = wsData[dayKey][todoIndex].notes[noteIndex];
    if(note && note.type==='task'){
      note.done = !note.done;
      writeTodos(data);
      return note;
    }
  }
  return null;
});

ipcMain.handle('delete-note', (event, todoIndex, noteIndex, workspace=defaultWorkspace(), dateKey=null) => {
  const data = migrateStructure(readTodos());
  const wsData = getWorkspaceData(data, workspace);
  const dayKey = dateKey || getTodayKey();
  if(wsData[dayKey] && wsData[dayKey][todoIndex]){
    const notes = wsData[dayKey][todoIndex].notes;
    if(noteIndex>=0 && noteIndex < notes.length){
      notes.splice(noteIndex,1);
      writeTodos(data);
      return true;
    }
  }
  return false;
});

ipcMain.handle('toggle-complete-todo', (event, todoIndex, workspace=defaultWorkspace(), dateKey=null) => {
  const data = migrateStructure(readTodos());
  const wsData = getWorkspaceData(data, workspace);
  const dayKey = dateKey || getTodayKey();
  if(wsData[dayKey] && wsData[dayKey][todoIndex]){
    wsData[dayKey][todoIndex].completed = !wsData[dayKey][todoIndex].completed;
    writeTodos(data);
    return wsData[dayKey][todoIndex];
  }
  return null;
});

ipcMain.handle('delete-todo', (event, todoIndex, workspace=defaultWorkspace(), dateKey=null) => {
  const data = migrateStructure(readTodos());
  const wsData = getWorkspaceData(data, workspace);
  const dayKey = dateKey || getTodayKey();
  if(wsData[dayKey]){
    if(todoIndex>=0 && todoIndex < wsData[dayKey].length){
      wsData[dayKey].splice(todoIndex,1);
      writeTodos(data);
      return true;
    }
  }
  return false;
});

ipcMain.handle('update-todo', (event, todoIndex, patch, workspace=defaultWorkspace(), dateKey=null) => {
  const data = migrateStructure(readTodos());
  const wsData = getWorkspaceData(data, workspace);
  const dayKey = dateKey || getTodayKey();
  if(wsData[dayKey] && wsData[dayKey][todoIndex]){
    const t = wsData[dayKey][todoIndex];
    Object.assign(t, patch);
    writeTodos(data);
    return t;
  }
  return null;
});

ipcMain.handle('update-banner', async (event, todoIndex, banner, workspace=defaultWorkspace(), dateKey=null) => {
  const data = migrateStructure(readTodos());
  const wsData = getWorkspaceData(data, workspace);
  const dayKey = dateKey || getTodayKey();
  if (wsData[dayKey] && wsData[dayKey][todoIndex]) {
    wsData[dayKey][todoIndex].banner = banner; // { type, path }
    writeTodos(data);
    return wsData[dayKey][todoIndex].banner;
  }
  return null;
});

ipcMain.handle('set-banner-offset', (event, todoIndex, offset, workspace=defaultWorkspace(), dateKey=null) => {
  const data = migrateStructure(readTodos());
  const wsData = getWorkspaceData(data, workspace);
  const dayKey = dateKey || getTodayKey();
  if(wsData[dayKey] && wsData[dayKey][todoIndex]){
    const v = Math.max(-400, Math.min(400, parseInt(offset||0,10)));
    wsData[dayKey][todoIndex].bannerOffset = v;
    writeTodos(data);
    return v;
  }
  return null;
});

ipcMain.handle('remove-banner', async (event, todoIndex, workspace=defaultWorkspace(), dateKey=null) => {
  const data = migrateStructure(readTodos());
  const wsData = getWorkspaceData(data, workspace);
  const dayKey = dateKey || getTodayKey();
  if (wsData[dayKey] && wsData[dayKey][todoIndex]) {
    wsData[dayKey][todoIndex].banner = null;
    writeTodos(data);
    return true;
  }
  return false;
});

ipcMain.handle('archive-todo', (event, todoIndex, archive=true, workspace=defaultWorkspace(), dateKey=null) => {
  const data = migrateStructure(readTodos());
  const wsData = getWorkspaceData(data, workspace);
  const dayKey = dateKey || getTodayKey();
  if(wsData[dayKey] && wsData[dayKey][todoIndex]){
    wsData[dayKey][todoIndex].archived = archive;
    writeTodos(data);
    return wsData[dayKey][todoIndex];
  }
  return null;
});

ipcMain.handle('set-tags', (event, todoIndex, tags, workspace=defaultWorkspace(), dateKey=null) => {
  const data = migrateStructure(readTodos());
  const wsData = getWorkspaceData(data, workspace);
  const dayKey = dateKey || getTodayKey();
  if(wsData[dayKey] && wsData[dayKey][todoIndex]){
    wsData[dayKey][todoIndex].tags = Array.from(new Set((tags||[]).map(t=>String(t).trim()).filter(Boolean)));
    writeTodos(data);
    return wsData[dayKey][todoIndex].tags;
  }
  return [];
});

ipcMain.handle('list-days', (event, workspace=defaultWorkspace()) => {
  const data = migrateStructure(readTodos());
  const wsData = getWorkspaceData(data, workspace);
  return Object.keys(wsData).sort();
});

// Medya dosyası seç
ipcMain.handle('select-media', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [ { name: 'Medya', extensions: ['png','jpg','jpeg','gif','webp','mp4','webm'] } ]
  });
  if (result.canceled || !result.filePaths?.length) return null;
  const filePath = result.filePaths[0];
  const ext = path.extname(filePath).toLowerCase().replace('.','');
  const videoExt = ['mp4','webm'];
  const type = videoExt.includes(ext) ? 'video' : 'image';
  return { type, path: filePath };
});
