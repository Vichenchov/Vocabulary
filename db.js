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
    ifLearned: Boolean
});

//creart gaem instance schema
const gameSchema = new mongoose.Schema({
    word: String,
    meaning: String,
    result: {
        EtH: Number,
        HtE: Number,
        writing: Boolean
    }

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

//gets an array of words and delete it from the words db
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

//gets an array of words and delete it from the games db
module.exports.deleteWordsFromGame = async function (wordsToDelete) {
    console.log(wordsToDelete);
    await wordsToDelete.forEach(word => {
        Game.deleteOne({
            word: word
        }).then(
            console.log(word + " deleted succesfuly!")
        ).catch((err) => {
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

// gets a number and moves that amount of words from the words repo to game collection
async function moveWordsToGame(amountOfWords) {
    existingNumbers = [];
    for (let i = amountOfWords; i > 0; i--) {
        //pick a random number and then add the document on that place to the game db
        const rand = Math.floor(Math.random() * amountOfWords);
        // if num alrady used we want to skip it so we won't practice the same words
        if (existingNumbers.includes(rand) == false) {
            console.log("true");
            const randomDoc = await Word.findOne().skip(rand);
            // generates an game db obj
            const gameObj = ({
                word: randomDoc.word,
                meaning: randomDoc.meaning,
                result: {
                    EtH: 2,
                    HtE: 2,
                    writing: false
                }

            })
            console.log("==========" + i);
            // pushe all used numbers to an array so we can check later if we alrady used that number
            existingNumbers.push(rand);
            Game.create(gameObj);
        } else {
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

//checks if EtH - if English to Hebrew answer is correct
// gets a word and a boolean if the user answerd correctly
// if yes - EtH of the word -- else EtH ++
// EtH can't be more then 2
module.exports.checkEtH = async function (word, ifCorrect) {
    const obj = await Game.findOne({
        word: word
    });
    var currentCount = obj.result.EtH;
    // checks if the answer is correct - if true -- else ++ EtH field
    ifCorrect ? currentCount -= 1 : currentCount += 1;
    // EtH can't be more then 2 ans less then zero - my game rules
    if (currentCount > 2) currentCount--;
    if (currentCount < 0) currentCount++;
    // updates the filed
    await Game.updateOne({
        word: word
    }, {
        'result.EtH': currentCount
    });
}

//checks if HtE - if Hebrew to English answer is correct
// gets a word and a boolean if the user answerd correctly
// if yes - EtH of the word -- else HtE ++
// EtH can't be more then 2
module.exports.checkHtE = async function (word, ifCorrect) {
    const obj = await Game.findOne({
        word: word
    });
    var currentCount = obj.result.HtE;
    // checks if the answer is correct - if true -- else ++ HtE field
    ifCorrect ? currentCount -= 1 : currentCount += 1;
    // HtE can't be more then 2 ans less then zero - my game rules
    if (currentCount > 2) currentCount--;
    if (currentCount < 0) currentCount++;
    // updates the filed
    await Game.updateOne({
        word: word
    }, {
        'result.HtE': currentCount
    });
}

// checks if a word already exists in the db
module.exports.ifWordExists = async function (word) {
    var count = await Word.countDocuments({
        word: word
    }).then((count) => {
        return count;
    }).catch(function err(err) {
        console.log(err);
    });
    return count;
}

// checks if the word learned by the user and we can delete it form the game db
// also change the ifLearned filed of the word that learned in the words db to true
module.exports.ifDeleteGameWord = async function (word) {
    const obj = await Game.findOne({
        word: word
    });
    var EtH = obj.result.EtH;
    var HtE = obj.result.HtE;
    var writing = obj.result.writing;
    // if all the fileds == 0 I assume that the user learned the word and we can delete it so the user won't need to continue practice it
    if (EtH == 0 && HtE == 0 && writing == true) {
        var arr = [word];
        exports.deleteWordsFromGame(arr);
        // change the ifLearned filed to true
        await Word.updateOne({
            word: word
        }, {
            ifLearned: true
        });
    }
}

// checks if the Game db is Empty - checkes if the user learned all the words in the current practice
module.exports.ifGameDbIsEmpty = async function () {
    var ans = await Game.count().then((count) => {
        if (count == 0) {
            return true;
        } else {
            return false;
        }
    });
    console.log(ans);
    return ans;
}

//checks if the user wrote the word correctly - if he is, the writing filed == true
// gets two params: 
//wordMeaning => the words meaning the I use to find the word obj in the db
// writing => what the user typed
module.exports.checkWriting = async function (wordMeaning, writing) {
    const obj = await Game.findOne({
        meaning: wordMeaning
    });
    console.log(obj);
    var word = obj.word;
    console.log(word);
    if (word == writing) {
        await Game.updateOne({
            meaning: wordMeaning
        }, {
            'result.writing': true
        }).catch((err)=>{
            console.log(err);
        });
    }
}


// שמעבריה את כל המילים שלא נלמדו - בעצם שהערך שלהם פאלס לדי בי משחק + אפשרןץ של בחירה זו בעמוד בחירת משחק
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
// להוסיף API של תמונות שמביא איזושהי תמונה שקשורה למילה שהמשתמש צריך ללמוד + אתגר נוסף הוא לחשוב על לשמור על התמונה מקומית ולגשת אליה במידה ומגיעה שוב ואפשרות למחוק את כל התמונות במידה ושומר יותר מדיי מקןם