/**
 * @description       :
 * @author            : 'Amol K'
 * @group             :
 * @last modified on  : 04-04-2023
 * @last modified by  : 
 **/
public without sharing class BusinessLoanFormController {
  @AuraEnabled(cacheable=true)
  public static ActionResult getInitialData(String loanApplicationId) {
    ResidentialLoanApplication loanApplication = new ResidentialLoanApplication();
    List<LoanApplicant> loanApplicant = new List<LoanApplicant>();
    Contact currentUserContact = new Contact();
    try {
      List<Loan_Program__c> loanProgramList = LoanApplicationUtil.getLoanProgramList(
        'Business Loan'
      );

      User currentUser = [
        SELECT Id, AccountId, ContactId
        FROM User
        WHERE Id = :UserInfo.getUserId()
      ];

      if (currentUser.ContactId != null) {
        currentUserContact = [
          SELECT
            Id,
            LastName,
            FirstName,
            Name,
            MobilePhone,
            Phone,
            Email,
            Social_Security_Number__c,
            AccountId
          FROM Contact
          WHERE id = :currentUser.ContactId
        ];
      }

      String documentIds = '';
      if (loanApplicationId != null && !String.isBlank(loanApplicationId)) {
        List<ResidentialLoanApplication> loanApplicationList = [
          SELECT
            Id,
            Name,
            OpportunityId,
            TotalMonthlyIncome__c,
            Account__c,
            TotalMonthlyExpense__c,
            Debt_To_Income_Ratio__c,
            Business_TIN__c,
            AccountId,
            Loan_Program__c,
            Status,
            LoanPurpose,
            DBA_or_Tradename__c,
            Number_of_Employees__c,
            Business_Classification__c,
            Street__c,
            City__c,
            State__c,
            Country__c,
            PostalCode__c,
            Average_Monthly_Payroll__c,
            Requested_Loan_Amount__c,
            Total_Ownership__c,
            Purpose_of_Loan__c,
            OtherLoanPurpose,
            Business_Phone__c,
            Business_Fax__c,
            Business_Website__c,
            Legal_Status__c,
            Tax_ID_Number__c,
            Date_Bus_Established__c,
            No_Of_Locations__c,
            Annual_Net_Income__c,
            hasCollateralInfo__c,
            Collateral_Type__c,
            Collateral_Value__c,
            Collateral_Description__c,
            Cash_On_Hand_In_LFCU__c,
            Deposit_In_Other_Institute__c,
            Notes_And_Account_Due__c,
            Taxes_Accrued__c,
            Life_Insurance_Value__c,
            As_Endorser__c,
            Legal_Claims__c,
            Special_Debt__c,
            Amount_Of_Contested__c,
            Expand_Product_Offering_Describe__c,
            Add_New_Location_Description__c,
            Buy_Operational_Assets_Description__c,
            Building_Maintenance_Description__c,
            Cover_Expense_Description__c,
            Expand_Business_Operations_Description__c,
            (
              SELECT
                Id,
                Name,
                LoanApplicationId,
                ContactId,
                BorrowerType,
                Last_Name__c,
                First_Name__c,
                SSN__c,
                Phone__c,
                Mobile__c,
                Email__c
              FROM LoanApplicants
              ORDER BY BorrowerType ASC, Name ASC
            )
          FROM ResidentialLoanApplication
          WHERE Id = :loanApplicationId
        ];

        if (loanApplicationList != null && !loanApplicationList.isEmpty()) {
          loanApplication = loanApplicationList[0];
          documentIds = LoanApplicationUtil.getRequiredDocumentFileIdsForLoanApplication(
            loanApplication.Id
          );
        }
      }

      return new ActionResult(
        new Map<string, object>{
          'loanProgram' => loanProgramList,
          'currentUserContact' => currentUserContact,
          'loanApplication' => loanApplication,
          'requiredDocumentIds' => documentIds,
          'currentUser' => currentUser,
          'statusOption' => getPicklistValues(
            'ResidentialLoanApplication',
            'Status'
          ),
          'loanPurpose' => getPicklistValues(
            'ResidentialLoanApplication',
            'Purpose_of_Loan__c'
          )
        }
      );
    } catch (Exception exec) {
      System.debug('Controller getInitialData Exception' + exec);
      return new ActionResult(exec);
    }
  }

  /*@AuraEnabled
    public static ActionResult getRequiredDocumentFileIds(String recordId){ 
        try{
            
            String requiredDocumentIds = LoanApplicationUtil.getRequiredDocumentFileIdsForLoanApplication(recordId);
            
            return new ActionResult(new map<string, object>{'requiredDocumentIds'=>requiredDocumentIds});            
        }catch(Exception exec){
            System.debug(exec);
            return new ActionResult(exec);
        }
    }*/

  public static Id getPersonalAccountId(LoanApplicant loanApplicantRecord) {
    if (loanApplicantRecord != null) {
      Id devRecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName()
        .get('Person Account')
        .getRecordTypeId();
      //Id devRecordTypeId = '0125w000001FcwN';
      String ssn = loanApplicantRecord.SSN__c.replaceAll(
        '[^a-zA-Z0-9\\s+]',
        ''
      );
      List<Account> personalAccounts = [
        SELECT Id
        FROM Account
        WHERE
          RecordTypeId = :devRecordTypeId
          AND LastName = :loanApplicantRecord.Last_Name__c
          AND PersonEmail = :loanApplicantRecord.Email__c
          AND SSN__c = :loanApplicantRecord.SSN__c
        LIMIT 1
      ];

      ResidentialLoanApplication loanApplication = [
        SELECT Id, Account__c
        FROM ResidentialLoanApplication
        WHERE Id = :loanApplicantRecord.LoanApplicationId
      ];

      User currentUser = [
        SELECT Id, AccountId, ContactId
        FROM User
        WHERE Id = :UserInfo.getUserId()
      ];

      if (personalAccounts == null || personalAccounts.isEmpty()) {
        try {
          Account personAccount = new Account();
          personAccount.FirstName = loanApplicantRecord.First_Name__c;
          personAccount.LastName = loanApplicantRecord.Last_Name__c;
          personAccount.PersonEmail = loanApplicantRecord.Email__c;
          personAccount.SSN__c = loanApplicantRecord.SSN__c;
          personAccount.RecordTypeId = devRecordTypeId;
          insert personAccount;

          personAccount.FinServ__IndividualType__c = 'Group';
          update personAccount;
          createAccountRelationship(
            loanApplication.Account__c,
            personAccount.Id
          );

          return personAccount.Id;
        } catch (Exception ex) {
          System.debug('Exception Create Personal Account' + ex.getMessage());
          return null;
        }
      } else {
        return personalAccounts[0].Id;
      }
    } else {
      return null;
    }
  }

  @AuraEnabled
  public static ActionResult saveLoanApplicant(String loanApplicant) {
    String loanApplicationId = '';
    try {
      LoanApplicant loanApplicantRecord = (LoanApplicant) Json.deserialize(
        loanApplicant,
        LoanApplicant.class
      );
      if (loanApplicantRecord.Account__c == null) {
        Id personalAccountId = getPersonalAccountId(loanApplicantRecord);
        if (personalAccountId != null) {
          loanApplicantRecord.Account__c = personalAccountId;
        }
      }

      upsert loanApplicantRecord;
      loanApplicationId = loanApplicantRecord.LoanApplicationId;

      List<LoanApplicant> loanApplicantList = [
        SELECT
          Id,
          Name,
          BorrowerType,
          SSN__c,
          Phone__c,
          Mobile__c,
          Email__c,
          Account__c,
          First_Name__c,
          Last_Name__c,
          LoanApplicationId
        FROM LoanApplicant
        WHERE LoanApplicationId = :loanApplicationId
        ORDER BY BorrowerType ASC
      ];

      List<ResidentialLoanApplication> loanApplicationList = [
        SELECT
          Id,
          TotalMonthlyIncome__c,
          Total_Ownership__c,
          TotalMonthlyExpense__c,
          Debt_To_Income_Ratio__c
        FROM ResidentialLoanApplication
        WHERE Id = :loanApplicationId
      ];

      return new ActionResult(
        new Map<string, object>{
          'message' => 'Applicant Information Saved sucessfully',
          'loanApplicantList' => loanApplicantList,
          'loanApplicantRecord' => loanApplicantRecord,
          'loanApplication' => loanApplicationList[0]
        }
      );
    } catch (Exception exec) {
      System.debug('loanAppDeclaration exec :' + exec);
      return new ActionResult(exec);
    }
  }

  @AuraEnabled
  public static ActionResult saveLoanApplicantAddress(
    String loanApplicantAddress,
    String loanApplicantMailingAddress
  ) {
    ActionResult result = LoanApplicationUtil.saveLoanApplicantAddress(
      loanApplicantAddress,
      loanApplicantMailingAddress
    );
    return result;
  }

  @AuraEnabled
  public static ActionResult saveLoanApplicantEmployment(
    String loanApplicantEmployment
  ) {
    ActionResult result = LoanApplicationUtil.saveLoanApplicantEmployment(
      loanApplicantEmployment
    );
    return result;
  }

  @AuraEnabled
  public static ActionResult saveLoanApplicantIncome(
    String loanApplicantIncomes
  ) {
    try {
      LoanApplicantIncome loanApplicantIncomesRec = (LoanApplicantIncome) Json.deserialize(
        loanApplicantIncomes,
        LoanApplicantIncome.class
      );
      upsert loanApplicantIncomesRec;
      return new ActionResult(
        new Map<string, object>{
          'message' => 'Applicant Income Saved sucessfully'
        }
      );
    } catch (Exception ex) {
      System.debug('loanAppDeclaration exec :' + ex);
      return new ActionResult(ex);
    }
  }

  @AuraEnabled
  public static ActionResult saveLoanapplicantQuestions(
    String applicationQuestions
  ) {
    ActionResult result = LoanApplicationUtil.saveLoanapplicantQuestions(
      applicationQuestions
    );
    return result;
  }

  @AuraEnabled
  public static ActionResult updateLoanApplicationStatus(
    String loanApplication
  ) {
    try {
      ResidentialLoanApplication loanApplicationForm = (ResidentialLoanApplication) JSON.deserialize(
        loanApplication,
        ResidentialLoanApplication.class
      );
      ResidentialLoanApplication application = new ResidentialLoanApplication();
      application.Id = loanApplicationForm.Id;
      application.Status = 'Pre-App Completed';
      update application;
      return new ActionResult(
        new Map<string, object>{
          'message' => 'Loan Application Status Updated sucessfully'
        }
      );
    } catch (Exception ex) {
      System.debug('updateLoanApplicationStatus exec :' + ex);
      return new ActionResult(ex);
    }
  }

  @AuraEnabled
  public static ActionResult getApplicantAddress(String loanApplicantId) {
    ActionResult result = LoanApplicationUtil.getApplicantAddress(
      loanApplicantId
    );
    return result;
  }

  @AuraEnabled
  public static ActionResult saveLoanApplication(
    String loanApplication,
    String loanApplicant
  ) {
    Savepoint sp = Database.setSavepoint();
    User currentUser = [
      SELECT Id, AccountId, ContactId, Contact.AccountId
      FROM User
      WHERE Id = :UserInfo.getUserId()
    ];

    try {
      ResidentialLoanApplication loanApplicationForm = (ResidentialLoanApplication) JSON.deserialize(
        loanApplication,
        ResidentialLoanApplication.class
      );

      if (loanApplicationForm.Id == null) {
        String RecTypeId = Schema.SObjectType.ResidentialLoanApplication.getRecordTypeInfosByName()
          .get('Business Loan')
          .getRecordTypeId();
        loanApplicationForm.RecordTypeId = RecTypeId;
      }

      //Create Business Account For Loan Application if Account Id is NULL
      if (loanApplicationForm.AccountId == null) {
        Id accountId = LoanApplicationUtil.createBusinessAccountRec(
          loanApplicationForm
        );

        if (currentUser.AccountId != null) {
          createAccountRelationship(accountId, currentUser.AccountId);
        }

        loanApplicationForm.AccountId = accountId;
        loanApplicationForm.Account__c = accountId;
      }
      upsert loanApplicationForm;

      LoanApplicant loanApplicantRecord = (LoanApplicant) JSON.deserialize(
        loanApplicant,
        LoanApplicant.class
      );

      List<LoanApplicant> ExistingLoanApplicantList = getLoanApplicants(
        loanApplicationForm.Id
      );
      if (
        loanApplicantRecord.Id == null && !ExistingLoanApplicantList.isEmpty()
      ) {
        loanApplicantRecord.Id = ExistingLoanApplicantList[0].Id;
      } else if (loanApplicantRecord.Id == null) {
        loanApplicantRecord.LoanApplicationId = loanApplicationForm.Id;
      }
      upsert loanApplicantRecord;

      //create opportunity for loan application
      if (loanApplicationForm.OpportunityId == null) {
        Id opportunityId = LoanApplicationUtil.createLoanApplicationOpportunity(
          loanApplicationForm
        );
        ResidentialLoanApplication application = new ResidentialLoanApplication();
        application.Id = loanApplicationForm.Id;
        application.OpportunityId = opportunityId;
        update application;
      }

      List<LoanApplicant> loanApplicantList = getLoanApplicants(
        loanApplicationForm.Id
      );

      String requiredDocumentIds = LoanApplicationUtil.getRequiredDocumentFileIdsForLoanApplication(
        loanApplicationForm.Id
      );

      return new ActionResult(
        new Map<string, object>{
          'message' => 'Loan Application Saved sucessfully',
          'loanApplication' => loanApplicationForm,
          'loanApplicantList' => loanApplicantList,
          'loanApplicant' => loanApplicantRecord,
          'requiredDocumentIds' => requiredDocumentIds
        }
      );
    } catch (Exception exec) {
      Database.rollback(sp);
      System.debug('saveLoanApplication exec :' + exec);
      return new ActionResult(exec);
    }
  }

  @AuraEnabled
  public static List<LoanApplicant> getLoanApplicants(
    String loanApplicationId
  ) {
    List<LoanApplicant> loanApplicantList = [
      SELECT
        Id,
        Name,
        BorrowerType,
        SSN__c,
        Phone__c,
        Mobile__c,
        Email__c,
        LoanApplicationId
      FROM LoanApplicant
      WHERE LoanApplicationId = :loanApplicationId
      ORDER BY BorrowerType
    ];
    return loanApplicantList;
  }

  @AuraEnabled(cacheable=true)
  public static ActionResult getLoanApplicantRecords(
    String loanApplicantRecId
  ) {
    LoanApplicantAddress loanApplicantPresentAddress = new LoanApplicantAddress();
    LoanApplicantAddress loanApplicantMailingAddress = new LoanApplicantAddress();
    LoanApplicantEmployment loanApplicantEmploymentRec = new LoanApplicantEmployment();
    LoanApplicantIncome loanApplicantIncomeRec = new LoanApplicantIncome();

    System.debug('loanApplicantRecId : ' + loanApplicantRecId);
    List<LoanApplicant> loanApplicantRecList = [
      SELECT
        Id,
        Name,
        SSN__c,
        Phone__c,
        MaritalStatus,
        DependentCount,
        Licence_Number__c,
        Mobile__c,
        Email__c,
        LoanApplicationId,
        BorrowerType,
        Outstanding_Loans_Expenses__c,
        Credit_Cards_Expenses__c,
        Lines_of_Credit_Expenses__c,
        Alimony_Expenses__c,
        Child_Support_Expenses__c,
        Other_Expenses__c,
        Monthly_Expenses_Amount__c,
        First_Name__c,
        Last_Name__c,
        Title__c,
        Percent_of_Ownership__c,
        Owner_Since__c,
        Approval_Accept__c,
        Approval_Name__c,
        BirthDate__c,
        (
          SELECT
            Id,
            Name,
            LoanApplicationId,
            IsPresentlyDelinquent,
            HasDeclaredBankruptcy,
            IsPartyToLawsuit,
            IsBusinessForSale__c,
            HasBusinessRelocated__c,
            IsBusinessNameChangeIn5Years__c,
            Question_Type__c
          FROM LoanApplicantDeclarations
          WHERE Question_Type__c = 'Application Question'
        )
      FROM LoanApplicant
      WHERE Id = :loanApplicantRecId
      ORDER BY BorrowerType ASC, Name ASC
      LIMIT 1
    ];

    String whereClause =
      ' WHERE LoanApplicantId = \'' +
      loanApplicantRecId +
      '\'' +
      ' AND ResidencyType = \'Present Address\'';
    List<LoanApplicantAddress> presentAddress = LoanApplicationUtil.queryAll(
      'LoanApplicantAddress',
      whereClause
    );

    if (presentAddress != null && !presentAddress.isEmpty()) {
      loanApplicantPresentAddress = presentAddress[0];
    }

    String whereCondition =
      ' WHERE LoanApplicantId = \'' +
      loanApplicantRecId +
      '\'' +
      ' AND ResidencyType = \'Mailing Address\'';
    List<LoanApplicantAddress> mailingAddress = LoanApplicationUtil.queryAll(
      'LoanApplicantAddress',
      whereCondition
    );

    if (mailingAddress != null && !mailingAddress.isEmpty()) {
      loanApplicantMailingAddress = mailingAddress[0];
    }

    String employmentWhereClause =
      ' WHERE LoanApplicantId = \'' +
      loanApplicantRecId +
      '\'';
    List<LoanApplicantEmployment> applicantEmployment = LoanApplicationUtil.queryAll(
      'LoanApplicantEmployment',
      employmentWhereClause
    );

    if (applicantEmployment != null && !applicantEmployment.isEmpty()) {
      loanApplicantEmploymentRec = applicantEmployment[0];
    }

    String incomeWhereClause =
      ' WHERE LoanApplicantId = \'' +
      loanApplicantRecId +
      '\'';
    List<LoanApplicantIncome> applicantIncome = LoanApplicationUtil.queryAll(
      'LoanApplicantIncome',
      incomeWhereClause
    );

    if (applicantIncome != null && !applicantIncome.isEmpty()) {
      loanApplicantIncomeRec = applicantIncome[0];
    }

    return new ActionResult(
      new Map<string, object>{
        'message' => 'Applicant records get sucessfully',
        'loanApplicant' => loanApplicantRecList[0],
        'presentAddress' => loanApplicantPresentAddress,
        'mailingAddress' => loanApplicantMailingAddress,
        'applicantEmployment' => loanApplicantEmploymentRec,
        'applicantIncome' => loanApplicantIncomeRec
      }
    );
  }

  @AuraEnabled
  public static ActionResult getApplicantCertificationValues(
    String loanApplicantId
  ) {
    ActionResult result = LoanApplicationUtil.getApplicantCertificationValues(
      loanApplicantId
    );
    return result;
  }

  @AuraEnabled
  public static ActionResult getApplicationDeclaration(String loanApplicantId) {
    try {
      String whereClause =
        ' WHERE LoanApplicantId = \'' +
        loanApplicantId +
        '\'' +
        ' AND Question_Type__c = \'Declaration\'';
      List<LoanApplicantDeclaration> declarations = LoanApplicationUtil.queryAll(
        'LoanApplicantDeclaration',
        whereClause
      );

      return new ActionResult(
        new Map<string, object>{
          'message' => 'Certification records get sucessfully',
          'declaration' => declarations
        }
      );
    } catch (Exception ex) {
      System.debug('getApplicantCertificationValues exec :' + ex);
      return new ActionResult(ex);
    }
  }

  @AuraEnabled
  public static ActionResult saveApplicationLoanInformation(
    String loanApplication
  ) {
    try {
      ResidentialLoanApplication loanApplicationForm = (ResidentialLoanApplication) JSON.deserialize(
        loanApplication,
        ResidentialLoanApplication.class
      );
      upsert loanApplicationForm;
      return new ActionResult(
        new Map<string, object>{
          'message' => 'Application records save sucessfully',
          'loanApplication' => loanApplicationForm
        }
      );
    } catch (Exception ex) {
      System.debug('getApplicantCertificationValues exec :' + ex);
      return new ActionResult(ex);
    }
  }

  @AuraEnabled
  public static ActionResult saveApplicantCertification(
    String applicationCertification
  ) {
    ActionResult result = LoanApplicationUtil.saveApplicantCertification(
      applicationCertification
    );
    return result;
  }

  @AuraEnabled
  public static ActionResult saveAsset(String asset, String loanApplicationId) {
    try {
      LoanApplicationAsset loanAsset = (LoanApplicationAsset) Json.deserialize(
        asset,
        LoanApplicationAsset.class
      );

      if (loanAsset.Id == null) {
        loanAsset.LoanApplicationId = loanApplicationId;
      }
      upsert loanAsset;

      String whereClause =
        ' WHERE LoanApplicationId = \'' +
        loanApplicationId +
        '\'' +
        ' AND Schedule_Form_Type__c = \'' +
        loanAsset.Schedule_Form_Type__c +
        '\'';
      List<LoanApplicationAsset> assetList = LoanApplicationUtil.queryAll(
        'LoanApplicationAsset',
        whereClause
      );

      return new ActionResult(
        new Map<string, object>{
          'message' => 'Loan Application Assets Saved sucessfully',
          'assets' => assetList
        }
      );
    } catch (Exception exec) {
      System.debug('loanAppDeclaration exec :' + exec);
      return new ActionResult(exec);
    }
  }

  @AuraEnabled
  public static ActionResult getAssetList(String loanApplicationId) {
    List<LoanApplicationAsset> assetList = new List<LoanApplicationAsset>();

    try {
      assetList = getAssets(loanApplicationId);

      return new ActionResult(new Map<string, object>{ 'assets' => assetList });
    } catch (Exception exec) {
      System.debug('Controller getInitialData Exception' + exec);
      return new ActionResult(exec);
    }
  }

  @AuraEnabled
  public static ActionResult saveLiability(
    String liability,
    String loanApplicationId
  ) {
    try {
      LoanApplicationLiability loanliability = (LoanApplicationLiability) Json.deserialize(
        liability,
        LoanApplicationLiability.class
      );

      if (loanliability.Id == null) {
        loanliability.LoanApplicationId = loanApplicationId;
      }
      upsert loanliability;

      String whereClause =
        ' WHERE LoanApplicationId = \'' +
        loanApplicationId +
        '\'' +
        ' AND Schedule_Form_Type__c = \'' +
        loanliability.Schedule_Form_Type__c +
        '\'';
      List<LoanApplicationLiability> liabilityList = LoanApplicationUtil.queryAll(
        'LoanApplicationLiability',
        whereClause
      );

      return new ActionResult(
        new Map<string, object>{
          'message' => 'Loan Application Liability Saved sucessfully',
          'liabilities' => liabilityList
        }
      );
    } catch (Exception exec) {
      System.debug('loanAppDeclaration exec :' + exec);
      return new ActionResult(exec);
    }
  }

  @AuraEnabled
  public static ActionResult getLiabilityList(String loanApplicationId) {
    List<LoanApplicationLiability> liabilityList = new List<LoanApplicationLiability>();
    try {
      liabilityList = getLiabilities(loanApplicationId);

      return new ActionResult(
        new Map<string, object>{ 'liabilities' => liabilityList }
      );
    } catch (Exception exec) {
      System.debug('Controller getInitialData Exception' + exec);
      return new ActionResult(exec);
    }
  }

  @AuraEnabled(cacheable=true)
  public static ActionResult getLoanApplicationAssetsAndLiabilities(
    String loanApplicationId
  ) {
    List<LoanApplicationLiability> liabilityList = new List<LoanApplicationLiability>();
    List<LoanApplicationAsset> assetList = new List<LoanApplicationAsset>();

    try {
      assetList = getAssets(loanApplicationId);

      liabilityList = getLiabilities(loanApplicationId);

      return new ActionResult(
        new Map<string, object>{
          'liabilities' => liabilityList,
          'assets' => assetList
        }
      );
    } catch (Exception exec) {
      System.debug('Controller getInitialData Exception' + exec);
      return new ActionResult(exec);
    }
  }

  @AuraEnabled
  public static ActionResult getApplicationList() {
    try {
      List<ResidentialLoanApplication> loanApplicationList = [
        SELECT
          Id,
          Name,
          OpportunityId,
          Loan_Program__r.Name,
          Status,
          LoanPurpose,
          CreatedDate
        FROM ResidentialLoanApplication
        WHERE CreatedbyId = :UserInfo.getUserId()
        ORDER BY CreatedDate DESC
      ];

      return new ActionResult(
        new Map<string, object>{ 'listApplications' => loanApplicationList }
      );
    } catch (Exception exec) {
      System.debug(exec);
      return new ActionResult(exec);
    }
  }

  @AuraEnabled(cacheable=true)
  public static ActionResult getCollateralInformation(
    String loanApplicationId
  ) {
    try {
      List<Collateral_Info__c> collateralInfoList = [
        SELECT
          Id,
          Name,
          Collateral_Type__c,
          Collateral_Value__c,
          Collateral_Description__c,
          Residential_Loan_Application__c
        FROM Collateral_Info__c
        WHERE Residential_Loan_Application__c = :loanApplicationId
      ];

      return new ActionResult(
        new Map<string, object>{
          'collateralInfoList' => collateralInfoList,
          'collateralTypes' => getPicklistValues(
            'Collateral_Info__c',
            'Collateral_Type__c'
          )
        }
      );
    } catch (Exception exec) {
      System.debug(exec);
      return new ActionResult(exec);
    }
  }

  @AuraEnabled
  public static ActionResult saveCollateralInformation(
    String collateralInfo,
    String loanApplicationId
  ) {
    try {
      Collateral_Info__c collateralInfoRec = (Collateral_Info__c) Json.deserialize(
        collateralInfo,
        Collateral_Info__c.class
      );

      if (collateralInfoRec.Id == null) {
        collateralInfoRec.Residential_Loan_Application__c = loanApplicationId;
      }
      upsert collateralInfoRec;

      List<Collateral_Info__c> collateralInfoList = [
        SELECT
          Id,
          Name,
          Collateral_Type__c,
          Collateral_Value__c,
          Collateral_Description__c,
          Residential_Loan_Application__c
        FROM Collateral_Info__c
        WHERE Residential_Loan_Application__c = :loanApplicationId
      ];

      return new ActionResult(
        new Map<string, object>{
          'collateralInfo' => collateralInfoRec,
          'collateralInfoList' => collateralInfoList
        }
      );
    } catch (Exception exec) {
      System.debug(exec);
      return new ActionResult(exec);
    }
  }

  //Function to get Business(Account) Information
  @AuraEnabled(cacheable=true)
  public static ActionResult getBusinessInfo(String accountId) {
    try {
      Account account = getAccountInfo(accountId);

      return new ActionResult(new Map<string, object>{ 'account' => account });
    } catch (Exception exec) {
      System.debug(exec);
      return new ActionResult(exec);
    }
  }

  //Function to get LoanApplicationLiability records of Loan Application
  public static List<LoanApplicationLiability> getLiabilities(
    String loanApplicationId
  ) {
    String whereClause =
      ' WHERE LoanApplicationId = \'' +
      loanApplicationId +
      '\'';
    return LoanApplicationUtil.queryAll(
      'LoanApplicationLiability',
      whereClause
    );
  }

  //Function to get LoanApplicationAsset records of Loan Application
  public static List<LoanApplicationAsset> getAssets(String loanApplicationId) {
    String whereClause =
      ' WHERE LoanApplicationId = \'' +
      loanApplicationId +
      '\'';
    return LoanApplicationUtil.queryAll('LoanApplicationAsset', whereClause);
  }

  //function to get Account Info of perticular account
  public static Account getAccountInfo(String accountId) {
    Account account = [
      SELECT
        Id,
        Name,
        Business_TIN__c,
        DBA_or_Tradename__c,
        Number_of_Employees__c,
        Business_Classification__c,
        Business_Classification_Other__c,
        BillingStreet,
        BillingCity,
        BillingState,
        BillingPostalCode,
        BillingCountry
      FROM Account
      WHERE Id = :accountId
    ];

    return account;
  }

  //Function to get picklist values of field
  public static List<String> getPicklistValues(
    String ObjectApi_name,
    String Field_name
  ) {
    List<String> lstPickvals = new List<String>();
    Schema.SObjectType targetType = Schema.getGlobalDescribe()
      .get(ObjectApi_name);
    Sobject Object_name = targetType.newSObject();
    Schema.sObjectType sobject_type = Object_name.getSObjectType();
    Schema.DescribeSObjectResult sobject_describe = sobject_type.getDescribe();
    Map<String, Schema.SObjectField> field_map = sobject_describe.fields.getMap();
    List<Schema.PicklistEntry> pick_list_values = field_map.get(Field_name)
      .getDescribe()
      .getPickListValues();
    for (Schema.PicklistEntry a : pick_list_values) {
      lstPickvals.add(a.getValue());
    }
    return lstPickvals;
  }

  //Funtion to create Account Contact Relationship When New Person Account is Created for Loan Applicant
  public static void createAccountRelationship(
    Id AccountId,
    Id RelatedAccountId
  ) {
    Account relatedAccountRec = [
      SELECT Id, (SELECT Id FROM Contacts)
      FROM Account
      WHERE Id = :RelatedAccountId
    ];

    AccountContactRelation accRelation = new AccountContactRelation();
    accRelation.AccountId = AccountId;
    accRelation.ContactId = relatedAccountRec.Contacts[0].Id;
    accRelation.Roles = 'Client';
    accRelation.IsActive = true;
    insert accRelation;
  }
}