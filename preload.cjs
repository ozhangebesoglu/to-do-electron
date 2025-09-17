const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  getTodos: () => ipcRenderer.invoke('get-todos'),
  addTodo: (title, banner=null) => ipcRenderer.invoke('add-todo', title, banner),
  addNote: (todoIndex, noteObj) => ipcRenderer.invoke('add-note', todoIndex, noteObj),
  toggleNote: (todoIndex, noteIndex) => ipcRenderer.invoke('toggle-note', todoIndex, noteIndex),
  deleteNote: (todoIndex, noteIndex) => ipcRenderer.invoke('delete-note', todoIndex, noteIndex),
  selectMedia: () => ipcRenderer.invoke('select-media'),
  updateBanner: (todoIndex, banner) => ipcRenderer.invoke('update-banner', todoIndex, banner),
  removeBanner: (todoIndex) => ipcRenderer.invoke('remove-banner', todoIndex),
    setBannerOffset: (todoIndex, offset) => ipcRenderer.invoke('set-banner-offset', todoIndex, offset),
    toggleCompleteTodo: (todoIndex) => ipcRenderer.invoke('toggle-complete-todo', todoIndex),
    deleteTodo: (todoIndex) => ipcRenderer.invoke('delete-todo', todoIndex),
    updateTodo: (todoIndex, patch) => ipcRenderer.invoke('update-todo', todoIndex, patch)
});

contextBridge.exposeInMainWorld('windowControls', {
  minimize: () => ipcRenderer.invoke('win:minimize'),
  toggleMaximize: () => ipcRenderer.invoke('win:toggle-maximize'),
  close: () => ipcRenderer.invoke('win:close')
});
