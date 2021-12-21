const electron = require('electron');
const {
    ipcRenderer
} = electron;

//Goes to addWindow on button click
document
    .querySelector('.start')
    .addEventListener('click', goToGameWindow);
async function goToGameWindow(e) {
    await ipcRenderer.send('goToPage', 'Views/gameWindow.html', document.querySelector('.amount').value);
}

document
    .querySelector('.selectWords')
    .addEventListener('click', goToWordsSelection);

function goToWordsSelection(e) {
    ipcRenderer.send('goToPage', 'Views/wordsSelection.html');
}

document
    .querySelector('.str')
    .addEventListener('click', str);

function str(e) {
    ipcRenderer.send('goToPage', 'Views/mainWindow.html');
}

document
    .querySelector('.unLearned')
    .addEventListener('click', unLearned);

function unLearned(e) {
    ipcRenderer.send('unLearned');
}

ipcRenderer.on('noUnlearned', (e) => {
    const newlabel = document.createElement('label');
    const t = document.createTextNode('NO UNLEARNED WORDS WERE FOUND');
    newlabel.appendChild(t);
    document.querySelector('.abc').insertBefore(newlabel,document.querySelector('.abc').childNodes[0]);
})

ipcRenderer.on('data', function (e, newAmount) {
    console.log(newAmount);
    if(newAmount == 0){
        alert('There is no words to practice, please add new words to start pracicing...');
    }else{
        alert('There is only ' + newAmount + 'words were saved til now. Press start to practice all of theme or enter samller number...');
    }
})
