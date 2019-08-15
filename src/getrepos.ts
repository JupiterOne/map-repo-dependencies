import { getClient } from "./getClient";
import { readdirSync, lstatSync } from 'fs';
import { resolve } from 'path';

const repoMap = new Map();

export async function getRepoIds(repoPath: string, clientInput: {account, accessToken}) {
  const repos = readdirSync(repoPath);
  const j1Client = await getClient(clientInput);

  for (const repo of repos) {
    const newRepoPath = resolve(repoPath, repo);
    if (repo.startsWith('.') || !lstatSync(newRepoPath).isDirectory()) {
      continue;
    }
    const repoID = await j1Client.queryV1(
      `Find CodeRepo with name='${repo}'`,
    );
    if (repoID.length > 0) {
      repoMap.set(repo, repoPath);
      continue;
    }

    const newFolders = readdirSync(newRepoPath);

    if (!(newFolders.includes('package.json')) && await containsSubdirectory(newFolders, j1Client)) {
      await getRepoIds(newRepoPath, clientInput);
      continue;
    }

    console.log('Could not query Repo (' + repo + ').');
  }
  return repoMap;
}

async function containsSubdirectory(newFolders, j1Client) {
  let subdir = false;
  for (const nrepo of newFolders) {
    const newRepo = await j1Client.queryV1(`Find CodeRepo with name='${nrepo}'`);
    if (newRepo.length > 0) {
      subdir = true;
      break;
    }
  }
  return subdir;
}