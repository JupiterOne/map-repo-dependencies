import { getClient } from "./getClient";
import { readdirSync } from 'fs';

const repoMap = new Map();

export async function getRepoIds(repoPath: string, clientInput: {account, accessToken}) {
  const repos = readdirSync(repoPath);
  const j1Client = await getClient(clientInput);

  for (const repo of repos) {
    const repoID = await j1Client.queryV1(
      `Find CodeRepo with name='${repo}'`,
    );
    if (repoID.length === 0) {
      const newRepoPath = repoPath.substring(repoPath.length-1) === '/' ? repoPath + repo : repoPath + '/' + repo;
      const newRepos = readdirSync(newRepoPath);
      let subdir = false;
      for (const nrepo of newRepos) {
        const newRepo = await j1Client.queryV1(`Find CodeRepo with name='${nrepo}'`);
        if (newRepo.length > 0) {
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