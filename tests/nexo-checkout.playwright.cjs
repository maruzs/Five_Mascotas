const http = require('node:http');
const { spawn } = require('node:child_process');
const path = require('node:path');
const os = require('node:os');
const fs = require('node:fs/promises');
const assert = require('node:assert/strict');
const { chromium } = require('playwright');

(async () => {
  const secret = 'b'.repeat(64);
  const requests = [];
  const upstream = http.createServer(async (req,res) => {
    assert.equal(req.headers['x-nexo-integration-token'],secret);
    if (req.url.startsWith('/public/catalog')) {
      res.setHeader('Content-Type','application/json');
      res.end(JSON.stringify({ count:1, shippingRates:{ 'ship-talca':1500 }, products:[{ id:'product',name:'Producto prueba Nexo',category:'Alimentos',brand:'Prueba',customAttributes:{ web_id:'prod-0' },variants:[{ id:'66666666-6666-4666-8666-666666666666',sku:'TEST',priceGross:'1190',available:20,unitOfMeasure:'BOLSA' }] }] })); return;
    }
    if (req.url.endsWith('/pdf')) { res.setHeader('Content-Type','application/pdf'); res.end('%PDF-1.4\n%%EOF'); return; }
    const chunks=[]; for await (const chunk of req) chunks.push(chunk);
    const input=JSON.parse(Buffer.concat(chunks).toString()); requests.push(input);
    res.setHeader('Content-Type','application/json');
    res.end(JSON.stringify({ kind:input.kind,id:'quote-test',number:input.kind==='QUOTATION'?'COT-TEST-000001':'ORD-TEST-000001',totalProducts:'1190',shippingFee:1500,totalDue:'2690',paymentStatus:'PENDING',bankDetails:{bankName:'Banco de prueba',accountType:'Corriente',accountNumber:'TEST',holderName:'Prueba',holderRut:'TEST',email:'test@example.test'} }));
  });
  await new Promise(resolve=>upstream.listen(0,'127.0.0.1',resolve));
  const probe = http.createServer(); await new Promise(resolve=>probe.listen(0,'127.0.0.1',resolve));
  const port=probe.address().port; await new Promise(resolve=>probe.close(resolve));
  const dataDir=await fs.mkdtemp(path.join(os.tmpdir(),'five-nexo-e2e-'));
  const child=spawn(process.execPath,['server/index.mjs'],{cwd:path.resolve(__dirname,'..'),env:{...process.env,PORT:String(port),DATA_DIR:dataDir,NODE_ENV:'test',PUBLIC_SITE_URL:`http://127.0.0.1:${port}`,NEXO_API_URL:`http://127.0.0.1:${upstream.address().port}`,NEXO_STORE:'test-five',NEXO_INTEGRATION_TOKEN:secret},stdio:['ignore','pipe','pipe'],windowsHide:true});
  const ready = new Promise((resolve,reject)=>{ child.stdout.on('data',data=>{if(data.toString().includes('Running on'))resolve();});child.once('exit',code=>reject(new Error('FIVE server exited '+code))); });
  let browser;
  try {
    await ready; browser=await chromium.launch({headless:true});
    const page=await browser.newPage({viewport:{width:390,height:844}});
    await page.goto(`http://127.0.0.1:${port}/alimentos/`);
    await page.locator('[data-add="prod-0"]').first().waitFor({state:'visible'});
    await page.waitForFunction(()=>document.querySelector('[data-add="prod-0"]')?.dataset.price==='1190');
    await page.locator('[data-add="prod-0"]').first().click();
    await page.evaluate(()=>document.querySelector('#five-checkout-btn').click());
    await page.locator('#chk-name').fill('Cliente de prueba'); await page.locator('#chk-phone').fill('+56912345678');
    await page.locator('#chk-email').fill('buyer@example.test'); await page.locator('#chk-address').fill('Dirección de prueba');
    await page.locator('#chk-quotation').check();
    await page.locator('#chk-form-step1 [type="submit"]').click();
    await page.locator('#chk-tracking-code').filter({hasText:'COT-TEST-000001'}).waitFor();
    assert.equal(requests.length,1); assert.equal(requests[0].kind,'QUOTATION');
    assert.deepEqual(requests[0].items,[{variantId:'66666666-6666-4666-8666-666666666666',quantity:1}]);
    assert.match(await page.locator('#chk-result-message').textContent(),/No se ha registrado un pago/);
    await page.locator('#chk-quotation-pdf').waitFor({state:'visible'});
    assert.match(await page.locator('#chk-result-status').textContent(),/Sin reserva de stock/);
    assert.equal(await page.locator('#chk-proof-help').isVisible(),false);
    const rejectedLegacy = await page.request.post(`http://127.0.0.1:${port}/api/orders`,{ data:{code:'FAKE',items:[]} });
    assert.equal(rejectedLegacy.status(),409);
    await page.screenshot({path:path.join(os.tmpdir(),'five-nexo-checkout-verified.png')});
    console.log('PASS browser FIVE: carrito móvil, cotización en Nexo, pago pendiente y enlace de PDF.');
  } finally {
    await browser?.close(); child.kill(); await new Promise(resolve=>upstream.close(resolve));
    if (dataDir.startsWith(path.join(os.tmpdir(),'five-nexo-e2e-'))) await fs.rm(dataDir,{recursive:true,force:true});
  }
})().catch(error=>{console.error(error);process.exitCode=1;});
