/**
 * @ClassName    	: ResidentialLoanAppTriggerHandlerTest
 * @Purpose      	: Test class to test functionality of ResidentialLoanApplicationTriggerHandler apex controller.
 */
@isTest
public class ResidentialLoanAppTriggerHandlerTest {
	
    /**
    * @MethodName   : setup
    * @Purpose      : Create required Objects data for Auto Loan Form Test
    */
    @testSetup
    public static void setup(){
        Account account = CreateUserAccount();
        System.assertNotEquals(null, account);
        
        Contact contact = CreateUserContact(account.Id);
        System.assertNotEquals(null, contact);
        
        User userRec = CerateUserRecord(contact.Id);
        System.assertNotEquals(null, userRec);
        
        List<Loan_Program__c> LoanProgramList = 
            Create_LoanProgram_ApplicantQuestion_Rec(new List<String>{'Small Business Loan'},
                                                                            'Business Loan');
        System.assertNotEquals(null, LoanProgramList);
        
        List<File_Type__c> FileTypeRecList = CerateFileTypeRec();
        System.assertNotEquals(null, FileTypeRecList);
        
        List<Required_Application_Document__c> ApplicationDocumentsList = 
            CerateRequiredApplicationDocuments(FileTypeRecList,LoanProgramList[0].id);
        System.assertNotEquals(null, ApplicationDocumentsList);
    }
    
    /**
    * @MethodName   : getInitialDataTest
    * @Purpose      : Test method to test functionality of getInitialData() of ConsumerLoanController
    */
    @isTest
    public static void LoanApplicationInsertTest(){
        Account account = [SELECT Id FROM Account LIMIT 1];
        Loan_Program__c loanProgram = [SELECT Id,Name FROM Loan_Program__c LIMIT 1];
        ResidentialLoanApplication ResidentialLoanApplication = new ResidentialLoanApplication();
        
        ResidentialLoanApplication.Name = loanProgram.Name+' Application';
        ResidentialLoanApplication.Account__c = account.Id;
        ResidentialLoanApplication.AccountId = account.Id;
        ResidentialLoanApplication.Loan_Program__c = loanProgram.Id;
        ResidentialLoanApplication.Status = 'Started';
        ResidentialLoanApplication.LoanPurpose = 'Other';
        
        insert ResidentialLoanApplication;
        
        List<Required_Application_Document__c> ApplicationDocumentsList 
            = [SELECT Id, Name FROM Required_Application_Document__c 
               WHERE Residential_Loan_Application__c = :ResidentialLoanApplication.Id];
        System.assertNotEquals(null, ApplicationDocumentsList);
    }
    
    //Function to create Loan_Program__c records for test class
    public static List<Loan_Program__c> Create_LoanProgram_ApplicantQuestion_Rec(List<String> LoanPrograms, String LoanType){
        
        List<Loan_Program__c> loanProgramList = new List<Loan_Program__c>();
        for(String program : LoanPrograms){
            Loan_Program__c LoanProgram = new Loan_Program__c();
            LoanProgram.Name = program;
            LoanProgram.Program_Description__c = 'Test Program Description';
            LoanProgram.Application_Questions_instruction__c = 'Application Questions Instruction';
            LoanProgram.Applicant_Instruction__c = 'Applicant Instruction';
            LoanProgram.Loan_Type__c = LoanType;
            loanProgramList.add(LoanProgram);
        }
        insert loanProgramList;
        return loanProgramList;
    }
    
    //Function to create File_Type__c record for test class
    public static List<File_Type__c> CerateFileTypeRec(){
        
        List<File_Type__c> fileTypeList = new List<File_Type__c>();
        
        File_Type__c fileType = new File_Type__c();
        fileType.Name = 'Last 2 Years Income Tax Returns';
        fileType.File_Name_Mapping_Id__c = 'Last 2 Years Income Tax Returns';
        fileType.Description__c = 'Last 2 Years Income Tax Returns';
        fileType.Help_Text__c = 'Last 2 Years Income Tax Returns';
        fileTypeList.add(fileType);
        
        File_Type__c fileType2 = new File_Type__c();
        fileType2.Name = 'Real Estate Portfolio Details';
        fileType2.File_Name_Mapping_Id__c = 'Real Estate Portfolio Details';
        fileType2.Description__c = 'Real Estate Portfolio Details';
        fileType2.Help_Text__c = 'Real Estate Portfolio Details';
        fileTypeList.add(fileType2);
        
        insert fileTypeList;
        return fileTypeList;
    }
    
    //Function to create Required_Application_Document__c record for test class
    public static List<Required_Application_Document__c> CerateRequiredApplicationDocuments(List<File_Type__c> fileTypeList, Id loanProgramId){
        
        List<Required_Application_Document__c> Required_Application_DocumentList = new List<Required_Application_Document__c>();
        
        for(File_Type__c fileType : fileTypeList){
            Required_Application_Document__c document = new Required_Application_Document__c();
            document.Name = fileType.Name;
            document.Loan_Program__c = loanProgramId;
            document.File_Type__c = fileType.Id;
            Required_Application_DocumentList.add(document);
        }
        
        insert Required_Application_DocumentList;
        return Required_Application_DocumentList;
    }
    
    //Function to create Account record for test class  
    public static Account CreateUserAccount(){
        
        Id devRecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Person Account').getRecordTypeId();
        
        Account account = new Account();
        account.Name = 'TestAccount';
        insert account;
        return account;
    }
    
    //Function to create Contact record for test class
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
    
    //Function to create User record for test class
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