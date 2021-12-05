const electron = require('electron');
const url = require('url');
const path = require('path');
const {
} = require('./db');


//capitalizeFirstLetter...
module.exports.capitalizeFirstLetter = function (string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}