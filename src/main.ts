import * as dotenv from 'dotenv';
import express from 'express';
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

const app = express();
app.set('view engine', 'ejs');
app.set('views', 'src/views');

app.get('/', async (req, res) => {
  const authResponse = await axios({
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
  const accessToken = authResponse.data?.access_token;

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

  const cobResponse = await reqEFI.post('/v2/cob', dataCob);
  const qrCodeResponse = await reqEFI.get(
    `/v2/loc/${cobResponse.data.loc.id}/qrcode`
  );

  res.render('qrcode', { qrcodeImage: qrCodeResponse.data.imagemQrcode });
});

app.listen(5555, () => {
  console.log('Server running on port 5555...');
});
