import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import { EFIRequest } from './apis/efi';

const app = express();
app.use(express.json());
app.set('view engine', 'ejs');
app.set('views', 'src/views');

const reqEFIalready = EFIRequest({
  clientId: process.env.EFI_CLIENT_ID!,
  clientSecret: process.env.EFI_CLIENT_SECRET!,
});

app.get('/', async (req, res) => {
  const reqEFI = await reqEFIalready;
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

app.get('/cobrancas', async (req, res) => {
  const reqEFI = await reqEFIalready;
  const cobResponse = await reqEFI.get(
    '/v2/cob?inicio=2024-01-01T00:00:00Z&fim=2024-12-31T23:59:59Z'
  );
  return res.send(cobResponse.data);
});

app.post('/webhook(/pix)?', (req, res) => {
  console.log(req.body);
  return res.send('200');
});

app.listen(5555, () => {
  console.log('Server running on port 5555...');
});
