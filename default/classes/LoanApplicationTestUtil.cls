/**
 * @ClassName    	: LoanApplicationTestUtil
 * @Purpose      	: Test class to Create Test record.
 */
@isTest
public class LoanApplicationTestUtil {
    
	//Function to create Loan_Program__c records for test class
    public static List<Loan_Program__c> Create_LoanProgram_ApplicantQuestion_Rec(List<String> LoanPrograms, String LoanType){
        
        List<Loan_Program__c> loanProgramList = new List<Loan_Program__c>();
        for(String program : LoanPrograms){
            Loan_Program__c LoanProgram = new Loan_Program__c();
            LoanProgram.Name = program;
            LoanProgram.Program_Description__c = 'Test Program Description';
            LoanProgram.Application_Questions_instruction__c = 'Application Questions Instruction';
            //LoanProgram.Program_Type__c = 'Purchase';
            LoanProgram.Applicant_Instruction__c = 'Applicant Instruction';
            LoanProgram.Loan_Type__c = LoanType;
            loanProgramList.add(LoanProgram);
        }
        insert loanProgramList;
        createLoanApplicantQuestionRec(loanProgramList,'Application Question');
        return loanProgramList;
    }
    
    //Function to create Application_Question__c records for test class
    public static void createLoanApplicantQuestionRec(List<Loan_Program__c> LoanPrograms, String QuestionType){
        
        List<Application_Question__c> applicationQuestions = new List<Application_Question__c>();
        
        for(Loan_Program__c program : LoanPrograms){
            Application_Question__c question1 = new Application_Question__c();
            question1.Description__c = 'Question Test Class Description';
            question1.Loan_Declaration_Field__c = 'HasDeclaredBankruptcy';
            question1.Question_Type__c = QuestionType;
            question1.Loan_Program__c = program.Id;
            
            Application_Question__c question2 = new Application_Question__c();
            question2.Description__c = 'Question Test Class Description';
            question2.Loan_Declaration_Field__c = 'IsPartyToLawsuit';
            question2.Question_Type__c = QuestionType;
            question2.Loan_Program__c = program.Id;
            
            applicationQuestions.add(question1);
            applicationQuestions.add(question2);
        }
        
        insert applicationQuestions;
    }
    
