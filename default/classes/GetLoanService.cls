/**********************************************************
@class      GetLoanService
@brief      This service will facilitate calling Encompass to read a loan and then process the response
@testClass  GetLoanServiceTest
@author     Developer Name (rchapple)
@version    2/6/2018   Developer Name (rchapple)
@bug        No known defects.
@todo       None.
@copyright  (c)2018 EMS.  All Rights Reserved. Unauthorized use is prohibited.
***********************************************************/

global virtual with sharing class GetLoanService {
    @testVisible
    private static Integer retryCount=0;
    @testVisible
    private static Integer MAX_RETRIES=5;

    @future (callout=true)
    public static void readAndUpdateLoanFuture(String loanId) {
        readAndUpdateLoan(loanId);
    }

    public static void readAndUpdateLoan(String loanId) {
        if(String.isBlank(loanId)) {
            return;
        }
        // Need to call Encompass to read the loan
        HttpResponse response;
        List<String> jsonBodyList = new List<String>();

        String authValue;
        try{
            Encompass_Connect_Setting_Endpoint__mdt ecse = +CalloutUtility.endpoint('Get_Loan');
            HttpRequest req = new HttpRequest();
            // Add the loan Id to the defined Get Endpoint
            String endpoint = ecse.Endpoint__c + '/' + loanId;
            String endpoint2 = endpoint + '/associates';
            String endpoint3 = endpoint + '/metadata';

            if(String.isNotBlank(ecse.Parameters__c)) {
                endpoint += ecse.Parameters__c;
            }
            req.setEndpoint(endpoint);
            req.setMethod(ecse.Method__c);
            req.setheader('Content-Type', ecse.Content_Type__c);
            req.setTimeout(120000);
            response = makeCall(req);
            for(Integer i = retryCount; i <= MAX_RETRIES && response.getStatusCode() == 401 /*Unauthorized*/; i++) {
                response = makeCall(req);
                retryCount=i;
            }
            // Assume if we finally got the first call to go through we can make the second call
            if(response.getStatusCode() < 300) {
                // Add current body to list
                jsonBodyList.add(response.getBody());
                // Change the endpoint in the request. All other details are the same.
                req.setEndpoint(endpoint2);
                Http h = new Http();
                response = h.send(req);

                if(response.getStatusCode() < 300) {
                    // Add Body2 to the list but this takes a little special processing
                    String response2Body = '{"loanTeamMember": ' + response.getBody() + ' } ';
                    jsonBodyList.add(response2Body);
                    req.setEndpoint(endpoint3);
                    response = h.send(req);
                }
            }
        } catch(Exception e){
            requeueLoanRead(loanId, String.valueOf(response.getStatusCode()), response.getStatus());
            System.Debug(LoggingLevel.DEBUG,'The Loan could not be retrieved.'+
                    ' \n There was a(n) '+e.getTypeName()+
                    ' type of error stating: \n"'+e.getMessage()+
                    '"\n on line '+e.getLineNumber()+
                    ' when running:  \n'+e.getStackTraceString());
            // Fail silently but the integration status will track the status
            return;
        }
        if(response.getStatusCode() > 299) {
            requeueLoanRead(loanId, String.valueOf(response.getStatusCode()), response.getStatus());
            System.Debug(LoggingLevel.DEBUG, 'The call was not successful.' + '\n Status Code: '+response.getStatusCode());
            // Fail silently but the Integration Status record will track the status
            return;
        }
        if(response!=null && response.getStatusCode() > 299) {
            throw new EncompassSubscriptionController.EncompassException('The Calls to Encompass were not successful.' + '\n Status Code:' + response.getStatusCode());
        }
        InboundIntegrationService service = new InboundIntegrationService();
        try {
            // Last Response still needs to be added to the list
            jsonBodyList.add(response.getBody());
            service.processJsonBody('Loan', loanId, jsonBodyList);
            updateSuccessLoanStatus(loanId);
        } catch (Exception e) {
            requeueLoanRead(loanId, e.getTypeName(), e.getMessage());
        }
    }

    private static HttpResponse makeCall(HttpRequest req) {
        Http h = new Http();
        String authValue = CalloutUtility.authHeaderValue(null);
        if(String.isNotBlank(authValue)) {
            req.setHeader('Authorization', authValue);
        }
        return h.send(req);
    }

    private static void updateSuccessLoanStatus(String loanGuid) {
        List<Integration_Status__c> statuses = [Select Id,
                Integration_Last_Error_Code__c,
                Integration_Last_Error_Message__c,
                Update_Integration_Status__c,
                Update_Integration_Success_Date__c,
                Update_Integration_Try_Count__c
        From Integration_Status__c where Linked_Object_Id__c=:loanGuid];

        if(statuses.size() != 0) {
            statuses.get(0).Update_Integration_Status__c='SUCCESS';
            statuses.get(0).Update_Integration_Success_Date__c = System.Now();
            statuses.get(0).Update_Integration_Try_Count__c=0;
            update statuses;
        }
    }

    private static void requeueLoanRead(String loanGuid, String errorCode, String errorMessage) {
        // Need to read or create an Integration Status record to track the status of this integration
        List<Integration_Status__c> statuses = [Select Id,
                Integration_Last_Error_Code__c,
                Integration_Last_Error_Message__c,
                Update_Integration_Status__c,
                Update_Integration_Success_Date__c,
                Update_Integration_Try_Count__c
                From Integration_Status__c where Linked_Object_Id__c=:loanGuid];

        if(statuses.size() == 0) {
            statuses.add(createIntegrationStatus('ResidentialLoanApplication', loanGuid, null, 'FAIL'));
        }
        // Update/insert the integration status with pertinent failure information
        statuses.get(0).Update_Integration_Status__c='FAIL';
        statuses.get(0).Update_Needed_Date__c = System.now();
        Decimal tryCount = statuses.get(0).Update_Integration_Try_Count__c;
        statuses.get(0).Update_Integration_Try_Count__c = tryCount < 999 ? tryCount + 1 : 999;
        statuses.get(0).Integration_Last_Error_Code__c = errorCode;
        String errorMessageToSave = errorMessage;
        if(errorMessageToSave.length() > 255) {
            errorMessageToSave = errorMessage.substring(0, 254);
        }
        statuses.get(0).Integration_Last_Error_Message__c = errorMessageToSave;
        upsert statuses.get(0);

        // We will try to reprocess if there are less than 5 retries.
        if(statuses.get(0).Update_Integration_Try_Count__c < 5) {
            // Based on the read integration status, should we requeue the event?
            Loan_Update__e createEvent = new Loan_Update__e();
            // Loan GUID goes in the Resource Id
            createEvent.Resource_Id__c = loanGuid;
            List<Database.SaveResult> results = EventBus.publish(new List<Loan_Update__e>{createEvent});
        }
    }

    /**
     * Method to create a new integration status record and set the necessary relationship fields
     * @return return the new record that has not yet been inserted
     */
    private static Integration_Status__c createIntegrationStatus(String sobjectAPIName, String uniqueId, String createStatus, String updateStatus) {
        System.debug(LoggingLevel.DEBUG, 'Starting createIntegrationStatus...');
        Integration_Status__c is = new Integration_Status__c();
        //Set the Linked API name to the SObject API name from the Integrated Object Record
        is.Linked_Object_API_Name__c = sobjectAPIName;
        //Set the Linked Object Id to the Id field  the record being processed
        is.Linked_Object_Id__c = uniqueId;
        if(String.isNotBlank(createStatus)) {
            //Set Create Integration Status to passed in value
            is.Create_Integration_Status__c = createStatus;
        }
        if(String.isNotBlank(updateStatus)) {
            //Set Create Integration Status to passed in value
            is.Update_Integration_Status__c = updateStatus;
            is.Update_Needed_Date__c = System.now();
        }
        is.Update_Integration_Try_Count__c=0;
        return is;
    }

    webservice static void syncLoanFromButton(String loanId) {
        readAndUpdateLoan(loanId);
    }
}