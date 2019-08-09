import { getDependencies, getDependenciesYaml } from './getDependencies';
import { getRepoIds } from './getRepos';
import { getClient } from './getClient';
import { question } from 'readline-sync';
import { createRepoRelationship, createDeployRelationship } from './createRepoRelationship';

require('dotenv').config();

let success = 0, failure = 0, switchName;
const missingDeps = [];
const packageScope = [];

(async () => {
  while (true) {
    const scope = question('Input a package scope, i.e. @package (input QUIT when finished, HELP for other options): ');
    if (scope === 'QUIT') {
      break;
    }
    if (scope === 'HELP') {
      console.log('');
      console.log('1. ALL = All dependencies');
      console.log('2. (No Input) = All dependencies not starting with \'@\'');
      console.log('');
      continue;
    }
    packageScope.push(scope);
  }
  const pathToRepos = question('Input path to directory with repos (relative to root directory): ');
  const account = question('Input account. If using a .env file, continue without input: ');
  const username = question('Input username. If using a .env file, continue without input: ');
  const password = question('Input password. If using a .env file, continue without input: ');
  const access = question('Input access token. If using a .env file, continue without input: ');
  const clientInput = {account: account, username: username, password: password, accessToken: access};


  console.log('');
  const j1Client = await getClient(clientInput);
  const repoMap = await getRepoIds(pathToRepos, clientInput);
  console.log('');

  for (const repoName of Array.from(repoMap.keys())) {
    console.log('Repo: ' + repoName);

    const mainRepo = await j1Client.queryV1(
      `FIND CodeRepo WITH name='${repoName}'`
    );
    const depsList = getDependencies(repoName, packageScope, repoMap);
    const deployDepsList = getDependenciesYaml(repoName, repoMap);
    
    switchName = '';
    getSwitchExpression(depsList, deployDepsList);

    switch (switchName) {
      case 'No package.json or dependencies yaml': {
        break;
      }
      case 'No dependencies.yaml': {
        const relationship = await createRepoRelationship(depsList, mainRepo, j1Client, repoName, missingDeps);
        missingDeps = relationship.missingDeps;
        success += relationship.success;
        failure += relationship.failure;
        break;
      }
      case 'No package.json': {
        const relationship = await createDeployRelationship(deployDepsList, mainRepo, j1Client, repoName, missingDeps);
        missingDeps = relationship.missingDeps;
        success += relationship.success;
        failure += relationship.failure;
        break;
      }
      default: {
        const relationship = await createRepoRelationship(depsList, mainRepo, j1Client, repoName, missingDeps);
        missingDeps = relationship.missingDeps;
        const deployRelationship = await createDeployRelationship(deployDepsList, mainRepo, j1Client, repoName, missingDeps);
        missingDeps = deployRelationship.missingDeps;
        success += relationship.success + deployRelationship.success;
        failure += relationship.failure + deployRelationship.failure;
        break;
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


function getSwitchExpression(depsList, deployDepsList) {
  if (depsList === undefined && deployDepsList === undefined) {
    switchName = 'No package.json or dependencies yaml';
  } 
  else if (deployDepsList === undefined && !(depsList === undefined)) {
    switchName = 'No dependencies.yaml';
  }
  else if (depsList === undefined && !(deployDepsList === undefined)) {
    switchName = 'No package.json';
  }
}