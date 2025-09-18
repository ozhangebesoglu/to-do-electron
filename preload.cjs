const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  listWorkspaces: () => ipcRenderer.invoke('list-workspaces'),
  listDays: (workspace) => ipcRenderer.invoke('list-days', workspace),
  getTodos: (workspace, dateKey) => ipcRenderer.invoke('get-todos', workspace, dateKey),
  addTodo: (title, banner=null, workspace, dateKey=null) => ipcRenderer.invoke('add-todo', title, banner, workspace, dateKey),
  addNote: (todoIndex, noteObj, workspace, dateKey) => ipcRenderer.invoke('add-note', todoIndex, noteObj, workspace, dateKey),
  toggleNote: (todoIndex, noteIndex, workspace, dateKey) => ipcRenderer.invoke('toggle-note', todoIndex, noteIndex, workspace, dateKey),
  deleteNote: (todoIndex, noteIndex, workspace, dateKey) => ipcRenderer.invoke('delete-note', todoIndex, noteIndex, workspace, dateKey),
  selectMedia: () => ipcRenderer.invoke('select-media'),
  updateBanner: (todoIndex, banner, workspace, dateKey) => ipcRenderer.invoke('update-banner', todoIndex, banner, workspace, dateKey),
  removeBanner: (todoIndex, workspace, dateKey) => ipcRenderer.invoke('remove-banner', todoIndex, workspace, dateKey),
  setBannerOffset: (todoIndex, offset, workspace, dateKey) => ipcRenderer.invoke('set-banner-offset', todoIndex, offset, workspace, dateKey),
  toggleCompleteTodo: (todoIndex, workspace, dateKey) => ipcRenderer.invoke('toggle-complete-todo', todoIndex, workspace, dateKey),
  deleteTodo: (todoIndex, workspace, dateKey) => ipcRenderer.invoke('delete-todo', todoIndex, workspace, dateKey),
  updateTodo: (todoIndex, patch, workspace, dateKey) => ipcRenderer.invoke('update-todo', todoIndex, patch, workspace, dateKey),
  archiveTodo: (todoIndex, archive, workspace, dateKey) => ipcRenderer.invoke('archive-todo', todoIndex, archive, workspace, dateKey),
  setTags: (todoIndex, tags, workspace, dateKey) => ipcRenderer.invoke('set-tags', todoIndex, tags, workspace, dateKey)
});

contextBridge.exposeInMainWorld('windowControls', {
  minimize: () => ipcRenderer.invoke('win:minimize'),
  toggleMaximize: () => ipcRenderer.invoke('win:toggle-maximize'),
  close: () => ipcRenderer.invoke('win:close')
});

contextBridge.exposeInMainWorld('appEvents', {
  onQuickCapture: (cb) => ipcRenderer.on('quick-capture', cb)
});
