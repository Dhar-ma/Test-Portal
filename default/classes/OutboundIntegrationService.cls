/**********************************************************
@class      OutboundIntegrationService
@brief      This class will interface with metadata configuration about Live Integrations and
            also interact with the Integration Status Object
@testClass  OutboundIntegrationServiceTest
@author     Developer Name (rchapple)
@version    1/10/2018   Developer Name (rchapple)
@bug        No known defects.
@todo       None.
@copyright  (c)2018 EMS.  All Rights Reserved. Unauthorized use is prohibited.
***********************************************************/

public with sharing class OutboundIntegrationService {

    //--------------------------------------------------------------------------
    // Constants

    //--------------------------------------------------------------------------
    // Methods
    /**
    * This method is intended to be called from an
    * After Insert trigger for records that do need to be integrated on creation.  It has to be after
    * insert so that the source record id is populated
    * @param integrationDefinition The record defining what should integration
    * @param Map of records that are being created that may need an Integration status record
    */
    public void checkIntegrationStatusRecordsForCreate(Integrated_Object__mdt integrationDefinition, List<SObject> newRecords) {
        System.debug(LoggingLevel.DEBUG, 'Starting OutboundIntegrationService.checkIntegrationStatusRecordsForCreate...');
        if (integrateOnCreate(integrationDefinition)) {
            List<Integration_Status__c> isRecords = new List<Integration_Status__c>();
            //For each record create an integration status record
            for (SObject record : newRecords) {
                // If the conditional field is not set or it is set and the field has a
                // true value
                if (String.isBlank(integrationDefinition.Conditional_Field_Name__c) ||
                        (Boolean) record.get(integrationDefinition.Conditional_Field_Name__c)) {
                    isRecords.add(createIntegrationStatus(integrationDefinition.SObject_API_Name__c, record,
                            IntegrationConfigConstants.INTEGRATION_STATUS_PENDING, null));
                }
            }
            insert isRecords;
            // For each inserted record, set the Integrated status field on the parent record.
            // This has to be in a separate insert statement.
            List<SObject> parentRecordsToUpdate = new List<SObject>();
            for (Integration_Status__c isRecord : isRecords) {
                SObject parentRecord = Schema.getGlobalDescribe().get(integrationDefinition.SObject_API_Name__c).newSObject();
                // Set the Id of the object so we can do an update
                parentRecord.put('Id', isRecord.Linked_Object_Id__c);
                // Set the reference field in the parent object that will point to the newly created record
                parentRecord.put(integrationDefinition.SObject_Integrated_Status_Field_Name__c, isRecord.Id);
                parentRecordsToUpdate.add(parentRecord);
            }
            update parentRecordsToUpdate;
        }
    }

    /**
    * This method is intended to be called from a
    * Before Update trigger.  It will determine what records need to be updated which is
    * 1) Any record that doesn't yet have an integration status record OR
    * 2) Any record that has an integration status record but one of the defined integrated fields has changed
    * @param integrationDefinition The record defining what should integrate
    * @param Map of new records that are being updated
    * @param Map of old records used to see if an integrated field has changed
    */
    public void checkIntegrationStatusRecordsForUpdate(Integrated_Object__mdt integrationDefinition, Map<Id, SObject> newRecords, Map<Id, SObject> oldRecords) {
        System.debug(LoggingLevel.DEBUG, 'Starting OutboundIntegrationService.checkIntegrationStatusRecordsForUpdate...');
        if (integrateOnUpdate(integrationDefinition)) {
            List<Integration_Status__c> recordsToBeUpserted = new List<Integration_Status__c>();
            Set<String> isIdsToRead = new Set<String>();
            for (Id key : newRecords.keySet()) {
                SObject record = newRecords.get(key);
                SObject oldRecord = oldRecords.get(key);
                // If the conditional field is not set or it is set and the field has a true value
                if (String.isBlank(integrationDefinition.Conditional_Field_Name__c) ||
                        (Boolean) record.get(integrationDefinition.Conditional_Field_Name__c)) {
                    // If the record doesn't yet have an integration status record, create one
                    if (record.get(integrationDefinition.SObject_Integrated_Status_Field_Name__c) == null) {
                        recordsToBeUpserted.add(createIntegrationStatus(integrationDefinition.SObject_API_Name__c, record,
                                null, IntegrationConfigConstants.INTEGRATION_STATUS_PENDING));
                    } else {
                        if (checkIfRecordHasChanged(integrationDefinition.Integrated_Object_Fields__r, oldRecord, record)) {
                            // If the record has an integration status, check if an integration field has been updated
                            // and if it has then add the record to the needs to be updated list.
                            isIdsToRead.add((String) record.get(integrationDefinition.SObject_Integrated_Status_Field_Name__c));
                        }
                    }
                }
                // Now read all the existing Integration Status records so that we can determine if a record
                // needs to be updated or inserted
                if (!isIdsToRead.isEmpty()) {
                    for (Integration_Status__c isRecord : [
                            SELECT
                                    Id,
                                    Linked_Object_Id__c,
                                    Update_Integration_Status__c,
                                    Update_Needed_Date__c,
                                    Update_Integration_Success_Date__c,
                                    Update_Integration_Try_Count__c
                            FROM
                                    Integration_Status__c
                            WHERE
                                    Id IN :isIdsToRead
                    ]) {
                        recordsToBeUpserted.add(updateIntegrationStatus(isRecord, IntegrationConfigConstants.INTEGRATION_STATUS_PENDING));
                    }
                }
            }
            if (!recordsToBeUpserted.isEmpty()) {
                upsert recordsToBeUpserted;
            }
            for (Integration_Status__c isRecord : recordsToBeUpserted) {
                // NOTE: This is the source record in the trigger so this field will be stored when the commit transaction completes
                SObject recordFromMap = newRecords.get(isRecord.Linked_Object_Id__c);
                if (recordFromMap.get(integrationDefinition.SObject_Integrated_Status_Field_Name__c) == null) {
                    recordFromMap.put(integrationDefinition.SObject_Integrated_Status_Field_Name__c, isRecord.Id);
                }
            }
        }
    }

    /**
    * Reads the integration configuration information for the passed in sobject API Name
    * @return the application configuration record with the embedded fields list
    */
    public Integrated_Object__mdt getIntegratedObjectConfiguration(String sobjectAPIName) {
        return getIntegratedObjectConfiguration(sobjectAPIName, true);
    }

    public Integrated_Object__mdt getIntegratedObjectConfiguration(String sobjectAPIName, Boolean useTestConfig) {
        System.debug(LoggingLevel.DEBUG, 'Starting OutboundIntegrationService.getIntegratedObjectConfiguration...');
        // Read test records only if a test is running
        Boolean isTest = false;
        if (useTestConfig == true && Test.isRunningTest()) {
            isTest = true;
        }
        try {
            return [
                    SELECT Endpoint__c,
                            Row_Create__c,
                            Row_Update__c,
                            Service_Class__c,
                            SObject_API_Name__c,
                            SObject_Integrated_Status_Field_Name__c,
                            Conditional_Field_Name__c,
                            Maximum_Number_of_Retries__c,
                            Maximum_Records_Per_Call__c,
                            MasterLabel, (
                            SELECT MasterLabel,
                                    Field_API_Name__c
                            FROM Integrated_Object_Fields__r
                    )
                    FROM Integrated_Object__mdt
                    WHERE SObject_API_Name__c = :sobjectAPIName
                    AND Is_Test_Record__c = :isTest
            ];
        } catch (Exception e) {
            // An exception just means there isn't a record defined so return null fromm the function
            System.debug(LoggingLevel.DEBUG, 'There is no integration defined for: ' + sobjectAPIName);
        }
        return null;
    }

    /**
    * Method to check the integration configuration Row Create flag
    * @return Return if the data should be integrated on a Create action or not
    */
    public Boolean integrateOnCreate(Integrated_Object__mdt integrationDefinition) {
        System.debug(LoggingLevel.DEBUG, 'Starting OutboundIntegrationService.integrateOnCreate...');
        return integrationDefinition != null && integrationDefinition.Row_Create__c;
    }

    /**
    * Method to check the integration configuration Row Update flag
    * @return Return if the data should be integrated on an update action or not
    */
    public Boolean integrateOnUpdate(Integrated_Object__mdt integrationDefinition) {
        System.debug(LoggingLevel.DEBUG, 'Starting OutboundIntegrationService.integrateOnUpdate...');
        return integrationDefinition != null && integrationDefinition.Row_Update__c;
    }

    public static String createSalesforceQuery(Integrated_Object__mdt objectConfig, Set<Id> recordIdsToIntegrate) {
        String query;
        Set<String> fieldNames = new Set<String>();
        // Make Sure Id is always selected
        fieldNames.add('Id');

        for(Integrated_Object_Field__mdt field: objectConfig.Integrated_Object_Fields__r) {
            fieldNames.add(field.Field_API_Name__c);
        }

        // Select fields
        query = 'SELECT ' + String.join(new List<String>(fieldNames), ',');
        // From the object in the configuration
        query += ' FROM ' + objectConfig.SObject_API_Name__c;
        // Add the condition matching the record Ids
        query += ' WHERE Id IN :recordIdsToIntegrate';

        System.Debug(LoggingLevel.DEBUG, 'Query created for object: ' + objectConfig.SObject_API_Name__c + ' is: ' + query);
        return query;
    }

    //---------------------------------------------------------------------
    // Helpers
    /**
    * Method to create a new integration status record and set the necessary relationship fields
    * @return return the new record that has not yet been inserted
    */
    private Integration_Status__c createIntegrationStatus(String sobjectAPIName, SObject record, String createStatus, String updateStatus) {
        System.debug(LoggingLevel.DEBUG, 'Starting OutboundIntegrationService.createIntegrationStatus...');
        System.debug(LoggingLevel.DEBUG, 'sobjectAPIName: ' + sobjectAPIName);
        System.debug(LoggingLevel.DEBUG, 'record: ' + record);
        System.debug(LoggingLevel.DEBUG, 'createStatus: ' + createStatus);
        System.debug(LoggingLevel.DEBUG, 'updateStatus: ' + updateStatus);
        Integration_Status__c is = new Integration_Status__c();
        //Set the Linked API name to the SObject API name from the Integrated Object Record
        is.Linked_Object_API_Name__c = sobjectAPIName;
        //Set the Linked Object Id to the Id field of the record being processed
        is.Linked_Object_Id__c = (String) record.get('Id');
        if (String.isNotBlank(createStatus)) {
            //Set Create Integration Status to passed in value
            is.Create_Integration_Status__c = createStatus;
        }
        if (String.isNotBlank(updateStatus)) {
            //Set Create Integration Status to passed in value
            is.Update_Integration_Status__c = updateStatus;
            is.Update_Needed_Date__c = System.now();
        }
        return is;
    }

    /**
    * Method to update an integration status record and set the necessary update integration fields
    * This can only happen on update so no create status is needed
    * @return return the updated record that will be in an upsert call
    */
    private Integration_Status__c updateIntegrationStatus(Integration_Status__c isRecord, String updateStatus) {
        System.debug(LoggingLevel.DEBUG, 'Starting OutboundIntegrationService.updateIntegrationStatus...');
        if (String.isNotBlank(updateStatus)) {
            //Set Create Integration Status to passed in value
            isRecord.Update_Integration_Status__c = updateStatus;
            // Clear other fields from a possible earlier update
            isRecord.Update_Needed_Date__c = System.now();
            isRecord.Update_Integration_Success_Date__c = null;
            isRecord.Update_Integration_Try_Count__c = 0;
        }
        return isRecord;
    }

    /**
    * Method to check if the fields have changed from the old record to the new record
    * @param fields the definition of metadata defining what fields to check
    * @param oldRecord the old version of the record
    * @param newRecord the new version of the record
    * @return Boolean will be true when the record has changed
    */
    private Boolean checkIfRecordHasChanged(List<Integrated_Object_Field__mdt> fields, SObject oldRecord, SObject newRecord) {
        System.debug(LoggingLevel.DEBUG, 'Starting OutboundIntegrationService.checkIfRecordHasChanged...');
        for (Integrated_Object_Field__mdt field : fields) {
            if (!field.Field_API_Name__c.contains('.')
                    && newRecord.get(field.Field_API_Name__c) != oldRecord.get(field.Field_API_Name__c)) {
                return true;
            }
        }
        return false;
    }
}