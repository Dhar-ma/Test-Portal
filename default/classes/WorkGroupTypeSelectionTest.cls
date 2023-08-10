/**
 * @ClassName    	: WorkGroupTypeSelectionTest
 * @Purpose      	: Test class to test functionality of WorkGroupTypeSelection apex controller.
 */
@isTest
public class WorkGroupTypeSelectionTest {
    
    /**
    * @MethodName   : setup
    * @Purpose      : Create required Objects data for Test
    */
	@TestSetup
    public static void setup(){
        
        Account account = LoanApplicationTestUtil.CreateUserAccount();
        System.assertNotEquals(null, account);
        
        Contact contact = LoanApplicationTestUtil.CreateUserContact(account.Id);
        System.assertNotEquals(null, contact);
        
        User userRec = LoanApplicationTestUtil.CerateUserRecord(contact.Id);
        System.assertNotEquals(null, userRec);
        
        List<WorkTypeGroup> WorkTypeGroupList = createWorkTypeGroups();
        System.assertNotEquals(null, WorkTypeGroupList);
    }
    
    /**
    * @MethodName   : getWorkGroupTypeMapTest
    * @Purpose      : Test method to test functionality of getWorkGroupTypeMap() of WorkGroupTypeSelection apex controller.
    */
    @isTest
    public static void getWorkGroupTypeMapTest(){
        
        User testUser = [SELECT Id FROM User LIMIT 1]; 
        
        System.runas(testUser) {
            ActionResult result = WorkGroupTypeSelection.getWorkGroupTypeMap();
            System.assertNotEquals(null, result.data);
        }
    }
    
    /**
    * @MethodName   : getAppointmentTypesTest
    * @Purpose      : Test method to test functionality of getAppointmentTypes() of WorkGroupTypeSelection apex controller.
    */
    @isTest
    public static void getAppointmentTypesTest(){
        
        User testUser = [SELECT Id FROM User LIMIT 1]; 
        
        System.runas(testUser) {
            ActionResult result = WorkGroupTypeSelection.getAppointmentTypes();
            System.assertNotEquals(null, result.data);
        }
    }
    
    
    //Function to create WorkTypeGroup record
    private static List<WorkTypeGroup> createWorkTypeGroups(){
                                                                    
        List<WorkTypeGroup> WorkTypeGroupList = new List<WorkTypeGroup>();
        
        WorkTypeGroup WorkGroup1 = new WorkTypeGroup();
        WorkGroup1.Name = 'Account Question';
        WorkGroup1.Description = 'Account Question Description';
        WorkGroup1.Group_Type__c = 'Insurance';
        WorkGroup1.IsActive = true;
        WorkGroup1.AdditionalInformation = 'Savings; Checking; Money Market';
        WorkTypeGroupList.add(WorkGroup1);
        
        WorkTypeGroup WorkGroup2 = new WorkTypeGroup();
        WorkGroup2.Name = 'Ask a Question';
        WorkGroup2.Description = 'Ask a Question Description';
        WorkGroup2.Group_Type__c = 'Wealth / Investment';
        WorkGroup2.IsActive = true;
        WorkGroup2.AdditionalInformation = 'Savings; Checking; Money Market';
        WorkTypeGroupList.add(WorkGroup2);
        
        WorkTypeGroup WorkGroup3 = new WorkTypeGroup();
        WorkGroup3.Name = 'Change an Investment';
        WorkGroup3.Description = 'Change an Investment Description';
        WorkGroup3.Group_Type__c = 'Wealth / Investment';
        WorkGroup3.IsActive = true;
        WorkGroup3.AdditionalInformation = 'Savings; Checking; Money Market';
        WorkTypeGroupList.add(WorkGroup3);
        
        insert WorkTypeGroupList;
        return WorkTypeGroupList;
    }
    
    //Function to create Account record
    public static Account CreateUserAccount(){
        
        Id devRecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Person Account').getRecordTypeId();
        
        Account account = new Account();
        account.Name = 'TestAccount';
        insert account;
        return account;
    }
    
    //Function to create Contact record
    public static Contact CreateUserContact(Id accountId){
        Contact contact = new Contact();
        contact.LastName = 'TestLastName';
        contact.FirstName = 'FirstName';
        contact.MobilePhone = '9876543218';
        contact.Phone = '6548723';
        contact.Email = 'emstest@gmail.com';
        contact.Social_Security_Number__c = 123456;
        contact.AccountId = accountId;
        insert contact;
        return contact;
    }
    
    //Function to create User record
    public static User CerateUserRecord(Id contactId){
        
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
            ContactId = contactId
        );
        return userObj;
    }
}