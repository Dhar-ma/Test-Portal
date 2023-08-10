/**
 * @ClassName    	: LoanTypeWrapperControllerTest
 * @Purpose      	: Test class to test functionality of LoanTypeWrapperController apex controller of Submit Request Form.
 */
@isTest
public class LoanTypeWrapperControllerTest {
	/**
    * @MethodName   : setup
    * @Purpose      : Create required Objects data for Test
    */
    @testSetup
    public static void setup(){
        
        Account account = LoanApplicationTestUtil.CreateUserAccount();
        System.assertNotEquals(null, account);
        
        User userRec = CerateUserRecord();
        System.assertNotEquals(null, userRec);
        
        List<Loan_Program__c> LoanProgramList = 
            LoanApplicationTestUtil.Create_LoanProgram_ApplicantQuestion_Rec(new List<String>{'Small Business Loan'},
                                                                            'Business Loan');
        System.assertNotEquals(null, LoanProgramList);
        
        ResidentialLoanApplication LoanApplication = 
            LoanApplicationTestUtil.CerateResidentialLoanApplicationRec(LoanProgramList[0],account.Id);
        System.assertNotEquals(null, LoanApplication);
    }
    
    /**
    * @MethodName   : getLoanTypesTest
    * @Purpose      : Test method to test functionality of getLoanTypes() of LoanTypeWrapperController
    */
    @isTest
    public static void getLoanTypesTest(){
        
        User testUser = [SELECT Id FROM User WHERE Email = 'test@user.com']; 
        
        System.runas(testUser) {
            ActionResult result = LoanTypeWrapperController.getLoanTypes();
            System.debug('getLoanTypesTest result :'+result);
            System.assertNotEquals(null, result.data);
        }
    }
    
    /**
    * @MethodName   : getInitialDataTest
    * @Purpose      : Test method to test functionality of getInitialData() of LoanTypeWrapperController
    */
    @isTest
    public static void getInitialDataTest(){
        
        ResidentialLoanApplication loanApplication = [Select Id From ResidentialLoanApplication LIMIT 1];
        User testUser = [SELECT Id FROM User WHERE Email = 'test@user.com']; 
        
        System.runas(testUser) {
            ActionResult result = LoanTypeWrapperController.getInitialData(loanApplication.Id);
            System.debug('getInitialDataTest result :'+result);
            System.assertNotEquals(null, result.data);
        }
    }
    
    //Function to create User record
    public static User CerateUserRecord(){
        
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