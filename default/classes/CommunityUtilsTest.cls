/**
 * @ClassName    	: CommunityUtilsTest
 * @Purpose      	: Test class to test functionality of CommunityUtils apex controller of Submit Request Form.
 */
@isTest
public class CommunityUtilsTest {
	
    /**
    * @MethodName   : setup
    * @Purpose      : Create required Objects data for Submit Request Form Test
    */
    @testSetup
    public static void setup(){
        
        User userRec = CerateUserRecord();
        System.assertNotEquals(null, userRec);
        
        List<Action_Type_Config__c> lstActionTypeConfigs = CerateActionTypeConfigRecord();
        System.assertNotEquals(null, lstActionTypeConfigs);
    }
    
     /**
    * @MethodName   : checkUserTypeTest
    * @Purpose      : Test method to test functionality of checkUserType() of CommunityUtils
    */
    @isTest
    public static void checkUserTypeTest(){
        User testUser = [SELECT Id FROM User WHERE Email = 'test@user.com']; 
        
        System.runas(testUser) {
            ActionResult result = CommunityUtils.checkUserType();
            System.debug('checkUserTypeTest result :'+result);
            System.assertNotEquals(null, result.data);
        }
    }
    
    /**
    * @MethodName   : fetchUserTest
    * @Purpose      : Test method to test functionality of fetchUser() of CommunityUtils
    */
    @isTest
    public static void fetchUserTest(){
        User testUser = [SELECT Id FROM User WHERE Email = 'test@user.com']; 
        
        System.runas(testUser) {
            User result = CommunityUtils.fetchUser();
            System.debug('fetchUserTest result :'+result);
            System.assertNotEquals(null, result);
        }
    }
    
    /**
    * @MethodName   : getDependetPicklistValuesTest
    * @Purpose      : Test method to test functionality of getDependetPicklistValues() of CommunityUtils
    */
    @isTest
    public static void getDependetPicklistValuesTest(){
        User testUser = [SELECT Id FROM User WHERE Email = 'test@user.com']; 
        
        System.runas(testUser) {
            ActionResult result = CommunityUtils.getDependetPicklistValues(new Case(),'Type','Action_Type__c','Product_Type__c');
            System.debug('getDependetPicklistValuesTest result :'+result);
            System.assertNotEquals(null, result.data);
        }
    }
    
    /**
    * @MethodName   : getDependetPicklistValuesTest
    * @Purpose      : Test method to test functionality of getMortgageDependetPicklistValues() of CommunityUtils
    */
    @isTest
    public static void getMortgageDependetPicklistValuesTest(){
        User testUser = [SELECT Id FROM User WHERE Email = 'test@user.com']; 
        
        System.runas(testUser) {
            ActionResult result = CommunityUtils.getMortgageDependetPicklistValues();
            System.debug('getMortgageDependetPicklistValuesTest result :'+result);
            System.assertNotEquals(null, result.data);
        }
    }
    
    /**
    * @MethodName   : saveAssociateProductTypesTest
    * @Purpose      : Test method to test functionality of saveAssociateProductTypes() of CommunityUtils
    */
    @isTest
    public static void saveAssociateProductTypesTest(){
        User testUser = [SELECT Id FROM User WHERE Email = 'test@user.com']; 
        
        System.runas(testUser) {
            Case caseObj = new Case();
            insert caseObj;
            ActionResult result = CommunityUtils.saveAssociateProductTypes(JSON.serialize(new List<String>{'Credit Card','Debit Card'}),caseObj.Id);
            System.debug('saveAssociateProductTypesTest result :'+result);
            System.assertNotEquals(null, result.data);
        }
    }
    
