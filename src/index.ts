import { getDependencies } from './getDependencies';
import { getRepoIds } from './getRepos';
const JupiterOneClient = require('@jupiterone/jupiterone-client-nodejs');
const gql = require('graphql-tag');
const readlineSync = require('readline-sync');

require('dotenv').config();

let success = 0, failure = 0;
const missingDeps = [];
let packageScope = [];

(async () => {
  while (true) {
    var scope = readlineSync.question('Please input a package scope, i.e. @package (input QUIT when finished): ');
    if (scope === 'QUIT') {
      break;
    }
    packageScope.push(scope);
  }
  console.log('');
  const j1Client = await new JupiterOneClient({
    account: 'j1dev',
    username: 'j1dev',
    password: 'dev',
    poolId: process.env.J1_USER_POOL_ID,
    clientId: process.env.J1_CLIENT_ID,
    accessToken: process.env.J1_API_TOKEN,
    dev: true,
  }).init();

  const repoMap = await getRepoIds();

  for (const repoName of Array.from(repoMap.values())) {
    console.log('Repo: ' + repoName);

    const mainRepo = await j1Client.queryV1(
      `FIND CodeRepo WITH name='${repoName}'`,
    );
    const depsList = getDependencies(repoName, packageScope);
    if (depsList === undefined) {
      continue;
    }
    if (depsList.length > 0) {
      for (const dep of depsList) {
        const fullName = dep.substring(1, dep.indexOf(':'));

        let depRepo = await j1Client.queryV1(
          `FIND CodeRepo WITH full_name='${fullName}'`,
        );

        if (depRepo.length > 0) {
          const relationshipKey = mainRepo[0].entity._key + '|uses|' + depRepo[0].entity._key;
          const relationship = await j1Client.createRelationship(
            relationshipKey,
            'bitbucket_repo_uses_bitbucket_repo',
            'USES',
            mainRepo[0].entity._id,
            depRepo[0].entity._id,
          );
          console.log('Successfully created relationship (' + repoName + ' USES ' + dep + ').');
          success++;
        } else {
          console.log(
            'Failed to create relationship with ' + dep + 
            ' (was not found on the graph). Skipped.'
          );
          failure++;
          if (missingDeps.indexOf(dep) === -1) {
            missingDeps.push(dep + ' (' + repoName + ').');
          }
        }
      }
    } else {
      console.log('Repo has no dependencies of requested scopes');
    }
    console.log('');
  }
  console.log('Summary:');
  console.log('Created Relationships: ' + success);
  console.log('Failed Attempts: ' + failure);
  console.log('Missing dependencies:');
  missingDeps.forEach(element => {
    console.log('    ' + element);
  });
  console.log('');
})().catch(err => {
  console.error('', err);
});
