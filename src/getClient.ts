const readlineSync = require('readline-sync');
const JupiterOneClient = require('@jupiterone/jupiterone-client-nodejs');

let J1_ACCOUNT, J1_USERNAME, J1_PASSWORD;

export async function getClient(accountInput: string, usernameInput: string, passwordInput: string) {
  accountInput === '' ?
    J1_ACCOUNT = process.env.J1_ACCOUNT :
    J1_ACCOUNT = accountInput;
  usernameInput === '' ?
    J1_USERNAME = process.env.J1_USERNAME :
    J1_USERNAME = usernameInput
  passwordInput === '' ? 
    J1_PASSWORD = process.env.J1_PASSWORD :
    J1_PASSWORD = passwordInput;
  if (J1_ACCOUNT === undefined || J1_PASSWORD === undefined || J1_USERNAME === undefined) {
    throw(console.error('ERROR: MISSING CREDENTIALS'));
  }

  const j1Client = await new JupiterOneClient({
    account: J1_ACCOUNT,
    username: J1_USERNAME,
    password: J1_PASSWORD,
    poolId: process.env.J1_USER_POOL_ID,
    clientId: process.env.J1_CLIENT_ID,
    accessToken: process.env.J1_API_TOKEN,
    dev: process.env.J1_DEV || false
  }).init();

  return j1Client;
}