    /**
    * @MethodName   : getFinancialAccountsTest
    * @Purpose      : Test method to test functionality of getFinancialAccounts() of CommunityUtils
    */
    @isTest
    public static void getFinancialAccountsTest(){
        User testUser = [SELECT Id FROM User WHERE Email = 'test@user.com']; 
        
        System.runas(testUser) {
            ActionResult result = CommunityUtils.getFinancialAccounts();
            System.debug('getFinancialAccountsTest result :'+result);
            System.assertNotEquals(null, result.data);
        }
    }
    
    
    //Function to create Action_Type_Config__c record
    public static List<Action_Type_Config__c> CerateActionTypeConfigRecord(){
        
        List<Action_Type_Config__c> lstActionTypeConfigs = new List<Action_Type_Config__c>();
        
        Action_Type_Config__c config1 = new Action_Type_Config__c();
        config1.Service_Type__c = 'Credit Card Request / Maintenance';
        config1.Action_Type__c = 'Add Authorized User';
        config1.Config_Type__c = 'Financial Account';
        config1.Values__c = 'Credit Card';
        config1.Disclosure__c = 'Disclosure';
        lstActionTypeConfigs.add(config1);
        
        Action_Type_Config__c config2 = new Action_Type_Config__c();
        config2.Service_Type__c = 'Debit Card Request / Maintenance';
        config2.Action_Type__c = 'Close Debit Card Account';
        config2.Config_Type__c = 'Product Type';
        config2.Values__c = 'Debit Card';
        config2.Disclosure__c = 'Disclosure';
        lstActionTypeConfigs.add(config2);
        
        Action_Type_Config__c config3 = new Action_Type_Config__c();
        config3.Service_Type__c = 'Deposit Account Request / Maintenance';
        config3.Action_Type__c = 'Add or Remove Beneficiary';
        config3.Config_Type__c = 'Product Type';
        config3.Values__c = 'Checking Account,Savings Account,IRA Account, CD Account';
        config3.Disclosure__c = 'Disclosure';
        lstActionTypeConfigs.add(config3);
        
        Action_Type_Config__c config4 = new Action_Type_Config__c();
        config4.Service_Type__c = 'Insurance';
        config4.Action_Type__c = 'Get a Quote';
        config4.Config_Type__c = 'Product Type';
        config4.Values__c = 'Deposit,Insurance,Loan';
        config4.Disclosure__c = 'Disclosure';
        lstActionTypeConfigs.add(config4);
        insert lstActionTypeConfigs;
        return lstActionTypeConfigs;
    }
    
    //Function to create User record
    public static User CerateUserRecord(){
        /*UserRole role = new UserRole(name = 'TEST ROLE');
        Database.insert(role);
        
        User userWithRole = new User(alias = 'hasrole', email='userwithrole@roletest.com', userroleid = role.id,
                                     emailencodingkey='UTF-8', lastname='Testing', languagelocalekey='en_US', 
                                     localesidkey='en_US', profileid = UserInfo.getProfileId(), 
                                     timezonesidkey='America/Los_Angeles', username='userwithrole@testorg.com');*/
        Account account;
        
        String recordTypeId = Schema.getGlobalDescribe().get('Account').getDescribe().getRecordTypeInfosByName().get('Person Account').getRecordTypeId();
        account = new Account(RecordTypeId = recordTypeId, FirstName = 'TestPersonAccountFirst', LastName = 'TestPersonAccountLast', PersonEmail = 'test@user.com');
        insert account;
        
        
        Account acc = [Select PersonContactId From Account Where Id = :account.Id];
        Id ProfileId = [SELECT Id FROM Profile WHERE Name = 'Customer Community Plus User Custom'].Id;
        
        User user = new User(
            FirstName = 'TestFirstName',
            LastName = 'TestLastName',
            Email = 'test@user.com',
            Username = 'test@user.com',
            Alias = 'TestPA', 
            TimeZoneSidKey = 'GMT', 
            LocaleSidKey = 'en_US', 
            EmailEncodingKey = 'UTF-8', 
            ProfileId = ProfileId, 
            LanguageLocaleKey = 'en_US',
            ContactId = acc.PersonContactId);
        insert user;
        return user;
    }
}