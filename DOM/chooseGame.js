const electron = require('electron');
const {
    ipcRenderer
} = electron;

var maxAmount;
var noUnlearned = false;

//Goes to addWindow on button click
document
    .querySelector('.start')
    .addEventListener('click', goToGameWindow);

function goToGameWindow(e) {
    var value = document.querySelector('.amount').value;
    if (!value) value = maxAmount;
    if (value > maxAmount) {
        alert('There is only ' + maxAmount + ' words, enter number less than ' + maxAmount);
        return;
    }
    ipcRenderer.send('goToPage', 'Views/gameWindow.html', value);
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
    if (noUnlearned == false) {
        var t = document.createTextNode('No Unlearned words...');
        noUnlearned = true;
    }
    newlabel.appendChild(t);
    document.querySelector('body').append(newlabel);
})

window.onload = (e) => {
    ipcRenderer.send('getWordsAmount');
}


ipcRenderer.on('data', function (e, newAmount) {
    maxAmount = newAmount;
    console.log(newAmount);
    document.querySelector('.amount').setAttribute('max', newAmount);
    document.querySelector('.amount').setAttribute('placeholder', 'max words is ' + newAmount);
})


// ipcRenderer.on('data', function (e, newAmount) {
//     amount = newAmount;
//     console.log(newAmount);
//     if (newAmount == 0) {
//         alert('There is no words to practice, please add new words to start practicing...');
//     } else {
//         alert('There is only ' + newAmount + ' words were saved til now. Press start to practice all of theme or enter samller number...');
//         document.querySelector('.amount').setAttribute('max', newAmount);
//         var text = document.createTextNode('asdasdasd');
//         document.querySelector('.amount').append(text);
//     }
// })