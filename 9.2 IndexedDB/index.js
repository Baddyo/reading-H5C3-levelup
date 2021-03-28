let db = null;
let IDB = null;
let noteTable = null;
let currentNote = null;
window.onload = () => {
  IDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;

  document.querySelector('.list-box').addEventListener('click', e => {
    if (e.target.className === 'note-item') {
      readNote(e.target.dataset.id);
    }
  })
  connect();




}

// 提交表单
function saveNote() {
  let transaction = db.transaction(['notes'], 'readwrite');
  noteTable = transaction.objectStore('notes');
  let data = {
    title: document.querySelector('#title').value,
    note: document.querySelector('#note').value,
  };
  if (currentNote && currentNote.id) {
    data.id = currentNote.id;
  }
  noteTable.put(data).onsuccess = e => {
    renderList(e.target.result, data)
  };
}
// 清空表单
function clearForm() {
  currentNote = null;
  document.querySelector('#title').value = '';
  document.querySelector('#note').value = '';
  updateActive()
}
// 点击单条笔记时查表
function readNote(id) {
  if (!id) {
    return;
  }
  let transaction = db.transaction(['notes'], 'readwrite');
  noteTable = transaction.objectStore('notes');
  noteTable.get(Number(id)).onsuccess = e => {
    currentNote = e.target.result;
    document.querySelector('#title').value = currentNote.title;
    document.querySelector('#note').value = currentNote.note;

    updateActive(currentNote.id)
  }
}
// 更新列表项高亮状态
function updateActive(id) {
  let notes = Array.from(document.querySelectorAll('.list-box .note-item'));
  notes.forEach(x => {
    // debugger
    let className = 'note-item';
    if (Number(x.dataset.id) === id) {
      className += ' current-note';
    }
    x.className = className;
  });
}
// 删除笔记
function delNote() {
  if (!currentNote || !currentNote.id) {
    return;
  }
  let transaction = db.transaction(['notes'], 'readwrite');
  noteTable = transaction.objectStore('notes');
  noteTable.delete(Number(currentNote.id)).onsuccess = e => {
    fetchNotes()
  }
}



// 连接 IndexedDB
function connect() {
  let version = 1;
  let request = IDB.open('BaddNotes', version);
  request.onupgradeneeded = e => {
    e.target.result.createObjectStore('notes', {
      keyPath: 'id',
      autoIncrement: true
    })
  }
  request.onsuccess = e => {
    db = e.target.result;
    fetchNotes();
  }
  request.onerror = e => {
    console.log('连接失败！', e);
  }
}
// 从 DB 中获取历史笔记
function fetchNotes() {
  document.querySelector('.list-box').innerHTML = '';
  let transaction = db.transaction(['notes'], 'readwrite');
  noteTable = transaction.objectStore('notes');

  let keyRange = IDBKeyRange.lowerBound(0);
  let req = noteTable.openCursor(keyRange);

  req.onsuccess = e => {
    let res = e.target.result;
    if (res) {
      renderList(res.key, res.value);
      res.continue();
    }
  }
  req.onerror = e => {
    console.log('获取笔记失败！', e);
  }
}
// 生成笔记列表
function renderList(key, data) {
  let item = `
    <p data-id="${key}" class="note-item">${data.title}</p>
  `;
  let div = document.createElement('div');
  div.innerHTML = item;
  let listBox = document.querySelector('.list-box').appendChild(div);
  if (currentNote) {
    updateActive(key);
  }
}