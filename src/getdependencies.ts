import { sync } from 'read-yaml';
import { join, resolve } from 'path';

let dependencies = [];

export function getDependencies(repo: string, packageScope: string[], repoMap: Map<string,string>) {
  try {
    const path = resolve(repoMap.get(repo) + '/' + repo + '/package.json');
    dependencies = [];
    const dependencyList = require(path).dependencies;
    
    for (const dep in dependencyList) {
      if (packageScope.includes('ALL')) {
        dependencies.push(dep + ': ' + dependencyList[dep]);
      }
      else {
        for (const scope of packageScope) {
          if (scope === '' && !(dep.startsWith('@'))) {
            dependencies.push(dep + ': ' + dependencyList[dep]);
          }
          else if (scope === '' && (dep.startsWith('@'))) {
            continue;
          }
          else if (dep.startsWith(scope)) {
            dependencies.push(dep + ': ' + dependencyList[dep]);
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
    const path = resolve(repoMap.get(repo) + '/' + repo + '/deploy/dependencies.yaml');
    dependencies = [];
    const dependencyList = sync(path).terraform;
    for (const dep in dependencyList) {
      dependencies.push(dependencyList[dep]);
    }
    return dependencies;
  } catch (error) {
    console.log('*** Repo does not have a deploy directory with a dependencies.yaml ***');
  }
}

