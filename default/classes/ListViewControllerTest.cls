/**
 * @ClassName    	: ListViewControllerTest
 * @Purpose      	: Test class to test functionality of ListViewController apex controller.
 */
@isTest
public class ListViewControllerTest {
	
     /**
    * @MethodName   : setup
    * @Purpose      : Create required Objects data for Test.
    */
    @testSetup
    public static void setup(){
        
        Account account = LoanApplicationTestUtil.CreateUserAccount();
        System.assertNotEquals(null, account);
        
        Contact contact = LoanApplicationTestUtil.CreateUserContact(account.Id);
        System.assertNotEquals(null, contact);
        
        User userRec = LoanApplicationTestUtil.CerateUserRecord(contact.Id);
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
    * @MethodName   : getApplicationListTest
    * @Purpose      : Test method to test functionality of getApplicationList() of ConsumerLoanController
    */
    @isTest
    public static void getApplicationListLoanTest(){
        User testUser = [SELECT Id FROM User LIMIT 1]; 
        System.runas(testUser) {
            
           ActionResult result = ListViewController.getApplicationList('loan'); 
           System.debug('getApplicationList result :'+result);
           System.assertNotEquals(null, result); 
        }
    }
    
    /**
    * @MethodName   : getMortgageApplicationListTest
    * @Purpose      : Test method to test functionality of getMortgageApplicationList() of ConsumerLoanController
    */
    @isTest
    public static void getMortgageApplicationListTest(){
        User testUser = [SELECT Id FROM User LIMIT 1]; 
        
        System.runas(testUser) {
            
           ActionResult result = ListViewController.getApplicationList('Mortgage'); 
           System.debug('getMortgageApplicationList result :'+result);
           System.assertNotEquals(null, result); 
        }
    }
}