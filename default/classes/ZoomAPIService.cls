public class ZoomAPIService{
    
    public Static String createToken() {
        
        ZoomAppCredentials__c zc = ZoomAppCredentials__c.getInstance();
        String APIKey = zc.API_Key__c;
        System.debug('APIKey : '+APIKey);
        
        String APISecret = zc.API_Secret__c;
        System.debug('APIKey : '+APISecret);
        
        String alg = 'HS256';
        String typ = 'JWT'; 
        String iss = APIKey;//'sDDep6URSQGT9m44UPwrCg';//api key
        String exp = String.valueOf(System.currentTimeMillis() + 60 * 60 * 1000);
            System.debug('exp'+exp);
        String headerJson = JSON.serialize(new Header(alg,typ));
        String bodyJson =  JSON.serialize(new Body(iss,exp));

        String token = EncodingUtil.base64Encode(Blob.valueOf(headerJson))
                + '.' + EncodingUtil.base64Encode(Blob.valueOf(bodyJson));
        String signature = EncodingUtil.base64Encode(Crypto.generateMac(
                'HMACSHA256',
                Blob.valueOf(token),
                //Blob.valueOf('2cT2mxsLXeM4MMlJxUdfQMMFi6zgLYeiT4fm') //api secrete
                Blob.valueOf(APISecret)
                ));
        token += '.' + signature;

        return token;
    }
    //inner class
    private class Header {
        String alg;
        String typ;
        Header(String alg,String typ) {
            this.alg = alg;
            this.typ = typ;
        }
    }
        //inner class
    private class Body {
        String iss;
        String exp;
        Body(String iss, String exp) {
            this.iss = iss;
            this.exp = exp;
        }
    }
}