/**
 * @ClassName    	: BusinessLoanFormControllerTest
 * @Purpose      	: Test class to test functionality of BusinessLoanFormController apex controller of BusinessLoan Form.
 */
@isTest
public class BusinessLoanFormControllerTest {
	
  /**
    * @MethodName   : setup
    * @Purpose      : Create required Objects data for Business Loan Form Test
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
        
        List<LoanApplicant> LoanApplicantList = 
            LoanApplicationTestUtil.CerateLoanApplicantsRec(LoanApplication.Id, contact.Id);
        System.assertNotEquals(null, LoanApplicantList);
                
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
    * @Purpose      : Test method to test functionality of getInitialData() of BusinessLoanFormController
    */
    @isTest
    public static void getInitialDataTest(){
        
        ResidentialLoanApplication loanApplication = [Select Id From ResidentialLoanApplication LIMIT 1];
        
        User testUser = [SELECT Id FROM User LIMIT 1]; 
        
        System.runas(testUser) {
            
           ActionResult result = BusinessLoanFormController.getInitialData(loanApplication.Id); 
           System.debug('ActionResult result :'+result);
           System.assertNotEquals(null, result); 
        }
    }
    
    /**
    * @MethodName   : getRequiredDocumentFileIdsTest
    * @Purpose      : Test method to test functionality of getRequiredDocumentFileIds() of BusinessLoanFormController
    */
    /*@isTest
    public static void getRequiredDocumentFileIdsTest(){
        ResidentialLoanApplication loanApplication = [Select Id From ResidentialLoanApplication LIMIT 1];
        
        User testUser = [SELECT Id FROM User LIMIT 1]; 
        
        System.runas(testUser) {
            
           ActionResult result = BusinessLoanFormController.getRequiredDocumentFileIds(loanApplication.Id); 
           System.debug('ActionResult result :'+result);
           System.assertNotEquals(null, result); 
        }
    }*/
    
    /**
    * @MethodName   : saveLoanApplicantTest
    * @Purpose      : Test method to test functionality of saveLoanApplicant() of BusinessLoanFormController
    */
    @isTest
    public static void saveLoanApplicantTest(){
        
        User testUser = [SELECT Id FROM User LIMIT 1]; 
        
        System.runas(testUser) {
            ResidentialLoanApplication loanApplication = [Select Id From ResidentialLoanApplication LIMIT 1];
            String whereClause = ' WHERE loanApplicationId = \''+loanApplication.Id+ '\'';
            List<LoanApplicant> LoanApplicantList = LoanApplicationUtil.queryAll('LoanApplicant',whereClause);
            
            ActionResult result = BusinessLoanFormController.saveLoanApplicant(JSON.serialize(LoanApplicantList[0])); 
            System.debug('saveLoanApplicantTest result :'+result);
            System.assertNotEquals(null, result.data); 
        }
    }
    
