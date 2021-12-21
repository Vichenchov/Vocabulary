const { ipcRenderer } = require("electron");

ipcRenderer.on('showAmount', function (e, amount) {
    var h2 = document.createElement('h2');
    var text = document.createTextNode('You just learned ' + amount + ' words !');
    h2.appendChild(text);
    document.querySelector('h1').appendChild(h2);
})

document.querySelector('.more').addEventListener('click', (e) =>{
    ipcRenderer.send('goToPage', 'Views/chooseGame.html');
})

document.querySelector('.exit').addEventListener('click', (e) =>{
    ipcRenderer.send('exit');
})