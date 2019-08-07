import { getDependencies, getDependenciesYaml } from './getDependencies';
import { getRepoIds } from './getRepos';
import { getClient } from './getClient';
const JupiterOneClient = require('@jupiterone/jupiterone-client-nodejs');
const gql = require('graphql-tag');
const readlineSync = require('readline-sync');

require('dotenv').config();

let success = 0, failure = 0;
const missingDeps = [];
let packageScope = [];
let J1_ACCOUNT, J1_USERNAME, J1_PASSWORD;

(async () => {
  while (true) {
    var scope = readlineSync.question('Input a package scope, i.e. @package (input QUIT when finished): ');
    if (scope === 'QUIT') {
      break;
    }
    packageScope.push(scope);
  }
  const pathToRepos = readlineSync.question('Input path to directory with repos (relative to root directory): ');
  const accountInput = readlineSync.question('Input account. If using a .env file, continue without input: ');
  const usernameInput = readlineSync.question('Input username. If using a .env file, continue without input: ');
  const passwordInput = readlineSync.question('Input password. If using a .env file, continue without input: ');

  console.log('');
  const j1Client = await getClient(accountInput, usernameInput, passwordInput);
  const repoMap = await getRepoIds(pathToRepos, accountInput, usernameInput, passwordInput);
  console.log('');
  
  for (const repoName of Array.from(repoMap.keys())) {
    console.log('Repo: ' + repoName);

    const mainRepo = await j1Client.queryV1(
      `FIND CodeRepo WITH name='${repoName}'`,
    );
    const depsList = getDependencies(repoName, packageScope, repoMap, pathToRepos);
    const deployDepsList = getDependenciesYaml(repoName, repoMap, pathToRepos);
    if (depsList === undefined) {
      if (deployDepsList === undefined) {
        continue;
      }
    } else if (depsList.length > 0) {
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
    if (deployDepsList != undefined) {
      if (deployDepsList.length > 0) {
        for (const dep of deployDepsList) {
          let deployRepo = await j1Client.queryV1(
            `FIND CodeRepo WITH name='${dep}'`,
          );
          if (deployRepo.length > 0) {
            const relationshipKey = mainRepo[0].entity._key + '|depends_on|' + deployRepo[0].entity._key;
            const relationship = await j1Client.createRelationship(
              relationshipKey,
              'bitbucket_repo_depends_on_bitbucketrepo',
              'USES',
              mainRepo[0].entity._id,
              deployRepo[0].entity._id,
            );
            console.log('Successfully created relationship (' + repoName + ' DEPENDS_ON ' + dep + ').');
            success++;
          } else {
            console.log(
              'Failed to create relationship with ' + dep + 
              ' (was not found on the graph). Skipped.'
            );
            failure++;
            if (missingDeps.indexOf(dep) === -1) {
              missingDeps.push(dep + ' (' + repoName + ', deploy).');
            }
          }
        }
      } else {
        console.log('Repo has no deploy dependencies');
      }
    }
    
    console.log('');
  }
  console.log('Summary:');
  console.log('Created Relationships: ' + success);
  console.log('Failed Attempts: ' + failure);
  console.log('Failed dependencies:');
  missingDeps.forEach(element => {
    console.log('    ' + element);
  });
  console.log('');
})().catch(err => {
  console.error('', err);
});

