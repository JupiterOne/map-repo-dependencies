const readlineSync = require('readline-sync');
const JupiterOneClient = require('@jupiterone/jupiterone-client-nodejs');

let J1_ACCOUNT, J1_USERNAME, J1_PASSWORD, J1_API_TOKEN;

export async function getClient(clientInput: string[]) {
  console.log(clientInput);
  clientInput[0] === '' ?
    J1_ACCOUNT = process.env.J1_ACCOUNT :
    J1_ACCOUNT = clientInput[0];
  clientInput[1] === '' ?
    J1_USERNAME = process.env.J1_USERNAME :
    J1_USERNAME = clientInput[1];
  clientInput[2] === '' ? 
    J1_PASSWORD = process.env.J1_PASSWORD :
    J1_PASSWORD = clientInput[2];
  clientInput[3] === '' ? 
    J1_API_TOKEN = process.env.J1_API_TOKEN :
    J1_API_TOKEN = clientInput[3];
  if (J1_ACCOUNT === undefined || J1_PASSWORD === undefined || J1_USERNAME === undefined ||
      J1_API_TOKEN === undefined) {
    throw(console.error('ERROR: MISSING CREDENTIALS'));
  }

  const j1Client = await new JupiterOneClient({
    account: J1_ACCOUNT,
    username: J1_USERNAME,
    password: J1_PASSWORD,
    accessToken: J1_API_TOKEN,
    dev: process.env.J1_DEV || false
  }).init();

  return j1Client;
}