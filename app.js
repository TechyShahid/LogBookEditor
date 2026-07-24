const editor = document.getElementById('editor');
const lineNumbers = document.getElementById('lineNumbers');
const tabStrip = document.getElementById('tabStrip');
const searchPanel = document.getElementById('searchPanel');
const findInput = document.getElementById('findInput');
const replaceInput = document.getElementById('replaceInput');
const statusText = document.getElementById('statusText');
const positionText = document.getElementById('positionText');
const wordCountText = document.getElementById('wordCountText');
const fileInput = document.getElementById('fileInput');

const state = {
  docs: [],
  currentId: null,
  theme: localStorage.getItem('editor-theme') || 'dark',
};

function createDoc(title = 'untitled.txt', content = '', path = null) {
  return {
    id: crypto.randomUUID(),
    title,
    content,
    path,
    changed: false,
  };
}

function createNewDoc() {
  const untitledCount = state.docs.filter((doc) => doc.title.startsWith('untitled')).length;
  const title = untitledCount === 0 ? 'untitled.txt' : `untitled-${untitledCount + 1}.txt`;
  return createDoc(title);
}

function applyTheme() {
  document.body.dataset.theme = state.theme;
  localStorage.setItem('editor-theme', state.theme);
}

function getCurrentDoc() {
  return state.docs.find((doc) => doc.id === state.currentId) || null;
}

function setCurrentDoc(doc) {
  state.currentId = doc.id;
  editor.value = doc.content;
  updateLineNumbers();
  updateStatus();
  renderTabs();
}

function addDoc(doc) {
  state.docs.push(doc);
  state.currentId = doc.id;
  renderTabs();
  setCurrentDoc(doc);
}

function renderTabs() {
  tabStrip.innerHTML = '';
  state.docs.forEach((doc) => {
    const tab = document.createElement('button');
    tab.className = `tab${doc.id === state.currentId ? ' active' : ''}`;
    tab.innerHTML = `<span class="tab-title" data-title="${doc.id}">${doc.title}${doc.changed ? ' •' : ''}</span><span class="close" data-close="${doc.id}">×</span>`;
    tab.addEventListener('click', (event) => {
      const closeTarget = event.target.closest('[data-close]');
      if (closeTarget) {
        closeDoc(doc.id);
        return;
      }
      const titleTarget = event.target.closest('.tab-title');
      if (titleTarget) {
        const current = getCurrentDoc();
        if (current) {
          current.content = editor.value;
          current.changed = true;
        }
        setCurrentDoc(doc);
        return;
      }
      const current = getCurrentDoc();
      if (current) {
        current.content = editor.value;
        current.changed = true;
      }
      setCurrentDoc(doc);
    });

    tab.querySelector('.tab-title').addEventListener('dblclick', (event) => {
      event.stopPropagation();
      const titleElement = event.currentTarget;
      const currentName = doc.title;
      const newName = prompt('Rename tab', currentName);
      if (newName && newName.trim()) {
        doc.title = newName.trim();
        renderTabs();
      }
    });

    tabStrip.appendChild(tab);
  });

  const addTabButton = document.createElement('button');
  addTabButton.className = 'tab add-tab';
  addTabButton.textContent = '+';
  addTabButton.title = 'Create a new editor tab';
  addTabButton.addEventListener('click', () => {
    addDoc(createNewDoc());
  });
  tabStrip.appendChild(addTabButton);
}

function closeDoc(id) {
  const index = state.docs.findIndex((doc) => doc.id === id);
  if (index === -1) return;
  const doc = state.docs[index];
  if (doc.changed) {
    const shouldClose = confirm(`Save changes to ${doc.title}?`);
    if (shouldClose) {
      saveDoc(doc, false);
    }
  }
  state.docs.splice(index, 1);
  if (state.docs.length === 0) {
    const fresh = createNewDoc();
    addDoc(fresh);
    return;
  }
  if (state.currentId === id) {
    state.currentId = state.docs[Math.max(0, index - 1)].id;
  }
  setCurrentDoc(getCurrentDoc());
}

function updateLineNumbers() {
  const lines = editor.value.split('\n').length;
  const numbers = Array.from({ length: lines }, (_, i) => `<div>${i + 1}</div>`).join('');
  lineNumbers.innerHTML = numbers;
}

function updateStatus() {
  const doc = getCurrentDoc();
  if (!doc) return;
  const selectionStart = editor.selectionStart;
  const textBefore = editor.value.slice(0, selectionStart);
  const line = textBefore.split('\n').length;
  const column = textBefore.length - textBefore.lastIndexOf('\n');
  const words = editor.value.trim() ? editor.value.trim().split(/\s+/).length : 0;
  positionText.textContent = `Ln ${line}, Col ${column}`;
  wordCountText.textContent = `Words: ${words}`;
  statusText.textContent = doc.changed ? 'Unsaved changes' : 'Ready';
}

