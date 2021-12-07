const mongodb = require('mongodb');
const mongoose = require('mongoose');
const {
    MongoClient,
    Db
} = require("mongodb");
const _ = require('lodash');
const {capitalizeFirstLetter} = require('./extensions');
const { words, xor } = require('lodash');

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

//creat non-game words schema
const unPlayedWords = new mongoose.Schema({
    word: String,
    meaning: String
});

//creart gaem instance schema
const gameSchema = new mongoose.Schema({
    word: String,
    meaning: String,
    result: {
        English: Number,
        Hebrew: Number,
        writing: Boolean
    }

});

//creats collection
const Word = mongoose.model("Word", wordsSchema);
const Game = mongoose.model("Game", gameSchema);
const Unplayed = mongoose.model("Unplayed",unPlayedWords);

// add this to the db when finish the project so this words will appear in any first start  
// const wordOne = new Word({
//     word: 'Dog',
//     meaning: 'כלב',
//     ifLearned: false
// })
// const wordTwo = new Word({
//     word: 'Cat',
//     meaning: 'חתול',
//     ifLearned: false
// })
// const wordThree = new Word({
//     word: 'Water',
//     meaning: 'מים',
//     ifLearned: false
// })

// wordOne.save();
// wordTwo.save();
// wordThree.save();


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
    const count = await exports.countWords();
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
            const randomDoc = await Word.findOne().skip(rand);
            // generates an game db obj
            const gameObj = ({
                word: randomDoc.word,
                meaning: randomDoc.meaning,
                result: {
                    English: 2,
                    Hebrew: 2,
                    writing: false
                }

            })
            console.log("==========" + i);
            // pushe all used numbers to an array so we can check later if we alrady used that number
            existingNumbers.push(rand);
            Game.create(gameObj);
        } else {
            i++;
        }
    }
    await exports.differ();
}

// empty game collection
module.exports.killGameInstance = async function () {
    await exports.countGame().then(count => {
        Game.deleteMany({}, () => {
            console.log('deleted ' + count + ' items');
        })
    });
}

// delelte all words form Unplayed db
module.exports.killUnplayed = async function () {
    await Unplayed.deleteMany({});
}

//checks if English - if English to Hebrew answer is correct
// gets a word and a boolean if the user answerd correctly
// if yes - English of the word -- else English ++
// English can't be more then 2
module.exports.checkEnglish = async function (word, ifCorrect) {
    const obj = await Game.findOne({
        word: word
    });
    var currentCount = obj.result.English;
    // checks if the answer is correct - if true -- else ++ English field
    ifCorrect ? currentCount -= 1 : currentCount += 1;
    // English can't be more then 2 ans less then zero - my game rules
    if (currentCount > 2) currentCount--;
    if (currentCount < 0) currentCount++;
    // updates the filed
    await Game.updateOne({
        word: word
    }, {
        'result.English': currentCount
    });
}

