/**
 * @ClassName    	: Branch_Selection_View_ControllerTest
 * @Purpose      	: Test class to test functionality of Branch_Selection_View_Controller apex controller.
 */
@isTest
public class Branch_Selection_View_ControllerTest {
    
    /**
    * @MethodName   : setup
    * @Purpose      : Create required Objects data for Test
    */
    @TestSetup
    public static void setup(){
        
        Account account = CreatePreferredBranchRec();
        System.assertNotEquals(null, account);
        
        Contact contact = CreateUserContact(account.Id);
        System.assertNotEquals(null, contact);
        
    }
    
    /**
    * @MethodName   : getInitialDataTest
    * @Purpose      : Test method to test functionality of getInitialData() of Branch_Selection_View_Controller apex controller.
    */
    @isTest
    public static void getInitialDataTest(){
        Account account = [Select Id From Account LIMIT 1];
        Contact contact = new Contact();
        contact.LastName = 'LastNameTest';
        contact.FirstName = 'FirstNameTest';
        contact.MobilePhone = '9876543999';
        contact.Phone = '6548723';
        contact.Email = 'emstest22@gmail.com';
        contact.Social_Security_Number__c = 678777;
        contact.AccountId = account.Id;
        insert contact;
        User userRec = CerateUserRecord(contact);
        System.runas(userRec) {
            ActionResult result = Branch_Selection_View_Controller.getInitialData(); 
            System.debug('getInitialDataTest result :'+result);
            System.assertNotEquals(null, result.data); 
        }
    }
    
    /**
    * @MethodName   : getBranchInfoAccountTest
    * @Purpose      : Test method to test functionality of getBranchInfoAccount() of Branch_Selection_View_Controller apex controller.
    */
    @isTest
    public static void getBranchInfoAccountTest(){
        Account account = new Account();
        account.Name = 'EMS Financial Services';
        insert account;
        Contact contact = [Select Id From Contact LIMIT 1];
        User userRec = CerateUserRecord(contact);
        System.runas(userRec) {
            ActionResult result = Branch_Selection_View_Controller.getBranchInfoAccount(account.Id); 
            System.debug('getBranchInfoAccountTest result :'+result);
            System.assertNotEquals(null, result.data); 
        }
    }
    
    //Function to create Create Preferred Branch  record for test class
    public static Account CreatePreferredBranchRec(){
        Id ProfileId = [SELECT Id FROM Profile WHERE Name = 'System Administrator'].Id;
        User userObj = new User(
            FirstName = 'FirstName',
            LastName = 'LastName',
            Email =  'primary1@gmail.com',
            Username = 'ems1'+'@gmail.com',
            CompanyName = 'EMS',
            Alias = 'primCont',
            TimeZoneSidKey = 'America/Los_Angeles',
            EmailEncodingKey = 'UTF-8',
            LanguageLocaleKey = 'en_US',
            LocaleSidKey = 'en_US',
            ProfileId = ProfileId, 
            Title = 'Title'
        );
        insert userObj;
        
        Id devRecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Business Account').getRecordTypeId();
        Account account = new Account();
        account.Name = 'EMS Financial Services';
        account.RecordTypeId = devRecordTypeId;
        account.Primary_Contact_1__c = userObj.Id;
        insert account;
        return account;
    }
    
	//Function to create Contact record for test class
    public static Contact CreateUserContact(Id preferredBranchId){
        
        Account account = new Account();
        account.Name = 'TestAccount';
        insert account;
        
        Contact contact = new Contact();
        contact.LastName = 'TestLastName';
        contact.FirstName = 'FirstName';
        contact.MobilePhone = '9876543218';
        contact.Phone = '6548723';
        contact.Email = 'emstest@gmail.com';
        contact.Social_Security_Number__c = 123456;
        contact.AccountId = account.Id;
        contact.Preferred_Branch__c = preferredBranchId;
        insert contact;
        return contact;
    }
    
    //Function to create User record for test class
    public static User CerateUserRecord(Contact contact){
       
        Id ProfileId = [SELECT Id FROM Profile WHERE Name = 'Customer Community Plus User Custom'].Id;
        
        User userObj = new User(
            LastName = 'LastName',
            Email =  ProfileId+'@gmail.com',
            Username = ProfileId+'ems'+'@gmail.com',
            CompanyName = 'EMS',
            Alias = 'testUser', 
            TimeZoneSidKey = 'America/Los_Angeles',
            EmailEncodingKey = 'UTF-8',
            LanguageLocaleKey = 'en_US',
            LocaleSidKey = 'en_US',
            ContactId = contact.Id,
            ProfileId = ProfileId
        );
        return userObj;
        
        
    }
}