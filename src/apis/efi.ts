import axios from 'axios';
import https from 'https';
import fs from 'fs';
import path from 'path';
import 'dotenv/config';

const cert = fs.readFileSync(
  path.join(__dirname, '..', '..', 'certs', process.env.EFI_CERT!)
);

const agent = new https.Agent({
  pfx: cert,
  passphrase: '',
});

const credentials = Buffer.from(
  `${process.env.EFI_CLIENT_ID}:${process.env.EFI_CLIENT_SECRET}`
).toString('base64');

const authenticate = async () => {
  return await axios({
    method: 'POST',
    url: `${process.env.EFI_URL}/oauth/token`,
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/json',
    },
    httpsAgent: agent,
    data: {
      grant_type: 'client_credentials',
    },
  });
};

export const EFIRequest = async () => {
  const authResponse = await authenticate();
  const accessToken = authResponse.data?.access_token;

  return axios.create({
    baseURL: process.env.EFI_URL,
    httpsAgent: agent,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });
};
