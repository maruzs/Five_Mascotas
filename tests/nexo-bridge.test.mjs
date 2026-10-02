import assert from 'node:assert/strict';
import http from 'node:http';
import { mapCatalog, nexoCheckout } from '../server/nexo.mjs';

const credential = 'a'.repeat(64); // Isolated test credential.
const sent = [];
const catalog = { products:[{ id:'p',name:'Prueba',description:'',brand:'Marca',category:'Alimentos',customAttributes:{ web_id:'prod-0',protein_percentage:32,gallery_images:['https://example.test/p.jpg'] },variants:[{ id:'variant-uuid',sku:'SKU',priceGross:'1190',taxRate:'.19',available:5 }] }],count:1 };
const upstream = http.createServer(async (req,res) => {
  assert.equal(req.headers['x-nexo-integration-token'],credential);
  res.setHeader('Content-Type','application/json');
  if (req.url.startsWith('/public/catalog')) { res.end(JSON.stringify(catalog)); return; }
  const chunks=[]; for await (const chunk of req) chunks.push(chunk);
  const body = JSON.parse(Buffer.concat(chunks).toString());
  sent.push(body); assert.equal(req.headers.origin,undefined);
  res.end(JSON.stringify({ kind:'ORDER',number:'ORD-TEST',totalProducts:'1190',totalDue:'1190',paymentStatus:'PENDING' }));
});
await new Promise(resolve => upstream.listen(0,'127.0.0.1',resolve));
process.env.NEXO_API_URL=`http://127.0.0.1:${upstream.address().port}`;
process.env.NEXO_INTEGRATION_TOKEN=credential; process.env.NEXO_STORE='test-five'; process.env.NODE_ENV='test';
try {
  const mapped=mapCatalog(catalog);
  assert.equal(mapped[0].id,'prod-0'); assert.equal(mapped[0].price,1190); assert.equal(mapped[0].proteinPct,32);
  const duplicated = mapCatalog({ products:[catalog.products[0], { ...catalog.products[0], id:'p2', variants:[{...catalog.products[0].variants[0],id:'second-variant'}] }] });
  assert.deepEqual(duplicated.map(p=>p.id),['variant-uuid','second-variant']);
  await nexoCheckout({ kind:'ORDER', shippingRateId:'pickup', organizationId:'attack', paymentStatus:'PAID', total:1, items:[{id:'prod-0',quantity:1,price:1}], customer:{name:'Prueba'} },'11111111-1111-4111-8111-111111111111');
  assert.deepEqual(sent[0].items,[{variantId:'variant-uuid',quantity:1}]);
  assert.equal(sent[0].organizationId,undefined); assert.equal(sent[0].total,undefined); assert.equal(sent[0].paymentStatus,undefined);
  await assert.rejects(()=>nexoCheckout({items:[{id:'private',quantity:1}]},'test'),/inválidos/);
  console.log('PASS Nexo bridge: catálogo, precios del servidor y exclusión de tenant/pago/precios del navegador.');
} finally { await new Promise(resolve => upstream.close(resolve)); }
