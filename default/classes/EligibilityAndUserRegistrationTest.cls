/**
 * @ClassName    	: EligibilityAndUserRegistrationTest
 * @Purpose      	: Test class to test functionality of EligibilityAndUserRegistrationController.
 */
@isTest
public class EligibilityAndUserRegistrationTest {
	/**
    * @MethodName   : setup
    * @Purpose      : Create required Objects data for Auto Loan Form Test
    */
    @testSetup
    public static void setup(){
        Account account = CreateAccount();
        System.assertNotEquals(null, account);
        
        Contact contact = CreateContact(account.Id);
        System.assertNotEquals(null, contact);
        
        User userRec = CerateUserRecord(contact.Id);
        System.assertNotEquals(null, userRec);
        
        createOwnerIdCustomSettingRec(userRec.Id);
    }
    
    /**
    * @MethodName   : checkUserTypeTest
    * @Purpose      : Test method to test functionality of checkUserType() of EligibilityAndUserRegistrationController
    */
    @isTest
    public static void checkUserTypeTest(){
        Contact contact = [SELECT Id, LastName,FirstName,MobilePhone,Email,
                           Phone,Social_Security_Number__c,Birthdate,AccountId 
                           FROM Contact LIMIT 1];
        
        ActionResult result = EligibilityAndUserRegistrationController.checkUserType(JSON.serialize(contact));
        System.assertNotEquals(null, result.data);
        
    }
    
  /**
    * @MethodName   : createNewUserTest
    * @Purpose      : Test method to test functionality of createNewUser() of EligibilityAndUserRegistrationController
    */
    @isTest
    public static void createNewUserTest(){
        
        Account account = [SELECT Id FROM Account LIMIT 1];
        
        Contact contact = new Contact();
        contact.LastName = 'LastName';
        contact.FirstName = 'FirstName';
        contact.MobilePhone = '9876543218';
        contact.Phone = '6548723';
        contact.Email = 'emstest@gmail.com';
        contact.Social_Security_Number__c = 123456;
        contact.AccountId = account.Id;
        contact.Birthdate = Date.today().addYears(-21);
        
        ActionResult result = EligibilityAndUserRegistrationController.createNewUser(JSON.serialize(contact));
        System.debug('createNewUserTest result ::'+result);
        System.assertNotEquals(null, result.data);
        
    }
    
    /**
    * @MethodName   : createNewUserNegativeTest
    * @Purpose      : Negative test method to test functionality of createNewUser() of EligibilityAndUserRegistrationController
    */
    @isTest
    public static void createNewUserNegativeTest(){
        
        Account account = [SELECT Id FROM Account LIMIT 1];
        
        Contact contact = new Contact();
        contact.LastName = 'LastName';
        contact.MobilePhone = '9876543218';
        contact.Phone = '6548723';
        contact.Email = 'test1@gmail.com';
        contact.Social_Security_Number__c = 123456;
        contact.AccountId = account.Id;
        contact.Birthdate = Date.today().addYears(-25);
        
        ActionResult result = EligibilityAndUserRegistrationController.createNewUser(JSON.serialize(contact));
        System.debug('createNewUserTest result ::'+result);
        System.assertNotEquals(null, result.data);
        
    }
    
    /**
    * @MethodName   : findUserTest
    * @Purpose      : Negative test method to test functionality of createNewUser() of EligibilityAndUserRegistrationController
    */
    @isTest
    public static void findUserTest(){
        
        Account account = [SELECT Id FROM Account LIMIT 1];
        
        Contact contact = new Contact();
        contact.LastName = 'LastName';
        contact.FirstName = 'FirstName';
        contact.MobilePhone = '9876543218';
        contact.Phone = '6548723';
        contact.Email = 'emstest@gmail.com';
        contact.Social_Security_Number__c = 123456;
        contact.AccountId = account.Id;
        contact.Birthdate = Date.today().addYears(-25);
        
        ActionResult result = EligibilityAndUserRegistrationController.createNewUser(JSON.serialize(contact));
        System.debug('createNewUserTest result ::'+result);
        System.assertNotEquals(null, result.data);
        
    }
    
    //Function to create Account record for test class  
    public static Account CreateAccount(){
        Account account = new Account();
        account.Name = 'TestAccount';
        insert account;
        return account;
    }
    
    //Function to create Contact record for test class
    public static Contact CreateContact(Id accountId){
        Contact contact = new Contact();
        contact.LastName = 'LastName';
        contact.FirstName = 'FirstName';
        contact.MobilePhone = '9876543218';
        contact.Phone = '6548723';
        contact.Email = 'emstest@gmail.com';
        contact.Social_Security_Number__c = 123456;
        contact.AccountId = accountId;
        contact.Birthdate = Date.today().addYears(-25);
        insert contact;
        return contact;
    }
    
    //Function to create User record for test class
    public static User CerateUserRecord(Id contactId){
       
        Id ProfileId = [SELECT Id FROM Profile WHERE Name = 'Customer Community Plus User Custom'].Id;
        
        User userObj = new User(
            LastName = 'LastName',
            Email =  'test1@gmail.com',
            Username = 'ems@gmail.com',
            CompanyName = 'EMS',
            TimeZoneSidKey = 'America/Los_Angeles',
            EmailEncodingKey = 'UTF-8',
            LanguageLocaleKey = 'en_US',
            LocaleSidKey = 'en_US',
            ContactId = contactId,
            ProfileId = ProfileId
        );
        return userObj;
    }
    
    public static void createOwnerIdCustomSettingRec(Id UserId){
        Loan_Account_Owner_Setting__c setting = new Loan_Account_Owner_Setting__c();
        setting.Owner_Id__c = UserId;
        insert setting;
    }
}