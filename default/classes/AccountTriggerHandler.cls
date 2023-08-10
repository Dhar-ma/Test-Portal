/**********************************************************
@class      AccountTriggerHandler
@brief      This class contains helper methods that are called from the Account trigger.
@testClass  AccountTriggerHelperTest
@author     Rob Sullivan
@version    2/15/20   Rob Sullivan
@bug        No known defects.
@todo       None.
@copyright  (c)2020 EMS.  All Rights Reserved. Unauthorized use is prohibited.
***********************************************************/

public with sharing class AccountTriggerHandler {
    //--------------------------------------------------------------------------
    // Constants
    public static Boolean insertIsFiring = false;

    //--------------------------------------------------------------------------
    // Methods
    public static void beforeUpdate(Map<Id, SObject> newRecords, Map<Id, SObject> oldRecords) {
        System.debug(LoggingLevel.DEBUG, 'Starting AccountTriggerHandler.beforeUpdate...');

        Set<Id> personContactIds = new Set<Id>();
        for (SObject record : newRecords.values()) {
            Account a = (Account)record;
            if (a.RecordTypeId == SObjectType.Account.getRecordTypeInfosByDeveloperName().get('PersonAccount').getRecordTypeId()) {
                personContactIds.add(a.PersonContactId);
            }
        }

        // Get the Loan Applicants for this set of Borrowers
        List<LoanApplicant> loanApplicants = [
                SELECT Id
                FROM LoanApplicant
                WHERE ContactId = :personContactIds
        ];

        // Mark these Loan Applicant records for integration (e.g. "touch" the records to fire the LoanApplicant integration process)
        if (loanApplicants.size() > 0) {
            update loanApplicants;
        }
    }

    public static void beforeInsert(List<Account> newRecords) {
        System.debug(LoggingLevel.DEBUG, 'Starting AccountTriggerHandler.beforeInsert...');

        for (SObject record : newRecords) {
            Account a = (Account)record;
            if (a.RecordTypeId != SObjectType.Account.getRecordTypeInfosByDeveloperName().get('PersonAccount').getRecordTypeId()
                    && a.Encompass_External_Id__c == null) {
                // Set the External Id to the Account name.
                // This is used by Update Loan Contacts to do upserts on incoming
                // Encompass external loan contats.
                a.Encompass_External_Id__c = a.Name;
            }
        }
    }
}