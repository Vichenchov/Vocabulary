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
    checkWriting,
    moveUnlearnedWords,
    ifContaintUnlearned,
    gameInstanceFromChoosenWords,
    countWords,
    getUnlearned,
    getLearned,
    countGame,
    deleteWordsFromGame,
    getXwordsFromWords,
    getXwordsFromGame,
    differ,
    killUnplayed,
    getXwordsFromUnplayed,
    getAllWords
} = require('./db');
require('electron-reload')(__dirname);
const _ = require('lodash');
const {
    formatWord
} = require('./extensions');
var AutoLaunch = require('auto-launch');
const {
    mean
} = require('lodash');



//objects that we pass in form electron that we can use it on this page
const {
    app,
    BrowserWindow,
    Menu,
    ipcMain,
    globalShortcut
} = electron;
//SET ENV - PROD - this line setes the project as ready to production and by that removes the DevTools from the Menu bar
// process.env.NODE_ENV = 'production';


let mainWindow;

// app.whenReady().then(() => {
//     globalShortcut.register('CommandOrControl+X', () => {
//         creatWindow();
//         mainWindow.loadURL(url.format({
//             pathname: path.join(__dirname, 'Views/addWindow.html'),
//             protocol: 'file:',
//             slashes: true
//         }))
//     })
//   })


function creatWindow() {
    mainWindow = new BrowserWindow({
        // idk what webPreferences do but it make it work so I need to add it to any new
        // page
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true

        }
    });
}

//Listen to app to bee ready
app.on('ready', function () {
    creatWindow();

    // Load html into window
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'Views/mainWindow.html'),
        protocol: 'file:',
        slashes: true
        // explaination of the code: Just building in a funcy way the path to page that
        // we want it to go to the path is: 'file://dirname/Views/mainWindow.html'
    }))

    // show amount of words in the db when mainWindow loaded
    mainWindow.once('ready-to-show', () => showCount())


    // Quit app when closed - closes all windows
    mainWindow.on('closed', async function (e) {
        await killUnplayed();
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

//* ===>>> test function -> works on delete button click <<<===
//* ===>>> test function -> works on delete button click <<<===
//* ===>>> test function -> works on delete button click <<<===


ipcMain.on('test', async function (e) {
    await loadWordsToChooswWords();
    // var ans = await shuffleWords().then((res) => {
    //     return res;
    // });
    // console.log(ans);

})


//* ===>>> test function -> works on delete button click <<<===
//* ===>>> test function -> works on delete button click <<<===cd
//* ===>>> test function -> works on delete button click <<<===

// Practice main function + runs when select buttons clicked (didn't create yet...)
ipcMain.on('practice', function () {

    // shuffleWords() => פעולה שבוחרת 4 מילים מהדי בי משחק ומחזירה אותן
    //  מהלך המחשק - מתוך הפעולה הזו תבחר מילה אחת מהדי בי משחק - המשך שורה למטה
    // את המילה הזו אנחנו נראה המילה שצריך לענות עלייה - אבל נראה גם את המילה וגם את הפירוש - אחד מהם בשאלה ואחת בתשובות - המשך שורה למטה
    // ואת שאר התשובות נבחר רנדומאלית מ3 המילים האחרות שקיבלנו !!! - לשים לב שהפעולה שמחזירה את 4 המילים מחזירה את האובייקט של המילה ולא רק את המילה 
    // בנוסף לשים לב שהמילה שמנחשים היא אחת המילים שהגיעו מהדי בי משחק - לעשות פשוט ראנדום לאחת המילים שקיבלנו מהדי בי משחק


    // * הפעולה מתחת גורמת לכך שמספר המילים בדי בי משחק יתעדכן
    // * חשוב שיהיה את טעינת העמוד אחרי הקריאה לפעולה שמביאה את כמות המילים 
    // * חשוב שכל זה יבוא אחרי שמחקו/הוסיפו מילה מהדי בי משחק
    // mainWindow.once('ready-to-show', () => showPracticeAmount());
    // mainWindow.loadURL(url.format({
    //     pathname: path.join(__dirname, 'Views/gameWindow.html'),
    //     protocol: 'file:',
    //     slashes: true
    // }))

})

// getting random words to show while practicing - always return an array with 4 words obj
async function shuffleWords() {
    // gets the amount of words in the game db
    var count = await countGame().then((amount) => {
        return amount;
    })
    // I relay on the amount of words in the game db, the amount of words in the corrent practice
    // if there's 4 or more, return all of theme, one for learning + the same one + 3 more for the answers
    // if there's 3, return all of theme and one more from the word db, one for learning + and the same one + 2 from db game + one from words game for the answers
    // ...
    // if i won't do this, when there's less then 4 words, I'll get only 3 answers or less, so I'm "getting help" from the words db
    switch (count) {
        case 3:
            var wordsFromGame = await getXwordsFromGame(3).then((res) => {
                return res;
            });
            var wordsFromWords = await getXwordsFromUnplayed(1).then((res) => {
                return res;
            });
            var results = await differWords(wordsFromGame, wordsFromWords).then((res) => {
                return res;
            }).catch(() => {
                return wordsFromGame.concat(wordsFromWords);
            })
            return results;
            break;

        case 2:
            var wordsFromGame = await getXwordsFromGame(2).then((res) => {
                return res;
            });
            var wordsFromWords = await getXwordsFromUnplayed(2).then((res) => {
                return res;
            });
            var results = await differWords(wordsFromGame, wordsFromWords).then((res) => {
                    return res;
                })
                .catch(() => {
                    return wordsFromGame.concat(wordsFromWords);
                })
            return results;
            break;

        case 1:
            var wordsFromGame = await getXwordsFromGame(1).then((res) => {
                return res;
            });
            var wordsFromWords = await getXwordsFromUnplayed(3).then((res) => {
                return res;
            });
            var results = await differWords(wordsFromGame, wordsFromWords).then((res) => {
                return res;
            }).catch(() => {
                return wordsFromGame.concat(wordsFromWords);
            })
            return results;
            break;

        default:
            var wordsFromGame = await getXwordsFromGame(4).then((res) => {
                return res;
            })
            return wordsFromGame;
            break;
    }
}

//check that we won't get the same words from the game db and the Unplayed db 
//so the answers always won't be the same
async function differWords(game, words) {
    for (let i = 0; i < game.length; i++) {
        const wordFromGame = game[i];
        for (let y = 0; y < words.length; y++) {
            const wordFromWords = words[y];
            if (wordFromGame.word == wordFromWords.word) {
                words.shift(wordFromWords);
                await getXwordsFromGame(1).then((newWord) => {
                    words.push(newWord[0]);
                    y--;
                });
            }
        }
    }
    return game.concat(words);
}

ipcMain.on('goBack', async function () {
    await killUnplayed().then(() => {
        killGameInstance();
    });
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'Views/chooseGame.html'),
        protocol: 'file:',
        slashes: true
    }))
})


