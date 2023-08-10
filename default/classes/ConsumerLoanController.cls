/**
 * @description       :
 * @author            : 'Amol K'
 * @group             :
 * @last modified on  : 02-20-2023
 * @last modified by  : 'Amol K'
 **/
public without sharing class ConsumerLoanController {
  @AuraEnabled
  public static ActionResult getInitialData(String loanApplicationId) {
    ResidentialLoanApplication loanApplication = new ResidentialLoanApplication();
    List<LoanApplicant> loanApplicant = new List<LoanApplicant>();
    Contact currentUserContact = new Contact();
    try {
      List<Loan_Program__c> loanProgramList = LoanApplicationUtil.getLoanProgramList(
        'Consumer Loan'
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
            TotalMonthlyExpense__c,
            Debt_To_Income_Ratio__c,
            Vehicle_Type__c,
            AccountId,
            Loan_Program__c,
            Status,
            LoanPurpose,
            Vehicle_Loan_Purpose__c,
            City__c,
            Country__c,
            State__c,
            Street__c,
            PostalCode__c,
            Add_Trade_In__c,
            Vehicle_Make__c,
            Vehicle_Model__c,
            Vehicle_Year__c,
            Is_new_or_used_vehicle__c,
            Estimated_Purchase_Price__c,
            Down_Payment_Amount__c,
            Desired_Loan_Amount__c,
            Dealer_Phone__c,
            Dealer_Name__c,
            Dealer_Email__c,
            Consumer_Types__c,
            AmortizationTerm,
            Trade_In_Vehicle_Type__c,
            Trade_In_Vehicle_Make__c,
            Trade_In_Vehicle_Model__c,
            Trade_In_Vehicle_Year__c,
            Trade_In_Current_Value_of_Vehicle__c,
            How_Much_Owe__c,
            Monthly_Pay_For_Vehicle__c,
            Expected_Trade_In_Allowance__c,
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
          System.debug('loanApplicationList: ' + loanApplicationList[0]);
          loanApplication = loanApplicationList[0];
          documentIds = LoanApplicationUtil.getRequiredDocumentFileIdsForLoanApplication(
            loanApplication.Id
          );
        }
      }

      System.debug('loanApplication :' + loanApplication);

      return new ActionResult(
        new Map<string, object>{
          'loanProgram' => loanProgramList,
          'currentUserContact' => currentUserContact,
          'loanApplication' => loanApplication,
          'statusOption' => getPicklistValues(
            'ResidentialLoanApplication',
            'Status'
          ),
          'requiredDocumentIds' => documentIds,
          'vehicleTypeMakeMap' => getDependetPicklistValues(
            'Consumer_Types__c',
            'Vehicle_Make__c'
          ),
          'loanPurpose' => getPicklistValues(
            'ResidentialLoanApplication',
            'LoanPurpose'
          ),
          'vehicleType' => getPicklistValues(
            'ResidentialLoanApplication',
            'Vehicle_Type__c'
          )
        }
      );
    } catch (Exception exec) {
      System.debug('Controller getInitialData Exception' + exec);
      return new ActionResult(exec);
    }
  }

  @AuraEnabled
  public static ActionResult getRequiredDocumentFileIds(String recordId) {
    try {
      String requiredDocumentIds = LoanApplicationUtil.getRequiredDocumentFileIdsForLoanApplication(
        recordId
      );

      return new ActionResult(
        new Map<string, object>{ 'requiredDocumentIds' => requiredDocumentIds }
      );
    } catch (Exception exec) {
      System.debug(exec);
      return new ActionResult(exec);
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
        Id personalAccountId = LoanApplicationUtil.getPersonalAccountId(
          loanApplicantRecord
        );
        if (personalAccountId != null) {
          loanApplicantRecord.Account__c = personalAccountId;
        }
      }

      System.debug('loanApplicantRecord before upsert:' + loanApplicantRecord);
      upsert loanApplicantRecord;
      loanApplicationId = loanApplicantRecord.LoanApplicationId;
      System.debug('loanApplicantRecord :: ' + loanApplicantRecord);

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
    ActionResult result = LoanApplicationUtil.saveLoanApplicantIncome(
      loanApplicantIncomes
    );
    return result;
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
      upsert loanApplicationForm;
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
      SELECT Id, AccountId, ContactId
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
          .get('Consumer Loan')
          .getRecordTypeId();
        loanApplicationForm.RecordTypeId = RecTypeId;
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
      System.debug('loanApplicantRecord :' + loanApplicantRecord);

      if (loanApplicationForm.OpportunityId == null) {
        Id opportunityId = LoanApplicationUtil.createLoanApplicationOpportunity(
          loanApplicationForm
        );
        loanApplicationForm.OpportunityId = opportunityId;
        update loanApplicationForm;
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
    LoanApplicant loanApplicantRec = [
      SELECT
        Id,
        Name,
        SSN__c,
        Phone__c,
        MaritalStatus,
        DependentCount,
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
        Approval_Accept__c,
        Approval_Name__c,
        BirthDate__c,
        (
          SELECT
            Id,
            Name,
            LoanApplicationId,
            HasOutstandingJudgement,
            HasDeclaredBankruptcy,
            IsRelatedToSeller,
            HasUndisclAddlPropApp,
            HasUndisclAddlCreditApp,
            IsSubjectToPriorityLien,
            IsCoSignerUndisclDebt,
            HasDeedSurrender,
            HasPastShortSale,
            IsPrimaryResidence,
            HasOwnershipInterest,
            PriorPropertyTitleType,
            PriorPropertyUsageType,
            HasBorrowedMoney,
            Applicant_Consent__c,
            IsPresentlyDelinquent,
            IsPartyToLawsuit,
            HasPropertyForeclosed,
            Loan_Program__c,
            Is_Permanent_Resident_Alien__c,
            Is_US_Citizen__c,
            Is_Obligated_To_Pay__c
          FROM LoanApplicantDeclarations
        )
      FROM LoanApplicant
      WHERE Id = :loanApplicantRecId
      ORDER BY BorrowerType ASC, Name ASC
      LIMIT 1
    ];

    System.debug('loanApplicantRec: ' + loanApplicantRec);

    String whereClause =
      ' WHERE LoanApplicantId = \'' +
      loanApplicantRecId +
      '\'' +
      ' AND ResidencyType = \'Present Address\'';
    List<LoanApplicantAddress> presentAddress = LoanApplicationUtil.queryAll(
      'LoanApplicantAddress',
      whereClause
    );
    System.debug('presentAddress: ' + presentAddress);

    if (presentAddress != null && !presentAddress.isEmpty()) {
      System.debug('presentAddress: ' + presentAddress[0]);
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
    System.debug('mailingAddress: ' + mailingAddress);

    if (mailingAddress != null && !mailingAddress.isEmpty()) {
      System.debug('mailingAddress: ' + mailingAddress[0]);
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
      System.debug('applicantEmployment: ' + applicantEmployment[0]);
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
        'loanApplicant' => loanApplicantRec,
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
  public static ActionResult saveApplicantCertification(
    String applicationCertification
  ) {
    ActionResult result = LoanApplicationUtil.saveApplicantCertification(
      applicationCertification
    );
    return result;
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

  @AuraEnabled
  public static ActionResult getDependetPicklistValues(
    string contrfieldApiName,
    string depfieldApiName
  ) {
    try {
      Map<String, List<String>> vehicleTypeMakeMap = GetDependentPicklist.getDependentMap(
        new ResidentialLoanApplication(),
        contrfieldApiName,
        depfieldApiName
      );

      return new ActionResult(
        new Map<string, object>{ 'vehicleTypeMakeMap' => vehicleTypeMakeMap }
      );
    } catch (Exception exec) {
      System.debug(exec);
      return new ActionResult(exec);
    }
  }

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
}