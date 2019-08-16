// Transform the scope name if the what's in the repo (e.g. Github) does not
// match what's in npm (other than the `@` sign).
// For example, TitleCase vs. all lowercase below:
// - in Github: `JupiterOne/jupiterone-client-nodejs`
// - in npm: `@jupiterone/jupiterone-client-nodejs`
const scopeNameTransformations = new Map([
  ['@jupiterone/', 'JupiterOne/']
])

export async function createRepoRelationships(depsList: string[], mainRepo, j1Client, repoName, missingDeps: string[]) {
  const successFail = {success: 0, failure: 0, missingDeps: []};
  const depRegex = /^(@\w+\/)?([^:]+)(:.*)?$/;
  if (depsList.length > 0) {
    for (const dep of depsList) {
      const match = dep.match(depRegex);
      if (!match) {
        continue;
      }

      const scope = match[1];
      const repo = match[2];

      let fullName;
      if (scope && repo) {
        fullName = scopeNameTransformations.has(scope)
          ? scopeNameTransformations.get(scope) + repo
          : scope.substr(1) + repo
      } 
      else if (repo) {
        fullName = repo;
      }
      else {
        continue;
      }
      
      const depRepo = await j1Client.queryV1(
        `FIND CodeRepo WITH full_name='${fullName}'`
      );          
      
      if (depRepo.length === 1) {
        const relationshipKey = mainRepo[0].entity._key + '|uses|' + depRepo[0].entity._key;
        const relationship = await j1Client.createRelationship(
          relationshipKey,
          'repo_dependency',
          'USES',
          mainRepo[0].entity._id,
          depRepo[0].entity._id,
        );
        console.log('Successfully created relationship (' + repoName + ' USES ' + dep + ').');
        successFail.success++;
      } else if (depRepo.length > 1) {
        console.log('Failed to create relationship with ' + dep + 
        ' (query returned multiple results). Skipped.' )
      }
      else {
        console.log(
          'Failed to create relationship with ' + dep + 
          ' (was not found on the graph). Skipped.'
        );
        if (!missingDeps.includes(dep)) {
          missingDeps.push(dep + ' (' + repoName + ').');
        }
        successFail.failure++;
      }
    }
  } else {
    console.log('Repo has no dependencies of requested scopes');
  }
  successFail.missingDeps = missingDeps;
  return successFail;
}

export async function createDeployRelationships(deployDepsList, mainRepo, j1Client, repoName, missingDeps) {
  const successFail = {success: 0, failure: 0, missingDeps: []};
  if (deployDepsList.length > 0) {
    for (const dep of deployDepsList) {
      const deployRepo = await j1Client.queryV1(
        `FIND CodeRepo WITH name='${dep}'`
      );
      
      if (deployRepo.length === 1) {
        const relationshipKey = mainRepo[0].entity._key + '|uses|' + deployRepo[0].entity._key;
        const relationship = await j1Client.createRelationship(
          relationshipKey,
          'repo_dependency',
          'USES',
          mainRepo[0].entity._id,
          deployRepo[0].entity._id,
        );
        console.log('Successfully created relationship (' + repoName + ' USES ' + dep + ' for deploy).');
        successFail.success++;
      } else if (deployRepo.length > 1) {
        console.log('Failed to create relationship with ' + dep + 
        ' (query returned multiple results). Skipped.' )
      }
      else {
        console.log(
          'Failed to create relationship with ' + dep + 
          ' (was not found on the graph). Skipped.'
        );
        if (!missingDeps.includes(dep)) {
          missingDeps.push(dep + ' (' + repoName + ', deploy).');
        }
        successFail.failure++;
      }
    }
  } else {
    console.log('Repo has no deploy dependencies');
  }
  successFail.missingDeps = missingDeps;
  return successFail;
}