/**********************************************************
@class      CalloutUtility
@brief      Provide methods which facilitate calls to the Encompass API
@testClass  CalloutUtilityTest
@author     Lee Hildebrand (EMS.Senior Salesforce Developer)
@version    05/11/2017    Lee Hildebrand (EMS.Senior Salesforce Developer) Create class
@bug        No known defects.
@todo       None.
@copyright  (c)2017 EMS.  All Rights Reserved. Unauthorized use is prohibited.
***********************************************************/
public class CalloutUtility {

    public static Encompass_Connect_Setting_Endpoint__mdt endpoint(String endpointName) {
        return [
                SELECT Endpoint__c,
                        Content_Type__c,
                        Grant_Type__c,
                        Method__c,
                        Parameters__c,
                        SuccessCode__c
                FROM Encompass_Connect_Setting_Endpoint__mdt
                WHERE DeveloperName = :endpointName
                LIMIT 1
        ];
    }

    public class CalloutException extends Exception {}

    public static AuthorizationUtility.token activeBearerToken(AuthorizationUtility.token token) {
        if (token == null || !AuthorizationUtility.tokenIntrospection(token).active) {
            return AuthorizationUtility.getToken();
        } else {
            return token;
        }
    }

    public static String authHeaderValue(AuthorizationUtility.token token) {
        token = activeBearerToken(token);
        if (token == null) return null;
        return token.token_type + ' ' + token.access_token;
    }

    public static HttpRequest returnEncompassRequest(String endpointName, String body, String guid, String templateName) {
        System.debug('CalloutUtility.returnEncompassRequest(' + endpointName + ')');
        Encompass_Connect_Setting_Endpoint__mdt config = CalloutUtility.endpoint(endpointName);
        String endpoint = config.Endpoint__c;
        if (guid != null) {
            endpoint = endpoint + '/' + guid;
        }
        // Add Parameters
        if (String.isNotBlank(config.Parameters__c)) {
            endpoint = endpoint + config.Parameters__c;
        }
        // Add Loan Officer assignment
        // DOES NOT WORK WHEN COMBINED WITH SETTING LOAN TEMPLATE
        // ELLIE MAE SUPPORT CONFIRMED THIS IS A KNOWN BUG
//        if (String.isNotBlank(loUsername)) {
//            endpoint = endpoint + '&loId=' + loUsername;
//        }
        // Add Template Name
        if (String.isNotBlank(templateName)) {
            endpoint = endpoint + templateName;
        }
        HttpRequest req = new HttpRequest();
        req.setEndpoint(endpoint);
        req.setMethod(config.Method__c == 'PATCH' ? 'POST' : config.Method__c);
        req.setHeader('Content-Type', config.Content_Type__c);
        if (!Test.isRunningTest()) {
            req.setHeader('Authorization', CalloutUtility.authHeaderValue(null));
        }
        if (config.Method__c == 'PATCH') {
            req.setHeader('X-HTTP-Method-Override', 'PATCH'); // Salesforce doesn't support direct PATCH callouts
        }
        req.setTimeout(120000);
        if (!String.isBlank(body)) req.setBody(body);
        return req;
    }

    //
    // check return code from Encompass
    //
    public static void assertSuccessCode(String endpointName, Integer statusCode) {
        if (CalloutUtility.endpoint(endpointName).SuccessCode__c != statusCode) {
            throw new CalloutException('Error calling Encompass (HTTP Code: ' + statusCode + ')');
        }
    }

    //
    // call for the Media URL of the AttachmentNativeId
    //
    public static MediaURL getMediaURL(String requestName, String loanGUID, String attachmentId, Integer pageNumber){
        try{
            HttpRequest req = CalloutUtility.returnEncompassRequest(requestName, null, null, null);
            req.setEndpoint(req.getEndpoint().replace('{loanId}', loanGUID));
            req.setEndpoint(req.getEndpoint().replace('{attachmentId}', attachmentId));
            if(pageNumber!=null) req.setEndpoint(req.getEndpoint().replace('{pageId}', String.ValueOf(pageNumber)));
            HttpResponse response = new Http().send(req);
            CalloutUtility.assertSuccessCode(requestName, response.getStatusCode());
            return (MediaURL) JSON.createParser(response.getBody()).readValueAs(MediaURL.class);
        }catch (Exception e){
            handleErrors(e);
            return null;
        }
    }

    //
    // get the file contents for an attachment stored in Encompass
    //
    public static HttpResponse returnMediaResponse(MediaURL mURL){
        HttpRequest req = CalloutUtility.returnEncompassRequest('ViewFile', null, null, null);
        req.setEndpoint(mURL.mediaURL);
        HttpResponse res = new Http().send(req);
        CalloutUtility.assertSuccessCode('ViewFile', res.getStatusCode());
        return res;
    }

    //
    // get list of pages on an Attachment
    // get the list of pages from the Attachment being viewed
    //
    public static AttachmentPage[] getPages(String loanGUID,String attachmentId){
        HttpRequest req = CalloutUtility.returnEncompassRequest('Get_Attachment', null, null, null);
        req.setEndpoint(req.getEndpoint().replace('{loanId}', loanGUID));
        req.setEndpoint(req.getEndpoint().replace('{attachmentId}', attachmentId));
        AttachmentPage[] pages = new AttachmentPage[]{};

        HttpResponse response = new Http().send(req);
        try{
            CalloutUtility.assertSuccessCode('Get_Attachment', response.getStatusCode());
            JSONParser parser = JSON.createParser(response.getBody());
            while (parser.nextToken() != null) {
                if(parser.getText() == 'pages'){
                    while(parser.getCurrentToken() != JSONToken.END_ARRAY) {
                        if (parser.getCurrentToken() == JSONToken.START_OBJECT)
                            pages.add((AttachmentPage) parser.readValueAs(AttachmentPage.class));
                        parser.nextToken();
                    }
                    parser.nextToken();
                }else parser.nextToken();
            }
            return pages;
        }catch (Exception e){
            CalloutUtility.handleErrors(e);
            return null;
        }
    }

    //
    // handle errors
    //
    public static void handleErrors(Exception e){
        system.debug(e);
    }
}