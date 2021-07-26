const Koa = require('koa');
const Router = require('@koa/router');
const fetch = require('node-fetch');

const app = new Koa();
const router = new Router();

router.get('/cid/:cid', async (ctx) => {
  // TODO: Source ipfs url from .env
  const url = `https://gateway.pinata.cloud/ipfs/${ctx.params.cid}`;
  const beneficiaryApplication = await fetch(url).then((response) =>
    response.json(),
  );
  ctx.status = 200;
  ctx.body = JSON.stringify(beneficiaryApplication);
}).post('/add', async(ctx) => {

});

app.use(router.routes()).use(router.allowedMethods());

app.listen(5000);
