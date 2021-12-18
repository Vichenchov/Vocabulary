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
    countUnlearned,
    countLearned,
    countGame,
    deleteWordsFromGame,
    getXwordsFromWords,
    getXwordsFromGame,
    differ,
    killUnplayed,
    getXwordsFromUnplayed,
    getAllWords,
    getLearned,
    getUnlearned,
    countUnplayed,
    addWordToGame,
    deleteFromGameDb
} = require('./db');
const _ = require('lodash');
const {
    formatWord
} = require('./extensions');
var AutoLaunch = require('auto-launch');
require('electron-reload')(__dirname);

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
// has the value of the current amount of words in the game db - 1,2,3 are real amount -> if 4 it can be 4 words or more
var amountInGameWords;

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
    killGameInstance();
    killUnplayed();

    // Quit app when closed - closes all windows
    mainWindow.on('closed', async function (e) {
        await killGameInstance();
        await killUnplayed();
        app.quit();


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

})



//* ===>>> test function -> works on delete button click <<<===
//* ===>>> test function -> works on delete button click <<<===cd
//* ===>>> test function -> works on delete button click <<<===






// Practice main function + runs when select buttons clicked (didn't create yet...)
ipcMain.on('practice', function () {

    // shuffleWords() => פעולה שבוחרת 4 מילים מהדי בי משחק ומחזירה אותן
    // מהלך המחשק - מת וך הפעולה הזו תבחר מילה אחת מהדי בי משחק
    // את המילה הזו אנחנו נראה המילה שצריך לענות עלייה - אבל נראה גם את המילה וגם את הפירוש - אחד מהם בשאלה ואחת בתשובות
    // ואת שאר התשובות נבחר רנדומאלית מ3 המילים האחרות שקיבלנו !!! - לשים לב שהפעולה שמחזירה את 4 המילים מחזירה את האובייקט של המילה ולא רק את המילה 
    // בנוסף לשים לב שהמילה שמנחשים היא אחת המילים שהגיעו מהדי בי משחק - לעשות פשוט ראנדום לאחת המילים שקיבלנו מהדי בי משחק

    // להוסיף פעולה שמציגה את ה4 מילים בעמוד המשחק - להשתמש במה שרשמתי כדי להציג את הטבלאות


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


// =============================================================================================

// save word in game db if the clicked the spacific check box on wordsSelection window
ipcMain.on('saveInGameDb', async function (e, word) {
    await addWordToGame(word);
})

// delete word in game db if the clicked the spacific check box on wordsSelection window
ipcMain.on('remvoeFromGameDb', async function (e, word) {
    await deleteWordsFromGame([word]);
})

// get the selected words from wordsSelection window and create the practice with thoes words
ipcMain.on('practiceSelected', async (e, words) => {
    displayWords();
})

// move unlearned word to game db and nevigate to the game page
ipcMain.on('unLearned', async function () {
    if (await ifContaintUnlearned()) {
        await moveUnlearnedWords().then(() => {
            shuffleWords().then(() => {
                mainWindow.loadURL(url.format({
                    pathname: path.join(__dirname, 'Views/gameWindow.html'),
                    protocol: 'file:',
                    slashes: true
                }))
            });
        });
    } else {
        mainWindow.webContents.send('noUnlearned');
    }
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
                //Shows a message to the user about the amount of words he iserted
                mainWindow.webContents.send('data', newAmount);
                return;
            } else {
                // creats an instance of words for the current practice
                await randomWords(newAmount);
                mainWindow.once('ready-to-show', () => showPracticeAmount());
                shuffleWords();
            }
            break;
        case 'Views/stats.html':
            mainWindow.once('ready-to-show', () => showCount());
            break;
        case 'Views/deleteWords.html':
            var words = await getAllWords().then((res) => {
                return res;
            });
            mainWindow.once('ready-to-show', () => loadWords(words));
            break;
        case 'Views/wordsSelection.html':
            var words = await getAllWords().then((res) => {
                return res;
            });
            mainWindow.once('ready-to-show', () => loadWords(words));
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


// delete words from game db (gets an array of words to delete)
ipcMain.on('deleteWords', async (e, words) => {
    await deleteWords(words);
    mainWindow.webContents.send('wordsDeleted');
})


// load words by categorys in stats window
ipcMain.on('showStatsTables', async (e, data) => {
    switch (data) {
        case 'all':
            var words = await getAllWords().then((res) => {
                return res;
            }).catch((err) => {
                console.log(err);
            });
            break;
        case 'learned':
            var words = await getLearned().then((res) => {
                return res;
            }).catch((err) => {
                console.log(err);
            });
            break;
        case 'unlearned':
            var words = await getUnlearned().then((res) => {
                return res;
            }).catch((err) => {
                console.log(err);
            });
            break;
        default:
            break;
    }
    console.log(words);
    creatWindow();
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'Views/showDataTables.html'),
        protocol: 'file:',
        slashes: true
    }));
    mainWindow.once('ready-to-show', () => loadWords(words));
})

