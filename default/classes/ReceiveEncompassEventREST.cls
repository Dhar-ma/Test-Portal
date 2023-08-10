/**********************************************************
@class      ReceiveEncompassEventREST
@brief      This class will expose a REST endpoint that can be used
            to receive an event from Encompass. The endpoint needs
            to be exposed as public on a Site.
@testClass  ReceiveEncompassEventRESTTest
@author     Developer Name (rchapple)
@version    2/1/2018   Developer Name (rchapple)
@bug        No known defects.
@todo       None.
@copyright  (c)2018 EMS.  All Rights Reserved. Unauthorized use is prohibited.
***********************************************************/
@RestResource(urlMapping='/receiveEncompassEvent')
global class ReceiveEncompassEventREST {
    @testVisible private static List<Loan_Update__e> eventList = new List<Loan_Update__e>();

    @HttpPost
    global static String doPost(String eventId, String eventTime, String eventType, MetaObject meta) {
        System.Debug(LoggingLevel.DEBUG, 'ReceiveEncompassEventREST:doPost: Begin: eventId:' + eventId + ', eventTime:' + eventTime + ', eventType:' + eventType);
        System.debug(LoggingLevel.DEBUG, 'meta: ' + meta);
        System.debug(LoggingLevel.DEBUG, '*** Request: ' + System.RestContext.request);
        Loan_Update__e createEvent = new Loan_Update__e();
        createEvent.Event_Id__c  = eventId;
        createEvent.Event_Time__c = eventTime;
        createEvent.Event_Type__c = eventType;
        createEvent.Resource_Id__c = meta.resourceId;
        createEvent.Resource_Type__c = meta.resourceType;
        createEvent.Resource_Reference__c = meta.resourceRef;

        // Check if this Loan exists in SF
        List<ResidentialLoanApplication> rla = [SELECT Id FROM ResidentialLoanApplication WHERE Id = :meta.resourceId LIMIT 1];
        if (rla.size() == 0) {
            // This loan does not yet exist - create shell records to prepare the integration to receive the loan data

        }

        // For testing purposes, add to the list
        eventList.add(createEvent);
        EventBus.publish(createEvent);
        return 'Success';
    }

    global class MetaObject {
        public String userId {set; get;}
        public String resourceId {set; get;}
        public String resourceType {set; get;}
        public String resourceRef {set; get;}
        public String instanceId {set; get;}
    }
}