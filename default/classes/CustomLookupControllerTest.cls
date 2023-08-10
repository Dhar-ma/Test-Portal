@isTest
public class CustomLookupControllerTest {
     @isTest
    public static void fetchRecordsTest(){ 
        Account account = CreateUserAccount();
        List<CustomLookupController.RecordsData> recordList = CustomLookupController.fetchRecords('Account','Name','',account.Id,'');
        System.debug('recordList : '+recordList);
        System.assertNotEquals(NULL, recordList);
    }
    
    @isTest
    public static void fetchRecordsWhereClauseTest(){ 
        Account account = CreateUserAccount();
        List<CustomLookupController.RecordsData> recordList = CustomLookupController.fetchRecords('Account','Name','TestAccount','','Business_TIN__c = \'1234\'');
        System.debug('recordList : '+recordList);
        System.assertNotEquals(NULL, recordList);
    }
    
    //Function to create Account record for test class  
    public static Account CreateUserAccount(){
        Account account = new Account();
        account.Name = 'TestAccount';
        account.Phone = '123456';
        account.Business_TIN__c = '1234';
        insert account;
        return account;
    }
}