        /**
    * @MethodName   : saveLoanApplicantAddressTest
    * @Purpose      : Test method to test functionality of saveLoanApplicantAddress() of BusinessLoanFormController
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
            
            ActionResult result = BusinessLoanFormController.saveLoanApplicantAddress(JSON.serialize(PresentAddressList[0]),JSON.serialize(MailingAddressList[0])); 
            System.debug('saveLoanApplicantAddress result :'+result);
            System.assertNotEquals(null, result.data); 
        }
    }
    
        /**
    * @MethodName   : saveLoanApplicantEmploymentTest
    * @Purpose      : Test method to test functionality of saveLoanApplicantEmployment() of BusinessLoanFormController
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
            
            ActionResult result = BusinessLoanFormController.saveLoanApplicantEmployment(JSON.serialize(LoanApplicantEmploymentList[0])); 
            System.debug('saveLoanApplicantEmployment result :'+result);
            System.assertNotEquals(null, result.data); 
        }
        
    }
    
        /**
    * @MethodName   : saveLoanApplicantIncomeTest
    * @Purpose      : Test method to test functionality of saveLoanApplicantIncome() of BusinessLoanFormController
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
            
            ActionResult result = BusinessLoanFormController.saveLoanApplicantIncome(JSON.serialize(LoanApplicantIncomeList[0])); 
            System.debug('saveLoanApplicantIncome result :'+result);
            System.assertNotEquals(null, result.data); 
        }
        
    }
    
        /**
    * @MethodName   : saveLoanapplicantQuestionsTest
    * @Purpose      : Test method to test functionality of saveLoanapplicantQuestions() of BusinessLoanFormController
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
            
            ActionResult result = BusinessLoanFormController.saveLoanapplicantQuestions(JSON.serialize(LoanApplicantDeclarationList[0])); 
            System.debug('saveLoanapplicantQuestions result :'+result);
            System.assertNotEquals(null, result.data); 
        }
        
    }
    
    
       /**
    * @MethodName   : updateLoanApplicationStatusTest
    * @Purpose      : Test method to test functionality of updateLoanApplicationStatus() of BusinessLoanFormController
    */
    @isTest
    public static void updateLoanApplicationStatusTest(){
        
        User testUser = [SELECT Id FROM User LIMIT 1]; 
        
        System.runas(testUser) {
            ResidentialLoanApplication loanApplication = [Select Id From ResidentialLoanApplication LIMIT 1];
            String whereClause = ' WHERE Id = \''+loanApplication.Id+ '\'';
            List<ResidentialLoanApplication> LoanApplicationList = LoanApplicationUtil.queryAll('ResidentialLoanApplication',whereClause);
            
            
            ActionResult result = BusinessLoanFormController.updateLoanApplicationStatus(JSON.serialize(LoanApplicationList[0])); 
            System.debug('updateLoanApplicationStatus result :'+result);
            System.assertNotEquals(null, result.data); 
        }
        
    }
    
       /**
    * @MethodName   : getApplicantAddressTest
    * @Purpose      : Test method to test functionality of getApplicantAddress() of BusinessLoanFormController
    */
    @isTest
    public static void getApplicantAddressTest(){
        
        User testUser = [SELECT Id FROM User LIMIT 1]; 
        
        System.runas(testUser) {
            ResidentialLoanApplication loanApplication = [Select Id From ResidentialLoanApplication LIMIT 1];
            String whereClause = ' WHERE loanApplicationId = \''+loanApplication.Id+ '\'';
            List<LoanApplicant> LoanApplicantList = LoanApplicationUtil.queryAll('LoanApplicant',whereClause);
            
            
            ActionResult result = BusinessLoanFormController.getApplicantAddress(JSON.serialize(LoanApplicantList[0].Id)); 
            System.debug('getApplicantAddress result :'+result);
            System.assertNotEquals(null, result.data); 
        }
        
    }
    
   /**
    * @MethodName   : saveLoanApplicationTest
    * @Purpose      : Test method to test functionality of saveLoanApplication() of BusinessLoanFormController
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
            loanApplicationRec.AccountId = null;
            
            String LoanApplicantClause = ' WHERE loanApplicationId = \''+loanApplication.Id+ '\'';
            List<LoanApplicant> LoanApplicantList = LoanApplicationUtil.queryAll('LoanApplicant',LoanApplicantClause);
            
            
            ActionResult result = BusinessLoanFormController.saveLoanApplication(JSON.serialize(loanApplicationRec),JSON.serialize(LoanApplicantList[0])); 
            System.debug('saveLoanApplicationTest result :'+result);
            System.assertNotEquals(null, result.data); 
        }
        
    }
    
    /**
    * @MethodName   : getLoanApplicantsTest
    * @Purpose      : Test method to test functionality of getLoanApplicants() of BusinessLoanFormController
    */
    @isTest
    public static void getLoanApplicantsTest(){
        
        User testUser = [SELECT Id,AccountId FROM User LIMIT 1]; 
        System.runas(testUser) {
            ResidentialLoanApplication loanApplication = [Select Id From ResidentialLoanApplication LIMIT 1];
            List<LoanApplicant> LoanApplicantList = BusinessLoanFormController.getLoanApplicants(JSON.serialize(loanApplication.Id));
            System.assertNotEquals(null, LoanApplicantList);
        }
    }
    
