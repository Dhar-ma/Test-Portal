/**********************************************************
@class      ResidentialLoanApplicationTriggerHandler
@brief      This class contains helper methods that are called from the RLA trigger.
@testClass  ResidentialLoanApplicationTriggerHandlerTest
@author     Rob Sullivan
@version    2021-05-05   Rob Sullivan
@bug        No known defects.
@todo       None.
@copyright  (c)2021 EMS.  All Rights Reserved. Unauthorized use is prohibited.
***********************************************************/

public with sharing class ResidentialLoanApplicationTriggerHandler {
    public static void beforeInsert(List<SObject> newRecords) {
        System.debug(LoggingLevel.DEBUG, 'Starting ResidentialLoanApplicationTriggerHandler.beforeInsert...');
        System.debug('newRecords: ' + newRecords);

        // Assign an Integration Status record to the new RLA
        //
        // Note that if the loan was created in Encompass before this RLA is created,
        // we would have already been receiving loan updates from Encompass with corresponding
        // Integration Status records (of course showing failure since there is no RLA)
        //
        // If that is case, we need to associate the existing Integration Status record to this
        // new RLA.
        //
        // If that is not the case, we need to create a new Integration Status record.

        // Create a set of the Loan GUIDs from the incoming RLAs
        Set<String> loanGUIDs = new Set<String>();
        for (ResidentialLoanApplication rla : (List<ResidentialLoanApplication>)newRecords) {
            if (rla.Loan_GUID__c != null) {
                loanGUIDs.add(rla.Loan_GUID__c);
            }
        }
        System.debug('loanGUIDs: ' + loanGUIDs);

        // Get the existing Integration Status records
        Map<String, Integration_Status__c> guidStatusMap = new Map<String, Integration_Status__c>();
        for (Integration_Status__c is : [
                SELECT Id, Linked_Object_Id__c
                FROM Integration_Status__c
                WHERE Linked_Object_API_Name__c = 'ResidentialLoanApplication'
                AND Linked_Object_Id__c IN :loanGUIDs
        ]) {
            guidStatusMap.put(is.Linked_Object_Id__c, is);
        }
        System.debug('guidStatusMap: ' + guidStatusMap);

        // Identify the RLAs that don't already have an Integration Status record
        List<ResidentialLoanApplication> rlaNeedingStatusRecord = new List<ResidentialLoanApplication>();
        for (ResidentialLoanApplication rla : (List<ResidentialLoanApplication>)newRecords) {
            if (rla.Loan_GUID__c != null && guidStatusMap.get(rla.Loan_GUID__c) == null) {
                rlaNeedingStatusRecord.add(rla);
            }
        }
        System.debug('rlaNeedingStatusRecord: ' + rlaNeedingStatusRecord);

        // Create new Integration Status records for any RLAs that don't have one
        List<Integration_Status__c> isRecordsToInsert = new List<Integration_Status__c>();
        for (ResidentialLoanApplication rla : rlaNeedingStatusRecord) {
            Integration_Status__c is = new Integration_Status__c(
                    Linked_Object_API_Name__c = 'ResidentialLoanApplication',
                    Linked_Object_Id__c = rla.Loan_GUID__c
            );
            isRecordsToInsert.add(is);
        }
        if(!isRecordsToInsert.isEmpty()) {
            insert isRecordsToInsert;
            System.debug('isRecordsToInsert: ' + isRecordsToInsert);
            // Add the new records to the map so they can be referenced later
            for (Integration_Status__c is : isRecordsToInsert) {
                guidStatusMap.put(is.Linked_Object_Id__c, is);
            }
        }
        System.debug('guidStatusMap: ' + guidStatusMap);

        for (ResidentialLoanApplication rla : (List<ResidentialLoanApplication>)newRecords) {
            for (Integration_Status__c is : guidStatusMap.values()) {
                if (is.Linked_Object_Id__c == rla.Loan_GUID__c) {
                    rla.Integration_Status__c = is.Id;
                    break;
                }
            }
        }
    }
}