// display words in the current practice
async function displayWords() {
    // get 4 words (4 objects) that one of theme is the une that the user need to know and the rest are the answer
    var words = await shuffleWords().then((res) => {
        return res;
    });
    // pick a random number from the game db that the user need to answer in the current turn
    var randomNum = await getWordForPractice(words).then((res) =>{
        return res;
    });
    //! עכשיו צריך שגם המילה הרנדומאלי תעבור לעמוד המשחק ותוצג במילה המרכזית
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'Views/gameWindow.html'),
        protocol: 'file:',
        slashes: true
    }));
    mainWindow.once('ready-to-show', () => showPracticeAmount().then(() => {
        loadWords(words);
    }));
}

// get 4 words objects (current options) -> return one word (object) that will be the main word that the user need to answer
async function getWordForPractice(words) {
    var wordsArray = [];
    // get only the words from the game db - the other words are from words db and they should show only as answers
    for (let i = 0; i < amountInGameWords; i++) {
        wordsArray.push(words[i]);
    }
    const rand = Math.floor(Math.random() * amountInGameWords);
    var randomWord = wordsArray[rand];
    return randomWord;
}



// getting random words to show while practicing - always return an array with 4 words obj
async function shuffleWords() {
    var count = await countGame().then((res) => {
        return res;
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
            var wordsFromWords = await getXwordsFromWords(1, wordsFromGame).then((res) => {
                return res;
            });
            amountInGameWords = 3;
            return wordsFromGame.concat(wordsFromWords);
        case 2:
            var wordsFromGame = await getXwordsFromGame(2).then((res) => {
                return res;
            });
            var wordsFromWords = await getXwordsFromWords(2, wordsFromGame).then((res) => {
                return res;
            });
            amountInGameWords = 2;
            return wordsFromGame.concat(wordsFromWords);

        case 1:
            var wordsFromGame = await getXwordsFromGame(1).then((res) => {
                return res;
            });
            var wordsFromWords = await getXwordsFromWords(3, wordsFromGame).then((res) => {
                return res;
            });
            amountInGameWords = 1;
            return wordsFromGame.concat(wordsFromWords);

        default:
            var wordsFromGame = await getXwordsFromGame(4).then((res) => {
                amountInGameWords = 4;
                return res;
            })
            return wordsFromGame;
    }
}

// // ! ????????????????????????????????????????????????????????????????????????
// //check that we won't get the same words from the game db and the Unplayed db 
// //so the answers always won't be the same
// async function differWords(game, words) {
//     for (let i = 0; i < game.length; i++) {
//         const wordFromGame = game[i];
//         for (let y = 0; y < words.length; y++) {
//             const wordFromWords = words[y];
//             if (wordFromGame.word == wordFromWords.word) {
//                 words.shift(wordFromWords);
//                 await getXwordsFromGame(1).then((newWord) => {
//                     words.push(newWord[0]);
//                     y--;
//                 });
//             }
//         }
//     }
//     return game.concat(words);
// }

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

// !=================================================================================
// !=================================================================================
// !=================================================================================
// !=================================================================================

// מציג את המידע של המילים בעמוד מחיקת מילים
// לקחת את זה ולכתוב פעולה אחת שמציגה את המילים בכל העמודים שצריך את זה
// ואז לכתוב סיכום לפעולה
async function loadWords(words) {
    for (let i = 0; i < words.length; i++) {
        var word = words[i].word;
        var meaning = words[i].meaning;
        mainWindow.webContents.send('loadWords', word, meaning, i + 1);
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

// shows the amount of words,unlearnd words and learned words in the db in mainWindow
async function showCount() {
    count = await countWords().then(count => {
        console.log(count);
        return count;
    })
    unlearned = await countUnlearned().then(count => {
        console.log(count);

        return count;
    })
    learned = await countLearned().then(count => {
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