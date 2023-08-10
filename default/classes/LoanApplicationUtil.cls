public without sharing class LoanApplicationUtil {
    
    /*
    * Function to get Loan Program List
    */
    public static List<Loan_Program__c> getLoanProgramList(String loanType){
        if(String.isNotBlank(loanType)){
            return [SELECT Id, Name, Program_Description__c,Loan_Instructions__c,Certification_Description__c, 
                Application_Questions_instruction__c, Program_Type__c,Applicant_Instruction__c, 
                (SELECT Id, Name, Description__c, Loan_Declaration_Field__c,Question_Type__c 
                 from Application_Questions__r ORDER BY Name) 
                FROM Loan_Program__c WHERE Loan_Type__c = :loanType];
        }else{
            return null;
        }
    }
	
    /*
     * Method to get Required Document File Ids For Loan Application
	 */
    public static String getRequiredDocumentFileIdsForLoanApplication(String loanApplicationId){
        Set<String> requiredDocumentIds = new Set<String>();
        
        for(Required_Application_Document__c reqDoc :[SELECT Id, File_Type__c 
                                                      FROM Required_Application_Document__c 
                                                      WHERE Residential_Loan_Application__c =:loanApplicationId 
                                                      Order by CreatedDate]){
                                                          if(reqDoc.File_Type__c != null){
                                                              requiredDocumentIds.add(reqDoc.File_Type__c);
                                                          }
                                                      }
        
        return String.join(New list<String>(requiredDocumentIds), ',');
    }
    
    /*
     * Method to save Loan Applicant main address and mailling address
	 */
    public static ActionResult saveLoanApplicantAddress(String loanApplicantAddress,String loanApplicantMailingAddress){
        try{
            LoanApplicantAddress LoanApplicantAddressRecord = (LoanApplicantAddress) Json.deserialize(loanApplicantAddress, LoanApplicantAddress.class);
            upsert LoanApplicantAddressRecord;
            
            LoanApplicantAddress LoanApplicantMailingAddressRecord = (LoanApplicantAddress) Json.deserialize(loanApplicantMailingAddress, LoanApplicantAddress.class);
            upsert LoanApplicantMailingAddressRecord;
            
            return new ActionResult(new map<string, object>{'message'=> 'Applicant Personal Address Saved sucessfully'});
            
        }catch(Exception ex){
            return new ActionResult(ex);
        }
    }
    
    /*
     * Method to save Loan Applicant Employment Details
	 */
    public static ActionResult saveLoanApplicantEmployment(String loanApplicantEmployment){
        try{
            LoanApplicantEmployment loanApplicantEmploymentRec = (LoanApplicantEmployment) Json.deserialize(loanApplicantEmployment, LoanApplicantEmployment.class);
            upsert loanApplicantEmploymentRec;
            return new ActionResult(new map<string, object>{'message'=> 'Applicant Employment Saved sucessfully'});
        }catch(Exception ex){
            System.debug('loanAppDeclaration exec :'+ex);
            return new ActionResult(ex);
        }
    }
    
    /*
     * Method to save Loan Applicant Income Details
	 */
    public static ActionResult saveLoanApplicantIncome(String loanApplicantIncomes){
        try{
            LoanApplicantIncome loanApplicantIncomesRec = (LoanApplicantIncome)Json.deserialize(loanApplicantIncomes, LoanApplicantIncome.class);
            upsert loanApplicantIncomesRec;
            
            List<ResidentialLoanApplication> loanApplicationList = [SELECT Id,TotalMonthlyIncome__c,
                                                                    TotalMonthlyExpense__c,Debt_To_Income_Ratio__c
                                                                    FROM ResidentialLoanApplication
                                                                    WHERE Id = :loanApplicantIncomesRec.LoanApplicationId];
            
            return new ActionResult(new map<string, object>{'message'=> 'Applicant Income Saved sucessfully',
                'loanApplication' => loanApplicationList[0]});
        }catch(Exception ex){
            System.debug('loanAppDeclaration exec :'+ex);
            return new ActionResult(ex);
        }
    }
    
    /*
     * Method to save Loan applicant Questions Details
	 */
    public static ActionResult saveLoanapplicantQuestions(String applicationQuestions){
        try{
            LoanApplicantDeclaration  applicationQuestionRecord =  (LoanApplicantDeclaration) JSON.deserialize(applicationQuestions,LoanApplicantDeclaration.class);
            upsert applicationQuestionRecord;   
            
            return new ActionResult(new map<string, object>{'message'=> 'Loanapplicant Questions Saved sucessfully',
                'applicationQuestion'=>applicationQuestionRecord});
        }catch(Exception ex){
            System.debug('loanAppDeclaration exec :'+ex);
            return new ActionResult(ex);
        }
    }
    
   /*
    * Method to save Loan applicant Questions Details
    */
    public static ActionResult getApplicantAddress(String loanApplicantId){
        try{
            LoanApplicantAddress loanApplicantPresentAddress = new LoanApplicantAddress();
            LoanApplicantAddress loanApplicantMailingAddress = new LoanApplicantAddress();
            
            List<LoanApplicantAddress> presentAddress = [SELECT Id, ResidenceStreet, ResidenceCity, ResidenceState, 
                                                         ResidencePostalCode, ResidenceCountry,
                                                         ResidenceAdditionalMonthCount, ResidenceYearCount, ResidencyType  
                                                         FROM LoanApplicantAddress 
                                                         WHERE LoanApplicantId = :loanApplicantId AND 
                                                         ResidencyType = 'Present Address' LIMIT 1];
            if(presentAddress != null && !presentAddress.isEmpty()){
                loanApplicantPresentAddress = presentAddress[0];
            }
            
            List<LoanApplicantAddress> mailingAddress = [SELECT Id, ResidenceStreet, ResidenceCity, ResidenceState, 
                                                         ResidencePostalCode, ResidenceCountry, 
                                                         ResidenceAdditionalMonthCount, ResidenceYearCount, ResidencyType  
                                                         FROM LoanApplicantAddress 
                                                         WHERE LoanApplicantId = :loanApplicantId AND 
                                                         ResidencyType = 'Mailing Address' LIMIT 1];
            
            if(mailingAddress != null && !mailingAddress.isEmpty()){
                loanApplicantMailingAddress = mailingAddress[0];
            }
            
            return new ActionResult(new map<string, object>{'message'=> 'Borrower Address',
                'borrowerPresentAddress'=>loanApplicantPresentAddress, 'borrowerMailingAddress'=>loanApplicantMailingAddress});
        }catch(Exception ex){
            System.debug('updateLoanApplicationStatus exec :'+ex.getMessage());
            return new ActionResult(ex);
        }
    }
    
    /*
    * Method to get Applicant Certification Values
    */
    public static ActionResult getApplicantCertificationValues(String loanApplicantId){
        try{
            List<LoanApplicantDeclaration> declarations = [SELECT Id, Name,I_Accept__c,
                                                           BirthDate__c, Name_On_Certification__c 
                                                           FROM LoanApplicantDeclaration 
                                                           WHERE LoanApplicantId = :loanApplicantId];
            
            return new ActionResult(new map<string, object>{'message'=> 'Certification records get sucessfully',
                'declaration'=> declarations});
        }catch(Exception ex){
            System.debug('getApplicantCertificationValues exec :'+ex);
            return new ActionResult(ex);
        }
    }
    
    /*
    * Method to save Loan Applicant Certification Records
    */
    public static ActionResult saveApplicantCertification(String applicationCertification){
        try{
            LoanApplicantDeclaration  applicationQuestionRecord =  (LoanApplicantDeclaration) JSON.deserialize(applicationCertification,LoanApplicantDeclaration.class);
            upsert applicationQuestionRecord;   
            return new ActionResult(new map<string, object>{'message'=> 'certification records saved sucessfully'});
        }catch(Exception ex){
            System.debug('saveApplicantCertification exec :'+ex);
            return new ActionResult(ex);
        }
    }
    
    /*
    * Function to create new person account Record for loan applicant
    */
    public static Id getPersonalAccountId(LoanApplicant loanApplicantRecord){
        if(loanApplicantRecord != null){
            
            Id devRecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Person Account').getRecordTypeId();
            
            //remove special characters in loan applicant record SSN__c
            String ssn = loanApplicantRecord.SSN__c.replaceAll('[^a-zA-Z0-9\\s+]', '');
            
            List<Account> personalAccounts = [SELECT Id FROM Account WHERE RecordTypeId = :devRecordTypeId 
                                              AND LastName = :loanApplicantRecord.Last_Name__c AND
                                              PersonEmail = :loanApplicantRecord.Email__c AND 
                                              SSN__c = :loanApplicantRecord.SSN__c LIMIT 1];
            
            if(personalAccounts == null || personalAccounts.isEmpty()){
                try{
                    Account personAccount = new Account();
                    personAccount.FirstName = loanApplicantRecord.First_Name__c;
                    personAccount.LastName = loanApplicantRecord.Last_Name__c;
                    personAccount.PersonEmail = loanApplicantRecord.Email__c;
                    personAccount.SSN__c = loanApplicantRecord.SSN__c; 
                    personAccount.RecordTypeId = devRecordTypeId; 
                    insert personAccount;
                    return personAccount.Id;
                }catch(Exception ex){
                    System.debug('Exception Create Personal Account'+ex.getMessage());
                    return null;
                }
            }else{
                return personalAccounts[0].Id;
            }
        }else{
            return null;
        }
    }
        
    /*
    * Function to create Opportunity for LoanApplication
    */
    public static Id createLoanApplicationOpportunity(ResidentialLoanApplication loanApplicationRec){
        
        User currentUser = [SELECT Id, AccountId, ContactId FROM User 
                            WHERE Id = :UserInfo.getUserId()];
        
        System.debug('Opportunity insert');
        Id devRecordTypeId = Schema.SObjectType.Opportunity.getRecordTypeInfosByName().get('General').getRecordTypeId();
        Opportunity opportunity = new Opportunity();
        opportunity.Name = loanApplicationRec.Name+' - Opp';
        opportunity.StageName = 'ClosedWon';
        opportunity.CloseDate = Date.today().addDays(10);
        opportunity.RecordTypeId = devRecordTypeId;
        opportunity.AccountId = currentUser.AccountId;
        opportunity.Amount = loanApplicationRec.Desired_Loan_Amount__c;
        System.debug('Opportunity before insert'+opportunity);
        insert opportunity;
        return opportunity.id;
    }
    
    /*
    * Function to create Opportunity for LoanApplication
    */
    public static Id createBusinessAccountRec(ResidentialLoanApplication loanApplicationForm){
        Account account = new Account();
        System.debug('create business account');
        Id devRecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Business Account').getRecordTypeId();
        System.debug('business account RecordTypeId : '+devRecordTypeId);
        account.Name = loanApplicationForm.Name;
        account.Business_TIN__c = loanApplicationForm.Business_TIN__c;
        account.DBA_or_Tradename__c = loanApplicationForm.DBA_or_Tradename__c;
        account.Number_of_Employees__c = loanApplicationForm.Number_of_Employees__c;
        account.Business_Classification__c = loanApplicationForm.Business_Classification__c;
        account.BillingStreet = loanApplicationForm.Street__c;
        account.BillingCity = loanApplicationForm.City__c;
        account.BillingState = loanApplicationForm.State__c;
        account.BillingCountry = loanApplicationForm.Country__c;
        account.BillingPostalCode = loanApplicationForm.PostalCode__c;
        account.RecordTypeId = devRecordTypeId;
        insert account;
        return account.Id;
    }
    
    
    
    public static List<SObject> queryAll(String objectName, String whereCondition) {

        DescribeSObjectResult describeResult = Schema.getGlobalDescribe().get(objectName).getDescribe();
        Map<String, Schema.SObjectField> fieldMap = describeResult.fields.getMap();

        // Get all of the fields on the object
        List<String> fieldNames = new List<String>( fieldMap.keySet() );

        // Build a Dynamic Query String.
        String soqlQuery = ' SELECT ' + String.join(fieldNames, ',') + ' FROM ' + objectName + whereCondition;

        // Need to return a generic list of sObject because we don't necessarily know exactly what the object is.
        List<SObject> records = Database.query(soqlQuery);

        return records;

    }
}