    /**
    * @MethodName   : getLoanApplicantRecordsTest
    * @Purpose      : Test method to test functionality of getLoanApplicantRecords() of BusinessLoanFormController
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
            
            ActionResult result = BusinessLoanFormController.getLoanApplicantRecords(loanAppliantRec.Id); 
            System.debug('getLoanApplicantRecords result :'+result);
            System.assertNotEquals(null, result.data); 
        }
    }
    
    /**
    * @MethodName   : getApplicantCertificationValuesTest
    * @Purpose      : Test method to test functionality of getApplicantCertificationValues() of BusinessLoanFormController
    */
    @isTest
    public static void getApplicantCertificationValuesTest(){
        User testUser = [SELECT Id,AccountId FROM User LIMIT 1]; 
        System.runas(testUser) {
            ResidentialLoanApplication loanApplication = [Select Id From ResidentialLoanApplication LIMIT 1];
            String whereClause = ' WHERE loanApplicationId = \''+loanApplication.Id+ '\'';
            List<LoanApplicant> LoanApplicantList = LoanApplicationUtil.queryAll('LoanApplicant',whereClause);
            LoanApplicant loanAppliantRec = LoanApplicantList[0];
            
            ActionResult result = BusinessLoanFormController.getApplicantCertificationValues(loanAppliantRec.Id); 
            System.debug('getApplicantCertificationValuesTest result :'+result);
            System.assertNotEquals(null, result.data); 
        }
    }
    
    /**
    * @MethodName   : getApplicationDeclarationTest
    * @Purpose      : Test method to test functionality of getApplicationDeclaration() of BusinessLoanFormController
    */
    @isTest
    public static void getApplicationDeclarationTest(){
        User testUser = [SELECT Id,AccountId FROM User LIMIT 1]; 
        System.runas(testUser) {
            ResidentialLoanApplication loanApplication = [Select Id From ResidentialLoanApplication LIMIT 1];
            String whereClause = ' WHERE loanApplicationId = \''+loanApplication.Id+ '\'';
            List<LoanApplicant> LoanApplicantList = LoanApplicationUtil.queryAll('LoanApplicant',whereClause);
            LoanApplicant loanAppliantRec = LoanApplicantList[0];
            
            ActionResult result = BusinessLoanFormController.getApplicationDeclaration(loanAppliantRec.Id); 
            System.debug('getApplicationDeclarationTest result :'+result);
            System.assertNotEquals(null, result.data); 
        }
    }
    
    /**
    * @MethodName   : saveApplicationLoanInformationTest
    * @Purpose      : Test method to test functionality of saveApplicationLoanInformation() of BusinessLoanFormController
    */
    @isTest
    public static void saveApplicationLoanInformationTest(){
        User testUser = [SELECT Id,AccountId FROM User LIMIT 1]; 
        System.runas(testUser) {
            ResidentialLoanApplication loanApplication = [Select Id From ResidentialLoanApplication LIMIT 1];
            String whereClause = ' WHERE Id = \''+loanApplication.Id+ '\'';
            List<ResidentialLoanApplication> LoanApplicationList = LoanApplicationUtil.queryAll('ResidentialLoanApplication',whereClause);
            ResidentialLoanApplication loanApplicationRec = LoanApplicationList[0];
            
            ActionResult result = BusinessLoanFormController.saveApplicationLoanInformation(JSON.serialize(loanApplicationRec)); 
            System.debug('saveApplicationLoanInformationTest result :'+result);
            System.assertNotEquals(null, result.data); 
        }
    }
    
