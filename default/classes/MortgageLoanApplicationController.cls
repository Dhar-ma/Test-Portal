public without sharing class MortgageLoanApplicationController {
	
    @AuraEnabled(cacheable=true)
    public static ActionResult getInitialData(String loanApplicationId){
        
        ResidentialLoanApplication loanApplication = new ResidentialLoanApplication();
        List<LoanApplicant> loanApplicant = new List<LoanApplicant>();
        List<LoanApplicationAsset> assetList = new List<LoanApplicationAsset>();
        List<LoanApplicationLiability> liabilityList = new List<LoanApplicationLiability>();
        Contact currentUserContact = new Contact();
        try{
            
            List<Loan_Program__c> loanProgramList = LoanApplicationUtil.getLoanProgramList('Mortgage Loan');
                
		    User currentUser = [SELECT Id, AccountId, ContactId FROM User 
                                WHERE Id = :UserInfo.getUserId()];
            
            if(currentUser.ContactId != null){
                currentUserContact = [SELECT Id, LastName, FirstName, Name, MobilePhone, Phone, 
                                              Email, Social_Security_Number__c,AccountId FROM Contact 
                                              Where id = :currentUser.ContactId];
                
                System.debug('currentUserContact : '+currentUserContact);
            }
            
            String documentIds = '';
            if(loanApplicationId != NULL && !String.isBlank(loanApplicationId)){
                
                List<ResidentialLoanApplication> loanApplicationList = [SELECT Id, Name, OpportunityId, TotalMonthlyIncome__c,
                                                                        TotalMonthlyExpense__c,Debt_To_Income_Ratio__c,MortgageProgramType, 
                                                                        AccountId, Loan_Program__c, Status, LoanPurpose, Year_Acquired__c,
                                                                        LotOriginalCost,Amount_Existing_Liens__c,Purpose_of_Refinance__c,
                                                                        ImprovementCost, Title_Held_In_Name__c,Manner_In_Which_Title_Held__c,
                                                                        Down_Payment_Source__c,Estate_Held_In__c,
                                                                        (SELECT Id, Name, LoanApplicationId, ContactId, BorrowerType, Last_Name__c,First_Name__c,
                                                                         SSN__c, Phone__c, Mobile__c, Email__c FROM LoanApplicants ORDER BY BorrowerType ASC, Name ASC),
                                                                        (SELECT Id, Name, RequestedLoanAmount, Downpayment_Amount__c, 
                                                                         Property_Type__c, LoanPurposeType, PropertyUseType, 
                                                                         PropertyStreet, PropertyCity, PropertyState, PropertyPostalCode, 
                                                                         PropertyCountry, Legal_Description__c, Year_Built__c,
                                                                         Number_of_Units__c FROM LoanApplicationProperties)
                                                                        FROM ResidentialLoanApplication
                                                                        WHERE Id = :loanApplicationId];
                    
                if(loanApplicationList != null && !loanApplicationList.isEmpty()){
                    loanApplication = loanApplicationList[0];
                    documentIds = LoanApplicationUtil.getRequiredDocumentFileIdsForLoanApplication(loanApplication.Id);
                }
                
                assetList = [SELECT Id, Name, AccountType, AssetType, AccountNumber, 
                             Loan_Applicant__c, AssetClass, FinancialInstitutionName, 
                             CashOrMarketValue,LoanApplicationId  FROM LoanApplicationAsset
                             WHERE LoanApplicationId = :loanApplicationId];
                
                liabilityList = [SELECT Id, Name, LoanApplicationId, Loan_Applicant__c, 
                                 LiabilityClass, AccountType, OtherLiabilityType, 
                                 CreditorName, AccountNumber, MonthlyPaymentAmount, 
                                 UnpaidBalanceAmount, ShouldBePaidInFull, 
                                 LoanType FROM LoanApplicationLiability 
                                 WHERE LoanApplicationId = :loanApplicationId];
            }
            
            System.debug('loanApplication :'+loanApplication);
            
            return new ActionResult(new map<string, object>{'loanProgram'=>loanProgramList, 
                'currentUserContact' => currentUserContact,'loanApplication'=>loanApplication,
                'statusOption'=>getPicklistValues('ResidentialLoanApplication', 'Status'),
                'mortgageTypes'=>getPicklistValues('ResidentialLoanApplication', 'MortgageProgramType'),
                'occupancyType'=>getPicklistValues('LoanApplicationProperty', 'PropertyUseType'),
                'PropertyType'=>getPicklistValues('LoanApplicationProperty', 'Property_Type__c'),
                'loanPurpose'=>getPicklistValues('ResidentialLoanApplication', 'LoanPurpose'),
                'requiredDocumentIds'=>documentIds, 'assets'=>assetList, 'liabilities'=>liabilityList
            });
            
        }catch(Exception exec){
            System.debug('Controller getInitialData Exception'+exec);
            return new ActionResult(exec);
        }
    }
	
    
    @AuraEnabled
    public static ActionResult getRequiredDocumentFileIds(String recordId){ 
        try{
            
            String requiredDocumentIds = LoanApplicationUtil.getRequiredDocumentFileIdsForLoanApplication(recordId);
            
            return new ActionResult(new map<string, object>{'requiredDocumentIds'=>requiredDocumentIds});            
        }catch(Exception exec){
            System.debug(exec);
            return new ActionResult(exec);
        }
    }
    
    @AuraEnabled
    public static ActionResult saveLoanApplicant(String loanApplicant){
       	
             String loanApplicationId = '';                                      
        try{
            LoanApplicant loanApplicantRecord = (LoanApplicant) Json.deserialize(loanApplicant, LoanApplicant.class);
            
            if(loanApplicantRecord.Account__c == null){
                Id personalAccountId = LoanApplicationUtil.getPersonalAccountId(loanApplicantRecord);
                if(personalAccountId != null){
                    loanApplicantRecord.Account__c = personalAccountId;
                }
            }
            
            upsert loanApplicantRecord;
            loanApplicationId = loanApplicantRecord.LoanApplicationId;
            
                       
            
            List<LoanApplicant> loanApplicantList = [SELECT Id, Name, BorrowerType, SSN__c, Phone__c, Mobile__c, 
                                                     Email__c, Account__c, First_Name__c,Last_Name__c,
                                                     LoanApplicationId FROM LoanApplicant 
                                                     WHERE LoanApplicationId = :loanApplicationId ORDER BY BorrowerType ASC];
            
            List<ResidentialLoanApplication> loanApplicationList = [SELECT Id,TotalMonthlyIncome__c,
                                                                    TotalMonthlyExpense__c,Debt_To_Income_Ratio__c
                                                                    FROM ResidentialLoanApplication
                                                                    WHERE Id = :loanApplicationId];
            
            return new ActionResult(new map<string, object>{'message'=> 'Applicant Information Saved sucessfully',
                'loanApplicantList'=>loanApplicantList, 'loanApplicantRecord'=>loanApplicantRecord,
                'loanApplication'=>loanApplicationList[0]});
        }catch(Exception exec){
            System.debug('loanAppDeclaration exec :'+exec);
            return new ActionResult(exec);
        }
    }
     
    @AuraEnabled
    public static ActionResult saveLoanApplicantAddress(String loanApplicantAddress,String loanApplicantMailingAddress){
        
        ActionResult result = LoanApplicationUtil.saveLoanApplicantAddress(loanApplicantAddress,loanApplicantMailingAddress);
        return result;
    }
    
    @AuraEnabled
    public static ActionResult saveLoanApplicantEmployment(String loanApplicantEmployment){
        
        ActionResult result = LoanApplicationUtil.saveLoanApplicantEmployment(loanApplicantEmployment);
        return result;
    }
    
    @AuraEnabled
    public static ActionResult saveLoanApplicantIncome(String loanApplicantIncomes){
        
        ActionResult result = LoanApplicationUtil.saveLoanApplicantIncome(loanApplicantIncomes);
        return result;
    }
    
    @AuraEnabled
    public static ActionResult saveLoanapplicantQuestions(String applicationQuestions){
        
        ActionResult result = LoanApplicationUtil.saveLoanapplicantQuestions(applicationQuestions);
        return result;
    }
    
    @AuraEnabled
    public static ActionResult updateLoanApplicationStatus(String loanApplication){
        try{
            ResidentialLoanApplication loanApplicationForm =  (ResidentialLoanApplication) JSON.deserialize(loanApplication,ResidentialLoanApplication.class);
            upsert loanApplicationForm;
            return new ActionResult(new map<string, object>{'message'=> 'Loan Application Status Updated sucessfully'});
        }catch(Exception ex){
            System.debug('updateLoanApplicationStatus exec :'+ex);
            return new ActionResult(ex);
        }
    }
    
    @AuraEnabled
    public static ActionResult getApplicantAddress(String loanApplicantId){
        
        ActionResult result = LoanApplicationUtil.getApplicantAddress(loanApplicantId);
        return result;
        
    }
    
    @AuraEnabled
    public static ActionResult saveLoanApplication(String loanApplication, String applicationProperty, 
                                                   String loanApplicant){ 
        Savepoint sp = Database.setSavepoint();                                              
        try{
            
            ResidentialLoanApplication loanApplicationForm =  (ResidentialLoanApplication) JSON.deserialize(loanApplication,ResidentialLoanApplication.class);
            upsert loanApplicationForm;
            
            
            LoanApplicationProperty  applicationPropertyForm =  (LoanApplicationProperty) JSON.deserialize(applicationProperty,LoanApplicationProperty .class);
            if(applicationPropertyForm.Id == null){
                applicationPropertyForm.LoanApplicationId = loanApplicationForm.Id;
                applicationPropertyForm.Name = loanApplicationForm.Name+' Property';
            }
            upsert applicationPropertyForm;
            
            LoanApplicant loanApplicantRecord =  (LoanApplicant) JSON.deserialize(loanApplicant,LoanApplicant.class);

            
            List<LoanApplicant> ExistingLoanApplicantList = getLoanApplicants(loanApplicationForm.Id);
            
            //Assign loan applicant id of existing loan applicant of loan application if available
            if(loanApplicantRecord.Id == null && !ExistingLoanApplicantList.isEmpty()){
                loanApplicantRecord.Id = ExistingLoanApplicantList[0].Id;
            }
            else if(loanApplicantRecord.Id == null){
                loanApplicantRecord.LoanApplicationId = loanApplicationForm.Id;
            }
            upsert loanApplicantRecord;
            
            if(loanApplicationForm.OpportunityId == null){
                Id opportunityId = LoanApplicationUtil.createLoanApplicationOpportunity(loanApplicationForm);
                loanApplicationForm.OpportunityId = opportunityId;
                update loanApplicationForm;
            }
            
            List<LoanApplicant> loanApplicantList = getLoanApplicants(loanApplicationForm.Id);
            
            String requiredDocumentIds = LoanApplicationUtil.getRequiredDocumentFileIdsForLoanApplication(loanApplicationForm.Id);

            return new ActionResult(new map<string, object>{'message'=> 'Loan Application Saved sucessfully',
                'loanApplication'=>loanApplicationForm, 'loanApplicant'=>loanApplicantList,
                'loanApplicationProperty'=>applicationPropertyForm, 'requiredDocumentIds'=>requiredDocumentIds});
            
        }catch(Exception exec){
            Database.rollback(sp);
            System.debug('saveLoanApplication exec :'+exec);
            return new ActionResult(exec);
        }
    }
    
    @AuraEnabled
    public static List<LoanApplicant> getLoanApplicants(String loanApplicationId){
        
        List<LoanApplicant> loanApplicantList = [SELECT Id, Name, BorrowerType, SSN__c, Phone__c, Mobile__c, Email__c, 
                                                 LoanApplicationId FROM LoanApplicant 
                                                 WHERE LoanApplicationId = :loanApplicationId
                                                 ORDER By BorrowerType];
        return loanApplicantList;
    }
    
   /*
    *Function to get LoanApplicant Records
    */
    @AuraEnabled
    public static ActionResult getLoanApplicantRecords(String loanApplicantRecId){
        
        LoanApplicantAddress loanApplicantPresentAddress = new LoanApplicantAddress();
        LoanApplicantAddress loanApplicantMailingAddress = new LoanApplicantAddress();
        LoanApplicantEmployment loanApplicantEmploymentRec = new LoanApplicantEmployment();
        LoanApplicantIncome loanApplicantIncomeRec =  new LoanApplicantIncome();
       
        System.debug('loanApplicantRecId : '+loanApplicantRecId);
        
        //get loan applicant record with related LoanApplicantDeclarations record
        LoanApplicant loanApplicantRec = [SELECT Id, Name, SSN__c, Phone__c, MaritalStatus, DependentCount,
                                          Mobile__c, Email__c,LoanApplicationId,BorrowerType,Outstanding_Loans_Expenses__c,
                                          Credit_Cards_Expenses__c,Lines_of_Credit_Expenses__c,Alimony_Expenses__c,
                                          Child_Support_Expenses__c,Other_Expenses__c,Monthly_Expenses_Amount__c,
                                          First_Name__c,Last_Name__c,Approval_Accept__c,Approval_Name__c,BirthDate__c,
                                          (SELECT Id, Name, LoanApplicationId, HasOutstandingJudgement, 
                                           HasDeclaredBankruptcy, IsRelatedToSeller, HasUndisclAddlPropApp, 
                                           HasUndisclAddlCreditApp, IsSubjectToPriorityLien, IsCoSignerUndisclDebt, 
                                           HasDeedSurrender, HasPastShortSale, IsPrimaryResidence, HasOwnershipInterest, 
                                           PriorPropertyTitleType, PriorPropertyUsageType, HasBorrowedMoney, 
                                           IsPresentlyDelinquent, IsPartyToLawsuit, HasPropertyForeclosed, Loan_Program__c,
                                           Is_Permanent_Resident_Alien__c,Is_US_Citizen__c,Is_Obligated_To_Pay__c
                                           FROM LoanApplicantDeclarations)
                                          FROM LoanApplicant 
                                          WHERE Id = :loanApplicantRecId ORDER BY BorrowerType ASC, Name ASC LIMIT 1];
        
        System.debug('loanApplicantRec: '+loanApplicantRec);
        
        //get loan applicant Present Address record 
        String whereClause = ' WHERE LoanApplicantId = \''+loanApplicantRecId+ '\''+' AND ResidencyType = \'Present Address\'';
        List<LoanApplicantAddress> presentAddress = LoanApplicationUtil.queryAll('LoanApplicantAddress',whereClause);
        System.debug('presentAddress: '+presentAddress);
        
        if(presentAddress != null && !presentAddress.isEmpty()){
            System.debug('presentAddress: '+presentAddress[0]);
            loanApplicantPresentAddress = presentAddress[0];
        }
        
         //get loan applicant Mailing Address record
        String whereCondition = ' WHERE LoanApplicantId = \''+loanApplicantRecId+ '\''+' AND ResidencyType = \'Mailing Address\'';
        List<LoanApplicantAddress> mailingAddress = LoanApplicationUtil.queryAll('LoanApplicantAddress',whereCondition);
        System.debug('mailingAddress: '+mailingAddress);
        
        if(mailingAddress != null && !mailingAddress.isEmpty()){
            System.debug('mailingAddress: '+mailingAddress[0]);
            loanApplicantMailingAddress = mailingAddress[0];
        }
        
        //get Loan Applicant Employment record
        String employmentWhereClause = ' WHERE LoanApplicantId = \''+loanApplicantRecId+ '\'';
        List<LoanApplicantEmployment> applicantEmployment = LoanApplicationUtil.queryAll('LoanApplicantEmployment',employmentWhereClause);
        
        if(applicantEmployment != null && !applicantEmployment.isEmpty()){
            System.debug('applicantEmployment: '+applicantEmployment[0]);
            loanApplicantEmploymentRec = applicantEmployment[0];
        }
        
        
        String incomeWhereClause = ' WHERE LoanApplicantId = \''+loanApplicantRecId+ '\'';
        List<LoanApplicantIncome> applicantIncome = LoanApplicationUtil.queryAll('LoanApplicantIncome',incomeWhereClause);
        
        
        if(applicantIncome != null && !applicantIncome.isEmpty()){
            loanApplicantIncomeRec = applicantIncome[0];
        }
        
        return new ActionResult(new map<string, object>{'message'=> 'Applicant records get sucessfully',
            'loanApplicant'=> loanApplicantRec, 'presentAddress'=> loanApplicantPresentAddress,
            'mailingAddress'=> loanApplicantMailingAddress, 'applicantEmployment'=> loanApplicantEmploymentRec,
            'applicantIncome'=> loanApplicantIncomeRec});
    }
    
    @AuraEnabled
    public static ActionResult getApplicantCertificationValues(String loanApplicantId){
        
        ActionResult result = LoanApplicationUtil.getApplicantCertificationValues(loanApplicantId);
        return result;
    }
    
    @AuraEnabled
    public static ActionResult saveApplicantCertification(String applicationCertification){
        
        ActionResult result = LoanApplicationUtil.saveApplicantCertification(applicationCertification);
        return result;
    }
    
    @AuraEnabled
    public static ActionResult saveAsset(String asset, String loanApplicationId, String loanApplicantId){
        try{
            LoanApplicationAsset loanAsset = (LoanApplicationAsset) Json.deserialize(asset, LoanApplicationAsset.class);
            
            if(loanAsset.Id == NULL){
                loanAsset.Loan_Applicant__c = loanApplicantId;
                loanAsset.LoanApplicationId = loanApplicationId;
            }
            upsert loanAsset;
            
            String whereClause = ' WHERE LoanApplicationId = \''+loanApplicationId+ '\'';
            List<LoanApplicationAsset> assetList = LoanApplicationUtil.queryAll('LoanApplicationAsset',whereClause);
            
            return new ActionResult(new map<string, object>{'message'=> 'Loan Application Assets Saved sucessfully',
            'assets'=>assetList});
        }catch(Exception exec){
            System.debug('loanAppDeclaration exec :'+exec);
            return new ActionResult(exec);
        }
    }
    
    @AuraEnabled
    public static ActionResult saveLiability(String liability, String loanApplicationId, String loanApplicantId){
        try{
            LoanApplicationLiability loanliability = (LoanApplicationLiability) Json.deserialize(liability, LoanApplicationLiability.class);
            
            if(loanliability.Id == NULL){
                loanliability.Loan_Applicant__c = loanApplicantId;
                loanliability.LoanApplicationId = loanApplicationId;
            }
            upsert loanliability;
            
            String whereClause = ' WHERE LoanApplicationId = \''+loanApplicationId+ '\'';
            List<LoanApplicationLiability> liabilityList = LoanApplicationUtil.queryAll('LoanApplicationLiability',whereClause);
            
            return new ActionResult(new map<string, object>{'message'=> 'Loan Application Liability Saved sucessfully',
            'liabilities'=>liabilityList});
        }catch(Exception exec){
            System.debug('loanAppDeclaration exec :'+exec);
            return new ActionResult(exec);
        }
    }
    
    @AuraEnabled
    public static ActionResult getApplicationList(){ 
        try{
            List<ResidentialLoanApplication> loanApplicationList = [SELECT Id, Name, OpportunityId, Loan_Program__r.Name,
                                                                    Status, LoanPurpose, CreatedDate 
                                                                    FROM ResidentialLoanApplication WHERE CreatedbyId =: UserInfo.getUserId()
                                                                    Order by CreatedDate desc];
            
            return new ActionResult(new map<string, object>{'listApplications'=>loanApplicationList });
        }catch(Exception exec){
            System.debug(exec);
            return new ActionResult(exec);
        }
    }
    
    @AuraEnabled
    public static ActionResult getPicklists(String type){
        try{
            if(type != NULL && type == 'Asset'){
                return new ActionResult(new map<string, object>{
                    'assetOrLiabilityClass'=>getPicklistValues('LoanApplicationAsset', 'AssetClass'),
                        'assetOrLiabilityType'=>getPicklistValues('LoanApplicationAsset', 'AssetType'),
                        'accountType'=>getPicklistValues('LoanApplicationAsset', 'AccountType')
                        });
            }else if(type != NULL && type == 'Liability'){
                return new ActionResult(new map<string, object>{
                    'assetOrLiabilityClass'=>getPicklistValues('LoanApplicationLiability', 'LiabilityClass'),
                        'assetOrLiabilityType'=>getPicklistValues('LoanApplicationLiability', 'OtherLiabilityType'),
                        'accountType'=>getPicklistValues('LoanApplicationLiability', 'AccountType')
                        });
            }else{
                return new ActionResult(new map<string, object>{'message'=> 'No Any Picklist Found'});
            }            
        }catch(Exception exec){
            System.debug('getAssetPicklistValues Exception'+exec);
            return new ActionResult(exec);
        }
    }
    
    public static List<String> getPicklistValues(String ObjectApi_name,String Field_name){ 
        
        List<String> lstPickvals=new List<String>();
        Schema.SObjectType targetType = Schema.getGlobalDescribe().get(ObjectApi_name);
        Sobject Object_name = targetType.newSObject();
        Schema.sObjectType sobject_type = Object_name.getSObjectType(); 
        Schema.DescribeSObjectResult sobject_describe = sobject_type.getDescribe(); 
        Map<String, Schema.SObjectField> field_map = sobject_describe.fields.getMap(); 
        List<Schema.PicklistEntry> pick_list_values = field_map.get(Field_name).getDescribe().getPickListValues(); 
        for (Schema.PicklistEntry a : pick_list_values) { 
            lstPickvals.add(a.getValue());
        }        
        return lstPickvals;
    }
}