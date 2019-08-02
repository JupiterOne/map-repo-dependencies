// const JupiterOneClient = require('@jupiterone/jupiterone-client-nodejs');
// import JupiterOneClient from '@jupiterone/jupiterone-client-nodejs';
const JupiterOneClient = require('@jupiterone/jupiterone-client-nodejs');
const fs = require('fs');

const J1_USER_POOL_ID_PROD = "us-east-2_9fnMVHuxD";
const J1_CLIENT_ID_PROD = "1hcv141pqth5f49df7o28ngq1u";
const accessToken = '';

const reposPath = './repos';
const repos = fs.readdirSync(reposPath);
const repoMap = new Map();

export async function getRepoIds() {
  const j1Client = await new JupiterOneClient({
    account: 'j1dev',
    username: 'j1dev',
    password: 'dev',
    poolId: J1_USER_POOL_ID_PROD,
    clientId: J1_CLIENT_ID_PROD,
    accessToken: accessToken,
    dev: true
  }).init();
  for (let i=0; i<repos.length; i++) {
    let currentRepo = repos[i];
    const repoID = await j1Client.queryV1(`Find CodeRepo with name='${currentRepo}'`);
    repoMap.set(repoID[0].entity._id, currentRepo);
  }
  return repoMap;
}  
