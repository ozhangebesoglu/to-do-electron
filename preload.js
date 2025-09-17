const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  getTodos: () => ipcRenderer.invoke('get-todos'),
  addTodo: (title) => ipcRenderer.invoke('add-todo', title),
  addNote: (todoIndex, note) => ipcRenderer.invoke('add-note', todoIndex, note)
});
