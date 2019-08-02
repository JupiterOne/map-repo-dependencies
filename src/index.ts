import { getDependencies } from './getdependencies';
import { getRepoIds } from './getrepos';
const JupiterOneClient = require('@jupiterone/jupiterone-client-nodejs');
const gql = require("graphql-tag");

const J1_USER_POOL_ID_PROD = "us-east-2_9fnMVHuxD";
const J1_CLIENT_ID_PROD = "1hcv141pqth5f49df7o28ngq1u";
const accessToken = '';

let success = 0, failure = 0;
const missingDeps = [];

;(async () => {
  const j1Client = await new JupiterOneClient({
    account: 'j1dev',
    username: 'j1dev',
    password: 'dev',
    poolId: J1_USER_POOL_ID_PROD,
    clientId: J1_CLIENT_ID_PROD,
    accessToken: accessToken,
    dev: true
  }).init();
  const repoMap = await getRepoIds();
  
  //value = Repo Name, key = Repo Entity ID
  for (let value of Array.from(repoMap.values())) {
    console.log('Repo: ' + value);

    //Get 'From' Repo
    const mainRepo = await j1Client.queryV1(`FIND CodeRepo WITH name='${value}'`);
    const depsList = getDependencies(value);
    if (depsList.length > 0) {
      for (let i=0; i<depsList.length; i++) {  
        const fullName = depsList[i].substring(1, depsList[i].indexOf(':'));

        //Check if Bitbucket Repo
        const depRepo = await j1Client.queryV1(`FIND CodeRepo WITH full_name='${fullName}'`);
    
        if (depRepo.length > 0) {
          const relationshipKey = mainRepo[0].entity._key + '|uses|' + depRepo[0].entity._key;
          const relationship = await j1Client.createRelationship(
            relationshipKey, 
            'bitbucket_repo_uses_bitbucket_repo', 
            'USES', 
            mainRepo[0].entity._id, 
            depRepo[0].entity._id
            );
          // console.log(value + ' uses ' + depsList[i]);
          console.log('Successfully created relationship (' + value + ' USES ' + depsList[i] + ').');
          success++;
        }
        else {
          const name = fullName.substring(fullName.indexOf('/')+1);

          //Check if Github Repo
          const ghDepRepo = await j1Client.queryV1(`FIND CodeRepo WITH name='${name}'`);
          if (ghDepRepo.length > 0) {
            const relationshipKey = mainRepo[0].entity._key + '|uses|' + ghDepRepo[0].entity._key;
            const relationship = await j1Client.createRelationship(
              relationshipKey, 
              'bitbucket_repo_uses_github_repo', 
              'USES', 
              mainRepo[0].entity._id, 
              ghDepRepo[0].entity._id
            );
            console.log('Successfully created relationship (' + value + ' USES ' + depsList[i] + ').');
            success++;
          }
          else {
            console.log('Failed to create relationship with ' + 
                          depsList[i].substring(0, depsList[i].indexOf(':')) + 
                          ' (was not found on the graph). Skipped.');
            failure++;
            if (missingDeps.indexOf(depsList[i]) === -1) {
              missingDeps.push(depsList[i]);
            }
          }
        }
      }
    }
    else {
      console.log('Repo has no @lifeomic or @jupiterone dependencies');
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
})().catch((err) => {
  console.error('', err);
});



