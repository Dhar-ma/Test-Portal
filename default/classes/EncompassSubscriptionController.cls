/**********************************************************
@class      EncompassSubscriptionController
@brief      This class will manage adding or deleting an encompass subscription
@testClass  EncompassSubscriptionControllerTest
@author     Developer Name (rchapple)
@version    2/1/2018   Developer Name (rchapple)
@bug        No known defects.
@todo       None.
@copyright  (c)2018 EMS.  All Rights Reserved. Unauthorized use is prohibited.
***********************************************************/
public with sharing class EncompassSubscriptionController {

    // Update defaults to true
    public Boolean updateSelected=true;
    // Create defaults to false
    public Boolean createSelected=true;
    public String currentSubscriptionId {get; set;}
    private static final String UPDATE_VALUE='update';
    private static final String CREATE_VALUE='create';
    private List<Get_Response_Body_Item> itemsRead = new List<Get_Response_Body_Item>();

    public class EncompassException extends Exception {}

    class Get_Response_Body_Item {
        // There are additional fields but these are the only ones we need to examine
        String subscriptionId {set; get;}
        String endpoint {set; get;}
    }

    class Create_Body {
        String endpoint;
        List<String> events;
        String resource;

        Create_Body(Boolean createSelected, Boolean updateSelected) {
            Encompass_Connect_Setting_Endpoint__mdt callback = CalloutUtility.endpoint('Encompass_Callback');
            if(callback != null) {
                this.endpoint = callback.Endpoint__c;
            }
            events = new List<String>();
            if(createSelected) {
                events.add(CREATE_VALUE);
            }
            if(updateSelected) {
                events.add(UPDATE_VALUE);
            }
            // Rob Sullivan: 23-Jan-2021: Encompass API now requires specifying the resource.
            // (seems it was previously defaulted to Loan if left null).
            this.resource = 'Loan';
        }
    }

    //create the Subscription to Loans in Encompass
    public PageReference create(){
        String callBody = JSON.serialize(new Create_Body(this.createSelected, this.updateSelected));
        System.Debug(LoggingLevel.DEBUG, 'Calculated Call Body is:'+callBody);
        // Need to call Encompass to create the subscription
        HttpResponse response;
        try{
            Encompass_Connect_Setting_Endpoint__mdt ecse = +CalloutUtility.endpoint('Create_Subscription');
            HttpRequest req = new HttpRequest();
            req.setEndpoint(ecse.Endpoint__c);
            req.setMethod(ecse.Method__c);
            req.setheader('Content-Type', ecse.Content_Type__c);
            setAuthorization(req);
            req.setTimeout(120000);
            Http h = new Http();
            req.setBody(callBody);
            System.debug('req: ' + req);
            response = h.send(req);
        } catch(Exception e){
            throw new EncompassException('The subscription could not be created.'+
            ' \n There was a(n) '+e.getTypeName()+
            ' type of error stating: \n"'+e.getMessage()+
            '"\n on line '+e.getLineNumber()+
            ' when running:  \n'+e.getStackTraceString());
        }
        System.debug('response: ' + response);
        if(response.getStatusCode() > 299) {
            throw new EncompassException('The call was not successful.' + '\n Status Code: '+response.getStatusCode());
        }
        System.debug(LoggingLevel.DEBUG, 'Response Header Location:'+response.getHeader('Location'));
        String location = response.getHeader('Location');
        string[] locationParts = location.split('/');
        if(locationParts.size()>1)
        {
            this.currentSubscriptionId=locationParts[locationParts.size()-1];
        }
        return null;
    }

    //create the Subscription to Loans in Encompass
    public PageReference getExistingSubscriptions(){
        // Need to call Encompass to create the subscription
        HttpResponse response;
        try{
            Encompass_Connect_Setting_Endpoint__mdt ecse = +CalloutUtility.endpoint('Get_Subscriptions');
            HttpRequest req = new HttpRequest();
            req.setEndpoint(ecse.Endpoint__c);
            req.setMethod(ecse.Method__c);
            req.setheader('Content-Type', ecse.Content_Type__c);
            setAuthorization(req);
            req.setTimeout(120000);
            Http h = new Http();
            response = h.send(req);
        } catch(Exception e){
            throw new EncompassException('The subscription could not be created.'+
                    ' \n There was a(n) '+e.getTypeName()+
                    ' type of error stating: \n"'+e.getMessage()+
                    '"\n on line '+e.getLineNumber()+
                    ' when running:  \n'+e.getStackTraceString());
        }
        if(response.getStatusCode() > 299) {
            throw new EncompassException('The call was not successful.' + '\n Status Code: '+response.getStatusCode());
        }
        itemsRead = (List<Get_Response_Body_Item>)JSON.deserialize(response.getBody(), List<Get_Response_Body_Item>.class);
        System.debug(LoggingLevel.DEBUG, 'ItemsRead:'+itemsRead);
        getCurrentSubscriptionId(itemsRead);
        return null;
    }

    //Delete the Subscription to Loans from Encompass
    public PageReference deleteSubscription(){
        if(String.isBlank(this.currentSubscriptionId)) {
            throw new EncompassException('The call cannot be made without an existing subscription number.  Try calling Get Subscriptions first' );
        }
        // Need to call Encompass to create the subscription
        HttpResponse response;
        try{
            Encompass_Connect_Setting_Endpoint__mdt ecse = +CalloutUtility.endpoint('Delete_Subscription');
            HttpRequest req = new HttpRequest();
            req.setEndpoint(ecse.Endpoint__c + '/' + this.currentSubscriptionId);
            req.setMethod(ecse.Method__c);
            req.setheader('Content-Type', ecse.Content_Type__c);
            setAuthorization(req);
            req.setTimeout(120000);
            Http h = new Http();
            response = h.send(req);
        } catch(Exception e){
            throw new EncompassException('The subscription could not be created.'+
                    ' \n There was a(n) '+e.getTypeName()+
                    ' type of error stating: \n"'+e.getMessage()+
                    '"\n on line '+e.getLineNumber()+
                    ' when running:  \n'+e.getStackTraceString());
        }
        if(response.getStatusCode() > 299) {
            throw new EncompassException('The call was not successful.' + '\n Status Code: '+response.getStatusCode());
        }
        this.currentSubscriptionId=null;
        return null;
    }

    private void getCurrentSubscriptionId(List<Get_Response_Body_Item> itemsRead) {
        // Clear the current value first.
        this.currentSubscriptionId=null;
        Encompass_Connect_Setting_Endpoint__mdt callback = CalloutUtility.endpoint('Encompass_Callback');
        if(callback != null) {
            for (Get_Response_Body_Item item : itemsRead) {
                if (item.endpoint.equals(callback.Endpoint__c)) {
                    this.currentSubscriptionId = item.subscriptionId;
                }
            }
        }
    }

    private void setAuthorization(HttpRequest req) {
        if(Test.isRunningTest()) {
            req.setHeader('Authorization', '1234567890');
        } else {
            String authValue=CalloutUtility.authHeaderValue(null);
            System.Debug(LoggingLevel.DEBUG, 'Token:'+authValue);
            if(String.isNotBlank(authValue)) {
                req.setHeader('Authorization', authValue);
            }
        }
    }
}