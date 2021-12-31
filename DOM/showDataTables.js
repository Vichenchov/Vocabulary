const electron = require('electron');
const {
    ipcRenderer
} = electron;

var dataLoad;

// gets the spacific to load every time
// window.addEventListener('load', (e) => {
//   ipcRenderer.send('dataForSearchBar', dataLoad);
// });

ipcRenderer.on('loadWords', function (e, word, meaning, num, data) {
    dataLoad = data;
    console.log(dataLoad);
    ipcRenderer.send('dataForSearchBar', dataLoad);
    const tbody = document.querySelector('.tbody');
    const tr = document.createElement('tr');
    tr.setAttribute('id', num);
    tbody.appendChild(tr);
    tr.setAttribute('value', word);
    tr.classList.add('trow');
    
    creatRow('td', num, num);
    creatRow('td', word, num);
    creatRow('td', meaning, num);
});

function creatRow(element, elementValue, id) {
    const kind = document.createElement(element);
    const value = document.createTextNode(elementValue);
    kind.appendChild(value);
    document.getElementById(id).appendChild(kind);
}

document
  .querySelector('.back')
  .addEventListener('click', str);

function str(e) {
  ipcRenderer.send('goToPage', 'Views/stats.html');
}