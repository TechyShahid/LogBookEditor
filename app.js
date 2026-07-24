const editor = document.getElementById('editor');
const highlightLayer = document.getElementById('highlightLayer');
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

function createDoc(title = 'untitled.txt', content = '', path = null, language = null) {
  return {
    id: crypto.randomUUID(),
    title,
    content,
    path,
    language: language || getLanguageFromName(title),
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

function getLanguageFromName(name = '') {
  const lowerName = name.toLowerCase();
  if (lowerName.endsWith('.html') || lowerName.endsWith('.htm')) return 'html';
  if (lowerName.endsWith('.css')) return 'css';
  if (lowerName.endsWith('.js') || lowerName.endsWith('.ts')) return 'js';
  if (lowerName.endsWith('.json')) return 'json';
  if (lowerName.endsWith('.md') || lowerName.endsWith('.markdown')) return 'md';
  return 'text';
}

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function highlightCode(value, language) {
  const escaped = escapeHtml(value);

  if (language === 'html') {
    return escaped
      .replace(/(&lt;!--[\s\S]*?--&gt;)/g, '<span class="token comment">$1</span>')
      .replace(/(&lt;\/?)([A-Za-z][\w:-]*)(?=[^&]*&gt;)/g, '$1<span class="token tag">$2</span>')
      .replace(/("[^"\\]*(\\.[^"\\]*)*"|'[^'\\]*(\\.[^'\\]*)*')/g, '<span class="token string">$1</span>');
  }

  if (language === 'css') {
    return escaped
      .replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="token comment">$1</span>')
      .replace(/([A-Za-z-]+)(?=\s*:)/g, '<span class="token attr-name">$1</span>')
      .replace(/("[^"\\]*(\\.[^"\\]*)*"|'[^'\\]*(\\.[^'\\]*)*')/g, '<span class="token string">$1</span>')
      .replace(/\b(\d+)(px|rem|em|vh|vw|%)?\b/g, '<span class="token number">$1$2</span>');
  }

  if (language === 'js') {
    return escaped
      .replace(/(\/\*[\s\S]*?\*\/|\/\/.*)/g, '<span class="token comment">$1</span>')
      .replace(/\b(function|const|let|var|return|if|else|for|while|new|class|extends|import|export|from|async|await|try|catch|finally|switch|case|break|default|typeof|instanceof|true|false|null|undefined|super|this)\b/g, '<span class="token keyword">$1</span>')
      .replace(/("[^"\\]*(\\.[^"\\]*)*"|'[^'\\]*(\\.[^'\\]*)*'|`[^`\\]*(\\.[^`\\]*)*`)/g, '<span class="token string">$1</span>')
      .replace(/\b(\d+)\b/g, '<span class="token number">$1</span>');
  }

  if (language === 'json') {
    return escaped
      .replace(/("(?:\\.|[^"\\])*"\s*:)/g, '<span class="token attr-name">$1</span>')
      .replace(/("(?:\\.|[^"\\])*"|\btrue\b|\bfalse\b|\bnull\b)/g, '<span class="token string">$1</span>')
      .replace(/\b(\d+)\b/g, '<span class="token number">$1</span>');
  }

  if (language === 'md') {
    return escaped.replace(/^(#{1,6}\s+.+)$/gm, '<span class="token heading">$1</span>');
  }

  return escaped;
}

function updateHighlight() {
  const doc = getCurrentDoc();
  if (!doc) return;
  const language = doc.language || getLanguageFromName(doc.title);
  highlightLayer.innerHTML = highlightCode(editor.value, language);
}

function getCurrentDoc() {
  return state.docs.find((doc) => doc.id === state.currentId) || null;
}

function setCurrentDoc(doc) {
  state.currentId = doc.id;
  editor.value = doc.content;
  doc.language = doc.language || getLanguageFromName(doc.title);
  updateLineNumbers();
  updateStatus();
  updateHighlight();
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
  doc.language = getLanguageFromName(doc.title);
  const suggestedName = doc.path ? doc.path.split(/[\\/]/).pop() : doc.title;
  const filename = asNew ? prompt('Save as', suggestedName || 'untitled.txt') : suggestedName;
  if (!filename) return;
  doc.language = getLanguageFromName(filename);
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
    const doc = createDoc(file.name, reader.result, file.name, getLanguageFromName(file.name));
    addDoc(doc);
    statusText.textContent = `Opened ${file.name}`;
  };
  reader.readAsText(file);
}

function findText(direction = 1) {
  const query = findInput.value;
  if (!query) return;

  const text = editor.value;
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();

  const selStart = editor.selectionStart;
  const selEnd = editor.selectionEnd;
  const isSelectedQuery = text.slice(selStart, selEnd).toLowerCase() === lowerQuery;

  let matchIndex = -1;

  if (direction > 0) {
    const fromIndex = isSelectedQuery ? selEnd : selStart;
    matchIndex = lowerText.indexOf(lowerQuery, fromIndex);
    if (matchIndex === -1 && fromIndex > 0) {
      matchIndex = lowerText.indexOf(lowerQuery, 0);
    }
  } else {
    const fromIndex = isSelectedQuery ? selStart - 1 : selStart - 1;
    if (fromIndex >= 0) {
      matchIndex = lowerText.lastIndexOf(lowerQuery, fromIndex);
    }
    if (matchIndex === -1) {
      matchIndex = lowerText.lastIndexOf(lowerQuery);
    }
  }

  if (matchIndex >= 0) {
    editor.focus();
    editor.setSelectionRange(matchIndex, matchIndex + query.length);

    const lineIndex = text.slice(0, matchIndex).split('\n').length - 1;
    const lineHeight = parseFloat(getComputedStyle(editor).lineHeight) || 21.37;
    const targetScrollTop = lineIndex * lineHeight;
    const containerHeight = editor.clientHeight;

    if (targetScrollTop < editor.scrollTop || targetScrollTop > editor.scrollTop + containerHeight - lineHeight * 2) {
      editor.scrollTop = Math.max(0, targetScrollTop - containerHeight / 3);
    }

    updateStatus();
  } else {
    statusText.textContent = `No matches found for "${query}"`;
  }
}

function replaceText() {
  const query = findInput.value;
  const replacement = replaceInput.value;
  if (!query) return;

  const selStart = editor.selectionStart;
  const selEnd = editor.selectionEnd;
  const selection = editor.value.slice(selStart, selEnd);

  if (selection.toLowerCase() === query.toLowerCase()) {
    const before = editor.value.slice(0, selStart);
    const after = editor.value.slice(selEnd);
    editor.value = `${before}${replacement}${after}`;

    const doc = getCurrentDoc();
    if (doc) {
      doc.content = editor.value;
      doc.changed = true;
      updateLineNumbers();
      updateStatus();
      updateHighlight();
      renderTabs();
    }

    editor.focus();
    editor.setSelectionRange(selStart, selStart + replacement.length);
    findText(1);
  } else {
    findText(1);
  }
}

function replaceAllText() {
  const query = findInput.value;
  const replacement = replaceInput.value;
  if (!query) return;
  const doc = getCurrentDoc();
  if (!doc) return;

  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(escaped, 'gi');
  const matches = doc.content.match(regex);
  const count = matches ? matches.length : 0;

  if (count === 0) {
    statusText.textContent = `No matches found for "${query}"`;
    return;
  }

  doc.content = doc.content.replace(regex, replacement);
  editor.value = doc.content;
  doc.changed = true;
  updateLineNumbers();
  updateStatus();
  updateHighlight();
  renderTabs();
  statusText.textContent = `Replaced ${count} occurrence(s) of "${query}"`;
}

function toggleSearch() {
  const isHidden = searchPanel.hidden;
  searchPanel.hidden = !isHidden;
  if (!searchPanel.hidden) {
    const selectedText = editor.value.slice(editor.selectionStart, editor.selectionEnd);
    if (selectedText && !selectedText.includes('\n')) {
      findInput.value = selectedText;
    }
    findInput.focus();
    findInput.select();
    if (findInput.value) {
      findText(1);
    }
  } else {
    editor.focus();
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
  const findPrevBtn = document.getElementById('findPrevBtn');
  if (findPrevBtn) {
    findPrevBtn.addEventListener('click', () => findText(-1));
  }
  document.getElementById('replaceBtn').addEventListener('click', replaceText);
  document.getElementById('replaceAllBtn').addEventListener('click', replaceAllText);
  document.getElementById('closeSearchBtn').addEventListener('click', () => {
    searchPanel.hidden = true;
    editor.focus();
  });

  findInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      findText(event.shiftKey ? -1 : 1);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      searchPanel.hidden = true;
      editor.focus();
    }
  });

  replaceInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      replaceText();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      searchPanel.hidden = true;
      editor.focus();
    }
  });

  editor.addEventListener('input', () => {
    const doc = getCurrentDoc();
    if (doc) {
      doc.content = editor.value;
      doc.changed = true;
      updateLineNumbers();
      updateStatus();
      updateHighlight();
      renderTabs();
    }
  });

  editor.addEventListener('scroll', () => {
    lineNumbers.scrollTop = editor.scrollTop;
    highlightLayer.scrollTop = editor.scrollTop;
    highlightLayer.scrollLeft = editor.scrollLeft;
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
  addDoc(createDoc('welcome.txt', 'Welcome to LogBook Editor\n\nFeatures:\n- Tabbed editing\n- Open/Save files\n- Find and replace\n- Line numbers\n- Dark/light themes\n', null, 'text'));
  attachEvents();
  updateLineNumbers();
  updateStatus();
  updateHighlight();
}

init();
