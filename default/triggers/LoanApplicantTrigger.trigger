trigger LoanApplicantTrigger on LoanApplicant (before insert, before update, before delete, after insert, after update, after delete, after undelete) {
    Trigger__mdt trigger_control = [SELECT Active__c, Before__c, After__c, Insert__c, Update__c, Delete__c, Undelete__c FROM Trigger__mdt WHERE DeveloperName = :Trigger.isDelete ? Trigger.old[0].getSObjectType().getDescribe().getName().remove('__c') : Trigger.NEW[0].getSObjectType().getDescribe().getName().remove('__c')];
    if (trigger_control.Active__c) {
        if (Trigger.isBefore && trigger_control.Before__c) {
            if (Trigger.isDelete || Trigger.isUpdate || Trigger.isInsert & (trigger_control.Delete__c && trigger_control.Update__c && trigger_control.Insert__c)) {

            }
            if (Trigger.isDelete || Trigger.isInsert & (trigger_control.Delete__c && trigger_control.Insert__c)) {

            }
            if (Trigger.isDelete || Trigger.isUpdate & (trigger_control.Delete__c && trigger_control.Update__c)) {

            }
            if (Trigger.isInsert || Trigger.isUpdate & (trigger_control.Update__c && trigger_control.Insert__c)) {

            }
            if (Trigger.isDelete && trigger_control.Delete__c) {

            }
            if (Trigger.isInsert && trigger_control.Insert__c) {

            }
            if (Trigger.isUpdate && trigger_control.Update__c) {
                if (!System.isFuture() || Test.isRunningTest()) {
                    OutboundIntegrationTriggerHandler.beforeUpdate(Trigger.newMap, Trigger.oldMap, 'LoanApplicant');
                }
            }
        }
        if (Trigger.isAfter && trigger_control.After__c) {
            if (Trigger.isUndelete || Trigger.isDelete || Trigger.isInsert || Trigger.isUpdate & (trigger_control.Delete__c && trigger_control.Undelete__c && trigger_control.Insert__c && trigger_control.Update__c)) {

            }
            if (Trigger.isUndelete || Trigger.isDelete || Trigger.isInsert & (trigger_control.Delete__c && trigger_control.Insert__c && trigger_control.Undelete__c)) {

            }
            if (Trigger.isUndelete || Trigger.isDelete || Trigger.isUpdate & (trigger_control.Delete__c && trigger_control.Undelete__c && trigger_control.Update__c)) {

            }
            if (Trigger.isUndelete || Trigger.isInsert || Trigger.isUpdate & (trigger_control.Undelete__c && trigger_control.Insert__c && trigger_control.Update__c)) {

            }
            if (Trigger.isDelete || Trigger.isInsert || Trigger.isUpdate & (trigger_control.Delete__c && trigger_control.Update__c && trigger_control.Insert__c)) {

            }
            if (Trigger.isUndelete || Trigger.isDelete & (trigger_control.Delete__c && trigger_control.Undelete__c)) {

            }
            if (Trigger.isUndelete || Trigger.isInsert & (trigger_control.Undelete__c && trigger_control.Insert__c)) {

            }
            if (Trigger.isUndelete || Trigger.isUpdate & (trigger_control.Undelete__c && trigger_control.Update__c)) {

            }
            if (Trigger.isDelete || Trigger.isInsert & (trigger_control.Delete__c && trigger_control.Insert__c)) {

            }
            if (Trigger.isDelete || Trigger.isUpdate & (trigger_control.Delete__c && trigger_control.Update__c)) {

            }
            if (Trigger.isInsert || Trigger.isUpdate & (trigger_control.Insert__c && trigger_control.Update__c)) {

            }
            if (Trigger.isUndelete && trigger_control.Undelete__c) {

            }
            if (Trigger.isDelete && trigger_control.Delete__c) {

            }
            if (Trigger.isInsert && trigger_control.Insert__c) {

            }
            if (Trigger.isUpdate && trigger_control.Update__c) {

            }
        }
    }
}