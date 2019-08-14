import { getClient } from "./getClient";
import { readdirSync } from 'fs';
import { resolve } from 'path';

const repoMap = new Map();

export async function getRepoIds(repoPath: string, clientInput: {account, accessToken}) {
  const repos = readdirSync(repoPath);
  const j1Client = await getClient(clientInput);

  for (const repo of repos) {
    if (repo === '.DS_Store') {
      continue;
    }
    const repoID = await j1Client.queryV1(
      `Find CodeRepo with name='${repo}'`,
    );
    if (repoID.length > 0) {
      repoMap.set(repo, repoPath);
      continue;
    }
    const newRepoPath = resolve(repoPath, repo);
    const newRepos = readdirSync(newRepoPath);
    let subdir = false;

    if (!(newRepos.includes('package.json')) && await containsSubdirectory(newRepos, j1Client, subdir)) {
      await getRepoIds(newRepoPath, clientInput);
      continue;
    }
    console.log('Could not query Repo (' + repo + ').');
  }
  return repoMap;
}

async function containsSubdirectory(newRepos, j1Client, subdir) {
  for (const nrepo of newRepos) {
    const newRepo = await j1Client.queryV1(`Find CodeRepo with name='${nrepo}'`);
    if (newRepo.length > 0) {
      subdir = true;
      break;
    }
  }
  return subdir;
}