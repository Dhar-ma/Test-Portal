/**********************************************************
@class      EncompassRelatedLists
@brief      Process Encompass line item Loan data in SF related lists
@testClass  EncompassRelatedListsTest
@author     Rob Sullivan
@version    4/14/20   Rob Sullivan
@bug        No known defects.
@todo       None.
@copyright  (c)2020 EMS.  All Rights Reserved. Unauthorized use is prohibited.
***********************************************************/

public with sharing class EncompassRelatedLists {

    //--------------------------------------------------------------------------
    // Constants
    // Map "source" Encompass API field names to "target" Salesforce field names
    private static final Map<String, String> LIABILITY_FIELD_MAP = new Map<String, String>{
            'requestId' => 'LiabilityExtIdentifier',
            'volIndex' => 'Index__c',
            'holderName' => 'CreditorName',
            'liabilityType' => 'AccountType',
            'unpaidBalanceAmount' => 'UnpaidBalanceAmount',
            'monthlyPaymentAmount' => 'MonthlyPaymentAmount',
            'remainingTermMonths' => 'Months_Left__c',
            'payoffIncludedIndicator' => 'ShouldBePaidInFull'
    };
    private static final Map<String, String> CONVERSATION_LOG_FIELD_MAP = new Map<String, String>{
            'id' => 'Log_Record_Id__c',
            'guid' => 'Encompass_Id__c',
            'name' => 'Name',
            'comments' => 'Comments__c',
            'company' => 'Company__c',
            'dateUtc' => 'Date__c',
            'email' => 'Email__c',
            'phone' => 'Phone__c',
            'userId' => 'User_ID__c',
            'logRecordIndex' => 'Index__c'
    };
    private static final Map<String, String> MILESTONE_FIELD_MAP = new Map<String, String>{
            'guid' => 'Encompass_Id__c',
            'stage' => 'Name',
            'dateUtc' => 'Milestone_Date__c',
            'doneIndicator' => 'Completed__c',
            'duration' => 'Days_in_Milestone__c',
            'logRecordIndex' => 'Milestone_Index__c'
    };

    public static void updateRelatedLists(Id recordId, String jsonBody) {
        try {
            updateConversationLogs(recordId, jsonBody);
        } catch (Exception e) {
            // fail silently so that other objects may still be processed
        }

        try {
            updateMilestones(recordId, jsonBody);
        } catch (Exception e) {
            // fail silently so that other objects may still be processed
        }
    }

    //--------------------------------------------------------------------------
    // Methods
    public static void updateConversationLogs(Id recordId, String jsonBody) {
        List<Conversation_Log__c> existingRecords = [SELECT Id, Encompass_Id__c FROM Conversation_Log__c WHERE Loan_Application__c = :recordId];
        List<Conversation_Log__c> recordsToUpsert = new List<Conversation_Log__c>();

        Map<String, Object> responseMap = ((Map<String, Object>) JSON.deserializeUntyped(jsonBody));
        List<Object> logList = (List<Object>) responseMap.get('conversationLogs');
        System.debug('logList: ' + logList);
        for (Object logObject : logList) {
            System.debug('logObject: ' + logObject);
            Map<String, Object> logMap = (Map<String, Object>) logObject;
            Conversation_Log__c newRecord = (Conversation_Log__c) createObject('Conversation_Log__c', recordId, logMap, CONVERSATION_LOG_FIELD_MAP);
            System.debug('newRecord: ' + newRecord);
            // Check if the Name field is populated.
            // The "name" field of Conversation Log is not required in Encompass. If it is blank, we will use the Id field
            if (String.isBlank(newRecord.name)) {
                newRecord.Name = newRecord.Log_Record_Id__c;
            }
            // Associate this new record to the Loan Application
            newRecord.Loan_Application__c = recordId;
            recordsToUpsert.add(newRecord);
            existingRecords = removeItem(newRecord, 'Encompass_Id__c', existingRecords);
        }

        if (!existingRecords.isEmpty()) {
            delete existingRecords;
        }
        if (!recordsToUpsert.isEmpty()) {
            upsert recordsToUpsert Encompass_Id__c;
        }
    }

    public static void updateMilestones(Id recordId, String jsonBody) {
        List<Loan_Milestone__c> existingRecords = [SELECT Id, Encompass_Id__c FROM Loan_Milestone__c WHERE Loan_Application__c = :recordId];
        List<Loan_Milestone__c> recordsToUpsert = new List<Loan_Milestone__c>();

        Map<String, Object> responseMap = ((Map<String, Object>) JSON.deserializeUntyped(jsonBody));
        List<Object> milestoneList = (List<Object>) responseMap.get('milestoneLogs');
        System.debug('milestoneList: ' + milestoneList);
        for (Object milestoneObject : milestoneList) {
            System.debug('milestoneObject: ' + milestoneObject);
            Map<String, Object> milestoneMap = (Map<String, Object>) milestoneObject;
            Loan_Milestone__c newRecord = (Loan_Milestone__c) createObject('Loan_Milestone__c', recordId, milestoneMap, MILESTONE_FIELD_MAP);
            System.debug('newRecord: ' + newRecord);
            // Associate this new record to the Loan Application
            newRecord.Loan_Application__c = recordId;
            recordsToUpsert.add(newRecord);
            existingRecords = removeItem(newRecord, 'Encompass_Id__c', existingRecords);
        }

        if (!existingRecords.isEmpty()) {
            delete existingRecords;
        }
        if (!recordsToUpsert.isEmpty()) {
            upsert recordsToUpsert Encompass_Id__c;
        }
    }

    //---------------------------------------------------------------------
    // Helpers
    private static sObject createObject(String objectType, Id recordId, Map<String, Object> fieldsAndValues, Map<String, String> fieldMap) {
        sObject record = Schema.getGlobalDescribe().get(objectType).newSObject();
        for (String sourceField : fieldMap.keySet()) {
            //System.debug(sourceField + ' = ' + fieldsAndValues.get(sourceField));
            if (sourceField == 'dateUtc') {
                record.put(fieldMap.get(sourceField), Datetime.valueOfGmt(((String) fieldsAndValues.get(sourceField)).replace('T', ' ')));
            } else if (sourceField == 'comments') {
                record.put(fieldMap.get(sourceField), ((String) fieldsAndValues.get(sourceField)).abbreviate(131072));
            } else {
                record.put(fieldMap.get(sourceField), fieldsAndValues.get(sourceField));
            }
        }
        return record;
    }

    private static List<SObject> removeItem(SObject record, String externalIdFieldName, List<SObject> existingRecords) {
        for (Integer i = (existingRecords.size() - 1) ; i >= 0; i--) {
            SObject existingRecord = existingRecords[i];
            if (existingRecord.get(externalIdFieldName) == record.get(externalIdFieldName)) {
                existingRecords.remove(i);
                break;
            }
        }
        return existingRecords;
    }
}