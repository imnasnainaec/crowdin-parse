exports.convertToJson = function (xlfData, jsonData) {
  xlfData.xliff.file.body["group"].map((g) => addGroup(g, jsonData, true));
};

function addGroup(g, jsonData, flatten = false) {
  const groupName = g._attributes.id.split("_").pop();
  let section = jsonData;
  if (flatten) {
    if (section[groupName] == undefined) {
      section[groupName] = [];
    }
  } else {
    if (section[groupName] === undefined) {
      section[groupName] = {};
    }
    section = section[groupName];
  }
  parseGroup(g, section, flatten ? groupName : undefined);
  if (flatten) {
    section[groupName].sort();
  }
}

function parseGroup(g, section, key) {
  const subgroup = g["group"];
  if (subgroup) {
    if (subgroup.length) {
      if (key) {
        subgroup.map((sub) => parseGroup(sub, section, key));
      } else {
        subgroup.map((sub) => addGroup(sub, section));
      }
    } else {
      if (key) {
        parseGroup(subgroup, section, key);
      } else {
        addGroup(subgroup, section);
      }
    }
  }

  const tu = g["trans-unit"];
  if (tu && tu.length) {
    const sKey = tu[0]["source"]._text;
    if (sKey) {
      const sVal = tu[1]["source"]._text;
      if (key) {
        if (!section[key].includes(sKey)) {
          section[key].push(sKey);
        }
        if (!section[key].includes(sVal)) {
          section[key].push(sVal);
        }
      } else {
        if (section[sKey] === undefined) {
          section[sKey] = [];
        }
        if (!section[sKey].includes(sVal)) {
          section[sKey].push(sVal);
        }
      }
    }
    const tKey = tu[0]["target"]._text;
    if (tKey) {
      if (key) {
        if (!section[key].includes(tKey)) {
          section[key].push(tKey);
        }
      } else {
        if (section[tKey] === undefined) {
          section[tKey] = [];
        }
      }
      const target = tu[1]["target"];
      if (target._attributes.state !== "needs-translation") {
        const tVal = target._text;
        if (key) {
          if (!section[key].includes(tVal)) {
            section[key].push(tVal);
          }
        } else {
          if (!section[tKey].includes(tVal)) {
            section[tKey].push(tVal);
          }
        }
      }
    }
  }
}

exports.minimizeJson = function (jsonData) {
  const mini = {};
  let maxLength = 0;
  const keys = Object.keys(jsonData);
  for (const key of keys) {
    mini[key] = { all: [], contains: [], prefix: [], resolved: [] };
    jsonData[key].map((item) => mini[key].all.push(item.toLocaleLowerCase()));
    mini[key].all = [...new Set(mini[key].all)];
    mini[key].maxLength = Math.max(...mini[key].all.map((s) => s.length));
    maxLength = Math.max(maxLength, mini[key].maxLength);
  }

  for (let len = 1; len <= maxLength; len++) {
    for (const key of keys) {
      const m = mini[key];
      for (const item of m.all) {
        if (item.length < len || m.resolved.includes(item)) {
          continue;
        }
        const prefix = item.substring(0, len);
        if (isStringUniqueToGroup(prefix, key, mini, true)) {
          processStringInGroup(prefix, mini[key], true);
        }
      }
    }
  }

  for (const key of keys) {
    mini[key] = {
      prefix: mini[key].prefix.sort(),
      equals: mini[key].all
        .filter((item) => !mini[key].resolved.includes(item))
        .sort(),
    };
  }

  return mini;
};

function isStringUniqueToGroup(string, groupName, mini, isPrefix = false) {
  const keys = Object.keys(mini);
  for (const k of keys) {
    if (k === groupName) {
      continue;
    }
    if (
      mini[k].all.find((i) => {
        if (isPrefix) {
          return i.substring(0, string.length) === string;
        }
        return i.includes(string);
      })
    ) {
      return false;
    }
  }
  return true;
}

function processStringInGroup(string, group, isPrefix = false) {
  group.all
    .filter((item) => !group.resolved.includes(item))
    .map((item) => {
      if (isPrefix && item.substring(0, string.length) === string) {
        group.resolved.push(item);
      }
      if (!isPrefix && item.includes(string)) {
        group.resolved.push(item);
      }
    });
  if (isPrefix) {
    group.prefix.push(string);
  } else {
    group.contains.push(string);
  }
}
