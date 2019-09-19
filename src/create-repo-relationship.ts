// Transform the scope name if the what's in the repo (e.g. Github) does not
// match what's in npm (other than the `@` sign).
// For example, TitleCase vs. all lowercase below:
// - in Github: `JupiterOne/jupiterone-client-nodejs`
// - in npm: `@jupiterone/jupiterone-client-nodejs`
const scopeNameTransformations = new Map([
  ['@jupiterone/', 'JupiterOne/']
])

export async function createRepoRelationships(
  depsList: string[],
  mainRepo: any[],
  j1Client,
  repoName: string,
  missingDeps: string[],
  forDeploy?: boolean
) {
  const results = {success: 0, failure: 0, missingDeps: []};
  const depRegex = /^(@\w+\/)?([^:]+)(:.*)?$/;
  if (depsList.length > 0) {
    for (const dep of depsList) {
      const match = dep.match(depRegex);
      if (!match) {
        continue;
      }

      const scope = match[1];
      const repo = match[2];
      const version = match[3];

      let fullName;
      if (scope && repo) {
        fullName = scopeNameTransformations.has(scope)
          ? scopeNameTransformations.get(scope) + repo
          : scope.substring(1) + repo
      } 
      else if (repo) {
        fullName = repo;
      }
      else {
        continue;
      }
      
      const j1query = scope
        ? `FIND CodeRepo WITH full_name='${fullName}'`
        : `FIND CodeRepo WITH name='${fullName}'`
      const depRepo = await j1Client.queryV1(j1query);          
      
      if (depRepo.length === 1) {
        const relationshipKey = mainRepo[0].entity._key + '|uses|' + depRepo[0].entity._key;
        const relationship = await j1Client.createRelationship(
          relationshipKey,
          'repo_dependency',
          'USES',
          mainRepo[0].entity._id,
          depRepo[0].entity._id,
          { version }
        );
        console.log(
          `Successfully created relationship (${repoName} USES ${dep}${
            forDeploy ? ' for deploy' : ''
          }).`
        );
        results.success++;
      } else if (depRepo.length > 1) {
        console.log(
          `Failed to create relationship with ${dep} (query returned multiple results). Skipped.`
        );
      }
      else {
        console.log(
          `Failed to create relationship with ${dep} (was not found on the graph). Skipped.`
        );
        if (!missingDeps.includes(dep)) {
          missingDeps.push(`${dep} (in ${repoName})`);
        }
        results.failure++;
      }
    }
  } else {
    console.log('Repo has no dependencies of requested scopes');
  }
  results.missingDeps = missingDeps;
  return results;
}