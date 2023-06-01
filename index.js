#! /usr/bin/env node

const fs = require("fs");
const xmlJsConvert = require("xml-js");
const goldetic = require("./goldetic");

function consoleUsage() {
  console.log("Command line utilities for working with Crowdin and react:");
  console.log("Usage: -goldetic [xlf file] [json file]");
  console.log("\tConverts GOLDEtic xlf file from Crowdin to json file.");
}

const myArgs = process.argv.slice(2);
if (myArgs.length < 3) {
  consoleUsage();
} else {
  switch (myArgs[0]) {
    case "-goldetic":
      if (myArgs.length > 3) {
        console.log("Too many arguments.");
      } else {
        xlfToJson(myArgs[1], myArgs[2]);
      }
      break;
    default:
      consoleUsage();
  }
}

function xlfToJson(xlfFilename, jsonFilename) {
  const options = { compact: true, ignoreComment: true, spaces: 4 };
  const xlfData = JSON.parse(
    xmlJsConvert.xml2json(fs.readFileSync(xlfFilename), options)
  );
  const jsonData = goldetic.convertToJson(xlfData);
  fs.writeFileSync(jsonFilename, JSON.stringify(jsonData), (err) => {
    // Throws an error, you could also catch it here
    if (err) {
      throw err;
    }
    // Success case, the file was saved
    console.log(`File saved: ${jsonFilename}`);
  });
}

// Remove suffix from end of a string
function getFileRoot(filename, suffix) {
  const fLen = filename.length;
  const sLen = suffix.length;
  if (
    fLen >= sLen &&
    filename.substring(fLen - sLen).toLowerCase() === suffix.toLowerCase()
  ) {
    return filename.substring(0, fLen - sLen);
  }
  return filename;
}

module.exports = { getFileRoot: getFileRoot };
