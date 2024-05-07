import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import { EFIRequest } from './apis/efi';

const app = express();
app.set('view engine', 'ejs');
app.set('views', 'src/views');

const reqEFIalready = EFIRequest();

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

app.listen(5555, () => {
  console.log('Server running on port 5555...');
});
