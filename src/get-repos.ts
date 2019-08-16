import { getClient } from "./get-client";
import { readdirSync, lstatSync } from 'fs';
import { resolve } from 'path';

const excludes = [
  'node_modules',
  'bin',
  'src',
  'test'
]

export async function getRepoIds(repoPath: string, clientInput: {account, accessToken}) {
  const repoMap = new Map();
  const repos = readdirSync(repoPath);
  const j1Client = await getClient(clientInput);

  for (const repo of repos) {
    const newRepoPath = resolve(repoPath, repo);
    if (repo.startsWith('.') || excludes.includes(repo) || !lstatSync(newRepoPath).isDirectory()) {
      continue;
    }

    const newFolders = readdirSync(newRepoPath);

    if (newFolders.includes('package.json')) {
      const repoID = await j1Client.queryV1(
        `Find CodeRepo with name='${repo}'`,
      );
      if (repoID.length > 0) {
        repoMap.set(repo, repoPath);
      }
      else {
        console.log('[SKIP] Could not query Repo (' + repo + ').');
      }
    }
    else if (await containsSubdirectory(newFolders, j1Client)) {
      const subMap = await getRepoIds(newRepoPath, clientInput);
      subMap.forEach((value, key) => {
        repoMap.set(key, value);
      })
    }
    else {
      console.log('[SKIP] Could not process (' + repo + ').');
    }
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