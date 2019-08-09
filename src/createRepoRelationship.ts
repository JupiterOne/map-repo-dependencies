export async function createRepoRelationship(depsList, mainRepo, j1Client, repoName, missingDeps: string[]) {
  const successFail = {success: 0, failure: 0, missingDeps: []};
  if (depsList.length > 0) {
    for (const dep of depsList) {
      const fullName = dep.substring(1, dep.indexOf(':'));
      let depRepo = await j1Client.queryV1(
        `FIND CodeRepo WITH full_name='${fullName}'`
      );          
      
      if (depRepo.length === 1) {
        const relationshipKey = mainRepo[0].entity._key + '|uses|' + depRepo[0].entity._key;
        const relationship = await j1Client.createRelationship(
          relationshipKey,
          'bitbucket_repo_uses_bitbucket_repo',
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

export async function createDeployRelationship(deployDepsList, mainRepo, j1Client, repoName, missingDeps) {
  const successFail = {success: 0, failure: 0, missingDeps: []};
  if (deployDepsList.length > 0) {
    for (const dep of deployDepsList) {
      let deployRepo = await j1Client.queryV1(
        `FIND CodeRepo WITH name='${dep}'`
      );
      
      if (deployRepo.length === 1) {
        const relationshipKey = mainRepo[0].entity._key + '|uses|' + deployRepo[0].entity._key;
        const relationship = await j1Client.createRelationship(
          relationshipKey,
          'bitbucket_repo_uses_bitbucket_repo',
          'USES',
          mainRepo[0].entity._id,
          deployRepo[0].entity._id,
        );
        console.log('Successfully created relationship (' + repoName + ' USES ' + dep + ', deploy).');
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