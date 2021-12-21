const electron = require('electron');
const {
  ipcRenderer
} = electron;

// save the selected word to delete them later
var words = [];

// show warrning message before deleting words
document.querySelector('.delete-btn').addEventListener('click', (e) => {
  e.preventDefault();
  if (words.length != 0) {
    if (confirm("This words will be deleted permanently, Are you sure you want to delete them?")) {
      ipcRenderer.send('deleteWords', words);
    }
  } else {
    alert('No word was selected...');
  }
})

// show Words deleted successfully message and redirects to main page
ipcRenderer.on('wordsDeleted', (e) => {
  alert('Words deleted successfully!');
  ipcRenderer.send('goToPage', 'Views/mainWindow.html');
})

// creates table elements with data 
ipcRenderer.on('loadWords', function (e, word, meaning, num) {
  const tbody = document.querySelector('.tbody');
  const tr = document.createElement('tr');
  tr.setAttribute('id', num);
  tbody.appendChild(tr);

  creatRow('td', num, num);
  creatRow('td', word, num, 'word');
  creatRow('td', meaning, num);

  var select = document.createElement('input');
  select.type = 'checkbox';
  select.name = num;
  select.value = 'check-' + num;
  select.id = 'check';
  document.getElementById(num).appendChild(select);
});

// helps create elements
function creatRow(element, elementValue, id, ifWord) {
  const kind = document.createElement(element);
  const value = document.createTextNode(elementValue);
  kind.appendChild(value);
  kind.setAttribute('value', elementValue);
  if (ifWord == 'word') {
    kind.setAttribute('class', ifWord + '-' + id);
  }
  document.getElementById(id).appendChild(kind);
}

// gets the word in the a row where checkbox is checked and add the word to words array to later delete the words 
document.addEventListener('click', (e) => {
  if (e.target.id == 'check') {
    var wordNumber = e.target.name;
    var value = document.querySelector('.word-' + wordNumber).getAttribute('value');
    if (!words.includes(value)) {
      words.push(value);
    } else {
      const index = words.indexOf(value);
      words.splice(index, 1);
    }
  }
});

document
  .querySelector('.goBack')
  .addEventListener('click', str);

function str(e) {
  ipcRenderer.send('goToPage', 'Views/mainWindow.html');
}