/**********************************************************
@class      EncompassLoanUpdates
@brief      Encompass Specific loan integration updates
@testClass  EncompassLoanUpdatesTest
@author     Rob Sullivan
@version    3/24/21   Rob Sullivan
@bug        No known defects.
@todo       None.
@copyright  (c)2021 EMS.  All Rights Reserved. Unauthorized use is prohibited.
***********************************************************/

public with sharing class EncompassLoanUpdates {

    public Boolean FORMAT_PHONE = true;

    public void updateLoanObjects(String loanId, String loanNumber, String externalIdValue, String jsonBodyList, Map<String, Object> responseMap) {
        List<Account> borrowerAccountsList = new List<Account>();
        Incoming_Integrated_Object__mdt objectConfig;
        InboundIntegrationService service = new InboundIntegrationService();

        //
        // GET THE EXTERNAL IDS FROM THE RESPONSE
        //
        String loanGUID = (String) responseMap.get('encompassId');
        System.debug('loanGUID: ' + loanGUID);
        Map<String, Object> application = null;
        List<Object> applications = (List<Object>) responseMap.get('applications');
        application = (Map<String, Object>) applications.get(0);
        System.debug('application: ' + application);
        String applicationId = (String) application.get('applicationId');
        System.debug('applicationId: ' + applicationId);
        Map<String, Object> borrower = (Map<String, Object>) application.get('borrower');
        System.debug('borrower: ' + borrower);
        String primaryBorrowerId = (String) borrower.get('altId');
        if (primaryBorrowerId.contains('borrower')) {
            primaryBorrowerId = externalIdValue + primaryBorrowerId;
        }
        System.debug('primaryBorrowerId: ' + primaryBorrowerId);
        Map<String, Object> coBorrower = (Map<String, Object>) application.get('coborrower');
        System.debug('coBorrower: ' + coBorrower);
        String coBorrowerId = (String) coBorrower.get('altId');
        if (coBorrowerId.contains('borrower')) {
            coBorrowerId = externalIdValue + coBorrowerId;
        }
        System.debug('coBorrowerId: ' + coBorrowerId);

        //
        // GET THE EXISTING LOAN APPLICANTS
        //
        List<LoanApplicant> existingLoanApplicants = [
                SELECT Id,
                        Name,
                        ApplicantExtIdentifier,
                        LoanApplicationId,
                        BorrowerType,
                        ContactId,
                        SSN__c,
                        Contact.AccountId,
                        Contact.FirstName,
                        Contact.LastName,
                        Contact.SSN__c,
                        Contact.HomePhone,
                        Contact.MobilePhone,
                        Contact.Email
                FROM LoanApplicant
                WHERE LoanApplicationId = :loanId
        ];
        System.debug('existingLoanApplicants: ' + existingLoanApplicants);

        //
        // PROCESS BORROWERS
        //
        Id loanOfficerUserId = null;
        JSONParser j;
        EncompassJSONContactParser e;
        j = JSON.createParser(jsonBodyList);
        e = (EncompassJSONContactParser) j.readValueAs(EncompassJSONContactParser.class);

        List<EncompassJSONContactParser.Applications> apps = new List<EncompassJSONContactParser.Applications>(e.Applications);
        for (EncompassJSONContactParser.Applications app : apps) {
            if (app.Borrower != null && app.Borrower.lastName != null) {
                Account a = new Account();
                // The Unique External Id for Borrowers will be Loan GUID concatenated with "altId".
                a.RecordTypeId = SObjectType.Account.getRecordTypeInfosByDeveloperName().get('PersonAccount').getRecordTypeId();
                if (app.Borrower.firstName != null) a.FirstName = app.Borrower.firstName;
                if (app.Borrower.lastName != null) a.LastName = app.Borrower.lastName;
                if (app.Borrower.taxIdentificationIdentifier != null) a.SSN__pc = app.Borrower.taxIdentificationIdentifier;
                if (app.Borrower.birthDate != null) a.PersonBirthdate = Date.valueOf(app.Borrower.birthDate);
                if (app.Borrower.applicantType != null) {
                    a.Type__pc = app.Borrower.applicantType;
                    //a.Type__pc = app.Borrower.altId.contains('borrower') ? 'Primary Borrower' : 'Additional Borrower';
                }
                if (app.Borrower.homePhoneNumber != null) {
                    a.PersonHomePhone = app.Borrower.homePhoneNumber;
                    if (FORMAT_PHONE) {
                        a.PersonHomePhone = a.PersonHomePhone.replaceAll('\\D', '');
                    }
                }
                if (app.Borrower.mobilePhone != null) {
                    a.PersonMobilePhone = app.Borrower.mobilePhone;
                    if (FORMAT_PHONE) {
                        a.PersonMobilePhone = a.PersonMobilePhone.replaceAll('\\D', '');
                    }
                }
                if (app.Borrower.emailAddressText != null) a.PersonEmail = app.Borrower.emailAddressText;
                if (loanOfficerUserId != null) {
                    a.OwnerId = loanOfficerUserId;
                }
                System.debug('Adding Borrower account: ' + a);
                borrowerAccountsList.add(a);
            }

            if (app.CoBorrower != null && app.CoBorrower.lastName != null) {
                Account a = new Account();
                // The Unique External Id for Borrowers will be Loan GUID concatenated with "altId".
                a.RecordTypeId = SObjectType.Account.getRecordTypeInfosByDeveloperName().get('PersonAccount').getRecordTypeId();
                if (app.CoBorrower.firstName != null) a.FirstName = app.CoBorrower.firstName;
                if (app.CoBorrower.lastName != null) a.LastName = app.CoBorrower.lastName;
                if (app.CoBorrower.taxIdentificationIdentifier != null) a.SSN__pc = app.CoBorrower.taxIdentificationIdentifier;
                if (app.CoBorrower.birthDate != null) a.PersonBirthdate = Date.valueOf(app.CoBorrower.birthDate);
                if (app.CoBorrower.applicantType != null) {
                    a.Type__pc = app.CoBorrower.applicantType;
                    //a.Type__pc = app.CoBorrower.altId.contains('borrower') ? 'Primary Co-Borrower' : 'Additional Co-Borrower';
                }
                if (app.CoBorrower.homePhoneNumber != null) {
                    a.PersonHomePhone = app.CoBorrower.homePhoneNumber;
                    if (FORMAT_PHONE) {
                        a.PersonHomePhone = a.PersonHomePhone.replaceAll('\\D', '');
                    }
                }
                if (app.CoBorrower.mobilePhone != null) {
                    a.PersonMobilePhone = app.CoBorrower.mobilePhone;
                    if (FORMAT_PHONE) {
                        a.PersonMobilePhone = a.PersonMobilePhone.replaceAll('\\D', '');
                    }
                }
                if (app.CoBorrower.emailAddressText != null) a.PersonEmail = app.CoBorrower.emailAddressText;
                if (loanOfficerUserId != null) {
                    a.OwnerId = loanOfficerUserId;
                }
                System.debug('Adding CoBorrower account: ' + a);
                borrowerAccountsList.add(a);
            }
        }

        borrowerAccountsList = EncompassMatchingRules.LoanBorrowerMatcher(borrowerAccountsList, existingLoanApplicants);
        System.debug('borrowerAccountsList: ' + borrowerAccountsList);

        //
        // RS: 05-APR-2021: FIBT has decided to NOT sync borrower name, Tax Id and DOB.
        //
        // If the Person Account record has an Id, that means the "LoanBorrowerMatcher" found a existing Person Account.
        // Don't update the name, SSN, etc of those records.
        //
        // If there is no Id, this is a new Borrower Person Account being inserted (probably a new co-borrower).
        // We still need to populate the name and other values.
        //
        List<Account> borrowerAccountsToUpsert = new List<Account>();
        for (Account a : borrowerAccountsList) {
            Account b = new Account();
            if (a.Id == null) {
                b = a;
            } else {
                b.Id = a.Id;
                b.RecordTypeId = a.RecordTypeId;
                b.Type__pc = a.Type__pc;
                b.PersonHomePhone = a.PersonHomePhone;
                b.PersonMobilePhone = a.PersonMobilePhone;
                b.PersonEmail = a.PersonEmail;
                if (a.OwnerId != null) {
                    b.OwnerId = a.OwnerId;
                }
            }
            borrowerAccountsToUpsert.add(b);
        }

        //
        // CREATE BORROWER ACCOUNTS
        //
        System.debug(borrowerAccountsToUpsert);
        System.debug('Borrower Accounts size is ' + borrowerAccountsToUpsert.size());
        List<Database.UpsertResult> borrowerAccountUpsertResults;
        if (borrowerAccountsToUpsert != null && borrowerAccountsToUpsert.size() > 0) {
            borrowerAccountUpsertResults = Database.upsert(borrowerAccountsToUpsert, false);
            System.debug('borrowerAccountUpsertResults: ' + borrowerAccountUpsertResults);
        }
        Set<Id> borrowerAccountIds = new Set<Id>();
        if (borrowerAccountUpsertResults != null && borrowerAccountUpsertResults.size() > 0) {
            for (Database.UpsertResult result : borrowerAccountUpsertResults) {
                if (result.isSuccess()) {
                    borrowerAccountIds.add(result.Id);
                }
            }
        }
        // Get the PersonContactIds for the borrowers upserted above
        Map<Id, Id> borrowerContactIds = new Map<Id, Id>();
        for (Account a : [SELECT Id, PersonContactId FROM Account WHERE Id = :borrowerAccountIds]) {
            borrowerContactIds.put(a.Id, a.PersonContactId);
        }
        System.debug('borrowerContactIds: ' + borrowerContactIds);

        // Get the Borrower-related configuration records
        Incoming_Integrated_Object__mdt addressObjectConfig = service.getIncomingIntegrationObjectConfigurationByObject('LoanApplicantAddress');
        System.debug('addressObjectConfig: ' + addressObjectConfig);
        Incoming_Integrated_Object__mdt employmentObjectConfig = service.getIncomingIntegrationObjectConfigurationByObject('LoanApplicantEmployment');
        System.debug('employmentObjectConfig: ' + employmentObjectConfig);
        Incoming_Integrated_Object__mdt relatedObjectConfig = service.getIncomingIntegrationObjectConfigurationByObject('LoanApplicantIncome');
        System.debug('relatedObjectConfig: ' + relatedObjectConfig);
        // Get the Income Types
        Set<String> incomeTypes = new Set<String>();
        for (Incoming_Integrated_Object_Field__mdt field : relatedObjectConfig.Incoming_Integrated_Object_Fields__r) {
            incomeTypes.add(field.Level_2_Match_Field_Value__c);
        }
        System.debug('incomeTypes: ' + incomeTypes);

        //
        // PROCESS THE PRIMARY BORROWER
        //
        objectConfig = service.getIncomingIntegrationObjectConfigurationByObject('LoanApplicantBorrower');
        System.debug('objectConfig: ' + objectConfig);
        SObject applicant = new LoanApplicant();
        applicant.put('ApplicantExtIdentifier', primaryBorrowerId);
        applicant.put('LoanApplicationId', loanId);
        applicant = service.updateRecord(applicant, responseMap, objectConfig);
        // Loop through all Borrower Accounts and add or update them on the Loan
        for (Account a : borrowerAccountsToUpsert) {
            if (a.Type__pc == 'Borrower') {
                applicant.put('ContactId', borrowerContactIds.get(a.Id));
            }
        }
        System.debug('applicant: ' + applicant);
        if (Test.isRunningTest()) {
            applicant.put('Name', 'Test Borrower');
        }
        if (applicant.isSet('Name')) {
            upsert (LoanApplicant) applicant ApplicantExtIdentifier;
            //
            // PROCESS THE BORROWER ADDRESS RECORDS
            //
            Integer index = 0;
            while (index < 6) {
                SObject address = new LoanApplicantAddress();
                address.put('AddressExtIdentifier', externalIdValue + '_Residence/' + index);
                address.put('LoanApplicationId', loanId);
                address.put('LoanApplicantId', applicant.Id);
                address = service.updateRecord(address, responseMap, addressObjectConfig, 'Residence/' + index);
                System.debug('>>>> address: ' + address);
                if (address.get('Applicant_Type__c') == 'Borrower' && address.get('ResidenceStreet') != null) {
                    address.put('Name', address.get('ResidenceStreet'));
                    if (address.get('Encompass_Mailing_Indicator__c') == true) {
                        address.put('ResidencyType', 'Mailing Address');
                    } else if (address.get('Encompass_Residency_Type__c') == 'Current') {
                        address.put('ResidencyType', 'Present Address');
                    } else if (address.get('Encompass_Residency_Type__c') == 'Prior') {
                        address.put('ResidencyType', 'Former Residence');
                    }
                    upsert (LoanApplicantAddress) address AddressExtIdentifier;
                }
                index++;
            }
            //
            // PROCESS THE BORROWER EMPLOYMENT RECORDS
            //
            index = 0;
            while (index < 2) {
                SObject employment = new LoanApplicantEmployment();
                employment.put('EmploymentExtIdentifier', externalIdValue + '_Employment/' + index);
                employment.put('LoanApplicationId', loanId);
                employment.put('LoanApplicantId', applicant.Id);
                employment = service.updateRecord(employment, responseMap, employmentObjectConfig, 'Employment/' + index);
                System.debug('>>>> employment: ' + employment);
                if (employment.get('EmployerName') != null || (Decimal) employment.get('MonthlyIncome') > 0) {
                    upsert (LoanApplicantEmployment) employment EmploymentExtIdentifier;
                }
                index++;
            }
            //
            // PROCESS THE BORROWER INCOME RECORDS
            //
            SObject income;
            for (String incomeType : incomeTypes) {
                if (!incomeType.startsWith('Co')) {
                    income = new LoanApplicantIncome();
                    income.put('IncomeExtIdentifier', primaryBorrowerId + '_' + incomeType);
                    income.put('LoanApplicationId', loanId);
                    income.put('LoanApplicantId', applicant.Id);
                    income = service.updateRecord(income, responseMap, relatedObjectConfig, incomeType);
                    System.debug('>>>> income: ' + income);
                    if ((Decimal) income.get('MonthlyIncomeAmount') > 0) {
                        upsert (LoanApplicantIncome) income IncomeExtIdentifier;
                    }
                }
            }
        }

        //
        // PROCESS THE CO-BORROWER
        //
        objectConfig = service.getIncomingIntegrationObjectConfigurationByObject('LoanApplicantCoBorrower');
        System.debug('objectConfig: ' + objectConfig);
        applicant = new LoanApplicant();
        applicant.put('ApplicantExtIdentifier', coBorrowerId);
        applicant.put('LoanApplicationId', loanId);
        applicant = service.updateRecord(applicant, responseMap, objectConfig);
        // Loop through all Co-Borrower Accounts and add or update them on the Loan
        for (Account a : borrowerAccountsToUpsert) {
            if (a.Type__pc == 'CoBorrower') {
                applicant.put('ContactId', borrowerContactIds.get(a.Id));
            }
        }
        System.debug('applicant: ' + applicant);
        if (Test.isRunningTest()) {
            applicant.put('Name', 'Test CoBorrower');
        }
        if (applicant.isSet('Name')) {
            upsert (LoanApplicant) applicant ApplicantExtIdentifier;
            //
            // PROCESS THE CO-BORROWER ADDRESS RECORDS
            //
            Integer index = 0;
            while (index < 6) {
                SObject address = new LoanApplicantAddress();
                address.put('AddressExtIdentifier', externalIdValue + '_Residence/' + index);
                address.put('LoanApplicationId', loanId);
                address.put('LoanApplicantId', applicant.Id);
                address = service.updateRecord(address, responseMap, addressObjectConfig, 'Residence/' + index);
                System.debug('>>>> address: ' + address);
                if (address.get('Applicant_Type__c') == 'CoBorrower' && address.get('ResidenceStreet') != null) {
                    address.put('Name', address.get('ResidenceStreet'));
                    if (address.get('Encompass_Mailing_Indicator__c') == true) {
                        address.put('ResidencyType', 'Mailing Address');
                    } else if (address.get('Encompass_Residency_Type__c') == 'Current') {
                        address.put('ResidencyType', 'Present Address');
                    } else if (address.get('Encompass_Residency_Type__c') == 'Prior') {
                        address.put('ResidencyType', 'Former Residence');
                    }
                    upsert (LoanApplicantAddress) address AddressExtIdentifier;
                }
                index++;
            }
            //
            // PROCESS THE CO-BORROWER EMPLOYMENT RECORDS
            //
            index = 2;
            while (index < 4) {
                SObject employment = new LoanApplicantEmployment();
                employment.put('EmploymentExtIdentifier', externalIdValue + '_Employment/' + index);
                employment.put('LoanApplicationId', loanId);
                employment.put('LoanApplicantId', applicant.Id);
                employment = service.updateRecord(employment, responseMap, employmentObjectConfig, 'Employment/' + index);
                System.debug('>>>> employment: ' + employment);
                if (employment.get('EmployerName') != null || (Decimal) employment.get('MonthlyIncome') > 0) {
                    upsert (LoanApplicantEmployment) employment EmploymentExtIdentifier;
                }
                index++;
            }
            //
            // PROCESS THE CO-BORROWER INCOME RECORDS
            //
            SObject income;
            for (String incomeType : incomeTypes) {
                if (incomeType.startsWith('Co')) {
                    income = new LoanApplicantIncome();
                    income.put('IncomeExtIdentifier', coBorrowerId + '_' + incomeType);
                    income.put('LoanApplicationId', loanId);
                    income.put('LoanApplicantId', applicant.Id);
                    income = service.updateRecord(income, responseMap, relatedObjectConfig, incomeType);
                    System.debug('>>>> income: ' + income);
                    if ((Decimal) income.get('MonthlyIncomeAmount') > 0) {
                        upsert (LoanApplicantIncome) income IncomeExtIdentifier;
                    }
                }
            }
        }

        //
        // PROCESS THE PROPERTY INFORMATION
        //
        objectConfig = service.getIncomingIntegrationObjectConfigurationByObject('LoanApplicationProperty');
        System.debug('objectConfig: ' + objectConfig);
        SObject property = new LoanApplicationProperty();
        property.put('PropertyExtIdentifier', externalIdValue);
        property.put('LoanApplicationId', loanId);
        property = service.updateRecord(property, responseMap, objectConfig);
        String propertyStreet = (String) property.get('PropertyStreet');
        property.put('Name', String.isNotBlank(propertyStreet) ? propertyStreet : 'TBD');
        upsert (LoanApplicationProperty) property PropertyExtIdentifier;

        //
        // PROCESS THE FINANCIAL INFORMATION
        //
        objectConfig = service.getIncomingIntegrationObjectConfigurationByObject('LoanApplicationFinancial');
        System.debug('objectConfig: ' + objectConfig);
        SObject financial = new LoanApplicationFinancial();
        financial.put('FinancialExtIdentifier', externalIdValue);
        financial.put('LoanApplicationId', loanId);
        financial.put('Name', loanNumber);
        financial = service.updateRecord(financial, responseMap, objectConfig);
        upsert (LoanApplicationFinancial) financial FinancialExtIdentifier;
    }
}