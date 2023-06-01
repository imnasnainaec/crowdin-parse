let goldetic = require("./goldetic");
var assert = require("assert");

const defaultFilename = "translations.json";
const langs = ["en", "es"];
const enPhrase = "from something";
const esPhrase = "a algo";
describe("tests", function () {
  const testXlf = {
    xliff: {
      _attributes: {
        xmlns: "urn:oasis:names:tc:xliff:document:1.2",
        version: "1.2",
      },
      file: {
        body: {
          _attributes: {
            original: defaultFilename,
            "source-language": langs[0],
          },
          "trans-unit": [
            {
              _attributes: { resname: "localize.sourceless" },
            },
            {
              _attributes: { resname: "localize.untranslatedA" },
              source: { _text: enPhrase },
            },
            {
              _attributes: { resname: "localize.untranslatedB" },
              source: { _text: enPhrase },
              target: {
                _attributes: { state: "needs-translation" },
              },
            },
            {
              _attributes: { resname: "localize.untranslatedC" },
              source: { _text: enPhrase },
              target: {
                _attributes: { state: "needs-translation" },
                _text: "",
              },
            },
            {
              _attributes: { resname: "localize.something" },
              source: { _text: enPhrase },
              target: {
                _attributes: { state: "translated" },
                _text: esPhrase,
              },
            },
            {
              _attributes: { resname: "nested.localize.something" },
              source: { _text: enPhrase },
              target: {
                _attributes: { state: "translated" },
                _text: esPhrase,
              },
            },
          ],
        },
      },
    },
  };

  describe("xlf to json tests", function () {
    it("builds json hierarchy from flat xliff", function () {
      var jsonData = goldetic.convertToJson(testXlf, {});
      assert.strictEqual(jsonData["localize"]["sourceless"], "");
      assert.strictEqual(jsonData["localize"]["untranslatedA"], enPhrase);
      assert.strictEqual(jsonData["localize"]["untranslatedB"], enPhrase);
      assert.strictEqual(jsonData["localize"]["untranslatedC"], enPhrase);
      assert.strictEqual(jsonData["localize"]["something"], esPhrase);
    });
    it("adds to existing translations", function () {
      var jsonData = goldetic.convertToJson(testXlf, {
        localize: { something: "firstTrans" },
      });
      assert.strictEqual(jsonData["localize"]["something"], esPhrase);
    });
    it("adds to existing nested translations", function () {
      var jsonData = goldetic.convertToJson(testXlf, {
        nested: { localize: { something: "firstTrans" } },
      });
      assert.strictEqual(jsonData["nested"]["localize"]["something"], esPhrase);
    });
  });
});