//checks if Hebrew - if Hebrew to English answer is correct
// gets a word and a boolean if the user answerd correctly
// if yes - English of the word -- else Hebrew ++
// English can't be more then 2
module.exports.checkHebrew = async function (word, ifCorrect) {
    const obj = await Game.findOne({
        word: word
    });
    var currentCount = obj.result.Hebrew;
    // checks if the answer is correct - if true -- else ++ Hebrew field
    ifCorrect ? currentCount -= 1 : currentCount += 1;
    // Hebrew can't be more then 2 ans less then zero - my game rules
    if (currentCount > 2) currentCount--;
    if (currentCount < 0) currentCount++;
    // updates the filed
    await Game.updateOne({
        word: word
    }, {
        'result.Hebrew': currentCount
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
    var English = obj.result.English;
    var Hebrew = obj.result.Hebrew;
    var writing = obj.result.writing;
    // if all the fileds == 0 I assume that the user learned the word and we can delete it so the user won't need to continue practice it
    if (English == 0 && Hebrew == 0 && writing == true) {
        var arr = [word];
        exports.deleteWordsFromGame(arr);
        // change the ifLearned filed to true
        await Word.updateOne({
            word: word
        }, {
            ifLearned: true
        });
        await Unplayed.deleteOne({word: word});
    }
}

// checks if the Game db is Empty - checkes if the user learned all the words in the current practice
module.exports.ifGameDbIsEmpty = async function () {
    var ans = await exports.countGame().then((count) => {
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
//wordMeaning => the words meaning that I use to find the word obj in the db
// writing => what the user typed
module.exports.checkWriting = async function (wordMeaning, writing) {
    const obj = await Game.findOne({
        meaning: wordMeaning
    });
    console.log(obj);
    var word = obj.word;
    console.log(word);
    if (word == capitalizeFirstLetter(writing)) {
        await Game.updateOne({
            meaning: wordMeaning
        }, {
            'result.writing': true
        }).catch((err)=>{
            console.log(err);
        });
    }
}

//find all unlearned word from words db and moves theme to the game db
module.exports.moveUnlearnedWords = async function () {
    await Word.find({'ifLearned': false}).then((ans => {
        // creating an obj that fits the game db
        ans.forEach(obj =>{
            const gameObj = ({
                word: obj.word,
                meaning: obj.meaning,
                result: {
                    English: 2,
                    Hebrew: 2,
                    writing: false
                }
            })
            Game.create(gameObj);
        })
    }));
    await exports.differ();
}

// checks if word db has unlearn words
module.exports.ifContaintUnlearned = async function () {
    bool = await Word.count({ifLearned: false}).then((count) =>{
        if(count > 0)return true;
        return false;
    })
    return bool;
}

// gets an array of words and move them from word db to game db
module.exports.gameInstanceFromChoosenWords = async function (wordsArray) {
    console.log(wordsArray);
    await wordsArray.forEach(word => {
         Word.findOne({word: word}).then((obj) =>{
            console.log(obj);
            const gameObj = ({
                word: obj.word,
                meaning: obj.meaning,
                result: {
                    English: 2,
                    Hebrew: 2,
                    writing: false
                }
            })
            Game.create(gameObj);
        })
    })
    await exports.differ();
}

// count words in the game db
module.exports.countGame = async function () {
    console.log("hiiiiiiiiiiiiiii");
    var ans = await Game.count().then((count) =>{
        console.log(count + "- 1");
        return count;
    }).catch((err) => {
        console.log(err);
    });
    console.log(ans + "- 2");
    return ans;
}

// count words in the words db
module.exports.countWords = async function () {
    var ans = await Word.count().then((count) =>{
        return count;
    });
    return ans;
}

// gets unlearned words from word db
module.exports.getUnlearned = async function () {
    var words = await Word.count({'ifLearned': false}).then((words)=>{
        return words;
    });
    return words;
}

// gets Learned words from word db
module.exports.getLearned = async function () {
    var words = await Word.count({'ifLearned': true}).then((words)=>{
        return words;
    });
    return words;
}

// gets a number and return x words from WORDS db
// ! don't chacks if there is enought words in the db
module.exports.getXwordsFromUnplayed = async function (x) {
    existingNumbers = [];
    var words = [];
    for (let i = x; i > 0; i--) {
        //pick a random number and then add the document on that place to the game db
        const rand = Math.floor(Math.random() * x);
        // if num alrady used we want to skip it so we won't practice the same words
        if (existingNumbers.includes(rand) == false) {
            const randomDoc = await Unplayed.findOne().skip(rand);
            await words.push(randomDoc);
            // pushe all used numbers to an array so we can check later if we alrady used that number
            await existingNumbers.push(rand);
        } else {
            i++;
        }
    }
    return words;
}

// gets a number and return x words from GAME db
// ! don't chacks if there is enought words in the db
module.exports.getXwordsFromGame = async function (x) {
    existingNumbers = [];
    var words = [];
    for (let i = x; i > 0; i--) {
        //pick a random number and then add the document on that place to the game db
        const rand = Math.floor(Math.random() * x);
        // if num alrady used we want to skip it so we won't practice the same words
        if (existingNumbers.includes(rand) == false) {
            const randomDoc = await Game.findOne().skip(rand);
            await words.push(randomDoc);
            // pushe all used numbers to an array so we can check later if we alrady used that number
            await existingNumbers.push(rand);
        } else {
            i++;
        }
    }
    return words;
}

// search the difference between words db and game db and pushes it to Unplayed db
module.exports.differ = async function () {
    var words = await Word.find().then((ans) => {
        return ans;
    });
    var game = await Game.find().then((ans) =>{
        return ans;
    });
    for (let i = 0; i < words.length; i++) {
        const elementW = words[i];
        for (let y = 0; y < game.length; y++) {
            const elementG = game[y];
            if(elementW.word == elementG.word){
                words.shift(elementW);
                i--;
            }
        }
    }
    words.forEach(word =>{
        let newObj = ({
            word: word.word,
            meaning: word.meaning
        })
         Unplayed.create(newObj);
    })
}

// get all words from words db
module.exports.getAllWords = async function () {
    var words = await Word.find().then((res) =>{
        return res;
    })
    return words;
}
// עמוד הבחירת מילים ספציפיות למשחק  - להמשיך איתו - כרגע הפעולה שמציגה את המילים בעמוד לא עובדת, לבדוק למה ולנסות למחוק את כל הסי אסאס של העמוד ולבנות טבלה מאפס

//להכין עמוד של מחיקת מילים - טבלה של כל המילים שיהיה אפשר לסמן כל אחת או לפלטר בחיפוש ואז למחוק - מחיקה יש כבר פעולה
// להכין לכל כפתור בעמוד סטאס שפותח חלונית חדשה עם המילים הרלוונטיות
// לרשום את מהלך המשחק במילים ואז את סדר הפעולות במחשק
// לחשוב איך אני רנדומלית מציג את העמוד כתיבה במשחק - אני ארשום את התגיות של האינפוט באחביא אותם, ואז ראנדומלית אראה אותם בעזרת סי אס אס
// לחשוב על מן מצגת כזו שתסביר על המשחק בפתיחה הראשונה של המחשק
//להכין עמוד שמסביר איך המשחק עובד באנגלית  
// פעולה שתגדיר לחצנים במקלדת כדי לפתוח לבד את החלונית של הוספת מילה
// לסדר את כל הקוד