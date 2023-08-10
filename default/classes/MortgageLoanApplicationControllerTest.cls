/**
 * @ClassName    	: MortgageLoanApplicationControllerTest
 * @Purpose      	: Test class to test functionality of MortgageLoanApplicationController apex controller of AutoLoan Form.
 */
@isTest
public class MortgageLoanApplicationControllerTest {
	/**
    * @MethodName   : setup
    * @Purpose      : Create required Objects data for Auto Loan Form Test
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
        
        LoanApplicationProperty LoanApplicationProperty = 
            LoanApplicationTestUtil.CerateLoanApplicationPropertyRec(LoanApplication.Id);
        System.assertNotEquals(null, LoanApplicationProperty);
        
        List<LoanApplicant> LoanApplicantList = 
            LoanApplicationTestUtil.CerateLoanApplicantsRec(LoanApplication.Id, contact.Id);
        System.assertNotEquals(null, LoanApplicantList);
        
        /*Loan_Application__c document_Loan_Application = 
            LoanApplicationTestUtil.CerateLoanApplicationRec(LoanProgramList[0].id,account.Id);
        System.assertNotEquals(null, document_Loan_Application);*/
        
        List<File_Type__c> FileTypeRecList = LoanApplicationTestUtil.CerateFileTypeRec();
        System.assertNotEquals(null, FileTypeRecList);
        
        List<Required_Application_Document__c> ApplicationDocumentsList = 
            LoanApplicationTestUtil.CerateRequiredApplicationDocuments(FileTypeRecList,LoanProgramList[0].id,LoanApplication.Id);
        System.assertNotEquals(null, ApplicationDocumentsList);
        
        List<LoanApplicationAsset> LoanApplicantAssetsList = 
            LoanApplicationTestUtil.cerateLoanApplicantAssets(LoanApplication);
        System.assertNotEquals(null, LoanApplicantAssetsList);
        
