const electron = require('electron');
const url = require('url');
const path = require('path');
const {
} = require('./db');

//capitalizeFirstLetter...
module.exports.formatWord = function (string) {
  return exports.capitalizeFirstLetter(exports.lowerCaseAllLetters(string));
}

module.exports.capitalizeFirstLetter = function (string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

module.exports.lowerCaseAllLetters = function (string) {
  return string.toLowerCase();
}



