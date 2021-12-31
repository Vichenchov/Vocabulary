const electron = require('electron');
const {
  ipcRenderer
} = electron;

// save the selected word to practice them later
var words = [];

document.querySelector('.start').addEventListener('click', (e) => {
  e.preventDefault();
  if (words.length != 0) {
    ipcRenderer.send('practiceSelected', words);
  } else {
    alert('No word was selected...');
  }
})

ipcRenderer.on('loadWords', function (e, word, meaning, num) {
  ipcRenderer.send('dataForSearchBar', 'all');
  const tbody = document.querySelector('.tbody');
  const tr = document.createElement('tr');
  tr.setAttribute('id', num);
  tbody.appendChild(tr);
  tr.setAttribute('value', word);
  tr.classList.add('trow');

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

// gets the word in the a row where checkbox is checked and add the word to words array to practice the words later
document.addEventListener('click', (e) => {
  if (e.target.id == 'check') {
    var wordNumber = e.target.name;
    var value = document.querySelector('.word-' + wordNumber).getAttribute('value');
    if (!words.includes(value)) {
      words.push(value);
      console.log(value);
      ipcRenderer.send('saveInGameDb', value);
    } else {
      const index = words.indexOf(value);
      console.log(value);
      words.splice(index, 1);
      ipcRenderer.send('remvoeFromGameDb', value);
    }
  }
});

document
  .querySelector('.back')
  .addEventListener('click', str);

function str(e) {
  ipcRenderer.send('goBack');
}