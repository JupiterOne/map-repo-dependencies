let readJson;
let dependencies = [];

export function getDependencies(repo: string) {
  let path = '../repos/' + repo + '/package.json';
  // console.log(path);
  dependencies = [];
  readJson = require(path).dependencies;
  for (let j in readJson) {
    if (j.includes('@jupiterone') || j.includes('@lifeomic')) {
      dependencies.push(j + ': ' + readJson[j]);
    }
  }
  return dependencies;
}
