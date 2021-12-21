const electron = require('electron');
const {
    ipcRenderer
} = electron;

document.querySelector('.all').addEventListener('click', (e) => {
    ipcRenderer.send('showStatsTables', 'all');
})
document.querySelector('.learned').addEventListener('click', (e) => {
    ipcRenderer.send('showStatsTables', 'learned');
})
document.querySelector('.unlearned').addEventListener('click', (e) => {
    ipcRenderer.send('showStatsTables', 'unlearned');
})



ipcRenderer.on('countWords', function (e, count) {
    const newlabel = document.createElement('label');
    // Current amount of words is
    const t = document.createTextNode('words ' + count);
    newlabel.appendChild(t);
    document.querySelector('h1').appendChild(newlabel);
})
ipcRenderer.on('countUnlearned', function (e, count) {
    const newlabel = document.createElement('label');
    // Current amount of Unlearned words is
    const t = document.createTextNode('Unlearned ' + count);
    newlabel.appendChild(t);
    document.querySelector('h1').appendChild(newlabel);
})
ipcRenderer.on('countLearned', function (e, count) {
    const newlabel = document.createElement('label');
    //Current amount of Leaned words is
    const t = document.createTextNode('Leaned ' + count);
    newlabel.appendChild(t);
    document.querySelector('h1').appendChild(newlabel);
})