//Exit game when exit buttons clicked 
ipcMain.on('exit', async function (e) {
    await killUnplayed();
    // empty the game db
    killGameInstance().then(() => {
        app.quit();
    });

})

//Gose to any window - the function gets the specific path and change the window to specific html page (not opens a new window!)
//if goes to the game page after
ipcMain.on('goToPage', async function (e, pagePath, amount) {
    switch (pagePath) {
        case 'Views/gameWindow.html':
            // gets the number of words for the current practice 
            var newAmount = await pickAmount(amount).then(value => {
                return value;
            });
            // If the user inserted amount that bigger then the amount of words in the db...
            if (newAmount < amount || newAmount == 0) {
                //Shows a message to the user about the amount of words he isertedcd
                mainWindow.webContents.send('data', newAmount);
                return;
            } else {
                // creats an instance of words for the current practice
                await randomWords(newAmount);
                mainWindow.once('ready-to-show', () => showPracticeAmount());
            }
            break;
        case 'Views/stats.html':
            mainWindow.once('ready-to-show', () => showCount());
            break;
            case 'Views/deleteWords.html':
                mainWindow.once('ready-to-show', () => loadWordsToDeleteWords());
                break;
            case 'Views/wordsSelection.html':
                mainWindow.once('ready-to-show', () => loadWordsToDeleteWords());
                break;
        default:
            break;
    }

    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, pagePath),
        protocol: 'file:',
        slashes: true
    }))
})

// !=================================================================================
// !=================================================================================
// !=================================================================================
// !=================================================================================

// מציג את המידע של המילים בעמוד מחיקת מילים
// לקחת את זה ולכתוב פעולה אחת שמציגה את המילים בכל העמודים שצריך את זה
// ואז לכתוב סיכום לפעולה
async function loadWordsToDeleteWords() {
    var words = await getAllWords().then((res) => {
        return res;
    });

    console.log(words);
    for (let i = 0; i < words.length; i++) {
        var word = words[i].word;
        var meaning = words[i].meaning;
        console.log(word);
        console.log(meaning);
        console.log(i+1);
        mainWindow.webContents.send('loadWords', word, meaning, i+1);
    }
}

// !=================================================================================
// !=================================================================================
// !=================================================================================
// !=================================================================================


// displays the amount of words in the current practice => current amount of words in the game db
async function showPracticeAmount(params) {
    var count = await countGame().then((res) => {
        return res;
    });
    console.log(count + " words in game db...");
    mainWindow.webContents.send('currentPracticeCount', count);
}

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
        word: formatWord(newWordInsert.word),
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
    if (ifExit == true) {
        await killUnplayed();
        // empty the game db and quit app
        killGameInstance().then(() => {
            app.quit();
        })
    }
    mainWindow.webContents.send('notIserted');
})

// delete words - gets an array of words, not just one word!
ipcMain.on('deleteWords', async function (wordsArr) {
    await deleteWords(wordsArr);
})

// move unlearned word to game db and nevigate to the game page
ipcMain.on('unLearned', async function () {
    if (await ifContaintUnlearned()) {
        await moveUnlearnedWords().then(() => {
            mainWindow.loadURL(url.format({
                pathname: path.join(__dirname, 'Views/gameWindow.html'),
                protocol: 'file:',
                slashes: true
            }))
        });
    } else {
        mainWindow.webContents.send('noUnlearned');
    }
})

// shows the amount of words,unlearnd words and learned words in the db in mainWindow
async function showCount() {
    count = await countWords().then(count => {
        console.log(count);
        return count;
    })
    unlearned = await getUnlearned().then(count => {
        console.log(count);

        return count;
    })
    learned = await getLearned().then(count => {
        console.log(count);

        return count;
    })

    mainWindow.webContents.send('countWords', count);
    mainWindow.webContents.send('countLearned', learned);
    mainWindow.webContents.send('countUnlearned', unlearned);
}

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