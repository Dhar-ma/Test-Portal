trigger FinancialAccountTrigger on FinServ__FinancialAccount__c (after insert, after update) {
    
    FinancialRecordShareHandler.shareFinancialAccounts(Trigger.New);
}