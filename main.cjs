const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

function getTodayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function getDataFile() {
  return path.join(app.getPath('userData'), 'todos.json');
}

function readTodos() {
  try {
    return JSON.parse(fs.readFileSync(getDataFile(), 'utf8'));
  } catch {
    return {};
  }
}

function writeTodos(data) {
  fs.writeFileSync(getDataFile(), JSON.stringify(data, null, 2));
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 820,
    minWidth: 760,
    minHeight: 600,
    backgroundColor: '#050505',
    title: 'Günlük Görevler',
    frame: false, // özel başlık
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
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// migrate plain string notes to object form
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
  });
  return changed;
}

ipcMain.handle('get-todos', () => {
  const todos = readTodos();
  const today = getTodayKey();
  const list = todos[today] || [];
  if(migrateNotesStructure(list)) { writeTodos(todos); }
  return list;
});

ipcMain.handle('add-todo', (event, title, banner=null) => {
  const todos = readTodos();
  const today = getTodayKey();
  if (!todos[today]) todos[today] = [];
  todos[today].push({ title, notes: [], banner, bannerOffset:0, completed:false, priority:'med', dueDate:null });
  writeTodos(todos);
  return todos[today];
});

ipcMain.handle('add-note', (event, todoIndex, noteObj) => {
  const todos = readTodos();
  const today = getTodayKey();
  if (todos[today] && todos[today][todoIndex]) {
    const todo = todos[today][todoIndex];
    if(migrateNotesStructure([todo])) writeTodos(todos);
    todo.notes.push(noteObj);
    writeTodos(todos);
    return todo;
  }
  return null;
});

ipcMain.handle('toggle-note', (event, todoIndex, noteIndex) => {
  const todos = readTodos();
  const today = getTodayKey();
  if(todos[today] && todos[today][todoIndex]){
    const note = todos[today][todoIndex].notes[noteIndex];
    if(note && note.type==='task'){
      note.done = !note.done;
      writeTodos(todos);
      return note;
    }
  }
  return null;
});

ipcMain.handle('delete-note', (event, todoIndex, noteIndex) => {
  const todos = readTodos();
  const today = getTodayKey();
  if(todos[today] && todos[today][todoIndex]){
    const notes = todos[today][todoIndex].notes;
    if(noteIndex>=0 && noteIndex < notes.length){
      notes.splice(noteIndex,1);
      writeTodos(todos);
      return true;
    }
  }
  return false;
});

ipcMain.handle('toggle-complete-todo', (event, todoIndex) => {
  const todos = readTodos();
  const today = getTodayKey();
  if(todos[today] && todos[today][todoIndex]){
    todos[today][todoIndex].completed = !todos[today][todoIndex].completed;
    writeTodos(todos);
    return todos[today][todoIndex];
  }
  return null;
});

ipcMain.handle('delete-todo', (event, todoIndex) => {
  const todos = readTodos();
  const today = getTodayKey();
  if(todos[today]){
    if(todoIndex>=0 && todoIndex < todos[today].length){
      todos[today].splice(todoIndex,1);
      writeTodos(todos);
      return true;
    }
  }
  return false;
});

ipcMain.handle('update-todo', (event, todoIndex, patch) => {
  const todos = readTodos();
  const today = getTodayKey();
  if(todos[today] && todos[today][todoIndex]){
    const t = todos[today][todoIndex];
    Object.assign(t, patch);
    writeTodos(todos);
    return t;
  }
  return null;
});

// Banner güncelle
ipcMain.handle('update-banner', async (event, todoIndex, banner) => {
  const todos = readTodos();
  const today = getTodayKey();
  if (todos[today] && todos[today][todoIndex]) {
    todos[today][todoIndex].banner = banner; // { type, path }
    writeTodos(todos);
    return todos[today][todoIndex].banner;
  }
  return null;
});

// Banner offset ayarla
ipcMain.handle('set-banner-offset', (event, todoIndex, offset) => {
  const todos = readTodos();
  const today = getTodayKey();
  if(todos[today] && todos[today][todoIndex]){
    const v = Math.max(-400, Math.min(400, parseInt(offset||0,10)));
    todos[today][todoIndex].bannerOffset = v;
    writeTodos(todos);
    return v;
  }
  return null;
});

// Banner kaldır
ipcMain.handle('remove-banner', async (event, todoIndex) => {
  const todos = readTodos();
  const today = getTodayKey();
  if (todos[today] && todos[today][todoIndex]) {
    todos[today][todoIndex].banner = null;
    writeTodos(todos);
    return true;
  }
  return false;
});

// Medya dosyası seç
ipcMain.handle('select-media', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [
      { name: 'Medya', extensions: ['png','jpg','jpeg','gif','webp','mp4','webm'] }
    ]
  });
  if (result.canceled || !result.filePaths?.length) return null;
  const filePath = result.filePaths[0];
  // tür belirle
  const ext = path.extname(filePath).toLowerCase().replace('.','');
  const videoExt = ['mp4','webm'];
  const type = videoExt.includes(ext) ? 'video' : 'image';
  return { type, path: filePath };
});
