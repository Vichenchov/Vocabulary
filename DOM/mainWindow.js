const electron = require('electron');
const {
    ipcRenderer
} = electron;
document
    .querySelector('.exit')
    .addEventListener('click', exit);

function exit(e) {
    ipcRenderer.send('exit');
}

//Goes to addWindow on button click
document
    .querySelector('.add')
    .addEventListener('click', goToAddWindow);

function goToAddWindow(e) {
    ipcRenderer.send('goToPage', 'Views/addWindow.html');
}

//Goes to chooseWindow on button click
document
    .querySelector('.play')
    .addEventListener('click', goToChooseGame);

function goToChooseGame(e) {
    ipcRenderer.send('goToPage', 'Views/chooseGame.html');
}


document
    .querySelector('.stats')
    .addEventListener('click', stats);

function stats(e) {
    ipcRenderer.send('goToPage', 'Views/stats.html');
}

document
    .querySelector('.delete')
    .addEventListener('click', deletePage);

function deletePage(e) {
    ipcRenderer.send('goToPage', 'Views/deleteWords.html');
}

