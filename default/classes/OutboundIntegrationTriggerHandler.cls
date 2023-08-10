/**********************************************************
@class      OutboundIntegrationTriggerHandler
@brief      This class contains helper methods that are called from the Contact trigger.
@testClass  ContactTriggerHelperTest
@author     Rob Sullivan
@version    1/10/20   Rob Sullivan
@bug        No known defects.
@todo       None.
@copyright  (c)2020 EMS.  All Rights Reserved. Unauthorized use is prohibited.
***********************************************************/

public with sharing class OutboundIntegrationTriggerHandler {
    //--------------------------------------------------------------------------
    // Constants
    public static Boolean insertIsFiring = false;

    //--------------------------------------------------------------------------
    // Methods
    public static void afterInsert(Map<Id, SObject> newRecords, String sobjectAPIName) {
        System.debug(LoggingLevel.DEBUG, 'Starting OutboundIntegrationTriggerHandler.afterInsert...');
        insertIsFiring = true;
        // Get the OutboundIntegrationTriggerHandler configuration.
        OutboundIntegrationService service = new OutboundIntegrationService();
        Integrated_Object__mdt readObject = service.getIntegratedObjectConfiguration(sobjectAPIName);
        if (readObject != null) {
            service.checkIntegrationStatusRecordsForCreate(readObject, newRecords.values());
            // Get the subset of records that should be integrated.
            Set<Id> recordIdsToIntegrate = getRecordIdsToIntegrate(newRecords.keySet(), true);
            System.debug(LoggingLevel.DEBUG, 'recordIdsToIntegrate (count): ' + recordIdsToIntegrate.size());
            // Call the Integration class for the set of records to integrate.
            if (!recordIdsToIntegrate.isEmpty()) {
                if (!System.isFuture()) {
                    IntegrationInterface integrationClass = (IntegrationInterface)Type.forName(readObject.Service_Class__c).newInstance();
                    integrationClass.performIntegrationCallouts(readObject, recordIdsToIntegrate, true);
                }
            }
        }
    }

    public static void beforeUpdate(Map<Id, SObject> newRecords, Map<Id, SObject> oldRecords, String sobjectAPIName) {
        System.debug(LoggingLevel.DEBUG, 'Starting OutboundIntegrationTriggerHandler.beforeUpdate...');

        // First see if integration status records are needed
        seeIfIntegrationStatusNeedsUpdating(newRecords, oldRecords, sobjectAPIName);

    }

    //---------------------------------------------------------------------
    // Helpers
    private static void seeIfIntegrationStatusNeedsUpdating(Map<Id, SObject> newRecords, Map<Id, SObject> oldRecords, String sobjectAPIName) {
        System.debug(LoggingLevel.DEBUG, 'Starting OutboundIntegrationTriggerHandler.seeIfIntegrationStatusNeedsUpdating...');
        // Get the record configuration.
        OutboundIntegrationService service = new OutboundIntegrationService();
        Integrated_Object__mdt readObject = service.getIntegratedObjectConfiguration(sobjectAPIName);
        if (readObject != null) {
            service.checkIntegrationStatusRecordsForUpdate(readObject, newRecords, oldRecords);
            // Get the subset of records that should be integrated.
            Set<Id> recordIdsToIntegrate = getRecordIdsToIntegrate(newRecords.keySet(), false);
            System.debug(LoggingLevel.DEBUG, 'recordIdsToIntegrate (count): ' + recordIdsToIntegrate.size());
            // Call the Integration class for the set of records to integrate.
            if (!recordIdsToIntegrate.isEmpty()) {
                IntegrationInterface integrationClass = (IntegrationInterface)Type.forName(readObject.Service_Class__c).newInstance();
                integrationClass.performIntegrationCallouts(readObject, recordIdsToIntegrate, false);
            }
        }
    }

    private static Set<Id> getRecordIdsToIntegrate(Set<Id> newRecordIds, Boolean isCreate) {
        System.debug(LoggingLevel.DEBUG, 'Starting OutboundIntegrationTriggerHandler.getRecordIdsToIntegrate...');
        // Get the PENDING Integration Status records for the incoming List of records.
        List<Integration_Status__c> isRecords = new List<Integration_Status__c>();
        if (isCreate) {
            isRecords = [
                    SELECT Id,
                            Linked_Object_Id__c,
                            Create_Integration_Status__c
                    FROM Integration_Status__c
                    WHERE Linked_Object_Id__c IN :newRecordIds
                    AND Create_Integration_Status__c = :IntegrationConfigConstants.INTEGRATION_STATUS_PENDING
            ];
        } else {
            isRecords = [
                    SELECT Id,
                            Linked_Object_Id__c,
                            Update_Integration_Status__c
                    FROM Integration_Status__c
                    WHERE Linked_Object_Id__c IN :newRecordIds
                    AND Update_Integration_Status__c = :IntegrationConfigConstants.INTEGRATION_STATUS_PENDING
            ];
        }
        // Create a set of parent record Ids for the Integration Status records queried above.
        Set<Id> recordIdsToIntegrate = new Set<Id>();
        for (Integration_Status__c is : isRecords) {
            recordIdsToIntegrate.add((Id)is.Linked_Object_Id__c);
        }
        return recordIdsToIntegrate;
    }
}