function saveDoc(doc, asNew = false) {
  if (!doc) return;
  doc.content = editor.value;
  const suggestedName = doc.path ? doc.path.split(/[\\/]/).pop() : doc.title;
  const filename = asNew ? prompt('Save as', suggestedName || 'untitled.txt') : suggestedName;
  if (!filename) return;
  const blob = new Blob([doc.content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
  doc.path = filename;
  doc.title = filename;
  doc.changed = false;
  renderTabs();
  updateStatus();
}

function saveCurrentDoc(asNew = false) {
  const doc = getCurrentDoc();
  if (!doc) return;
  saveDoc(doc, asNew);
}

function saveAllDocs() {
  state.docs.forEach((doc) => {
    if (doc.changed) {
      saveDoc(doc, false);
    }
  });
}

function openFile(file) {
  const reader = new FileReader();
  reader.onload = () => {
    const doc = createDoc(file.name, reader.result, file.name);
    addDoc(doc);
    statusText.textContent = `Opened ${file.name}`;
  };
  reader.readAsText(file);
}

function findText(direction = 1) {
  const query = findInput.value;
  if (!query) return;
  const text = editor.value;
  const start = editor.selectionStart;
  const fromIndex = direction > 0 ? start + query.length : start - 1;
  const matchIndex = direction > 0 ? text.indexOf(query, fromIndex) : text.lastIndexOf(query, fromIndex);
  if (matchIndex >= 0) {
    editor.focus();
    editor.setSelectionRange(matchIndex, matchIndex + query.length);
    updateStatus();
  }
}

function replaceText() {
  const query = findInput.value;
  const replacement = replaceInput.value;
  if (!query) return;
  const selection = editor.value.slice(editor.selectionStart, editor.selectionEnd);
  if (selection === query) {
    const before = editor.value.slice(0, editor.selectionStart);
    const after = editor.value.slice(editor.selectionEnd);
    editor.value = `${before}${replacement}${after}`;
    editor.setSelectionRange(editor.selectionStart, editor.selectionStart + replacement.length);
    const doc = getCurrentDoc();
    if (doc) {
      doc.content = editor.value;
      doc.changed = true;
      updateLineNumbers();
      updateStatus();
      renderTabs();
    }
  }
}

function replaceAllText() {
  const query = findInput.value;
  const replacement = replaceInput.value;
  if (!query) return;
  const doc = getCurrentDoc();
  if (!doc) return;
  doc.content = doc.content.split(query).join(replacement);
  editor.value = doc.content;
  doc.changed = true;
  updateLineNumbers();
  updateStatus();
  renderTabs();
}

function toggleSearch() {
  searchPanel.hidden = !searchPanel.hidden;
  if (!searchPanel.hidden) {
    findInput.focus();
  }
}

function attachEvents() {
  document.getElementById('newBtn').addEventListener('click', () => {
    addDoc(createNewDoc());
  });
  document.getElementById('openBtn').addEventListener('click', () => fileInput.click());
  document.getElementById('openNewTabBtn').addEventListener('click', () => fileInput.click());
  document.getElementById('saveBtn').addEventListener('click', () => saveCurrentDoc(false));
  document.getElementById('saveAsBtn').addEventListener('click', () => saveCurrentDoc(true));
  document.getElementById('saveAllBtn').addEventListener('click', () => saveAllDocs());
  document.getElementById('findBtn').addEventListener('click', toggleSearch);
  document.getElementById('themeBtn').addEventListener('click', () => {
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    applyTheme();
  });
  document.getElementById('findNextBtn').addEventListener('click', () => findText(1));
  document.getElementById('replaceBtn').addEventListener('click', replaceText);
  document.getElementById('replaceAllBtn').addEventListener('click', replaceAllText);
  document.getElementById('closeSearchBtn').addEventListener('click', () => {
    searchPanel.hidden = true;
  });

  editor.addEventListener('input', () => {
    const doc = getCurrentDoc();
    if (doc) {
      doc.content = editor.value;
      doc.changed = true;
      updateLineNumbers();
      updateStatus();
      renderTabs();
    }
  });

  editor.addEventListener('scroll', () => {
    lineNumbers.scrollTop = editor.scrollTop;
  });

  editor.addEventListener('keyup', updateStatus);
  editor.addEventListener('click', updateStatus);
  editor.addEventListener('select', updateStatus);

  fileInput.addEventListener('change', (event) => {
    const [file] = event.target.files || [];
    if (file) {
      openFile(file);
      fileInput.value = '';
    }
  });

  document.addEventListener('keydown', (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
      event.preventDefault();
      saveCurrentDoc(false);
    }
    if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key.toLowerCase() === 's') {
      event.preventDefault();
      saveAllDocs();
    }
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'o') {
      event.preventDefault();
      fileInput.click();
    }
    if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key.toLowerCase() === 'o') {
      event.preventDefault();
      fileInput.click();
    }
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'n') {
      event.preventDefault();
      addDoc(createNewDoc());
    }
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'f') {
      event.preventDefault();
      toggleSearch();
    }
  });
}

function init() {
  applyTheme();
  addDoc(createDoc('welcome.txt', 'Welcome to LogBook Editor\n\nFeatures:\n- Tabbed editing\n- Open/Save files\n- Find and replace\n- Line numbers\n- Dark/light themes\n'));
  attachEvents();
  updateLineNumbers();
  updateStatus();
}

init();