    //Function to create Account record for test class  
    public static Account CreateUserAccount(){
        
        Id devRecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Person Account').getRecordTypeId();
        
        Account account = new Account();
        /*account.FirstName = 'FirstName';
        account.LastName = 'LastName';
        account.RecordTypeId = devRecordTypeId;*/
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
    
    //Function to create ResidentialLoanApplication record for test class
    public static ResidentialLoanApplication CerateResidentialLoanApplicationRec(Loan_Program__c loanProgram, Id accountId){
        
        ResidentialLoanApplication ResidentialLoanApplication = new ResidentialLoanApplication();
        
        ResidentialLoanApplication.Name = loanProgram.Name+' Application';
        ResidentialLoanApplication.Account__c = accountId;
        ResidentialLoanApplication.AccountId = accountId;
        ResidentialLoanApplication.Loan_Program__c = loanProgram.Id;
        ResidentialLoanApplication.Status = 'Started';
        ResidentialLoanApplication.LoanPurpose = 'Other';
        
        insert ResidentialLoanApplication;
        return ResidentialLoanApplication;
    }
    
    //Function to create LoanApplicants record for test class
    public static List<LoanApplicant> CerateLoanApplicantsRec(Id loanApplicationId, Id contactId){
        
        List<LoanApplicant> loanApplicantList = new List<LoanApplicant>();
        for(Integer count = 0; count <=1 ; count++){
            LoanApplicant loanApplicant = new LoanApplicant();
            loanApplicant.Name = 'LoanApplicantName';
            loanApplicant.LoanApplicationId = loanApplicationId;
            loanApplicant.ContactId = contactId;
            if(count==0){
                loanApplicant.BorrowerType = 'Borrower';
            }else{
                loanApplicant.BorrowerType = 'CoBorrower';
            }
            loanApplicant.Last_Name__c = 'LastName';
            loanApplicant.First_Name__c = 'FirstName';
            loanApplicant.SSN__c = '123456';
            loanApplicant.Phone__c = '6547896';
            loanApplicant.Mobile__c = '9876543211';
            loanApplicant.Email__c = 'test@gmail.com';
            loanApplicantList.add(loanApplicant);
        }
        insert loanApplicantList;
        CerateLoanApplicantAddressRec(loanApplicantList);
        CerateLoanApplicantEmploymentRec(loanApplicantList);
        CerateLoanApplicantIncomeRec(loanApplicantList);
        cerateLoanApplicantDeclarationRec(loanApplicantList);
        return loanApplicantList;
    }
    
    //Function to create LoanApplicantAddress record for test class
    public static List<LoanApplicantAddress> CerateLoanApplicantAddressRec(List<LoanApplicant> loanApplicantList){
        
        List<LoanApplicantAddress> LoanApplicantAddressList = new List<LoanApplicantAddress>();
        for(LoanApplicant loanApplicant : loanApplicantList){
            
            for(Integer count = 0; count <=1 ; count++){
                LoanApplicantAddress address = new LoanApplicantAddress();
                address.ResidenceStreet = 'Street';
                address.ResidenceCity = 'City';
                address.ResidenceState = 'State';
                address.ResidencePostalCode = 'PostalCode';
                address.ResidenceCountry = 'Country';
                address.LoanApplicantId = loanApplicant.Id;
                address.LoanApplicationId = loanApplicant.LoanApplicationId;
                address.Name = loanApplicant.Name+' Address';
                if(count == 0){
                    address.ResidencyType = 'Present Address';
                }else{
                    address.ResidencyType = 'Mailing Address';
                }
                LoanApplicantAddressList.add(address);
            }
        }
        
        insert LoanApplicantAddressList;
        System.debug('LoanApplicantAddressList: :: '+LoanApplicantAddressList);
        return LoanApplicantAddressList;
    }
    
    //Function to create LoanApplicantEmployment record for test class
    public static List<LoanApplicantEmployment> CerateLoanApplicantEmploymentRec(List<LoanApplicant> loanApplicantList){
        
        List<LoanApplicantEmployment> LoanApplicantEmploymentList = new List<LoanApplicantEmployment>();
        for(LoanApplicant loanApplicant : loanApplicantList){
            
            
            LoanApplicantEmployment employment = new LoanApplicantEmployment();
            
            employment.EmployerStreet = 'Street';
            employment.EmployerCity = 'City';
            employment.EmployerState = 'State';
            employment.EmployerPostalCode = 'PostalCode';
            employment.EmployerCountry = 'Country';
            employment.LoanApplicantId = loanApplicant.Id;
            employment.LoanApplicationId = loanApplicant.LoanApplicationId;
            employment.IsSelfEmployed = true;
            employment.EmployerName = 'Test Employer';
            employment.MonthlyBaseIncomeAmount = 123;
            employment.MonthlyBonusAmount = 123;
            employment.MonthlyCommissionAmount = 123;
            employment.Years_in_Industry__c = 2;
            employment.Name = loanApplicant.Name+' Employment';
            LoanApplicantEmploymentList.add(employment);
        }
        
        insert LoanApplicantEmploymentList;
        return LoanApplicantEmploymentList;
    }
    
    //Function to create LoanApplicantIncome record for test class
    public static List<LoanApplicantIncome> CerateLoanApplicantIncomeRec(List<LoanApplicant> loanApplicantList){
        List<LoanApplicantIncome> LoanApplicantIncomeList = new List<LoanApplicantIncome>();
        for(LoanApplicant loanApplicant : loanApplicantList){
            
            
            LoanApplicantIncome income = new LoanApplicantIncome();
            income.Name = loanApplicant.Name+' Income';
            income.LoanApplicantId = loanApplicant.Id;
            income.LoanApplicationId = loanApplicant.LoanApplicationId;
            income.Base_Monthly_Salary__c = 123;
            income.Monthly_Overtime_Amount__c = 123;
            income.Monthly_Bonus_Amount__c = 123;
            income.Monthly_Commission_Amount__c = 123;
            income.Devidends_Interest__c = 123;
            
            LoanApplicantIncomeList.add(income);
        }
        
        insert LoanApplicantIncomeList;
        return LoanApplicantIncomeList;
    }
    
    //Function to create LoanApplicantDeclaration record for test class
    public static List<LoanApplicantDeclaration> cerateLoanApplicantDeclarationRec(List<LoanApplicant> loanApplicantList){
        List<LoanApplicantDeclaration> LoanApplicantDeclarationList = new List<LoanApplicantDeclaration>();
        for(LoanApplicant loanApplicant : loanApplicantList){
            
            
            LoanApplicantDeclaration declaration = new LoanApplicantDeclaration();
            declaration.Name = loanApplicant.Name+' Declaration';
            declaration.LoanApplicantId = loanApplicant.Id;
            declaration.LoanApplicationId = loanApplicant.LoanApplicationId;
            declaration.HasDeclaredBankruptcy = true;
            declaration.IsPartyToLawsuit = true;
            declaration.Question_Type__c = 'Application Question';
            
            LoanApplicantDeclarationList.add(declaration);
        }
        
        insert LoanApplicantDeclarationList;
        return LoanApplicantDeclarationList;
    }
        
    //Function to create LoanApplicationProperties record for test class
    public static LoanApplicationProperty CerateLoanApplicationPropertyRec(Id loanApplicationId){
        LoanApplicationProperty property = new LoanApplicationProperty();
        property.Name = 'LoanApplicationProperty';
        property.LoanApplicationId = loanApplicationId;
        property.RequestedLoanAmount = 32165;
        property.Downpayment_Amount__c = 3245;
        property.Property_Type__c = 'Single Family Home';
        property.PropertyUseType = 'Primary Residence';
        property.LoanPurposeType = 'Other';
        property.Legal_Description__c = 'Legal_Description';
        property.Year_Built__c = 2;
        property.Number_of_Units__c = 2;
        insert property;
        return property;
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
    public static List<Required_Application_Document__c> CerateRequiredApplicationDocuments(List<File_Type__c> fileTypeList, Id loanProgramId, Id laonApplicationId){
        
        List<Required_Application_Document__c> Required_Application_DocumentList = new List<Required_Application_Document__c>();
        
        for(File_Type__c fileType : fileTypeList){
            Required_Application_Document__c document = new Required_Application_Document__c();
            document.Name = fileType.Name;
            //document.Loan_Application__c = laonApplicationId;
            document.Loan_Program__c = loanProgramId;
            document.File_Type__c = fileType.Id;
            document.Residential_Loan_Application__c = laonApplicationId;
            Required_Application_DocumentList.add(document);
        }
        
        insert Required_Application_DocumentList;
        return Required_Application_DocumentList;
    }
    
    //Function to create LoanApplicationAsset record for test class
    public static List<LoanApplicationAsset> cerateLoanApplicantAssets(ResidentialLoanApplication loanApplication){
        List<LoanApplicationAsset> LoanApplicantAssetsList = new List<LoanApplicationAsset>();
        for(Integer count =0 ; count <= 2 ; count++){
            
            
            LoanApplicationAsset asset = new LoanApplicationAsset();
            asset.Name = loanApplication.Name+' Asset'+count;
            asset.LoanApplicationId = loanApplication.Id;
            if(count == 0){
                asset.Schedule_Form_Type__c = 'ScheduleAForm';
            }else if(count == 1){
                asset.Schedule_Form_Type__c = 'ScheduleBForm';
            }else{
                asset.Schedule_Form_Type__c = 'ScheduleCForm';
            }
            asset.Titled_In_Name_Of__c = 'Test';
            
            LoanApplicantAssetsList.add(asset);
        }
        
        insert LoanApplicantAssetsList;
        return LoanApplicantAssetsList;
    }
    
    //Function to create LoanApplicationLiability record for test class
    public static List<LoanApplicationLiability> cerateLoanApplicationLiabilities(ResidentialLoanApplication loanApplication){
        List<LoanApplicationLiability> LoanApplicationLiabilityList = new List<LoanApplicationLiability>();
        for(Integer count =0 ; count <= 2 ; count++){
            
            
            LoanApplicationLiability liability = new LoanApplicationLiability();
            liability.Name = loanApplication.Name+' Asset'+count;
            liability.LoanApplicationId = loanApplication.Id;
            if(count == 0){
                liability.Schedule_Form_Type__c = 'ScheduleAForm';
            }else if(count == 1){
                liability.Schedule_Form_Type__c = 'ScheduleBForm';
            }else{
                liability.Schedule_Form_Type__c = 'ScheduleCForm';
            }
            liability.Titled_In_Name_Of__c = 'Test';
            
            LoanApplicationLiabilityList.add(liability);
        }
        
        insert LoanApplicationLiabilityList;
        return LoanApplicationLiabilityList;
    }
    
}