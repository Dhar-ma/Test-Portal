/**********************************************************
@class      BatchLoanTrackerResubmission
@brief      A class to re-process failed integration status records
@testClass  BatchLoanTrackerResubmissionTest
@author     Developer Name (Rob Sullivan)
@version    03/28/2018   Developer Name (Rob Sullivan)
@bug        No known defects.
@todo       None.
@copyright  (c)2018 EMS.  All Rights Reserved. Unauthorized use is prohibited.
***********************************************************/
global class BatchLoanTrackerResubmission implements Database.Batchable<sObject>, Database.Stateful {

    global Database.QueryLocator start(Database.BatchableContext BC) {
        return Database.getQueryLocator([
                SELECT Id,
                        Name,
                        Linked_Object_API_Name__c,
                        Linked_Object_Id__c,
                        Create_Integration_Status__c,
                        Update_Integration_Status__c
                FROM Integration_Status__c
                WHERE Linked_Object_API_Name__c = 'Loan_Tracker__c'
                AND (Create_Integration_Status__c = :IntegrationConfigConstants.INTEGRATION_STATUS_PENDING
                OR Create_Integration_Status__c = :IntegrationConfigConstants.INTEGRATION_STATUS_FAILED
                OR Update_Integration_Status__c = :IntegrationConfigConstants.INTEGRATION_STATUS_PENDING
                OR Update_Integration_Status__c = :IntegrationConfigConstants.INTEGRATION_STATUS_FAILED)
                AND (Create_Integration_Try_Count__c < 25
                AND Update_Integration_Try_Count__c < 25)
                AND LastModifiedDate = LAST_N_DAYS:5
        ]);
    }

    global void execute(Database.BatchableContext BC, List<Integration_Status__c> failedIntegrationStatusRecords) {
        System.debug('Scope current size: ' + failedIntegrationStatusRecords.size());
        if(failedIntegrationStatusRecords != null && !failedIntegrationStatusRecords.isEmpty()) {
            List<Loan_Update__e> recordsToUpdate = new List<Loan_Update__e>();
            for(Integration_Status__c integrationRecord : failedIntegrationStatusRecords) {
                Loan_Update__e event = new Loan_Update__e();
                event.Resource_Id__c = integrationRecord.Linked_Object_Id__c;
                recordsToUpdate.add(event);
            }
            List<Database.SaveResult> results = EventBus.publish(recordsToUpdate);
        }
    }

    global void finish(Database.BatchableContext BC) {
    }
}