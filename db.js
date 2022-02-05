const mongodb = require('mongodb');
const mongoose = require('mongoose');
const _ = require('lodash');
const {
    capitalizeFirstLetter
} = require('./extensions');

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
const Unplayed = mongoose.model("Unplayed", unPlayedWords);

// add this to the db when finish the project so this words will appear in any first start  

module.exports.minWords = async function (num) {
    count = 0;
    if (await exports.ifWordExists(wordOne.word) == 0) {
        await exports.addWord(wordOne);
        count++;
    }
    if (count != num) {

        if (await exports.ifWordExists(wordTwo.word) == 0) {
            await exports.addWord(wordTwo);
            count++;
        }
    }
    if (count != num) {

        if (await exports.ifWordExists(wordThree.word) == 0) {
            await exports.addWord(wordThree);
            count++;
        }
    }
    if (count != num) {

        if (await exports.ifWordExists(wordFour.word) == 0) {
            await exports.addWord(wordFour);
        }
    }
}

const wordOne = new Word({
    word: 'Music',
    meaning: 'מוזיקה',
    ifLearned: false
})
const wordTwo = new Word({
    word: 'Coffee',
    meaning: 'קפה',
    ifLearned: false
})
const wordThree = new Word({
    word: 'Love',
    meaning: 'אהבה',
    ifLearned: false
})
const wordFour = new Word({
    word: 'Fun',
    meaning: 'כיף',
    ifLearned: false
})

//================================================================================

//DB functions...

//add new word to the game collection
module.exports.addWordToGame = async function (word) {
    var wordObj = await Word.findOne({
        word: word
    }).then((res) => {
        return res;
    });
    var newWord = ({
        word: word,
        meaning: wordObj.meaning,
        result: {
            English: 2,
            Hebrew: 2,
            writing: false
        }
    });
    Game.create(newWord, function (err) {
        if (err) console.log(err);
    });
}

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
// gets a word and the meaning and checkes if the answer is correct
// if yes - English of the word -- else English ++
// English can't be more then 2
module.exports.checkEnglish = async function (word, meaning) {
    const obj = await Game.findOne({
        word: word
    });
    var currentCount = obj.result.English;
    // checks if the answer is correct - if true -- else ++ English field
    if (obj.meaning == meaning) {
        currentCount -= 1;
    } else {
        currentCount += 1;
    }
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
// gets a word and the meaning and checkes if the answer is correct
// if yes - English of the word -- else Hebrew ++
// English can't be more then 2
module.exports.checkHebrew = async function (word, meaning) {
    const obj = await Game.findOne({
        meaning: meaning
    });
    var currentCount = obj.result.Hebrew;
    // checks if the answer is correct - if true -- else ++ Hebrew field
    if (obj.word == word) {
        currentCount -= 1;
    } else {
        currentCount += 1;
    }
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
        await Unplayed.deleteOne({
            word: word
        });
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
        await Game.deleteOne({
            meaning: wordMeaning
        });
        await Word.updateOne({
            meaning: wordMeaning
        }, {
            $set: {
                ifLearned: true
            }
        });
    }
}

//find all unlearned word from words db and moves theme to the game db
module.exports.moveUnlearnedWords = async function () {
    await Word.find({
        'ifLearned': false
    }).then((ans => {
        // creating an obj that fits the game db
        ans.forEach(obj => {
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
    bool = await Word.count({
        ifLearned: false
    }).then((count) => {
        if (count > 0) return true;
        return false;
    })
    return bool;
}

// gets an array of words and move them from word db to game db
module.exports.gameInstanceFromChoosenWords = async function (wordsArray) {
    await wordsArray.forEach(word => {
        Word.findOne({
            word: word
        }).then(async (obj) => {
            const gameObj = {
                word: obj.word,
                meaning: obj.meaning,
                result: {
                    English: 2,
                    Hebrew: 2,
                    writing: false
                }
            }
            await Game.create(gameObj);
        });
    });
    await exports.differChoosenWords(wordsArray);
}

// count words in the game db
module.exports.countGame = async function () {
    var ans = await Game.count().then((count) => {
        return count;
    }).catch((err) => {
        console.log(err);
    });
    return ans;
}

// count words in the words db
module.exports.countWords = async function () {
    var ans = await Word.count().then((count) => {
        return count;
    });
    return ans;
}
// count words in the Unplayed db
module.exports.countUnplayed = async function () {
    var ans = await Unplayed.count().then((count) => {
        return count;
    });
    return ans;
}

// count unlearned words - word db
module.exports.countUnlearned = async function () {
    var words = await Word.count({
        'ifLearned': false
    }).then((words) => {
        return words;
    });
    return words;
}

// count Learned words - word db
module.exports.countLearned = async function () {
    var words = await Word.count({
        'ifLearned': true
    }).then((words) => {
        return words;
    });
    return words;
}

// gets a number and return x words from WORDS db
// ! don't chacks if there is enought words in the db
module.exports.getXwordsFromWords = async function (x, arr) {
    var existingWords = [];
    var words = [];
    arr.forEach(word => {
        existingWords.push(word.word);
    });
    var wordsList = await Word.find({}).then((res) => {
        return res;
    });
    wordsList.forEach(word => {
        if (words.length != x) {
            if (!existingWords.includes(word.word)) {
                words.push(word);
            }
        }
    })
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
            words.push(randomDoc);
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
    var game = await Game.find().then((ans) => {
        return ans;
    });
    for (let i = 0; i < words.length; i++) {
        const elementW = words[i];
        for (let y = 0; y < game.length; y++) {
            const elementG = game[y];
            if (elementW.word == elementG.word) {
                words.shift(elementW);
                i--;
            }
        }
    }
    words.forEach(word => {
        let newObj = ({
            word: word.word,
            meaning: word.meaning
        })
        Unplayed.create(newObj);
    })
}

// search the difference between words db and game db and pushes it to Unplayed db
module.exports.differChoosenWords = async function (onlyGames) {
    // ! onlyGames - only contains something after gameInstanceFromChoosenWords() => there was a problem that I wasn't able to identify so it works this way
    // ! onlyGame contains the words that the user chose to practice from the wordsSelecion page
    onlyWords = [];
    // gat all words from words db and only push the word filed to an array
    await Word.find().then((words) => {
        words.forEach(word => {
            onlyWords.push(word.word);
        });
    })
    // find the difference between the words db and the words that the use chose so we can push theme to the Unplayed DB
    let difference = onlyWords.filter(x => !onlyGames.includes(x));

    // find the words that different (those words that not contains in the game db) and adding theme to the Unplayed DB 
    difference.forEach(async (word) => {
        await Word.findOne({
            word: word
        }).then((word) => {
            var obj = {
                word: word.word,
                meaning: word.meaning
            }
            Unplayed.create(obj);
        })
    })
}

// get all words from words db
module.exports.getAllWords = async function () {
    var words = await Word.find().then((res) => {
        return res;
    })
    return words;
}

// get all unlearned words
module.exports.getUnlearned = async function () {
    var words = await Word.find({
        'ifLearned': false
    }).then((res) => {
        return res;
    });
    return words;
}

// get all learned words
module.exports.getLearned = async function () {
    var words = await Word.find({
        'ifLearned': true
    }).then((res) => {
        return res;
    });
    return words;
}