public class LeadTriggerHandler {

    public static Boolean isFirstTime = true;
    private static Id REC_TYPE_ID = getPersonAccountRecTypeId();

    public static void onAfterUpdate(List<Lead> leadList, Map<Id, Lead> oldLeadMap) {
        System.debug('LeadTriggerHandler.onAfterUpdate()');
        Map<Id, Lead> accountLeadMap = getConvertedLeads(leadList, oldLeadMap);
        // Only execute the remaining functionality if we are converting any leads
        if (!accountLeadMap.isEmpty()) {
            //
            // Process Leads with Prescreens
            //
            Map<Id, Lead> leadsWithPrescreens = new Map<Id, Lead>();
            for (Lead lead : leadList) {
                leadsWithPrescreens.put(lead.ConvertedAccountId, lead);
            }
            System.debug('leadsWithPrescreens: ' + leadsWithPrescreens);
            if (!leadsWithPrescreens.isEmpty()) {
                createLoanAppRecordsForOpp(leadsWithPrescreens, createPersonAccountForPrescreens(leadsWithPrescreens.values()));
            }
        }
    }

    private static Map<Id, Prescreen__c> createPersonAccountForPrescreens(List<Lead> convertedLeads) {
        System.debug('LeadTriggerHandler.createPersonAccountForPrescreens()');
        Set<Id> convertedLeadIds = new Set<Id>();
        for (Lead lead : convertedLeads) {
            convertedLeadIds.add(lead.Id);
        }
        Map<Prescreen__c, Account> coBorrowerMap = new Map<Prescreen__c, Account>();
        List<Prescreen__c> preScreensToUpdate = new List<Prescreen__c>();
        Map<Id, Prescreen__c> accountPrescreenMap = new Map<Id, Prescreen__c>();
        List<Prescreen__c> preScreensToProcess = [
                SELECT Id,
                        Name,
                        Co_Borrower_First_Name__c,
                        Co_Borrower_Last_Name__c,
                        Lead__r.ConvertedAccountId,
                        Primary_Borrower_or_Co_Borrower__c,
                        Property_Usage__c,
                        Loan_Purpose__c,
                        Estimated_Value__c,
                        Desired_Loan_Amount__c,
                        Current_Employment_Term__c,
                        Number_of_Years_in_Profession__c,
                        Estimated_Monthly_Income_Gross__c,
                        Total_Estimated_Monthly_Liabilities__c,
                        Alimony_Amount__c,
                        Monthly_Child_Support__c,
                        Borrower_SSN__c,
                        Borrower_DOB__c
                FROM Prescreen__c
                WHERE Lead__c IN :convertedLeadIds];

        for (Prescreen__c preScreen : preScreensToProcess) {
            if (String.isNotBlank(preScreen.Co_Borrower_Last_Name__c)) {
                coBorrowerMap.put(preScreen, new Account(
                        RecordTypeId = REC_TYPE_ID,
                        FirstName = preScreen.Co_Borrower_First_Name__c,
                        LastName = preScreen.Co_Borrower_Last_Name__c
                ));
            }
        }
        insert coBorrowerMap.values();

        for (Prescreen__c preScreen : preScreensToProcess) {
            Prescreen__c ps = new Prescreen__c(
                    Id = preScreen.Id,
                    Borrower__c =                                       preScreen.Lead__r.ConvertedAccountId,
                    Co_Borrower__c =                                    coBorrowerMap.get(preScreen) == null ? null : coBorrowerMap.get(preScreen).Id,
                    Co_Borrower_First_Name__c =                         preScreen.Co_Borrower_First_Name__c,
                    Co_Borrower_Last_Name__c =                          preScreen.Co_Borrower_Last_Name__c,
                    Property_Usage__c =                                 preScreen.Property_Usage__c,
                    Loan_Purpose__c =                                   preScreen.Loan_Purpose__c,
                    Estimated_Value__c =                                preScreen.Estimated_Value__c,
                    Desired_Loan_Amount__c =                            preScreen.Desired_Loan_Amount__c,
                    Current_Employment_Term__c =                        preScreen.Current_Employment_Term__c,
                    Number_of_Years_in_Profession__c =                  preScreen.Number_of_Years_in_Profession__c,
                    Estimated_Monthly_Income_Gross__c =                 preScreen.Estimated_Monthly_Income_Gross__c,
                    Total_Estimated_Monthly_Liabilities__c =            preScreen.Total_Estimated_Monthly_Liabilities__c,
                    Alimony_Amount__c =                                 preScreen.Alimony_Amount__c,
                    Monthly_Child_Support__c =                          preScreen.Monthly_Child_Support__c,
                    Borrower_SSN__c =                                   preScreen.Borrower_SSN__c,
                    Borrower_DOB__c =                                   preScreen.Borrower_DOB__c
            );
            preScreensToUpdate.add(ps);
            accountPrescreenMap.put(preScreen.Lead__r.ConvertedAccountId, ps);
        }
        update preScreensToUpdate;

        System.debug('accountPrescreenMap: ' + accountPrescreenMap);
        return accountPrescreenMap;
    }

