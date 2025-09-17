async function renderTodos() {
  const todos = await window.api.getTodos();
  const list = document.getElementById('todo-list');
  list.innerHTML = '';
  todos.forEach((todo, idx) => {
    const li = document.createElement('li');
    li.textContent = todo.title;
    li.onclick = () => showNoteInput(idx, todo);
    if (todo.notes && todo.notes.length > 0) {
      const notesDiv = document.createElement('div');
      notesDiv.className = 'notes';
      notesDiv.innerHTML = todo.notes.map(n => `• ${n}`).join('<br>');
      li.appendChild(notesDiv);
    }
    list.appendChild(li);
  });
}

document.getElementById('add-todo').onclick = async () => {
  const input = document.getElementById('todo-title');
  const title = input.value.trim();
  if (title) {
    await window.api.addTodo(title);
    input.value = '';
    renderTodos();
  }
};

function showNoteInput(idx, todo) {
  const list = document.getElementById('todo-list');
  const li = list.children[idx];
  if (li.querySelector('.note-input')) return;
  const noteDiv = document.createElement('div');
  noteDiv.className = 'note-input';
  const noteInput = document.createElement('input');
  noteInput.type = 'text';
  noteInput.placeholder = 'Not ekle...';
  const noteBtn = document.createElement('button');
  noteBtn.textContent = 'Kaydet';
  noteBtn.onclick = async () => {
    const note = noteInput.value.trim();
    if (note) {
      await window.api.addNote(idx, note);
      renderTodos();
    }
  };
  noteDiv.appendChild(noteInput);
  noteDiv.appendChild(noteBtn);
  li.appendChild(noteDiv);
  noteInput.focus();
}

renderTodos();
