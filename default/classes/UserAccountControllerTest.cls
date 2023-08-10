/**
 * @ClassName    	: UserAccountControllerTest
 * @Purpose      	: Test class to test functionality of UserAccountController apex controller.
 */
@isTest
public class UserAccountControllerTest {
	
    /**
    * @MethodName   : getInitialDataTest
    * @Purpose      : Test method to test functionality of getLoanTypes() of UserAccountController
    */
    @isTest
    public static void getInitialDataTest(){
        
        Account account = CreateUserAccount();
        System.assertNotEquals(null, account);
        
        Contact contact = CreateUserContact(account.Id);
        System.assertNotEquals(null, contact);
        
        User userRec = CerateUserRecord(account.Id,contact.Id);
        System.assertNotEquals(null, userRec);
        
        System.runas(userRec) {
            ActionResult result = UserAccountController.getInitialData();
            System.debug('getInitialDataTest result :'+result);
            System.assertNotEquals(null, result.data);
        }
    }
    
    /**
    * @MethodName   : updateAccountKYCDetailsTest
    * @Purpose      : Test method to test functionality of updateAccountKYCDetails() of UserAccountController
    */
    @isTest
    public static void updateAccountKYCDetailsTest(){
        
        Account account = CreateUserAccount();
        System.assertNotEquals(null, account);
        
        Contact contact = CreateUserContact(account.Id);
        System.assertNotEquals(null, contact);
        
        User userRec = CerateUserRecord(account.Id,contact.Id);
        System.assertNotEquals(null, userRec);
        
        account.FinServ__NetWorth__c = 654877;
        
       
        contact.FinServ__TaxBracket__c = '15%';
        
        System.runas(userRec) {
            ActionResult result = UserAccountController.updateAccountKYCDetails(
            JSON.serialize(account),JSON.serialize(contact),JSON.serialize(userRec));
            
            System.debug('updateAccountKYCDetailsTest result :'+result);
            System.assertNotEquals(null, result.data);
        }
    }
    
    //Function to create Account record for test class  
    public static Account CreateUserAccount(){
        
        RecordType accRecortType = [select id from RecordType where SobjectType='Account' AND IsPersonType=True limit 1];
        
        Account account = new Account();
        account.Name = 'TestAccount';
        account.FinServ__PersonalInterests__c = 'Cooking';
        account.FinServ__FinancialInterests__c = 'Technology';
        account.FinServ__InvestmentExperience__c = 'Experienced';
        account.FinServ__NetWorth__c = 1324;
        account.FinServ__InvestmentObjectives__c = 'Income';
        insert account;
        return account;
    }
    
    //Function to create Contact record for test class
    public static Contact CreateUserContact(Id AccountId){
        Contact contact = new Contact();
        contact.LastName = 'TestLastName';
        contact.FirstName = 'FirstName';
        contact.MobilePhone = '9876543218';
        contact.Phone = '6548723';
        contact.Email = 'emstest@gmail.com';
        contact.Social_Security_Number__c = 123456;
        contact.FinServ__Occupation__c = 'FinServ Occupation';
        contact.FinServ__TaxId__c = '1234';
        contact.FinServ__MaritalStatus__c = 'Single';
        contact.FinServ__TaxBracket__c = '10%';
        contact.FinServ__WeddingAnniversary__c = Date.today();
        contact.FinServ__LastFourDigitSSN__c = '3214';
        contact.AccountId = AccountId;
        insert contact;
        return contact;
    }
    
    //Function to create User record for test class
    public static User CerateUserRecord(Id accountId, Id contactId){
        
        /*UserRole userRole=new UserRole(Name= 'TestingBusinessCustomerUser'); 
        insert userRole; */
        
       	Id ProfileId = [SELECT Id FROM Profile WHERE Name = 'Customer Community Plus User Custom'].Id;
        
        User userObj = new User(
            LastName = 'LastName',
            Email =  ProfileId+'@gmail.com',
            Username = ProfileId+'ems'+'@gmail.com',
            CompanyName = 'EMS',
            TimeZoneSidKey = 'America/Los_Angeles',
            EmailEncodingKey = 'UTF-8',
            LanguageLocaleKey = 'en_US',
            LocaleSidKey = 'en_US',
            ProfileId = ProfileId,
            ContactId = contactId,
            Alias = 'TestUser'
        );
        return userObj;
    }
    
}