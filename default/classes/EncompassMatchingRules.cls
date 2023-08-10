/**********************************************************
@class      EncompassMatchingRules
@brief
@testClass  EncompassMatchingRulesTest
@author     Joe Cadd
@version    5/23/2019   Joe Cadd
@bug        No known defects.
@todo       None.
@copyright  (c)2019 EMS.  All Rights Reserved. Unauthorized use is prohibited.

Update 6/10/2019 Joe Cadd: Added "strict search" functionality. When multiple person accounts passed into LoanBorrowerMatcher (borrowers parameter)
        with the same Email or Mobile. Strict search will be enabled, only allowing Email+First+Last or Mobile+First+Last matching
        options throughout the process. This will help prevent incoming api borrowers from matching to the same account ids (causing an upsert error "Duplicate Ids in List")

***********************************************************/

public with sharing class EncompassMatchingRules {

    /*
    Searches records related to a loan (@param #2: List<LoanApplicant>) and Org wide PersonAccounts to match borrowers coming in through API updates

    If a PersonAccount match is found then the ID will be populated on the Account.

    **NOTE** Even if an ID is populated that doesn't necessarily mean the person account is related to the opportunity via a LoanApplicant record.

    @param borrowers        List of instantiated accounts coming in through the API to find matches for
    @param loanApplicants    Existing joined LoanApplicant objects related to the opportunity, used to look for a match

    @return List<Account> borrowers  Same list of borrowers passed in the 1st param with the ID populated if match was found.
     */
    public static List<Account> LoanBorrowerMatcher(List<Account> borrowers, List<LoanApplicant> loanApplicants) {

        List<Account> orgAccsWithSsnMatch;
        Set<String> borrowerSsnSet = new Set<String>();

        List<Account> orgAccsWithEmailMatch;
        Set<String> borrowerEmailSet = new Set<String>();
        Set<String> duplicateEmailsInBorrowers = new Set<String>();

        List<Account> orgAccsWithMobileMatch;
        Set<String> borrowerMobileSet = new Set<String>();
        Set<String> duplicateMobileInBorrowers = new Set<String>();

        // Store sets of borrower info for queries later if needed required
        for (Account b : borrowers) {

            if (b.SSN__pc != null) {
                borrowerSsnSet.add(b.SSN__pc);
            }
            if (b.PersonEmail != null) {
                // detect if borrowers have duplicate emails with each other
                if (borrowerEmailSet.contains(b.PersonEmail)) {
                    duplicateEmailsInBorrowers.add(b.PersonEmail);
                }
                borrowerEmailSet.add(b.PersonEmail);
            }
            if (b.PersonMobilePhone != null) {
                String mobileClean = b.PersonMobilePhone.replaceAll('\\D', '');
                // detect if borrowers have duplicate mobiles with each other
                if (borrowerMobileSet.contains(mobileClean)) {
                    duplicateMobileInBorrowers.add(mobileClean);
                }
                borrowerMobileSet.add(mobileClean);
            }
        }

        for (Account b : borrowers) {

            // Run a more strict search if there are duplicate emails/mobiles passed in the borrowers account param
            Boolean strictEmailSearch = false;
            Boolean strictMobileSearch = false;
            if (duplicateEmailsInBorrowers.contains(b.PersonEmail)) {
                strictEmailSearch = true;
            }
            if (duplicateMobileInBorrowers.contains(b.PersonMobilePhone)) {
                strictMobileSearch = true;
            }

            // Attempt to match by SSN
            if (b.SSN__pc != null) {
                b = matchBySSN(b, loanApplicants, orgAccsWithSsnMatch, borrowerSsnSet);
            }

            // Attempt match by FIRST NAME + LAST NAME
            if (b.Id == null) {
                b = matchByFirstLast(b, loanApplicants);
            }

            // Attempt match by EMAIL
            if (b.Id == null && b.PersonEmail != null) {
                b = matchByEmail(b, loanApplicants, orgAccsWithEmailMatch, borrowerEmailSet, strictEmailSearch);
            }

            // Attempt match by MOBILE PHONE
            if (b.Id == null && b.PersonMobilePhone != null) {
                b = matchByMobile(b, loanApplicants, orgAccsWithMobileMatch, borrowerMobileSet, strictMobileSearch);
            }
        }

        return borrowers;
    }

    /*
    (1)  SS# Matching
        * Incoming borrower has a SS#; if not got to (2)
        * Search the LOAN BORROWERS queried above and try to find a match on SS#:
            * If match found, update Loan Applicant/Person Account
            * If no match:
                * Query all Person Accounts in Salesforce WHERE SS# = :<all SS#s from the incoming set of borrowers> (The “ORG-WIDE PERSON ACCOUNTS”)
                    * NOTE:  We will need to implement Large Data Volume strategies for this
                    * *One* ORG-WIDE PERSON ACCOUNT matches on SS#, Update the Person Account and associate it to Loan Applicants
                    * *Multiple* ORG-WIDE PERSON ACCOUNTS match on SS#:
                        * Try to match on SS#, First Name & Last Name
                            * If one match, Update
                            * If no match, Create Person Account and associate it to Loan Applicants
     */
    public static Account matchBySSN(Account b, List<LoanApplicant> loanApplicants, List<Account> orgAccsWithSsnMatch, Set<String> borrowerSsnSet) {
        // Search the LOAN APPLICANTS queried above and try to find a match on SS#:
        for (LoanApplicant la : loanApplicants) {
            if (b.SSN__pc.equals(la.Contact.SSN__c)) {
                system.debug(b.SSN__pc + ' - ' + la.Contact.SSN__c);
                b.Id = la.Contact.AccountId;
                break;
            }
        }

        // No SSN Match on loan borrowers joined object
        if (b.Id == null) {
            // Query all Person Accounts in Salesforce WHERE SS# = :<all SS#s from the incoming set of borrowers> (The “ORG-WIDE PERSON ACCOUNTS”)
            orgAccsWithSsnMatch = queryPersonAccountsBySsn(orgAccsWithSsnMatch, borrowerSsnSet);

            // Count number of accounts with this SSN
            // See if any matches for SSN + FirstName + LastName
            Integer ssnMatchCount = 0;
            Integer ssnFirstLastMatchCount = 0;
            Id lastAccMatchId;
            Id lastSsnFirstLastAccMatchId;
            for (Account a : orgAccsWithSsnMatch) {
                if (b.SSN__pc.equals(a.SSN__pc)) {
                    ssnMatchCount++;
                    lastAccMatchId = a.Id;
                    if (b.FirstName.equals(a.FirstName) && b.LastName.equals(a.LastName)) {
                        ssnFirstLastMatchCount++;
                    }
                }
            }

            if (ssnMatchCount == 1) {
                // *One Match* ORG-WIDE PERSON ACCOUNT matches on SS#, Update the Person Account and associate it to Loan Applicants
                b.Id = lastAccMatchId;
            } else if (ssnMatchCount > 1 && ssnFirstLastMatchCount == 1) {
                // *Multiple Matches* ORG-WIDE PERSON ACCOUNTS match on SS#
                // AND ONLY 1 SSN + First + Last Match (Single match found) -> Update matched account
                b.Id = lastSsnFirstLastAccMatchId;
            }
        }

        return b;
    }

    /*
        (2) Name Matching
            * Search the LOAN BORROWERS and try to find an exact match on Firstname & Lastname
                * If match found, update the Loan Applicant/Person Account
                * If no match, Go To Email Matching (3)
     */
    public static Account matchByFirstLast(Account b, List<LoanApplicant> loanApplicants) {
        if (b.FirstName != null && b.LastName != null) {

            for (LoanApplicant la : loanApplicants) {
                if (b.FirstName.equals(la.Contact.FirstName) && b.LastName.equals(la.Contact.LastName)) {
                    b.Id = la.Contact.AccountId;
                }
            }
        }

        return b;
    }

    /*
    (3) Email matching
        * (3A) Incoming borrower has an email address; if not go to (4) :
            * Does the email address match an existing LOAN BORROWER, and there is only one LOAN BORROWER with the email address?
                * Yes - Update LOAN BORROWER/Person Account
                * Yes, but there are two or more existing LOAN BORROWERS with the same Email Address - GoTo (3B)
                * No - There are no matches on email address in LOAN BORROWERS
                    * Search Person Account for Email Address
                    * If only one Person Account found for the Email Address, update Person Account, and associate it to LOAN BORROWERS
                        * If there are more than one Person Accounts with the same Email Address
                            * Search Person Account for exact Last Name, First Name and Email Address
                                * If Match Found, update Person Account, and associate it to LOAN BORROWERS
                                * If No Match Found, create Person Account and associate it to LOAN BORROWERS
            * *(3B) Multiple* LOAN BORROWERS match on email:
                * Try to match on Email, First Name & Last Name for LOAN BORROWERS
                    * If found, Update the LOAN BORROWERS/Person Account
                    * If not found, Search Person Account for exact Last Name, First name and Email Address
                        * If Match Found, Update Person Account, and associate it to LOAN BORROWERS
                        * If No Match Found, create Person Account and associate it to LOAN BORROWERS
     */
    public static Account matchByEmail(Account b, List<LoanApplicant> loanApplicants, List<Account> orgAccsWithEmailMatch, Set<String> borrowerEmailSet, Boolean strictSearch) {

        Integer emailMatchCount = 0;
        Id lastEmailMatchAccId;
        for (LoanApplicant la : loanApplicants) {
            if (b.PersonEmail == la.Contact.Email) {
                emailMatchCount++;
                lastEmailMatchAccId = la.Contact.AccountId;
            }
        }

        if (emailMatchCount == 0) {
            // No ZERO MATCHES - Search org accounts for matches
            b = searchPersonAccountsForEmailMatch(b, orgAccsWithEmailMatch, borrowerEmailSet, strictSearch);

        } else if (emailMatchCount == 1 && !strictSearch) {
            // Yes ONE MATCH - Update LOAN BORROWER/Person Account
            b.Id = lastEmailMatchAccId;

        } else {
            // Yes MULTIPLE MATCHES
            b = multipleLoanBorrowerEmailMatches(b, loanApplicants, orgAccsWithEmailMatch, borrowerEmailSet, strictSearch);
        }

        return b;
    }

    /*
    (4) Mobile Phone Matching
        * If incoming borrower has a mobile phone number, and we couldn't match on the above criteria:
                * Apply all email matching logic above using mobile phone
                    * Encompass API field name: “cell”
                    * Salesforce field name: “PersonMobilePhone”
                    * Strip all non-numeric characters when querying
                * If still no match because 1, 2 , 3, and 4 did not apply
                    * Create a new Loan Applicant/Person Account with incoming Encompass details
     */
    public static Account matchByMobile(Account b, List<LoanApplicant> loanApplicants, List<Account> orgAccsWithMobileMatch, Set<String> borrowerMobileSet, Boolean strictSearch) {

        Integer mobileMatchCount = 0;
        Id lastMobileMatchAccId;
        for (LoanApplicant la : loanApplicants) {
            if (b.PersonMobilePhone == la.Contact.MobilePhone) {
                mobileMatchCount++;
                lastMobileMatchAccId = la.Contact.AccountId;
            }
        }

        if (mobileMatchCount == 0) {
            // No ZERO MATCHES - Search org accounts for matches
            b = searchPersonAccountsForMobileMatch(b, orgAccsWithMobileMatch, borrowerMobileSet, strictSearch);

        } else if (mobileMatchCount == 1 && !strictSearch) {
            // Yes ONE MATCH - Update LOAN BORROWER/Person Account
            b.Id = lastMobileMatchAccId;

        } else if (mobileMatchCount > 1) {
            // Yes MULTIPLE MATCHES
            b = multipleLoanBorrowerMobileMatches(b, loanApplicants, orgAccsWithMobileMatch, borrowerMobileSet, strictSearch);
        }

        return b;
    }

    /*
    No - There are no matches on email address in LOAN BORROWERS
            * Search Person Account for Email Address
            * If only one Person Account found for the Email Address, update Person Account, and associate it to LOAN BORROWERS
                * If there are more than one Person Accounts with the same Email Address
                    * Search Person Account for exact Last Name, First Name and Email Address
                        * If Match Found, update Person Account, and associate it to LOAN BORROWERS
                        * If No Match Found, create Person Account and associate it to LOAN BORROWERS
    */
    public static Account searchPersonAccountsForEmailMatch(Account b, List<Account> orgAccsWithEmailMatch, Set<String> borrowerEmailSet, Boolean strictSearch) {

        orgAccsWithEmailMatch = queryPersonAccountsByEmail(orgAccsWithEmailMatch, borrowerEmailSet);

        Integer emailMatchCount = 0;
        Id lastEmailMatchAccId;
        for (Account emailMatchAcc : orgAccsWithEmailMatch) {
            if (b.PersonEmail == emailMatchAcc.PersonEmail) {
                emailMatchCount++;
                lastEmailMatchAccId = emailMatchAcc.Id;
            }
        }

        if (emailMatchCount == 1 && !strictSearch) {
            b.Id = lastEmailMatchAccId;
        }

        return b;
    }

    /* Yes - Multiple Matches
     *(3B) Multiple* LOAN BORROWERS match on email:
        * Try to match on Email, First Name & Last Name for LOAN BORROWERS
            * If found, Update the LOAN BORROWERS/Person Account
            * If not found, Search Person Account for exact Last Name, First name and Email Address
                * If Match Found, Update Person Account, and associate it to LOAN BORROWERS
                * If No Match Found, create Person Account and associate it to LOAN BORROWERS
     */
    public static Account multipleLoanBorrowerEmailMatches(Account b, List<LoanApplicant> loanApplicants, List<Account> orgAccsWithEmailMatch, Set<String> borrowerEmailSet, Boolean strictSearch) {

        for (LoanApplicant la : loanApplicants) {
            if (b.PersonEmail == la.Contact.Email
                    && b.FirstName.equals(la.Contact.FirstName)
                    && b.LastName.equals(la.Contact.LastName)) {
                b.Id = la.Contact.AccountId;
            }
        }

        // No email, first, last match found in LOAN BORROWERS
        if (b.Id == null) {
            // Attempt to find match on person accounts by First/Last/Email
            b = searchPersonAccountsForEmailMatch(b, orgAccsWithEmailMatch, borrowerEmailSet, strictSearch);
        }

        return b;
    }

    // Mobile Phone Version of EMAIL version method
    public static Account multipleLoanBorrowerMobileMatches(Account b, List<LoanApplicant> loanApplicants, List<Account> orgAccsWithMobileMatch, Set<String> borrowerMobileSet, Boolean strictSearch) {

        for (LoanApplicant la : loanApplicants) {
            if (b.PersonMobilePhone.replaceAll('\\D', '') == la.Contact.MobilePhone.replaceAll('\\D', '')
                    && b.FirstName.equals(la.Contact.FirstName)
                    && b.LastName.equals(la.Contact.LastName)) {
                b.Id = la.Contact.AccountId;
            }
        }

        // No email, first, last match found in LOAN BORROWERS
        if (b.Id == null) {
            // Attempt to find match on person accounts by First/Last/Email
            b = searchPersonAccountsForMobileMatch(b, orgAccsWithMobileMatch, borrowerMobileSet, strictSearch);
        }

        return b;
    }

    // Mobile Phone Version of EMAIL version method
    public static Account searchPersonAccountsForMobileMatch(Account b, List<Account> orgAccsWithMobileMatch, Set<String> borrowerMobileSet, Boolean strictSearch) {

        orgAccsWithMobileMatch = queryPersonAccountsByMobile(orgAccsWithMobileMatch, borrowerMobileSet);

        Integer mobileMatchCount = 0;
        Integer mobileFirstLastMatchCount = 0;
        Id lastMobileMatchAccId;
        Id lastMobileFirstLastMatchAccId;
        for (Account mobileMatchAcc : orgAccsWithMobileMatch) {
            if (b.PersonMobilePhone == mobileMatchAcc.PersonMobilePhone) {
                mobileMatchCount++;
                lastMobileMatchAccId = mobileMatchAcc.Id;
                if (b.FirstName.equals(mobileMatchAcc.FirstName) && b.LastName.equals(mobileMatchAcc.LastName)) {
                    mobileFirstLastMatchCount++;
                    lastMobileFirstLastMatchAccId = mobileMatchAcc.Id;
                }
            }
        }

        if (mobileMatchCount == 1 && !strictSearch) {
            b.Id = lastMobileMatchAccId;
        } else if (mobileMatchCount > 1 && mobileFirstLastMatchCount == 1) {
            b.Id = lastMobileFirstLastMatchAccId;
        }

        return b;
    }

    public static List<Account> queryPersonAccountsBySsn(List<Account> orgAccsWithSsnMatch, Set<String> borrowerSsnSet) {
        if (orgAccsWithSsnMatch == null) {
            orgAccsWithSsnMatch = new List<Account>();
            orgAccsWithSsnMatch.addAll([
                    SELECT Id, SSN__pc, FirstName, LastName
                    FROM Account
                    WHERE SSN__pc IN :borrowerSsnSet
                    AND RecordTypeId = :SObjectType.Account.getRecordTypeInfosByDeveloperName().get('PersonAccount').getRecordTypeId()
            ]);
            system.debug('orgAccsWithSsnMatch');
            system.debug(orgAccsWithSsnMatch);
        }
        return orgAccsWithSsnMatch;
    }

    public static List<Account> queryPersonAccountsByEmail(List<Account> orgAccsWithEmailMatch, Set<String> borrowerEmailSet) {
        if (orgAccsWithEmailMatch == null) {
            orgAccsWithEmailMatch = new List<Account>();
            orgAccsWithEmailMatch.addAll([
                    SELECT Id, FirstName, LastName, PersonEmail
                    FROM Account
                    WHERE PersonEmail IN :borrowerEmailSet
                    AND RecordTypeId = :SObjectType.Account.getRecordTypeInfosByDeveloperName().get('PersonAccount').getRecordTypeId()
            ]);
            system.debug('orgAccsWithEmailMatch');
            system.debug(orgAccsWithEmailMatch);
        }
        return orgAccsWithEmailMatch;
    }

    public static List<Account> queryPersonAccountsByMobile(List<Account> orgAccsWithMobileMatch, Set<String> borrowerMobileSet) {
        if (orgAccsWithMobileMatch == null) {
            orgAccsWithMobileMatch = new List<Account>();
            orgAccsWithMobileMatch.addAll([
                    SELECT Id, FirstName, LastName, PersonMobilePhone
                    FROM Account
                    WHERE PersonMobilePhone IN:borrowerMobileSet
                    AND RecordTypeId = :SObjectType.Account.getRecordTypeInfosByDeveloperName().get('PersonAccount').getRecordTypeId()
            ]);
            system.debug('orgAccsWithMobileMatch');
            system.debug(orgAccsWithMobileMatch);
        }
        return orgAccsWithMobileMatch;
    }
}