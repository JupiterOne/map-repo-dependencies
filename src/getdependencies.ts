import { error } from 'console';

let readJson;
let dependencies = [];

export function getDependencies(repo: string, packageScope: string[]) {
  try {
    let path = '../repos/' + repo + '/package.json';

    dependencies = [];
    readJson = require(path).dependencies;
    for (const j in readJson) {
      for (const scope of packageScope) {
        if (j.includes(scope)) {
          dependencies.push(j + ': ' + readJson[j]);
        }
      }
    }
    return dependencies;
  } catch (error) {
    console.log('Repo does not have a package.json');
    console.log('');
  }
}
