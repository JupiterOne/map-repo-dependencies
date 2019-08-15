import { getDependencies, getDependenciesYaml } from './getDependencies';
import { getRepoIds } from './getRepos';
import { getClient } from './getClient';
import { question } from 'readline-sync';
import { createRepoRelationships, createDeployRelationships } from './createRepoRelationship';

require('dotenv').config();

let success = 0, failure = 0, switchName;
let missingDeps = [];
let packageScope = [];

(async () => {
  while (true) {
    const scope = question('Input a package scope, i.e. @package (input DONE when finished, HELP for other options): ');
    if (scope === 'DONE') {
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
  const access = question('Input access token. If using a .env file, continue without input: ');
  const clientInput = {account: account, accessToken: access};

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

    if (depsList !== undefined) {
      const relationship = await createRepoRelationships(depsList, mainRepo, j1Client, repoName, missingDeps);
      missingDeps = relationship.missingDeps;
      success += relationship.success;
      failure += relationship.failure;
    }
    if (deployDepsList !== undefined) {
      const relationship = await createDeployRelationships(deployDepsList, mainRepo, j1Client, repoName, missingDeps);
      missingDeps = relationship.missingDeps;
      success += relationship.success;
      failure += relationship.failure;
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