import { getDependencies, getDeployDependencies } from './get-dependencies';
import { getRepoIds } from './get-repos';
import { getClient } from './get-client';
import { question } from 'readline-sync';
import { createRepoRelationships } from './create-repo-relationship';

require('dotenv').config();

let success = 0, failure = 0;
let missingDeps = [];
let packageScope = [];

(async () => {
  while (true) {
    const scope = question(
      '\nInput a package scope, e.g. @jupiterone (input ALL for everything, DONE when finished, HELP for other options):\n'
    );
    if (scope === 'DONE') {
      break;
    }
    if (scope === 'ALL') {
      packageScope.push(scope);
      break;
    }
    if (scope === 'HELP') {
      console.log('1. ALL = All dependencies');
      console.log('2. (No Input) = All dependencies not starting with \'@\'');
      continue;
    }
    packageScope.push(scope);
  }
  const pathToRepos = question('\nInput path to directory with repos (relative to root directory):\n');
  const account = question('\nInput your JupiterOne account id. If using a .env file, continue without input:\n');
  const access = question('\nInput your JupiterOne access token. If using a .env file, continue without input:\n');
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
    const deployDepsList = getDeployDependencies(repoName, repoMap);

    if (depsList) {
      const results = await createRepoRelationships(depsList, mainRepo, j1Client, repoName, missingDeps);
      success += results.success;
      failure += results.failure;
    }
    if (deployDepsList) {
      const results = await createRepoRelationships(deployDepsList, mainRepo, j1Client, repoName, missingDeps, true);
      success += results.success;
      failure += results.failure;
    }
    
    console.log('');
  }
  console.log('Summary:');
  console.log('Created Relationships: ' + success);
  console.log('Failed Attempts: ' + failure);
  if (missingDeps.length > 0) {
    console.log('Unable to create relationship to the following dependencies:');
    console.log('  - ' + missingDeps.join('\n  - '));
  }
})().catch(err => {
  console.error('', err);
});