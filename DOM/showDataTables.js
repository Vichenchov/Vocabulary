const electron = require('electron');
const {
    ipcRenderer
} = electron;

ipcRenderer.on('loadWords', function (e, word, meaning, num) {
    const tbody = document.querySelector('.tbody');
    const tr = document.createElement('tr');
    tr.setAttribute('id', num);
    tbody.appendChild(tr);

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