import Router from '@koa/router';
import { BeneficiaryApplication } from '@popcorn/utils';
import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import Koa from 'koa';
import koaBody from 'koa-body';
import logger from 'koa-logger';
import fetch from 'node-fetch';
const app = new Koa();
const router = new Router();
app.use(koaBody({ multipart: true }));

const KEY = '193289c4e4adb7101295';
const SECRET =
  '3396ef09a0b343c394e63b97a2c30216567110c049e6556c9bd86125dd9f0fe7';

interface UploadResult {
  status: number;
  hash?: string;
  errorDetails?: string;
}

router
  .get('/cid/:cid', async (ctx) => {
    // TODO: Source ipfs url from .env
    const url = `https://gateway.pinata.cloud/ipfs/${ctx.params.cid}`;
    const beneficiaryApplication: BeneficiaryApplication = await fetch(
      url,
    ).then((response) => response.json());
    ctx.status = 200;
    ctx.body = JSON.stringify(beneficiaryApplication);
  })
  .post('/add', async (ctx) => {
    const cid = await getCid(ctx.request.body);
    ctx.status = 200;
    ctx.body = cid;
  })
  .post('/upload', async (ctx) => {
    const { size, path, name, type } = ctx.request.files.file;
    console.log(ctx.request.files.file);
    const reader = fs.createReadStream(`${path}/${name}`);
    var data = new FormData();
    data.append('file', reader, name);
    const config = {
      headers: {
        'Content-Type': `multipart/form-data;`,
        pinata_api_key: KEY,
        pinata_secret_api_key: SECRET,
      },
    };
    const res = await axios
      .post('https://api.pinata.cloud/pinning/pinFileToIPFS/', data, config)
      .then((result) => {
        console.log('successful upload');
        console.log(result.data.IpfsHash);
        return { hash: result.data.IpfsHash, status: result.status };
      })
      .catch((error) => {
        console.log('error uploading');
        console.log({ error });
        if (error.response) {
          return {
            status: error.response.status,
            errorDetails: error.response.data.error.details,
          };
        }
        return error;
      });
    console.log({ res });
    ctx.body = res.hash;
    ctx.status = res.status;
  });

const getCid = async (
  beneficiaryApplication: BeneficiaryApplication,
): Promise<string> => {
  // TODO: Source ipfs url from .env
  // TODO: Source API keys from .env
  const cid = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      pinata_api_key: KEY,
      pinata_secret_api_key: SECRET,
    },
    body: JSON.stringify(beneficiaryApplication),
    redirect: 'follow',
  })
    .then((response) => response.text())
    .then((result) => {
      return JSON.parse(result).IpfsHash;
    })
    .catch((error) => {
      console.error(error);
    });
  return cid;
};

app.use(logger());
app.use(router.routes()).use(router.allowedMethods());

app.listen(5000);
