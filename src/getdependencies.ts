import { error } from 'console';
const readYaml =  require('read-yaml');

let readJson, parseYaml;
let dependencies = [];

export function getDependencies(repo: string, packageScope: string[], repoMap: Map<string,string>) {
  try {
    let path = '../' + repoMap.get(repo) + '/' + repo + '/package.json';
    dependencies = [];
    readJson = require(path).dependencies;
    for (const j in readJson) {
      if (packageScope.length === 0) {
        dependencies.push(j + ': ' + readJson[j]);
      }
      else {
        for (const scope of packageScope) {
          if (j.includes(scope)) {
            dependencies.push(j + ': ' + readJson[j]);
          }
        }
      }
    }
    return dependencies;
  } catch (error) {
    console.log('*** Repo does not have a package.json ***');
  }
}

export function getDependenciesYaml(repo: string, repoMap: Map<string,string>) {
  try {
    let path = repoMap.get(repo) + '/' + repo + '/deploy/dependencies.yaml';
    dependencies = [];
    parseYaml = readYaml.sync(path).terraform;
    for (const j in parseYaml) {
      dependencies.push(parseYaml[j]);
    }
    return dependencies;
  } catch (error) {
    console.log('*** Repo does not have a deploy directory with a dependencies.yaml ***');
    console.log('');
  }
}

