trigger FinancialGoalTrigger on FinServ__FinancialGoal__c (after insert, after update) {
    
    FinancialRecordShareHandler.shareFinancialGoals(Trigger.New);
}