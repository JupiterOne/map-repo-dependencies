const JupiterOneClient = require('@jupiterone/jupiterone-client-nodejs');

export async function getClient(clientInput: {account, accessToken}) {
  const account = clientInput.account === '' ?
    process.env.J1_ACCOUNT :
    clientInput.account;
  const accessToken = clientInput.accessToken === '' ? 
    process.env.J1_API_TOKEN :
    clientInput.accessToken;
  if (accessToken === undefined || account === undefined) {
    throw(console.error('ERROR: MISSING CREDENTIALS'));
  }
  const j1Client = await new JupiterOneClient({
    account,
    accessToken,
    dev: process.env.J1_DEV || false
  }).init();

  return j1Client;
}