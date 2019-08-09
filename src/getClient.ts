const JupiterOneClient = require('@jupiterone/jupiterone-client-nodejs');

export async function getClient(clientInput: {account, username, password, accessToken}) {
  const account = clientInput.account === '' ?
    process.env.J1_ACCOUNT :
    clientInput.account;
  const username = clientInput.username === '' ?
    process.env.J1_USERNAME :
    clientInput.username;
  const password = clientInput.password === '' ? 
    process.env.J1_PASSWORD :
    clientInput.password;
  const accessToken = clientInput.accessToken === '' ? 
    process.env.J1_API_TOKEN :
    clientInput.accessToken;
  if (account === undefined || username === undefined || password === undefined ||
      accessToken === undefined) {
    throw(console.error('ERROR: MISSING CREDENTIALS'));
  }
  const j1Client = await new JupiterOneClient({
    account,
    username,
    password,
    accessToken,
    dev: process.env.J1_DEV || false
  }).init();

  return j1Client;
}