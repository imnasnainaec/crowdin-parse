exports.convertToJson = function (xlfData) {
  const jsonData = {};
  xlfData.xliff.file["trans-unit"].map((tu) =>
    addTranslationUnit(tu, jsonData)
  );
  return jsonData;
};

function addTranslationUnit(tu, jsonData) {
  const idParts = getTransUnitId(tu);
  let section = jsonData;
  let sectionId = "";
  for (let i = 0; i < idParts.length - 1; i++) {
    sectionId = idParts[i];
    if (section[sectionId] === undefined) {
      section[sectionId] = {};
    }
    section = section[sectionId];
  }
  parseTransUnit(tu, section);
}

function getTransUnitId(tu) {
  if (tu._attributes.resname) {
    return tu._attributes.resname.split(".");
  }
  return tu._attributes.id.split(".");
}

function parseTransUnit(tu, section) {
  const finalPart = getTransUnitId(tu).pop();
  if (
    tu.target &&
    tu.target._text &&
    tu.target._attributes.state !== "needs-translation"
  ) {
    section[finalPart] = tu.target._text;
  }
}
