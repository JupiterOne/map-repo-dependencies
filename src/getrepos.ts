import { getClient } from "./getClient";
const JupiterOneClient = require('@jupiterone/jupiterone-client-nodejs');
const fs = require('fs');

const repoMap = new Map();

export async function getRepoIds(repoPath: string, clientInput: string[]) {
  const repos = fs.readdirSync(repoPath);
  const j1Client = await getClient(clientInput);

  for (const repo of repos) {
    const repoID = await j1Client.queryV1(
      `Find CodeRepo with name='${repo}'`,
    );
    if (repoID.length === 0) {
      let newRepoPath = repoPath.substring(repoPath.length) === '/' ? repoPath + repo : repoPath + '/' + repo;
      let newRepos = fs.readdirSync(newRepoPath);
      let subdir = false;
      for (const nrepo of newRepos) {
        const lol = await j1Client.queryV1(`Find CodeRepo with name='${nrepo}'`);
        if (lol.length > 0) {
          subdir = true;
          break;
        }
      }
      if (subdir) {
        await getRepoIds(newRepoPath, clientInput);
      }
      else {
        console.log('Could not query Repo (' + repo + ').');
      }
    } else {
      repoMap.set(repo, repoPath);
    }
  }
  return repoMap;
}