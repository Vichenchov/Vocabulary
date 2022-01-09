const electron = require('electron');
const {
    ipcRenderer
} = electron;

var countWords;
var countUnlearned;
var countLearned;

document.querySelector('.all').addEventListener('click', (e) => {
    if (countWords != 0) {
        ipcRenderer.send('showStatsTables', 'all');
    } else {
        alert('There is 0 in the Database');
    }
})
document.querySelector('.learned').addEventListener('click', (e) => {
    if (countLearned != 0) {
        ipcRenderer.send('showStatsTables', 'learned');
    } else {
        alert('There is 0 in the Database');
    }
})
document.querySelector('.unlearned').addEventListener('click', (e) => {
    if (countUnlearned != 0) {
        ipcRenderer.send('showStatsTables', 'unlearned');
    } else {
        alert('There is 0 in the Database');
    }
})

ipcRenderer.on('countWords', function (e, count) {
    countWords = count;
    const newlabel = document.createElement('label');
    newlabel.setAttribute('id','stats');
    // Current amount of words is
    const t = document.createTextNode('Words saved: ' + count);
    newlabel.appendChild(t);
    document.querySelector('div').appendChild(newlabel);
})
ipcRenderer.on('countUnlearned', function (e, count) {
    countUnlearned = count;
    const newlabel = document.createElement('label');
    newlabel.setAttribute('id','stats');
    // Current amount of Unlearned words is
    const t = document.createTextNode('Unlearned words: ' + count);
    newlabel.appendChild(t);
    document.querySelector('div').appendChild(newlabel);
})
ipcRenderer.on('countLearned', function (e, count) {
    countLearned = count;
    const newlabel = document.createElement('label');
    newlabel.setAttribute('id','stats');
    //Current amount of Leaned words is
    const t = document.createTextNode('Learned words: ' + count);
    newlabel.appendChild(t);
    document.querySelector('div').appendChild(newlabel);
})

document
    .querySelector('.back')
    .addEventListener('click', str);

function str(e) {
    ipcRenderer.send('goToPage', 'Views/mainWindow.html');
}