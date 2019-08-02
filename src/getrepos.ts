// const JupiterOneClient = require('@jupiterone/jupiterone-client-nodejs');
// import JupiterOneClient from '@jupiterone/jupiterone-client-nodejs';
const JupiterOneClient = require('@jupiterone/jupiterone-client-nodejs');
const fs = require('fs');

const J1_USER_POOL_ID_PROD = "us-east-2_9fnMVHuxD";
const J1_CLIENT_ID_PROD = "1hcv141pqth5f49df7o28ngq1u";
const accessToken = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjFhZTJmNzU1LWJkYjktNDM3My1iMTU4LTQwZDNmMTBjYWJkNyJ9.eyJhY2NvdW50IjoiajFkZXYiLCJ1c2VybmFtZSI6ImoxZGV2X2F1c3Rpbi5rZWxsZWhlckBsaWZlb21pYy5jb20iLCJ2ZXJzaW9uIjoiMSIsInRva2VuX3VzZSI6ImFjY2VzcyIsInJuZCI6IlBqTXdkYkFHMG9SME8vNXQwZENGSlB2OHFTMXBNeVQ2Yld5NHpMSStpa0JWTThhS0tRNHdCRk5aSkFyRzN1RTUwZ0tRTC9pdTF6c0tuSnBTeXBCVzZnPT0iLCJpYXQiOjE1NjA5Njg4MDksImV4cCI6MTU5MjUwNDgwOSwiaXNzIjoiaHR0cHM6Ly9hcGkuZGV2Lmp1cGl0ZXJvbmUuaW8vdjEvYXBpLWtleXMiLCJqdGkiOiIxYzViNzkyMC0wM2QxLTRmMmItYWY0NS1hZmFiYmNhY2M4NjUifQ.J55b62t2LYKd0xW1FH16bZR8yU0jqUAdcY8aso5vo10qno4NUJeLqqfpcaZzplSq8kLjYlPTkye4w5-7um8n1dH8efXBfHmrQw4GUyi-JqVrnlcFuSRHD-FhBsK-fP4cyB740mtPtJ7QcjLH46UfvVscks-ajaCmLzYdxVA-98W5fNWYurWM2M0t9P497JjnLvM4zl9r2HqCPOGtIWtaDN0gq9qYCNYxmXwPo7DYFNFYliyipu3EH2tgMGirO48q3-6gfu7msURkgwagL_IMQDdhIsfdke6aUi6FTi7GJssTS814tyTYCIm6HIFKH9s7thtmg40P9ua3agcKxiosrw';

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
