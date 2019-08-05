const JupiterOneClient = require('@jupiterone/jupiterone-client-nodejs');
const fs = require('fs');

const reposPath = './repos';
const repos = fs.readdirSync(reposPath);
const repoMap = new Map();

export async function getRepoIds() {
  const j1Client = await new JupiterOneClient({
    account: 'j1dev',
    username: 'j1dev',
    password: 'dev',
    poolId: process.env.J1_USER_POOL_ID,
    clientId: process.env.J1_CLIENT_ID,
    accessToken: process.env.J1_API_TOKEN,
    dev: true,
  }).init();

  for (let repo of repos) {
    const repoID = await j1Client.queryV1(
      `Find CodeRepo with name='${repo}'`,
    );
    if (repoID.length === 0) {
      console.log('Could not query Repo (' + repo + ').');
    } else {
      repoMap.set(repoID[0].entity._id, repo);
    }
  }
  console.log('');
  return repoMap;
}