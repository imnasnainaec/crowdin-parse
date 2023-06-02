#! /usr/bin/env node

const fs = require("fs");
const xmlJsConvert = require("xml-js");
const goldetic = require("./goldetic");

function consoleUsage() {
  console.log("Command line utilities for working with Crowdin and react:");
  console.log("Usage: -goldetic [xlf file] ... [xlf file]");
  console.log("\tConverts GOLDEtic xlf files from Crowdin to json file.");
  console.log("Usage: -minimize [json file]");
  console.log(
    "\tConverts the json result of -goldetic to a set a minimal strings."
  );
}

const myArgs = process.argv.slice(2);
if (myArgs.length < 2) {
  consoleUsage();
} else {
  switch (myArgs[0]) {
    case "-goldetic":
      xlfToJson(myArgs.slice(1));
      break;
    case "-minimize":
      minimizeJson(myArgs[1]);
      break;
    default:
      consoleUsage();
  }
}

function xlfToJson(xlfFilenames) {
  const options = { compact: true, ignoreComment: true, spaces: 4 };
  const jsonData = {};
  for (const xlfFilename of xlfFilenames) {
    const xlfData = JSON.parse(
      xmlJsConvert.xml2json(fs.readFileSync(xlfFilename), options)
    );
    goldetic.convertToJson(xlfData, jsonData);
  }
  const jsonFilename = "goldetic.json";
  fs.writeFileSync(jsonFilename, JSON.stringify(jsonData), (err) => {
    // Throws an error, you could also catch it here
    if (err) {
      throw err;
    }
    // Success case, the file was saved
    console.log(`File saved: ${jsonFilename}`);
  });
}

function minimizeJson(inFilename) {
  const jsonData = JSON.parse(fs.readFileSync(inFilename));
  const minimized = goldetic.minimizeJson(jsonData);
  const outFilename = getFileRoot(inFilename, ".json") + "-minimized.json";
  fs.writeFileSync(outFilename, JSON.stringify(minimized), (err) => {
    // Throws an error, you could also catch it here
    if (err) {
      throw err;
    }
    // Success case, the file was saved
    console.log(`File saved: ${outFilename}`);
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
