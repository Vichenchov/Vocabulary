const electron = require('electron');
const {
    ipcRenderer
} = electron;

// onClick .exit do exit()
document
    .querySelector('.exit')
    .addEventListener('click', exit);

//Saves the current word and exits the game
function exit(e) {
    ifExit = true;
    saveWord(e, ifExit, '');
}

//onClick .play do goToChooseGame()
document
    .querySelector('.play')
    .addEventListener('click', goToChooseGame);

//Saves the current word and redirects to chooseGame.html to choose game setting and start playing    
function goToChooseGame(e) {
    saveWord(e, false, 'Views/chooseGame.html');
}

//onClick .saveWord do saveWordAndAddMore
document
    .querySelector('.saveWord')
    .addEventListener('click', saveWordAndAddMore);

//Saves the current word and saty in the same page that the user can add another word
function saveWordAndAddMore(e) {
    saveWord(e, false, '');
}

//Save the current word
//Three params 
//(e) is the event 
//(ifExit) gets boolean if the app should cloes after the word was saved
//(url) gets a url if the user wants to play after the word was saved, and redirects him to the game settings page
function saveWord(e, ifExit, url) {
    // e.preventDefault();
    const newWordInsert = {
        word: document
            .querySelector('#word')
            .value,
        meaning: document
            .querySelector('#meaning')
            .value
    }
    document.querySelector('#word').value = '';
    document.querySelector('#meaning').value = '';
    console.log(newWordInsert);
    ipcRenderer.send('addNewWord', newWordInsert, ifExit,
        url);
}

//Goes back to the main window
document
    .querySelector('.goBack')
    .addEventListener('click', (e) => {
        ipcRenderer.send('goToPage', 'Views/mainWindow.html');
    });

ipcRenderer.on('notIserted', function (e) {
    document.querySelector('.exists').classList.add('hide');
    document.querySelector('.empty').classList.remove('hide');
})

ipcRenderer.on('alreadyExist', function (e) {
    document.querySelector('.empty').classList.add('hide');
    document.querySelector('.exists').classList.remove('hide');
})