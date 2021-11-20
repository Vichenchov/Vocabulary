const mongodb = require('mongodb');
const mongoose = require('mongoose');
const {
    MongoClient,
    Db
} = require("mongodb");
const _ = require('lodash');

main().catch(err => console.log(err));

//db connection
async function main() {
    await mongoose.connect('mongodb://localhost:27017/wordsDB');
}

//creat words schema
const wordsSchema = new mongoose.Schema({
    word: String,
    meaning: String,
    ifLearnd: Boolean
});

//creart gaem instance schema
const gameSchema = new mongoose.Schema({
    word: String,
    meaning: String,
    result: [{
        EtH: Number,
        HtE: Number,
        writing: Boolean
    }]

});

//creats collection
const Word = mongoose.model("Word", wordsSchema);
const Game = mongoose.model("Game", gameSchema);

//================================================================================

//DB functions...


//adds new word to the words collection
module.exports.addWord = async function (word) {
    await Word.create(word, function (err) {
        if (err) console.log(err);
    });
}

//gets an array of words and delete it from the db
module.exports.deleteWords = async function (wordsToDelete) {
    console.log(wordsToDelete);
    await wordsToDelete.forEach(word => {
        Word.deleteOne({
            word: word
        }).then(
            console.log(word + " deleted succesfuly!")
        ).catch(function err(err) {
            console.log(err);
        })
    });
}

//gets a number that represent the amount of words the user want to learn at a current game
// then randomly pick some words from the wordsRepo and adding theme to the game db
// creats an instance for a game
module.exports.randomWords = async function (amountOfWords) {
    var ans = await exports.ifEnoughWords(amountOfWords);
    if (ans.result == false) amountOfWords = ans.numOfWordsInDb;
    await moveWordsToGame(amountOfWords);
}

// checks if there's enought words in the db as the user inserted
module.exports.ifEnoughWords = async function (numOfWords) {
    let ifEnough = true;
    const count = await Word.count();
    // if there's less words in the db then the user inserted, ifEnough = false
    if (count < numOfWords) ifEnough = false;
    // returns an obj with the answer and the amount of words in the db 
    var answer = {
        result: ifEnough,
        numOfWordsInDb: count
    };
    return answer;
}

// gets a numbe and move that amount of words from the words repo to game collection
async function moveWordsToGame(amountOfWords) {
    existingNumbers = [];
    for (let i = amountOfWords; i > 0; i--) {
        //pick a random number and then add the document on that place to the game db
        const rand = Math.floor(Math.random() * amountOfWords);
        // if num alrady used we want to skip it so we won't practice the same words
        if(existingNumbers.includes(rand) == false){
            console.log("true");
            const randomDoc = await Word.findOne().skip(rand);
            // generates an game db obj
            const gameObj = ({
                word: randomDoc.word,
                meaning: randomDoc.meaning,
                result: [{
                    EtH: 2,
                    HtE: 2,
                    writing: false
                }]
    
            })
            console.log("==========" + i);
            // pushe all used numbers to an array so we can check later if we alrady used that number
            existingNumbers.push(rand);
            Game.create(gameObj);
        }else{
            console.log("false");
            i++;
        }

    }

}

// empty game collection
module.exports.killGameInstance = async function () {
    await Game.count().then(count => {
        Game.deleteMany({}, () => {
            console.log('deleted ' + count + ' items');
        });
    });

}

//checks if EtH 
// gets the word and and bool if the user answerd correctly
// if yes - EtH of the word -- else EtH ++
// EyH can't be more then 2
module.exports.checkEtH = async function (word, ifCorrect) {
    Game.findOne({
        word: word
    }, (obj) => {
        console.log(obj);
        // לבדוק איך אני מפרק את האובייקט כך שאוכך לגשת ל HtE
        var currentCount = obj[3].EtH;
        ifCorrect ? currentCount -= 1 : currentCount += 1;
        console.log(currentCount);
    }).then((currentCount) => {
        Game.updateOne({
            word: word
        }, {
            EtH: currentCount
        }).catch(() => {
            console.log(err);
        })
    })
}
// כשהפעולה הזו תעבוד - להעתיק אותה ולסדר אותה ל EtH
//אחרי זה פעולה שבודקת ששלושת השדות באמת שווים ל 0 0 ופאלס - > ואז היא מוחקת את המילה מהאינסטנס
// אחרי זה פעולה שבודקת אם הכתיבה באנגלית נכונה - אם לא אז לא יקרה כלום והוא יצטרך לחזור עד שיצליח
// אחרי זה לשנות את הקולקשן של וורדס ככה שברגע שיש מילה שנלמדה יהיה שדה בוליאני טרו שישאר ככה כל הזמן -> ולהוסיף את הפעולה בסוף מחיקה של מילה מהאינסטס משחק
//מילה שמעבריה את כל המילים שלא נלמדה - בעצם שהערך שלהם פאלס לדי בי משחק
//להוסיף בחירה של השחקן ללמוד את כל המילים שעוד לא נלמדו וללמוד אותם בסבב תרגול בעזרת הפעולה מעל
// פעולה שמקבלת מערך של מילים ספצפיות שהשחק הולך לסמן ותכניס אותן לאינסטנס גיים שיוכל לתרגל רק אותן
// להציג את המספר מילים שקיימים ברגע זה בדי בי - בעמוד הראשי - יהיו תחת כותרת סטאטס
// להציג את המילים שנלמדו שנמצאים כרגע בדי בי - בעמוד הראשי - יהיו תחת כותרת סטאטס
// להוסיף שבמהלך המשחק יהיה רשום כמה מילים נלמדות - כל פעם שמילה נלמדת אז ירד באחד - פשוט למחוק אותה מהדי בי גיים - אם יש טעות אחת אז הוספה של תרגול חוזר למילה
//להכין עמוד שמסביר איך המשחק עובד באנגלית 
// להוסיף עמוד סטאטס שיציג את כמות המילים שנלמדו כבר + כפתור שפותח חלונית עם המילים, כמות המילים שעוד לא נלמדו+ כפתור שפותח חלונית עם המילים, כמות המילים במאגר + כפתור שפותח חלונית עם המילים,
// פעולה שתגדיר לחצנים במקלדת כדי לפתוח לבד את החלונית של הוספת מילה
// פעולה שבוחרת 4 מילים מהדי בי משחק ומחזירה אותן
// פעולה שבוחרת מילה אחת מה דיבי משחק ומחזירה אותה בשביל הבדיקה של הכתיבה
//להכין עמוד של מחיקת מילים - טבלה של כל המילים שיהיה אפשר לסמן כל אחת או לפלטר בחיפוש ואז למחוק - מחיקה יש כבר פעולה
// לחשוב איך אני רנדומלית מציג את העמוד כתיבה במשחק 