    /**
    * @MethodName   : saveApplicantCertificationTest
    * @Purpose      : Test method to test functionality of saveApplicantCertification() of BusinessLoanFormController
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
            
            ActionResult result = BusinessLoanFormController.saveApplicantCertification(JSON.serialize(loanAppliantDeclarationRec)); 
            System.debug('saveApplicantCertificationTest result :'+result);
            System.assertNotEquals(null, result.data); 
        }
    }
    
    /**
    * @MethodName   : saveAssetTest
    * @Purpose      : Test method to test functionality of saveAsset() of BusinessLoanFormController
    */
    @isTest
    public static void saveAssetTest(){
        User testUser = [SELECT Id,AccountId FROM User LIMIT 1]; 
        System.runas(testUser) {
            ResidentialLoanApplication loanApplication = [Select Id From ResidentialLoanApplication LIMIT 1];
            String whereClause = ' WHERE loanApplicationId = \''+loanApplication.Id+ '\'';
            
            String assetWhereClause = ' WHERE loanApplicationId = \''+loanApplication.Id+ '\'';
            List<LoanApplicationAsset> LoanApplicantAssetsList = LoanApplicationUtil.queryAll('LoanApplicationAsset',assetWhereClause);
            LoanApplicationAsset asset = LoanApplicantAssetsList[0];
            
            ActionResult result = BusinessLoanFormController.saveAsset(JSON.serialize(asset),loanApplication.Id); 
            System.debug('saveAssetTest result :'+result);
            System.assertNotEquals(null, result.data); 
        }
    }
    
    /**
    * @MethodName   : getAssetListTest
    * @Purpose      : Test method to test functionality of getAssetList() of BusinessLoanFormController
    */
    @isTest
    public static void getAssetListTest(){
        User testUser = [SELECT Id,AccountId FROM User LIMIT 1]; 
        System.runas(testUser) {
            ResidentialLoanApplication loanApplication = [Select Id From ResidentialLoanApplication LIMIT 1];
            
            ActionResult result = BusinessLoanFormController.getAssetList(loanApplication.Id); 
            System.debug('getAssetListTest result :'+result);
            System.assertNotEquals(null, result.data); 
        }
    }
    
    /**
    * @MethodName   : saveLiabilityTest
    * @Purpose      : Test method to test functionality of saveLiability() of BusinessLoanFormController
    */
    @isTest
    public static void saveLiabilityTest(){
        User testUser = [SELECT Id,AccountId FROM User LIMIT 1]; 
        System.runas(testUser) {
            ResidentialLoanApplication loanApplication = [Select Id From ResidentialLoanApplication LIMIT 1];
            String whereClause = ' WHERE loanApplicationId = \''+loanApplication.Id+ '\'';
            
            String assetWhereClause = ' WHERE loanApplicationId = \''+loanApplication.Id+ '\'';
            List<LoanApplicationLiability> LoanApplicationLiabilityList = LoanApplicationUtil.queryAll('LoanApplicationLiability',assetWhereClause);
            LoanApplicationLiability liability = LoanApplicationLiabilityList[0];
            
            ActionResult result = BusinessLoanFormController.saveLiability(JSON.serialize(liability),loanApplication.Id); 
            System.debug('saveLiabilityTest result :'+result);
            System.assertNotEquals(null, result.data); 
        }
    }
    
    /**
    * @MethodName   : getLiabilityListTest
    * @Purpose      : Test method to test functionality of getLiabilityList() of BusinessLoanFormController
    */
    @isTest
    public static void getLiabilityListTest(){
        User testUser = [SELECT Id,AccountId FROM User LIMIT 1]; 
        System.runas(testUser) {
            ResidentialLoanApplication loanApplication = [Select Id From ResidentialLoanApplication LIMIT 1];
            
            ActionResult result = BusinessLoanFormController.getLiabilityList(loanApplication.Id); 
            System.debug('getLiabilityListTest result :'+result);
            System.assertNotEquals(null, result.data); 
        }
    }
    
