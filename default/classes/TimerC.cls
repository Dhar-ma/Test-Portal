public class TimerC {

    public Test_Set__c tm {get;set;}
    
    public TimerC(){
        tm = new Test_Set__c();
        tm = [SELECT Id, Duration__c FROM Test_Set__c LIMIT 1];
    }
}