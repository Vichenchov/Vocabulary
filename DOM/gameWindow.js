const {
    ipcMain
} = require('electron');
const electron = require('electron');
const {
    ipcRenderer
} = electron;

var state;
var gameMaxCount;


document.addEventListener('click', function (e) {
    if (e.target.value == 'btn') {
        // console.log(document.querySelector('#inputValue').value);
        console.log(e.target.name);
        console.log(document.querySelector('h1').getAttribute('value'));
        switch (state) {
            case 'h':
                word = document.querySelector('h1').getAttribute('value');
                meaning = e.target.name;
                break;
            case 'e':
                meaning = document.querySelector('h1').getAttribute('value');
                word = e.target.name;
                break;
            default: //writeing
                meaning = document.querySelector('h1').getAttribute('value');
                word = document.querySelector('#inputValue').value;
                break;
        }
        ipcRenderer.send('practice', word, meaning, state);
    }
})


ipcRenderer.on('displayMainWord', function (e, mainWord) {
    const newlabel = document.createElement('h1');
    const t = document.createTextNode(mainWord);
    newlabel.appendChild(t);
    newlabel.setAttribute('value', mainWord);
    newlabel.setAttribute('class', 'main');
    document.querySelector('div').appendChild(newlabel);
});

ipcRenderer.on('writeWord', function (e) {
    const input = document.createElement('input');
    input.setAttribute('id', 'inputValue');
    const button = document.createElement('button');
    const br = document.createElement("br");
    button.setAttribute('type', 'submit');
    button.setAttribute('value', 'btn');
    button.setAttribute('class', 'btn btn-outline-light game-buttons');
    var text = document.createTextNode('submit');
    button.appendChild(text);
    document.querySelector('ul').appendChild(input);
    document.querySelector('ul').appendChild(br);
    document.querySelector('ul').appendChild(button);
});

ipcRenderer.on('loadWords', function (e, word, meaning, i, displayHow) {
    state = displayHow;
    console.log(state);
    if (displayHow == 'e') {
        displayWordsElements(word, i);
    } else {
        displayWordsElements(meaning, i);
    }
})

function displayWordsElements(displayHow, i) {
    const button = document.createElement('button');
    const text = document.createTextNode(displayHow);
    const br = document.createElement("br");
    button.appendChild(text);
    button.setAttribute('value', 'btn');
    button.setAttribute('name', displayHow);
    button.setAttribute('id', displayHow + '-' + i + ' game-buttons');
    button.setAttribute('class', 'btn btn-outline-light game-buttons');
    document.querySelector('.g-buttons').appendChild(button);
    document.querySelector('.g-buttons').appendChild(br);
}


ipcRenderer.on('currentPracticeCount', function (e, count) {
    const newlabel = document.createElement('label');
    //Current amount of Leaned words is
    const t = document.createTextNode('Words in current practice: ' + count);
    newlabel.appendChild(t);
    document.querySelector('label').appendChild(newlabel);
})

document
    .querySelector('.exit')
    .addEventListener('click', exit);

function exit(e) {
    ipcRenderer.send('exit');
}

document
    .querySelector('.goBack')
    .addEventListener('click', goBack);

function goBack(e) {
    ipcRenderer.send('goBack');
    ipcRenderer.send('reset');
}