    private static void createLoanAppRecordsForOpp(Map<Id, Lead> accountLeadMap, Map<Id, Prescreen__c> accountPrescreenMap) {
/*
        System.debug('LeadTriggerHandler.createLoanAppRecordsForOpp()');
        if (accountLeadMap != null) {
            List<Loan_Application__c> loanApplicationsToInsert = new List<Loan_Application__c>();
            for (Opportunity oppRecord : [
                    SELECT Id,
                            AccountId,
                            Account.FirstName,
                            Account.LastName,
                            Account.Phone,
                            Account.PersonMobilePhone,
                            Account.PersonEmail
                    FROM Opportunity
                    WHERE AccountId IN :accountLeadMap.keySet()
            ]) {
                Loan_Application__c loanApp = new Loan_Application__c(
                        Opportunity__c =                                oppRecord.Id,
                        Borrower__c =                                   oppRecord.AccountId,
                        Borrower_First_Name__c =                        oppRecord.Account.FirstName,
                        Borrower_Last_Name__c =                         oppRecord.Account.LastName,
                        Borrower_Home_Phone__c =                        oppRecord.Account.Phone,
                        Borrower_Mobile_Phone__c =                      oppRecord.Account.PersonMobilePhone,
                        Borrower_Email__c =                             oppRecord.Account.PersonEmail
                );
                // Copy Lead values to Application
                Lead lead = accountLeadMap.get(oppRecord.AccountId);
                if (lead != null) {
                    loanApp.Purpose_of_Loan__c =                        lead.Loan_Purpose__c;
                    loanApp.Sales_Price__c =                            lead.Estimated_Value__c;
                    loanApp.Loan_Amount__c =                            lead.Estimated_Loan_Amount_calc__c;
                    loanApp.Property_Street__c =                        lead.Street;
                    loanApp.Property_City__c =                          lead.City;
                    loanApp.Property_State__c =                         lead.State;
                    loanApp.Property_Zip__c =                           lead.PostalCode;
                }
                // Copy Prescreen values to Application
                Prescreen__c ps = accountPrescreenMap.get(oppRecord.AccountId);
                if (ps != null) {
                    loanApp.Co_Borrower__c =                            ps.Co_Borrower__c;
                    loanApp.Co_Borrower_First_Name__c =                 ps.Co_Borrower_First_Name__c;
                    loanApp.Co_Borrower_Last_Name__c =                  ps.Co_Borrower_Last_Name__c;
                    loanApp.Property_Usage__c =                         ps.Property_Usage__c;
                    loanApp.Borrower_Years_on_Job__c =                  ps.Current_Employment_Term__c;
                    loanApp.Borrower_Years_in_Industry__c =             ps.Number_of_Years_in_Profession__c;
                    Decimal monthlySalary = null;
                    if (ps.Estimated_Monthly_Income_Gross__c != null && ps.Estimated_Monthly_Income_Gross__c != 0) {
                        monthlySalary = ps.Estimated_Monthly_Income_Gross__c / 12;
                    }
                    loanApp.Borrower_Base_Monthly_Salary__c =           monthlySalary == null ? null : monthlySalary.setScale(2);
                    loanApp.Total_Liability_Value__c =                  ps.Total_Estimated_Monthly_Liabilities__c;
                    loanApp.Borrower_Co_Borrower_Alimony__c =           ps.Alimony_Amount__c;
                    loanApp.Borrower_Co_Borrower_Child_Support__c =     ps.Monthly_Child_Support__c;
                    loanApp.Borrower_Social_Security_Number__c =        ps.Borrower_SSN__c;
                    loanApp.Borrower_DOB__c =                           ps.Borrower_DOB__c;
                }
                loanApplicationsToInsert.add(loanApp);
            }
            System.debug('loanApplicationsToInsert: ' + loanApplicationsToInsert);
            insert loanApplicationsToInsert;
        }
*/
    }

    private static Map<Id, Lead> getConvertedLeads(List<Lead> leadList, Map<Id, Lead> oldLeadMap) {
        System.debug('LeadTriggerHandler.getConvertedLeads()');
        Map<Id, Lead> accountLeadMap = new Map<Id, Lead>();
        if (leadList != null && oldLeadMap != null) {
            for (Lead lead : leadList) {
                if (String.isBlank(lead.Company)
                        && lead.IsConverted
                        && !oldLeadMap.get(lead.Id).IsConverted
                        && lead.RecordTypeId == SObjectType.Lead.getRecordTypeInfosByDeveloperName().get('Mortgage').getRecordTypeId()
                        ) {
                    accountLeadMap.put(lead.ConvertedAccountId, lead);
                }
            }
        }
        System.debug('accountLeadMap: ' + accountLeadMap);
        return accountLeadMap;
    }

    private static Id getPersonAccountRecTypeId() {
        Id recTypeId;
        try {
            recTypeId = Schema.SObjectType.Account.getRecordTypeInfosByDeveloperName().get('PersonAccount').getRecordTypeId();
        } catch (Exception e) {
            recTypeId = Schema.SObjectType.Account.getRecordTypeInfosByDeveloperName().get('Person_Account').getRecordTypeId();
        }
        return recTypeId;
    }

    private static Map<Id, Opportunity> getOppsForLeads(Set<Id> accountIds) {
        Map<Id, Opportunity> convertedOppMap = new Map<Id, Opportunity>();
        for (Opportunity opp : [
                SELECT Id,
                        AccountId,
                        Account.FirstName,
                        Account.LastName,
                        Account.Phone,
                        Account.PersonMobilePhone,
                        Account.PersonEmail
                FROM Opportunity
                WHERE AccountId IN :accountIds
        ]) {
            convertedOppMap.put(opp.AccountId, opp);
        }
        return convertedOppMap;
    }
}