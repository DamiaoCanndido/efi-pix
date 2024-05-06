import * as dotenv from 'dotenv';
import axios from 'axios';
import https from 'https';
import fs from 'fs';
import path from 'path';

dotenv.config();

const cert = fs.readFileSync(
  path.join(__dirname, '..', 'certs', process.env.EFI_CERT!)
);

const agent = new https.Agent({
  pfx: cert,
  passphrase: '',
});

const credentials = Buffer.from(
  `${process.env.EFI_CLIENT_ID}:${process.env.EFI_CLIENT_SECRET}`
).toString('base64');

axios({
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
}).then((response) => {
  const accessToken = response.data?.access_token;

  const reqEFI = axios.create({
    baseURL: process.env.EFI_URL,
    httpsAgent: agent,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  const dataCob = {
    calendario: {
      expiracao: 3600,
    },
    devedor: {
      cpf: '12345678909',
      nome: 'Francisco da Silva',
    },
    valor: {
      original: '10.00',
    },
    chave: '160126bd-136d-4c38-b408-e600b6f56a23',
    solicitacaoPagador: 'Cobrança dos serviços prestados.',
  };

  reqEFI
    .post('/v2/cob', dataCob)
    .then((response) => console.log(response.data));
});
