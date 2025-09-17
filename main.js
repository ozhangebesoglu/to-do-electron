const { app, BrowserWindow, ipcMain } = require('electron');
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
    width: 500,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  win.loadFile('index.html');
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

// IPC handlers
ipcMain.handle('get-todos', () => {
  const todos = readTodos();
  const today = getTodayKey();
  return todos[today] || [];
});
ipcMain.handle('add-todo', (event, title) => {
  const todos = readTodos();
  const today = getTodayKey();
  if (!todos[today]) todos[today] = [];
  todos[today].push({ title, notes: [] });
  writeTodos(todos);
  return todos[today];
});
ipcMain.handle('add-note', (event, todoIndex, note) => {
  const todos = readTodos();
  const today = getTodayKey();
  if (todos[today] && todos[today][todoIndex]) {
    todos[today][todoIndex].notes.push(note);
    writeTodos(todos);
    return todos[today][todoIndex];
  }
  return null;
});
