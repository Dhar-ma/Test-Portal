/**
 * @description       : 
 * @author            : Dharmraj Baravkar
 * @group             : 
 * @last modified on  : 11-28-2022
 * @last modified by  : Dharmraj Baravkar
**/
trigger passCode on Candidate__c(after insert) {
  PasscodeHelper.addPasscodes(Trigger.new);

}