    /**
    * @MethodName   : getLoanApplicationAssetsAndLiabilitiesTest
    * @Purpose      : Test method to test functionality of getLoanApplicationAssetsAndLiabilities() of BusinessLoanFormController
    */
    @isTest
    public static void getLoanApplicationAssetsAndLiabilitiesTest(){
        User testUser = [SELECT Id,AccountId FROM User LIMIT 1]; 
        System.runas(testUser) {
            ResidentialLoanApplication loanApplication = [Select Id From ResidentialLoanApplication LIMIT 1];
            
            ActionResult result = BusinessLoanFormController.getLoanApplicationAssetsAndLiabilities(loanApplication.Id); 
            System.debug('getLoanApplicationAssetsAndLiabilitiesTest result :'+result);
            System.assertNotEquals(null, result.data); 
        }
    }
    
    /**
    * @MethodName   : getApplicationListTest
    * @Purpose      : Test method to test functionality of getApplicationList() of BusinessLoanFormController
    */
    @isTest
    public static void getApplicationListTest(){
        User testUser = [SELECT Id,AccountId FROM User LIMIT 1]; 
        System.runas(testUser) {
            ActionResult result = BusinessLoanFormController.getApplicationList(); 
            System.debug('getApplicationListTest result :'+result);
            System.assertNotEquals(null, result.data); 
        }
    }
    
    /**
    * @MethodName   : getCollateralInformationTest
    * @Purpose      : Test method to test functionality of getCollateralInformation() of BusinessLoanFormController
    */
    @isTest
    public static void getCollateralInformationTest(){
        User testUser = [SELECT Id,AccountId FROM User LIMIT 1];
        
        System.runas(testUser) {
            Collateral_Info__c CollateralInfo = new Collateral_Info__c();
            CollateralInfo.Collateral_Type__c = 'Investment Account';
            CollateralInfo.Collateral_Value__c = 3214;
            CollateralInfo.Collateral_Description__c = 'Collateral Description';
            insert CollateralInfo;
            
            ResidentialLoanApplication loanApplication = [Select Id From ResidentialLoanApplication LIMIT 1];
            
            ActionResult result = BusinessLoanFormController.getCollateralInformation(loanApplication.Id); 
            System.debug('getCollateralInformationTest result :'+result);
            System.assertNotEquals(null, result.data); 
        }
    }
    
    /**
    * @MethodName   : saveCollateralInformationTest
    * @Purpose      : Test method to test functionality of saveCollateralInformation() of BusinessLoanFormController
    */
    @isTest
    public static void saveCollateralInformationTest(){
        User testUser = [SELECT Id,AccountId FROM User LIMIT 1];
        
        Collateral_Info__c CollateralInfo = new Collateral_Info__c();
        CollateralInfo.Collateral_Type__c = 'Investment Account';
        CollateralInfo.Collateral_Value__c = 3214;
        CollateralInfo.Collateral_Description__c = 'Collateral Description';
        
        System.runas(testUser) {
            ResidentialLoanApplication loanApplication = [Select Id From ResidentialLoanApplication LIMIT 1];
            
            ActionResult result = BusinessLoanFormController.saveCollateralInformation(JSON.serialize(CollateralInfo),loanApplication.Id); 
            System.debug('saveCollateralInformationTest result :'+result);
            System.assertNotEquals(null, result.data); 
        }
    }
    
    /**
    * @MethodName   : getBusinessInfoTest
    * @Purpose      : Test method to test functionality of getBusinessInfo() of BusinessLoanFormController
    */
    @isTest
    public static void getBusinessInfoTest(){
        User testUser = [SELECT Id,AccountId FROM User LIMIT 1];
        System.runas(testUser) {
            Account account = [Select Id From Account LIMIT 1];
            
            ActionResult result = BusinessLoanFormController.getBusinessInfo(account.Id); 
            System.debug('getBusinessInfoTest result :'+result);
            System.assertNotEquals(null, result.data); 
        }
    }
    
}