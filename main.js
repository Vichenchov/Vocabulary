const electron = require('electron');
const url = require('url');
const path = require('path');
const {
    addWord,
    deleteWords,
    randomWords,
    ifEnoughWords,
    killGameInstance,
    checkEtH,
    checkHtE,
    ifWordExists,
    ifDeleteGameWord,
    ifGameDbIsEmpty,
    checkWriting
} = require('./db');
require('electron-reload')(__dirname);
const _ = require('lodash');



//objects that we pass in form electron that we can use it on this page
const {
    app,
    BrowserWindow,
    Menu,
    ipcMain
} = electron;
//SET ENV - PROD - this line setes the project as ready to production and by that removes the DevTools from the Menu bar
// process.env.NODE_ENV = 'production';


let mainWindow;


//Listen to app to bee ready
app.on('ready', function () {

    //Create new window
    mainWindow = new BrowserWindow({
        // idk what webPreferences do but it make it work so I need to add it to any new
        // page
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true

        }
    });

    // Load html into window
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'Views/mainWindow.html'),
        protocol: 'file:',
        slashes: true
        // explaination of the code: Just building in a funcy way the path to page that
        // we want it to go to the path is: 'file://dirname/Views/mainWindow.html'
    }))

    // Quit app when closed - closes all windows
    mainWindow.on('closed', function () {
        killGameInstance().then(() => {
            app.quit();
        });
    })

    //Build menu from template
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    //Insert menu
    Menu.setApplicationMenu(mainMenu);
})

//=================================================================================

//Exit game when exit buttons clicked 
ipcMain.on('exit', function (e) {
    // empty the game db
    killGameInstance().then(() => {
        app.quit();
        mainWindow.close();
    });

})

//Gose to any window - the function gets the specific path and change the window to specific html page (not opens a new window!)
//if goes to the game page after

ipcMain.on('goToPage', async function (e, pagePath, amount) {
    // if the user starts to play then...
    if (pagePath == 'Views/gameWindow.html') {
        // gets the number of words for the current practice 
        var newAmount = await pickAmount(amount).then(value => {
            return value;
        });
        // If the user inserted amount the bigger then the amount of words in the db...
        if (newAmount < amount) {
            //Shows a message to the user about the amount of words he iserted
            mainWindow.webContents.send('data', newAmount);
            return;
        } else {
            // creats an instance of words for the current practice
            randomWords(newAmount);
        }
    }
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, pagePath),
        protocol: 'file:',
        slashes: true
    }))
})

// checks if there is enough words in the db as the user inserts
// if not, returns the number of the words in the db
async function pickAmount(amount) {
    // ans is an obj with two fields - (1)boolean if Enough words - (2) - num of words in the db
    var ans = await ifEnoughWords(amount).then(value => {
        return value;
    });
    // *also if amount == '', aka 'undifined' means that the user just clicked start
    // *so it returns the amount of words in the db so the user starts practice all the words
    if (ans.result == false || amount == '') amount = ans.numOfWordsInDb;
    return amount;
}

//Gets new word and inserts it to the db, also gets two more params:
//(ifExit) gets boolean if the app should cloes after the word was saved
//(url) gets a url if the user wants to play after the word was saved, and redirects him to the game settings page
ipcMain.on('addNewWord', async function (e, newWordInsert, ifExit, pagePath) {
    //newWordInsert is an obj with two fileds, word & meaning
    //newInsert is an obj with the info we need to insert it to the DB
    const newInsert = {
        word: newWordInsert.word,
        meaning: newWordInsert.meaning,
        ifLearned: false
    }

    console.log(newInsert);

    var count = await ifWordExists(newInsert.word).then(ans => {
        return ans;
    })

    // checks if a word already exists
    if (count > 0) {
        mainWindow.webContents.send('alreadyExist');
        return;
    }

    // checks if the fileds are not empty
    if (newWordInsert.word != '' && newWordInsert.meaning != '') {
        //insert method from db module
        await addWord(newInsert);
        console.log('Inserted!!!');
        // If spacific button was clicked - it redirects to the chooseGame page
        if (pagePath !== '') mainWindow.loadURL(url.format({
            pathname: path.join(__dirname, pagePath),
            protocol: 'file:',
            slashes: true
        }))
    }
    //Checks if the exit button is clicked
    if (ifExit == true) app.quit();
    mainWindow.webContents.send('notIserted');
})

// delete words - gets an array of words, not just one word!
ipcMain.on('deleteWords', async function (wordsArr) {
    await deleteWords(wordsArr);
})



//* ===>>> test function -> works on delete button click <<<===
//* ===>>> test function -> works on delete button click <<<===
//* ===>>> test function -> works on delete button click <<<===


ipcMain.on('test', async function (e) {
    console.log("main");
    await ifDeleteGameWord('b').then((ans) => {
        console.log(ans);
    });

})


//* ===>>> test function -> works on delete button click <<<===
//* ===>>> test function -> works on delete button click <<<===
//* ===>>> test function -> works on delete button click <<<===

// This is just an array that will repesent the main Menu Sometime we don't want
// to use the main Menu so we can build one as we like or remove it
const mainMenuTemplate = [{
    label: 'file',
    submenu: [{
        label: 'Add Item',
        click() {
            creatAddWindow();
        }
    }, {
        label: 'Clear Item',
        click() {
            mainWindow.webContents.send('item:clear');
        }
    }, {
        label: 'Quit',
        // the accelerator checks the OS of the comuter (process.platform checks the
        // current OS, you can run this comman on node) darwin is the name that will
        // pop-up if we using MAC-OS then relating to the OS, we choose which keys to
        // click to close the app window
        accelerator: process.platform == 'darwin' ?
            'Command+Q' : 'Ctrl+Q',
        click() {
            app.quit();
        }

    }]
}]

// If mac, add empty object to menu On a mac, when we open a new window, insted
// of the word file in the beginning of the menu, it supposed to be the word
// electron by defult to fix this we check if we on a mac by using
// proccess.platform... and if we on mac, we just adding an ampty object to the
// beginning of the menu using the unshift method the unshift method adds an
// object to the beginning of an array
if (process.platform == 'darwin') {
    mainMenuTemplate.unshift({});
}

//Add a developer tools item if not in prod
if (process.env.NODE_ENV !== 'production') {
    mainMenuTemplate.push({
        label: 'Developer Tools',
        submenu: [{
            label: 'Toggle DevTools',
            accelerator: process.platform == 'darwin' ?
                'Command+I' : 'Ctrl+I',
            click(item, focusedwindow) {
                focusedwindow.toggleDevTools();
            }
        }, {
            role: 'reload'
        }]
    })
}