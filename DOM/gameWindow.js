const electron = require('electron');
const {
    ipcRenderer
} = electron;

var state;

function play(e) {
    
}

document.addEventListener('click', function (e) {
    if(e.target.value == 'btn'){
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
    document.querySelector('body').appendChild(newlabel);
});

ipcRenderer.on('writeWord', function (e) {
    const input = document.createElement('input');
    input.setAttribute('id', 'inputValue');
    const button = document.createElement('button');
    button.setAttribute('type','submit');
    button.setAttribute('value', 'btn');
    var text = document.createTextNode('submit');
    button.appendChild(text);
    document.querySelector('body').appendChild(input);
    document.querySelector('body').appendChild(button);
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
    button.appendChild(text);
    button.setAttribute('value', 'btn');
    button.setAttribute('name', displayHow);
    button.setAttribute('id', displayHow + '-' + i);
    document.querySelector('ul').appendChild(button);
}

ipcRenderer.on('currentPracticeCount', function (e, count) {
    const newlabel = document.createElement('label');
    //Current amount of Leaned words is
    const t = document.createTextNode(' +++ Current practice amount: ' + count);
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
    .querySelector('.str')
    .addEventListener('click', str);

function str(e) {
    ipcRenderer.send('goToPage', 'Views/mainWindow.html');
}

document
    .querySelector('.goBack')
    .addEventListener('click', goBack);

function goBack(e) {
    ipcRenderer.send('goBack');
}