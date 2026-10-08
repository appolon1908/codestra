/* Synthetic browser checks: provider mocked, no lead is submitted. */
const { chromium } = require('playwright');
const fs = require('node:fs');
const assert = require('node:assert/strict');
const base = process.env.CHAT_TEST_BASE_URL || 'http://127.0.0.1:3081';
const resultPath = process.env.CHAT_TEST_OUTPUT || '/tmp/chat-widget-browser.json';
(async () => {
 const browser = await chromium.launch({headless:true,args:['--no-sandbox']});
 const results=[];
 try {
  for (const viewport of [{width:1440,height:1000},{width:390,height:844}]) {
   const context=await browser.newContext({viewport});
   await context.route('**/api/**', route => route.fulfill({status:401,contentType:'application/json',body:'{"detail":"Synthetic unauthenticated response"}'}));
   await context.route('https://widgets.leadconnectorhq.com/loader.js', route => route.fulfill({status:200,contentType:'application/javascript',body:'window.__codestraTestWidgetLoads=(window.__codestraTestWidgetLoads||0)+1;'}));
   const page=await context.newPage();
   for (const path of ['/', '/contact', '/services', '/privacy', '/terms', '/sms', '/sms-terms', '/contact-information']) {
    const response=await page.goto(base+path,{waitUntil:'networkidle'});
    assert.equal(response.status(),200);
    await page.waitForFunction(() => window.__codestraTestWidgetLoads===1);
    assert.equal(await page.locator('script[data-widget-id="6ac7add4b17ff091c6b9a42c"]').count(),1);
    assert.match(response.headers()['content-security-policy'],/script-src[^;]*https:\/\/widgets.leadconnectorhq.com/);
    results.push({viewport:viewport.width,path,check:'public_single_loader',pass:true});
   }
   for (const path of ['/login','/signup']) {
    const response=await page.goto(base+path,{waitUntil:'networkidle'});
    assert.equal(await page.locator('#codestra-leadconnector-loader').count(),0);
    assert.equal(await page.evaluate(() => window.__codestraTestWidgetLoads),undefined);
    assert.doesNotMatch(response.headers()['content-security-policy'].split('script-src')[1].split(';')[0],/leadconnector/);
    results.push({viewport:viewport.width,path,check:'private_no_loader',pass:true});
   }
   await page.goto(base+'/',{waitUntil:'networkidle'});
   const origin=await page.evaluate(() => performance.timeOrigin);
   await page.evaluate(() => { history.pushState({},'', '/login'); window.dispatchEvent(new PopStateEvent('popstate')); });
   await page.waitForFunction(previous => performance.timeOrigin !== previous,origin);
   await page.waitForLoadState('networkidle');
   assert.equal(await page.locator('#codestra-leadconnector-loader').count(),0);
   assert.equal(await page.evaluate(() => window.__codestraTestWidgetLoads),undefined);
   results.push({viewport:viewport.width,check:'public_to_private_fresh_document',pass:true});
   const privateOrigin=await page.evaluate(() => performance.timeOrigin);
   await page.evaluate(() => { history.pushState({},'', '/contact'); window.dispatchEvent(new PopStateEvent('popstate')); });
   await page.waitForFunction(previous => performance.timeOrigin !== previous,privateOrigin);
   await page.waitForFunction(() => window.__codestraTestWidgetLoads===1);
   results.push({viewport:viewport.width,check:'private_to_public_fresh_document',pass:true});
   await context.close();
  }
  // Persist contract evidence before a separate external availability probe.
  fs.writeFileSync(resultPath,JSON.stringify({synthetic_checks:results,provider_mocked_for_contract_checks:true,live_form_submitted:false},null,2));
  const context=await browser.newContext();
  // The static preview has no application database. Mock only its API; vendor
  // requests below remain real and are reported independently.
  await context.route('**/api/**', route => route.fulfill({status:401,contentType:'application/json',body:'{"detail":"Preview has no application backend"}'}));
  const page=await context.newPage();
  const provider=[];
  const csp=[];
  await page.addInitScript(() => { window.__chatCspViolations=[]; document.addEventListener('securitypolicyviolation', e => window.__chatCspViolations.push({directive:e.effectiveDirective,blockedURI:e.blockedURI})); });
  page.on('response',response => {if(response.url().includes('leadconnector'))provider.push({url:response.url(),status:response.status()});});
  page.on('requestfailed',request => {if(request.url().includes('leadconnector'))provider.push({url:request.url(),error:request.failure()?.errorText});});
  await page.goto(base+'/sms',{waitUntil:'domcontentloaded',timeout:15000});
  await page.waitForTimeout(8000);
  await page.screenshot({path:resultPath.replace('.json','.png'),fullPage:true,timeout:15000});
  csp.push(...await page.evaluate(() => window.__chatCspViolations || []));
  const rendered=await page.locator('chat-widget').count();
  const report={live_widget_element_count:rendered,csp_violations:csp,synthetic_checks:results,provider_mocked_for_contract_checks:true,live_provider_probe:provider,local_api_mocked_for_static_preview:true,live_form_submitted:false};
  fs.writeFileSync(resultPath,JSON.stringify(report,null,2));
  console.log(JSON.stringify(report,null,2));
  assert.equal(rendered,1,'Real provider must create exactly one widget');
  assert.equal(csp.length,0,'No CSP violation may be silently ignored');
  assert.ok(provider.some(r => r.url.includes('/loader.js') && r.status===200),'Real vendor loader must succeed');
 } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode=1; });