        List<LoanApplicationLiability> LoanApplicationLiabilityList = 
            LoanApplicationTestUtil.cerateLoanApplicationLiabilities(LoanApplication);
        System.assertNotEquals(null, LoanApplicationLiabilityList);
        
    }
    
    /**
    * @MethodName   : getInitialDataTest
    * @Purpose      : Test method to test functionality of getInitialData() of MortgageLoanApplicationController
    */
    @isTest
    public static void getInitialDataTest(){
        
        ResidentialLoanApplication loanApplication = [Select Id From ResidentialLoanApplication LIMIT 1];
        
        User testUser = [SELECT Id FROM User LIMIT 1]; 
        
        System.runas(testUser) {
            
           ActionResult result = MortgageLoanApplicationController.getInitialData(loanApplication.Id); 
           System.debug('ActionResult result :'+result);
           System.assertNotEquals(null, result); 
        }
    }
    
    /**
    * @MethodName   : getRequiredDocumentFileIdsTest
    * @Purpose      : Test method to test functionality of getRequiredDocumentFileIds() of MortgageLoanApplicationController
    */
    @isTest
    public static void getRequiredDocumentFileIdsTest(){
        ResidentialLoanApplication loanApplication = [Select Id From ResidentialLoanApplication LIMIT 1];
        
        User testUser = [SELECT Id FROM User LIMIT 1]; 
        
        System.runas(testUser) {
            
           ActionResult result = MortgageLoanApplicationController.getRequiredDocumentFileIds(loanApplication.Id); 
           System.debug('ActionResult result :'+result);
           System.assertNotEquals(null, result); 
        }
    }
    
    /**
    * @MethodName   : saveLoanApplicantTest
    * @Purpose      : Test method to test functionality of saveLoanApplicant() of MortgageLoanApplicationController
    */
    @isTest
    public static void saveLoanApplicantTest(){
        
        User testUser = [SELECT Id FROM User LIMIT 1]; 
        
        System.runas(testUser) {
            ResidentialLoanApplication loanApplication = [Select Id From ResidentialLoanApplication LIMIT 1];
            String whereClause = ' WHERE loanApplicationId = \''+loanApplication.Id+ '\'';
            List<LoanApplicant> LoanApplicantList = LoanApplicationUtil.queryAll('LoanApplicant',whereClause);
            
            ActionResult result = MortgageLoanApplicationController.saveLoanApplicant(JSON.serialize(LoanApplicantList[0])); 
            System.debug('saveLoanApplicantTest result :'+result);
            System.assertNotEquals(null, result.data); 
        }
    }
    
       /**
    * @MethodName   : saveLoanApplicantAddressTest
    * @Purpose      : Test method to test functionality of saveLoanApplicantAddress() of MortgageLoanApplicationController
    */
    @isTest
    public static void saveLoanApplicantAddressTest(){
        
        User testUser = [SELECT Id FROM User LIMIT 1]; 
        
        System.runas(testUser) {
            ResidentialLoanApplication loanApplication = [Select Id From ResidentialLoanApplication LIMIT 1];
            String whereClause = ' WHERE loanApplicationId = \''+loanApplication.Id+ '\'';
            List<LoanApplicant> LoanApplicantList = LoanApplicationUtil.queryAll('LoanApplicant',whereClause);
            
            String presentSddressClause = ' WHERE LoanApplicantId = \''+LoanApplicantList[0].Id+ '\''+' AND ResidencyType = \'Present Address\'';
            List<LoanApplicantAddress> PresentAddressList = LoanApplicationUtil.queryAll('LoanApplicantAddress',presentSddressClause);
            
            String mailingSddressClause = ' WHERE LoanApplicantId = \''+LoanApplicantList[0].Id+ '\''+' AND ResidencyType = \'Mailing Address\'';
            List<LoanApplicantAddress> MailingAddressList = LoanApplicationUtil.queryAll('LoanApplicantAddress',mailingSddressClause);
            
            ActionResult result = MortgageLoanApplicationController.saveLoanApplicantAddress(JSON.serialize(PresentAddressList[0]),JSON.serialize(MailingAddressList[0])); 
            System.debug('saveLoanApplicantAddress result :'+result);
            System.assertNotEquals(null, result.data); 
        }
    }
    
        /**
    * @MethodName   : saveLoanApplicantEmploymentTest
    * @Purpose      : Test method to test functionality of saveLoanApplicantEmployment() of MortgageLoanApplicationController
    */
    @isTest
    public static void saveLoanApplicantEmploymentTest(){
        
        User testUser = [SELECT Id FROM User LIMIT 1]; 
        
        System.runas(testUser) {
            ResidentialLoanApplication loanApplication = [Select Id From ResidentialLoanApplication LIMIT 1];
            String whereClause = ' WHERE loanApplicationId = \''+loanApplication.Id+ '\'';
            List<LoanApplicant> LoanApplicantList = LoanApplicationUtil.queryAll('LoanApplicant',whereClause);
            
            String employmentWhereClause = ' WHERE LoanApplicantId = \''+LoanApplicantList[0].Id+ '\'';
            List<LoanApplicantEmployment> LoanApplicantEmploymentList = LoanApplicationUtil.queryAll('LoanApplicantEmployment',employmentWhereClause);
            
            ActionResult result = MortgageLoanApplicationController.saveLoanApplicantEmployment(JSON.serialize(LoanApplicantEmploymentList[0])); 
            System.debug('saveLoanApplicantEmployment result :'+result);
            System.assertNotEquals(null, result.data); 
        }
        
    }
    
        /**
    * @MethodName   : saveLoanApplicantIncomeTest
    * @Purpose      : Test method to test functionality of saveLoanApplicantIncome() of MortgageLoanApplicationController
    */
    @isTest
    public static void saveLoanApplicantIncomeTest(){
        
        User testUser = [SELECT Id FROM User LIMIT 1]; 
        
        System.runas(testUser) {
            ResidentialLoanApplication loanApplication = [Select Id From ResidentialLoanApplication LIMIT 1];
            String whereClause = ' WHERE loanApplicationId = \''+loanApplication.Id+ '\'';
            List<LoanApplicant> LoanApplicantList = LoanApplicationUtil.queryAll('LoanApplicant',whereClause);
            
            String IncomeWhereClause = ' WHERE LoanApplicantId = \''+LoanApplicantList[0].Id+ '\'';
            List<LoanApplicantIncome> LoanApplicantIncomeList = LoanApplicationUtil.queryAll('LoanApplicantIncome',IncomeWhereClause);
            
            ActionResult result = MortgageLoanApplicationController.saveLoanApplicantIncome(JSON.serialize(LoanApplicantIncomeList[0])); 
            System.debug('saveLoanApplicantIncome result :'+result);
            System.assertNotEquals(null, result.data); 
        }
        
    }
    
        /**
    * @MethodName   : saveLoanapplicantQuestionsTest
    * @Purpose      : Test method to test functionality of saveLoanapplicantQuestions() of MortgageLoanApplicationController
    */
    @isTest
    public static void saveLoanapplicantQuestionsTest(){
        
        User testUser = [SELECT Id FROM User LIMIT 1]; 
        
        System.runas(testUser) {
            ResidentialLoanApplication loanApplication = [Select Id From ResidentialLoanApplication LIMIT 1];
            String whereClause = ' WHERE loanApplicationId = \''+loanApplication.Id+ '\'';
            List<LoanApplicant> LoanApplicantList = LoanApplicationUtil.queryAll('LoanApplicant',whereClause);
            
            String DeclarationWhereClause = ' WHERE LoanApplicantId = \''+LoanApplicantList[0].Id+ '\'';
            List<LoanApplicantDeclaration> LoanApplicantDeclarationList = LoanApplicationUtil.queryAll('LoanApplicantDeclaration',DeclarationWhereClause);
            
            ActionResult result = MortgageLoanApplicationController.saveLoanapplicantQuestions(JSON.serialize(LoanApplicantDeclarationList[0])); 
            System.debug('saveLoanapplicantQuestions result :'+result);
            System.assertNotEquals(null, result.data); 
        }
        
    }
    
       /**
    * @MethodName   : updateLoanApplicationStatusTest
    * @Purpose      : Test method to test functionality of updateLoanApplicationStatus() of MortgageLoanApplicationController
    */
    @isTest
    public static void updateLoanApplicationStatusTest(){
        
        User testUser = [SELECT Id FROM User LIMIT 1]; 
        
        System.runas(testUser) {
            ResidentialLoanApplication loanApplication = [Select Id From ResidentialLoanApplication LIMIT 1];
            String whereClause = ' WHERE Id = \''+loanApplication.Id+ '\'';
            List<ResidentialLoanApplication> LoanApplicationList = LoanApplicationUtil.queryAll('ResidentialLoanApplication',whereClause);
            
            
            ActionResult result = MortgageLoanApplicationController.updateLoanApplicationStatus(JSON.serialize(LoanApplicationList[0])); 
            System.debug('updateLoanApplicationStatus result :'+result);
            System.assertNotEquals(null, result.data); 
        }
    }
    
      /**
    * @MethodName   : getApplicantAddressTest
    * @Purpose      : Test method to test functionality of getApplicantAddress() of MortgageLoanApplicationController
    */
    @isTest
    public static void getApplicantAddressTest(){
        
        User testUser = [SELECT Id FROM User LIMIT 1]; 
        
        System.runas(testUser) {
            ResidentialLoanApplication loanApplication = [Select Id From ResidentialLoanApplication LIMIT 1];
            String whereClause = ' WHERE loanApplicationId = \''+loanApplication.Id+ '\'';
            List<LoanApplicant> LoanApplicantList = LoanApplicationUtil.queryAll('LoanApplicant',whereClause);
            LoanApplicant LoanApplicantRec = LoanApplicantList[0];
            
            ActionResult result = MortgageLoanApplicationController.getApplicantAddress(LoanApplicantRec.Id); 
            System.debug('getApplicantAddress result :'+result);
            System.assertNotEquals(null, result.data); 
        }
        
    }
    
   /**
    * @MethodName   : saveLoanApplicationTest
    * @Purpose      : Test method to test functionality of saveLoanApplication() of MortgageLoanApplicationController
    */
    @isTest
    public static void saveLoanApplicationTest(){
        
        User testUser = [SELECT Id,AccountId FROM User LIMIT 1]; 
        System.debug('saveLoanApplicationTest :'+testUser);
        System.runas(testUser) {
            ResidentialLoanApplication loanApplication = [Select Id From ResidentialLoanApplication LIMIT 1];
            String whereClause = ' WHERE Id = \''+loanApplication.Id+ '\'';
            List<ResidentialLoanApplication> LoanApplicationList = LoanApplicationUtil.queryAll('ResidentialLoanApplication',whereClause);
            ResidentialLoanApplication loanApplicationRec = LoanApplicationList[0];
            loanApplicationRec.Id = null;
            
            String LoanAppPropertyClause = ' WHERE loanApplicationId = \''+loanApplication.Id+ '\'';
            List<LoanApplicationProperty> LoanApplicationPropertyList = LoanApplicationUtil.queryAll('LoanApplicationProperty',LoanAppPropertyClause);
            LoanApplicationProperty LoanApplicationPropertyRec = LoanApplicationPropertyList[0];
            LoanApplicationPropertyRec.Id = null;
            
            String LoanApplicantClause = ' WHERE loanApplicationId = \''+loanApplication.Id+ '\'';
            List<LoanApplicant> LoanApplicantList = LoanApplicationUtil.queryAll('LoanApplicant',LoanApplicantClause);
            LoanApplicant LoanApplicantRec = LoanApplicantList[0];
            LoanApplicantRec.Id = null;
            
            ActionResult result = MortgageLoanApplicationController.saveLoanApplication(JSON.serialize(loanApplicationRec),JSON.serialize(LoanApplicationPropertyRec),JSON.serialize(LoanApplicantRec)); 
            System.debug('saveLoanApplicationTest result :'+result);
            System.assertNotEquals(null, result.data); 
        }
        
    }
    
    /**
    * @MethodName   : getLoanApplicantRecordsTest
    * @Purpose      : Test method to test functionality of getLoanApplicantRecords() of MortgageLoanApplicationController
    */
    @isTest
    public static void getLoanApplicantRecordsTest(){
        User testUser = [SELECT Id,AccountId FROM User LIMIT 1]; 
        System.runas(testUser) {
            ResidentialLoanApplication loanApplication = [Select Id From ResidentialLoanApplication LIMIT 1];
            String whereClause = ' WHERE loanApplicationId = \''+loanApplication.Id+ '\'';
            List<LoanApplicant> LoanApplicantList = LoanApplicationUtil.queryAll('LoanApplicant',whereClause);
            System.debug('getLoanApplicantRecords LoanApplicantList :'+LoanApplicantList[0]);
            LoanApplicant loanAppliantRec = LoanApplicantList[0];
            
            ActionResult result = MortgageLoanApplicationController.getLoanApplicantRecords(loanAppliantRec.Id); 
            System.debug('getLoanApplicantRecords result :'+result);
            System.assertNotEquals(null, result.data); 
        }
    }
    
    /**
    * @MethodName   : getApplicantCertificationValuesTest
    * @Purpose      : Test method to test functionality of getApplicantCertificationValues() of MortgageLoanApplicationController
    */
    @isTest
    public static void getApplicantCertificationValuesTest(){
        User testUser = [SELECT Id,AccountId FROM User LIMIT 1]; 
        System.runas(testUser) {
            ResidentialLoanApplication loanApplication = [Select Id From ResidentialLoanApplication LIMIT 1];
            String whereClause = ' WHERE loanApplicationId = \''+loanApplication.Id+ '\'';
            List<LoanApplicant> LoanApplicantList = LoanApplicationUtil.queryAll('LoanApplicant',whereClause);
            LoanApplicant loanAppliantRec = LoanApplicantList[0];
            
            ActionResult result = MortgageLoanApplicationController.getApplicantCertificationValues(loanAppliantRec.Id); 
            System.debug('getApplicantCertificationValuesTest result :'+result);
            System.assertNotEquals(null, result.data); 
        }
    }
    
    /**
    * @MethodName   : saveApplicantCertificationTest
    * @Purpose      : Test method to test functionality of saveApplicantCertification() of MortgageLoanApplicationController
    */
    @isTest
    public static void saveApplicantCertificationTest(){
        User testUser = [SELECT Id,AccountId FROM User LIMIT 1]; 
        System.runas(testUser) {
            ResidentialLoanApplication loanApplication = [Select Id From ResidentialLoanApplication LIMIT 1];
            String whereClause = ' WHERE loanApplicationId = \''+loanApplication.Id+ '\'';
            List<LoanApplicant> LoanApplicantList = LoanApplicationUtil.queryAll('LoanApplicant',whereClause);
            LoanApplicant loanAppliantRec = LoanApplicantList[0];
            
            String declarationWhereClause = ' WHERE loanApplicantId = \''+loanAppliantRec.Id+ '\'';
            List<LoanApplicantDeclaration> LoanApplicantDeclarationList = LoanApplicationUtil.queryAll('LoanApplicantDeclaration',declarationWhereClause);
            LoanApplicantDeclaration loanAppliantDeclarationRec = LoanApplicantDeclarationList[0];
            
            ActionResult result = MortgageLoanApplicationController.saveApplicantCertification(JSON.serialize(loanAppliantDeclarationRec)); 
            System.debug('saveApplicantCertificationTest result :'+result);
            System.assertNotEquals(null, result.data); 
        }
    }
    
    /**
    * @MethodName   : getApplicationListTest
    * @Purpose      : Test method to test functionality of getApplicationList() of MortgageLoanApplicationController
    */
    @isTest
    public static void getApplicationListTest(){
        User testUser = [SELECT Id,AccountId FROM User LIMIT 1]; 
        System.runas(testUser) {
            ActionResult result = MortgageLoanApplicationController.getApplicationList(); 
            System.debug('getApplicationListTest result :'+result);
            System.assertNotEquals(null, result.data); 
        }
    }
    
    /**
    * @MethodName   : saveAssetTest
    * @Purpose      : Test method to test functionality of saveAsset() of MortgageLoanApplicationController
    */
    @isTest
    public static void saveAssetTest(){
        User testUser = [SELECT Id,AccountId FROM User LIMIT 1]; 
        System.runas(testUser) {
            ResidentialLoanApplication loanApplication = [Select Id From ResidentialLoanApplication LIMIT 1];
            String whereClause = ' WHERE loanApplicationId = \''+loanApplication.Id+ '\'';
            
            String applicantWhereClause = ' WHERE loanApplicationId = \''+loanApplication.Id+ '\'';
            List<LoanApplicant> LoanApplicantList = LoanApplicationUtil.queryAll('LoanApplicant',applicantWhereClause);
            LoanApplicant loanAppliantRec = LoanApplicantList[0];
            
            String assetWhereClause = ' WHERE loanApplicationId = \''+loanApplication.Id+ '\'';
            List<LoanApplicationAsset> LoanApplicantAssetsList = LoanApplicationUtil.queryAll('LoanApplicationAsset',assetWhereClause);
            LoanApplicationAsset asset = LoanApplicantAssetsList[0];
            asset.Id = null;
            
            ActionResult result = MortgageLoanApplicationController.saveAsset(JSON.serialize(asset),loanApplication.Id,loanAppliantRec.Id); 
            System.debug('saveAssetTest result :'+result);
            System.assertNotEquals(null, result.data); 
        }
    }
    
    /**
    * @MethodName   : saveLiabilityTest
    * @Purpose      : Test method to test functionality of saveLiability() of MortgageLoanApplicationController
    */
    @isTest
    public static void saveLiabilityTest(){
        User testUser = [SELECT Id,AccountId FROM User LIMIT 1]; 
        System.runas(testUser) {
            ResidentialLoanApplication loanApplication = [Select Id From ResidentialLoanApplication LIMIT 1];
            String whereClause = ' WHERE loanApplicationId = \''+loanApplication.Id+ '\'';
            
            String applicantWhereClause = ' WHERE loanApplicationId = \''+loanApplication.Id+ '\'';
            List<LoanApplicant> LoanApplicantList = LoanApplicationUtil.queryAll('LoanApplicant',applicantWhereClause);
            LoanApplicant loanAppliantRec = LoanApplicantList[0];
            
            String assetWhereClause = ' WHERE loanApplicationId = \''+loanApplication.Id+ '\'';
            List<LoanApplicationLiability> LoanApplicationLiabilityList = LoanApplicationUtil.queryAll('LoanApplicationLiability',assetWhereClause);
            LoanApplicationLiability liability = LoanApplicationLiabilityList[0];
            liability.Id = null;
            
            ActionResult result = MortgageLoanApplicationController.saveLiability(JSON.serialize(liability),loanApplication.Id,loanAppliantRec.Id); 
            System.debug('saveLiabilityTest result :'+result);
            System.assertNotEquals(null, result.data); 
        }
    }
    
    /**
    * @MethodName   : getAssetsPicklistsTest
    * @Purpose      : Test method to test functionality of getPicklists() of MortgageLoanApplicationController for Assets 
    */
    @isTest
    public static void getAssetsPicklistsTest(){
        User testUser = [SELECT Id,AccountId FROM User LIMIT 1]; 
        System.runas(testUser) {
            ActionResult result = MortgageLoanApplicationController.getPicklists('Asset');
            System.debug('getAssetsPicklistsTest result :'+result);
            System.assertNotEquals(null, result.data); 
        }
    }
    
    /**
    * @MethodName   : getLiabilityPicklistsTest
    * @Purpose      : Test method to test functionality of getPicklists() of MortgageLoanApplicationController for Liability 
    */
    @isTest
    public static void getLiabilityPicklistsTest(){
        User testUser = [SELECT Id,AccountId FROM User LIMIT 1]; 
        System.runas(testUser) {
            ActionResult result = MortgageLoanApplicationController.getPicklists('Liability');
            System.debug('getAssetsPicklistsTest result :'+result);
            System.assertNotEquals(null, result.data); 
        }
    }
}