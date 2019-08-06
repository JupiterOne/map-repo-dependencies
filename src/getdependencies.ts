import { error } from 'console';

let readJson;
let dependencies = [];

export function getDependencies(repo: string) {
  try {
    let path = '../repos/' + repo + '/package.json';

    dependencies = [];
    readJson = require(path).dependencies;
    for (const j in readJson) {
      if (j.includes('@jupiterone') || j.includes('@lifeomic')) {
        dependencies.push(j + ': ' + readJson[j]);
      }
    }
    return dependencies;
  } catch (error) {
    console.log('Repo does not have a package.json');
    console.log('');
  }
}
