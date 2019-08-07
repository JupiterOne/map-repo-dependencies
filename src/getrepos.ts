import { getClient } from "./getClient";
import { error } from "console";
const JupiterOneClient = require('@jupiterone/jupiterone-client-nodejs');
const fs = require('fs');

const repoMap = new Map();

export async function getRepoIds(repoPath: string, accountInput, usernameInput, passwordInput) {
  const repos = fs.readdirSync(repoPath);
  const j1Client = await getClient(accountInput, usernameInput, passwordInput);

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
        await getRepoIds(newRepoPath, accountInput, usernameInput, passwordInput);
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