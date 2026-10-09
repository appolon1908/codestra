#!/usr/bin/env python3
"""Read-only checks of real policy bodies, proxy-safe redirects, and route CSP."""
import argparse,json,urllib.request,urllib.error
from datetime import datetime,timezone
class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self,*args,**kwargs): return None

def verify(base):
    opener=urllib.request.build_opener(NoRedirect())
    results=[]
    for route,title in {'privacy':'Privacy Policy','terms':'Terms &amp; Conditions','sms':'SMS Updates','sms-terms':'SMS Terms','contact-information':'Business Contact Information'}.items():
        with opener.open(base+'/'+route,timeout=10) as response:
            body=response.read().decode('utf-8')
            assert response.status==200 and '<h1' in body and title in body and 'CODESTRA LLC' in body,route
            assert '<div id="root"></div>' not in body,route+' returned an empty fallback'
            assert response.headers.get_content_type()=='text/html',route
            results.append({'path':'/'+route,'status':200,'real_document':True,'bytes':len(body.encode())})
    for alias,target in {'/privacy-policy/':'/privacy','/privacy/':'/privacy','/terms-and-conditions/':'/terms','/terms-of-service/':'/terms','/sms/index.html':'/sms'}.items():
        try: response=opener.open(base+alias,timeout=10)
        except urllib.error.HTTPError as err:response=err
        assert response.code==308,alias+' must redirect'
        assert response.headers.get('Location')==target,(alias,response.headers.get('Location'),'must preserve visitor origin, scheme and external port')
        results.append({'path':alias,'status':308,'location':target,'same_origin_redirect':True})
    for route,public in [('/sms',True),('/login',False),('/signup',False),('/dashboard',False)]:
        with opener.open(base+route,timeout=10) as response:
            csp=response.headers.get('Content-Security-Policy','')
            script=csp.split('script-src',1)[1].split(';',1)[0]
            assert ('leadconnectorhq.com' in script)==public,route
            assert 'unsafe-inline' not in script and 'unsafe-eval' not in script,route
            results.append({'path':route,'status':response.status,'public_script_permission':public,'script_policy_verified':True})
    return {'at':datetime.now(timezone.utc).isoformat(),'base_url':base,'checks':results,'passed':len(results),'mutations':False}
if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--base',required=True);parser.add_argument('--output')
    args=parser.parse_args();result=verify(args.base.rstrip('/'));text=json.dumps(result,indent=2)
    if args.output:
        from pathlib import Path
        Path(args.output).write_text(text+'\n')
    print(text)
