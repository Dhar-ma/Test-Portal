public class UpdateLoanContacts {

    public static Boolean FORMAT_PHONE = true;

    public class LoanTeamMember {
        String name;
        String email;
        String type;
    }

    public static void parseAndUpdate(String jsonBody) {
        parseAndUpdate(jsonBody, null, null);
    }

    public static void parseAndUpdate(String loanJson, String associatesJson, String loanId) {
        System.debug('UpdateLoanContacts.parseAndUpdate()');
        List<Account> businessAccountsToUpsert = new List<Account>();
        List<Contact> businessContactsToUpsert = new List<Contact>();
        Set<String> externalAccountIdsList = new Set<String>();
        Set<String> externalContactIdsList = new Set<String>();
        Map<String, String> contactTypeMap = new Map<String, String>();
        Set<String> ltmEmails = new Set<String>();
        Map<String, LoanTeamMember> ltmMap = new Map<String, LoanTeamMember>();
        Id loanOfficerUserId = null;
		JSONParser j;
        EncompassJSONContactParser e;
        //
        // First process the "associates". Any contact type that appears there is an internal Loan Team Member.
        //
        // Note that most of the users that appear in the Associates list are duplicated in the Contacts list.
        // We will use a map with contact type as the key to prevent duplicates (which would cause the upsert to fail)
        //
        if (associatesJson != null) {
            j = JSON.createParser(associatesJson.replace('loanTeamMember', 'associates'));
            e = (EncompassJSONContactParser)j.readValueAs(EncompassJSONContactParser.class);
            List<EncompassJSONContactParser.Associates> associates = new List<EncompassJSONContactParser.Associates>(e.associates);
            for (EncompassJSONContactParser.Associates associate : associates) {
                LoanTeamMember ltm = new LoanTeamMember();
                ltm.name = associate.name;
                ltm.email = associate.email;
                ltm.type = associate.roleName;
                System.debug('Adding Associate: ' + ltm);
                ltmMap.put(ltm.type, ltm);
                ltmEmails.add(associate.email);
            }
        }

        // Now process the main "loans" response body, which includes the contacts and borrowers
        j = JSON.createParser(loanJson);
        e = (EncompassJSONContactParser)j.readValueAs(EncompassJSONContactParser.class);
        String loanGUID = e.encompassId;
        if (e != null) {
            loanGUID = e.encompassId;
        }
        if (loanGUID != null) {
            ResidentialLoanApplication loan = [SELECT Id FROM ResidentialLoanApplication WHERE Loan_GUID__c = :loanGUID];
            Map<String, String> contactTypesToUse = EncompassUtils.getExternalContactTypes();
            System.debug('contactTypesToUse: ' + contactTypesToUse);
            List<String> emailDomains = EncompassUtils.getEmailDomains();
            System.debug('emailDomains: ' + emailDomains);

            List<EncompassJSONContactParser.Contacts> cons = new List<EncompassJSONContactParser.Contacts>(e.contacts);

            for (EncompassJSONContactParser.Contacts con : cons) {
                System.debug('con: ' + con);
                // Is this contact one of the types configured to be imported?
                if (((con.contactType != null) && (String.isNotBlank(contactTypesToUse.get(con.contactType)))) || (Test.isRunningTest())) {
                    System.debug('Processing Contact Type: ' + con.contactType);
                    Account a = new Account();
                    Contact c = new Contact();

                    //
                    // The Encompass API is not consist with the "name" and "contactName" fields.
                    // - Sometimes both fields are passed; sometimes only one or the other is passed.
                    // - Sometimes name is a company; other times a person.
                    //
                    // Here are some general rules:
                    //
                    // - If we receive an email address, the contact is always a Person.
                    // - If both name and contactName are passed, name is always Company and contactName is always a Person.
                    // - If only one of name or contactName is passed, both fields are sometimes company and other times person. The most
                    //   consistent is that name is Company and contactName is person (but with some exceptions).
                    // - The same person can have multiple roles and appear twice in the API response. For example, the Title Company
                    //   and Escrow Company contacts are often the same person.
                    //
                    if (con.email != null && con.email.contains('@')) {
                        // This contact has an email address - it must be a person
                        String emailDomain = con.email.substringAfter('@');
                        System.debug('emailDomain: ' + emailDomain);
                        if (emailDomains.contains(emailDomain)) {
                            //
                            // This contact is an internal Loan Team Member.
                            //
                            LoanTeamMember ltm = new LoanTeamMember();
                            ltm.name = con.contactName != null ? con.contactName : con.name;
                            ltm.email = con.email;
                            ltm.type = contactTypesToUse.get(con.contactType);
                            System.debug('Adding Loan Team Member: ' + ltm);
                            ltmMap.put(ltm.type, ltm);
                            ltmEmails.add(con.email);
                        } else {
                            //
                            // This contact is an External Loan Contact
                            //
                            // Check if we have an Encompass Contact GUID for this contact.
                            // (e.g. this Contact is a "master" Business Contact that was
                            // linked to the loan.
                            if (con.contact != null) {
                                if (con.contact.entityId != null && con.contact.entityType == 'Business') {
                                    c.Encompass_Id__c = con.contact.entityId;
                                }
                            }

                            // Format phone numbers
                            String phone = con.phone;
                            String mobilePhone = con.cell;
                            if (FORMAT_PHONE) {
                                if (phone != null) phone = phone.replaceAll('\\D', '');
                                if (mobilePhone != null) mobilePhone = mobilePhone.replaceAll('\\D', '');
                            }

                            if (con.name != null && con.contactName != null) {
                                // Both name and contactName were specified.
                                // Create an account for the company & contact for the person.
                                c.Encompass_Company_Name__c = con.name;
                                c.FirstName = con.contactName.substringBeforeLast(' ');
                                c.LastName = con.contactName.substringAfterLast(' ');
                            } else if (con.name != null) {
                                // We have the person name but not a company name.
                                // Use the email domain to create a placeholder account where we can add this contact.
                                c.FirstName = con.name.substringBeforeLast(' ');
                                c.LastName = con.name.substringAfterLast(' ');
                                c.Encompass_Company_Name__c = emailDomain;
                            } else if (con.contactName != null) {
                                // We have the person name but not a company name.
                                // Use the email domain to create a placeholder account where we can add this contact.
                                c.FirstName = con.contactName.substringBeforeLast(' ');
                                c.LastName = con.contactName.substringAfterLast(' ');
                                c.Encompass_Company_Name__c = emailDomain;
                            }
                            a.Name = c.Encompass_Company_Name__c;
                            a.Encompass_External_Id__c = c.Encompass_Company_Name__c;
                            if (phone != null) c.Phone = phone;
                            if (mobilePhone != null) c.MobilePhone = mobilePhone;
                            if (con.email != null) {
                                c.Email = con.email;
                                if (c.Encompass_Id__c == null) {
                                    // We didn't get a Contact GUID above - use the email address as the external Id
                                    c.Encompass_Id__c = con.email.toLowerCase();
                                }
                            }
                            if (con.address != null) c.MailingStreet = con.address;
                            if (con.city != null) c.MailingCity = con.city;
                            if (con.state != null) c.MailingState = con.state;
                            if (con.postalCode != null) c.MailingPostalCode = con.postalCode;
                            if (con.personalLicenseNumber != null) c.License_Num__c = con.personalLicenseNumber;
                            c.Type__c = con.contactType;
                            if (c.Encompass_Id__c != null) {
                                System.debug('Processing Contact for Type ' + c.Type__c + ': ' + c);
                                // It's possible that the same person has multiple roles.
                                // (for example, the Title Agent is also the Escrow Agent).
                                // Only create a new Person Account if we haven't already seen this person.
                                if (!externalContactIdsList.contains(c.Encompass_Id__c)) {
                                    System.debug('Adding business Contact: ' + c);
                                    businessContactsToUpsert.add(c);
                                }
                                contactTypeMap.put(c.Type__c, c.Encompass_Id__c);
                                externalContactIdsList.add(c.Encompass_Id__c);
                            }
                        }
                    } else {
                        // This contact does not have an email address.
                        // Because Encompass doesn't send a unique external Id for contacts, we use email address
                        // as the external Id. Since this contact has no email, we won't create a contact and
                        // instead will only create an account for whatever value we received.
                        if (con.name != null) {
                            // We have a company name and may or may not have a contactName.
                            // Either way, create an account for the name and disregard the contactName.
                            a.Name = con.name;
                            a.Encompass_External_Id__c = con.name;
                        } else if (con.contactName != null) {
                            // The name field is null - we will assume the contactName field is the company name.
                            a.Name = con.contactName;
                            a.Encompass_External_Id__c = con.contactName;
                        }
                    }
                    if (a.Encompass_External_Id__c != null && !externalAccountIdsList.contains(a.Encompass_External_Id__c)) {
                        System.debug('Adding business account: ' + a);
                        businessAccountsToUpsert.add(a);
                    }
                    externalAccountIdsList.add(a.Encompass_External_Id__c);
                }
            }

            //
            // ADD LOAN TEAM MEMBERS TO LOAN APPLICATION
            //
            Map<String, Id> usersToMap = new Map<String, Id>();
            List<User> userList = [
                    SELECT Id, Email
                    FROM User
                    WHERE Email = :ltmEmails
            ];
            for (User u : userList) {
                usersToMap.put(u.Email, u.Id);
            }
            System.debug('usersToMap: ' + usersToMap);

            List<Loan_Team_Member__c> loanTeamMembersToUpsert = new List<Loan_Team_Member__c>();
            Map<String, Loan_Team_Member__c> existingLTMMap = new Map<String, Loan_Team_Member__c>();
            for (Loan_Team_Member__c ltm : [
                    SELECT Id, Name, Type__c, Name__c, User__c
                    FROM Loan_Team_Member__c
                    WHERE Loan_Application__c = :loan.Id])
            {
                existingLTMMap.put(ltm.Type__c, ltm);
            }
            // Loop through all the Loan Team Members and add or update them on the Loan
            for (LoanTeamMember ltm : ltmMap.values()) {
                // Check if the current Contact type has previously been added to the Loan
                Loan_Team_Member__c existingLTM = existingLTMMap.get(ltm.type);
                Loan_Team_Member__c newLTM = new Loan_Team_Member__c();
                if (existingLTM != null) {
                    // This contact type (e.g. Loan Processor) already exists as a Loan Team Member on the Loan.
                    // Update the existing Loan Team Member record.
                    newLTM = existingLTM;
                    System.debug('Found Existing Loan Team Member to update: ' + newLTM);
                } else {
                    // This is a new user we haven't seen before.
                    // Create a new Loan Team Member and associate it to the Loan
                    newLTM.Loan_Application__c = loan.Id;
                    System.debug('Creating new Loan Team Member record...');
                }
                newLTM.User__c = usersToMap.get(ltm.email);
                newLTM.Name__c = ltm.name;
                newLTM.Type__c = ltm.type;
                System.debug('Adding Loan Team Member: ' + newLTM);
                loanTeamMembersToUpsert.add(newLTM);
                // Get the Loan Officer to assign as the Account/Contact owner.
                if (newLTM.Type__c == 'Loan Officer' && newLTM.User__c != null) {
                    loanOfficerUserId = newLTM.User__c;
                    System.debug('loanOfficerUserId: ' + loanOfficerUserId);
                }
            }
            System.debug('loanTeamMembersToUpsert: ' + loanTeamMembersToUpsert);

            try {
                System.debug('Upserting Loan Team Members...');
                upsert loanTeamMembersToUpsert;
            } catch(Exception ex) {}

            //
            // CREATE BUSINESS ACCOUNTS
            //
            System.debug(businessAccountsToUpsert);
            System.debug('Business Accounts size is ' + businessAccountsToUpsert.size());
            List<Database.UpsertResult> businessAccountUpsertResults;
            if (businessAccountsToUpsert != null && businessAccountsToUpsert.size() > 0) {
                if (loanOfficerUserId != null) {
                    // Set the Loan Officer as the account owner
                    for (Account a : businessAccountsToUpsert) {
                        a.OwnerId = loanOfficerUserId;
                    }
                }
                Schema.SObjectField f = Account.Fields.Encompass_External_Id__c;
                businessAccountUpsertResults = Database.upsert(businessAccountsToUpsert, f, false);
                System.debug('businessAccountUpsertResults: ' + businessAccountUpsertResults);
            }

            // Query the Business Accounts upserted above
            Set<Id> accountIds = new Set<Id>();
            if (businessAccountUpsertResults != null && businessAccountUpsertResults.size() > 0) {
                for (Database.UpsertResult result : businessAccountUpsertResults) {
                    if (result.isSuccess()) {
                        accountIds.add(result.Id);
                    }
                }
            }
            System.debug('accountIds: ' + accountIds);

            Map<String, Account> accountsByName = new Map<String, Account>();
            Map<String, Account> accountsByExtId = new Map<String, Account>();
            if (accountIds != null && accountIds.size() > 0) {
                for (Account a : [
                        SELECT Id,
                                Encompass_External_Id__c,
                                Name,
                                PersonContactId,
                                Encompass_Company_Name__pc
                        FROM Account
                        WHERE Id IN :accountIds
                ]) {
                    accountsByName.put(a.Name, a);
                    accountsByExtId.put(a.Encompass_External_Id__c, a);
                }
            }
            System.debug('accountsByName: ' + accountsByName);

            //
            // CREATE BUSINESS CONTACTS
            //
            System.debug('businessContactsToUpsert: ' + businessContactsToUpsert);
            System.debug('Contacts size is ' + businessContactsToUpsert.size());

            List<Contact> deduped = new List<Contact>();
            List<Contact> contactsWithAccounts = new List<Contact>();
            if (businessContactsToUpsert != null && businessContactsToUpsert.size() > 1) {
                List<SObject> soL = EncompassUtils.dedupeList(businessContactsToUpsert);
                for (SObject so : soL) {
                    deduped.add((Contact) so);
                }
            } else {
                deduped = businessContactsToUpsert.deepClone();
            }
            // Pull in the Account Ids
            for (Contact c : deduped) {
                if (accountsByName.get(c.Encompass_Company_Name__c) != null) {
                    c.AccountId = accountsByName.get(c.Encompass_Company_Name__c).Id;
                    contactsWithAccounts.add(c);
                } else {
                    contactsWithAccounts.add(c);
                }
            }
            // Set the Loan Officer as the contact owner
            if (loanOfficerUserId != null) {
                for (Contact c: contactsWithAccounts) {
                    c.OwnerId = loanOfficerUserId;
                }
            }
            System.debug('contactsWithAccounts: ' + contactsWithAccounts);
            System.debug('Business Contacts size is ' + contactsWithAccounts.size());
            List<Database.UpsertResult> contactUpsertResults;
            if (contactsWithAccounts != null && contactsWithAccounts.size() > 0) {
                Schema.SObjectField f = Contact.Fields.Encompass_Id__c;
                contactUpsertResults = Database.upsert(contactsWithAccounts, f, false);
                System.debug('contactUpsertResults: ' + contactUpsertResults);
            }

            // Query the Contacts upserted above
            Set<Id> contactIds = new Set<Id>();
            if (contactUpsertResults != null && contactUpsertResults.size() > 0) {
                for (Database.UpsertResult result : contactUpsertResults) {
                    if (result.isSuccess()) {
                        contactIds.add(result.Id);
                    }
                }
            }
            System.debug('contactIds: ' + contactIds);

            Map<String, Contact> contactsByExtId = new Map<String, Contact>();
            if (contactIds != null && contactIds.size() > 0) {
                for (Contact c : [
                        SELECT Id,
                                AccountId,
                                Encompass_Id__c,
                                Encompass_Company_Name__c
                        FROM Contact
                        WHERE Id IN :contactIds
                ]) {
                    contactsByExtId.put(c.Encompass_Id__c, c);
                }
            }
            System.debug('contactsByExtId: ' + contactsByExtId);

            //
            // ADD EXTERNAL LOAN CONTACTS TO LOAN APPLICATION
            //
            List<Loan_Contact__c> loanContactsToUpsert = new List<Loan_Contact__c>();
            Map<String, Loan_Contact__c> existingELCMap = new Map<String, Loan_Contact__c>();
            for (Loan_Contact__c elc : [
                    SELECT Id, Name, Type__c, Contact__c, Account__c, Company_Name__c
                    FROM Loan_Contact__c
                    WHERE Loan_Application__c = :loan.Id])
            {
                existingELCMap.put(elc.Type__c, elc);
            }
            System.debug('existingELCMap: ' + existingELCMap);
            // Loop through all the Contacts Types we received and add or update them on the Loan Application
            for (String contactType : contactTypeMap.keySet()) {
                // Get the Contact for this contact type
                Contact c = contactsByExtId.get(contactTypeMap.get(contactType));
                if (c != null) {
                    // Check if the current Contact type has previously been added to the Loan
                    Loan_Contact__c existingELC = existingELCMap.get(contactTypesToUse.get(contactType));
                    Loan_Contact__c newELC = new Loan_Contact__c();
                    if (existingELC != null) {
                        // This contact type (e.g. Buyers Agent) already exists as an External Loan Contact on the Loan.
                        // Update the existing External Loan Contact record.
                        newELC = existingELC;
                        System.debug('Found Existing External Loan Contact to update: ' + newELC);
                    } else {
                        // This is a new contact we haven't seen before.
                        // Create a new External Loan Contact and associate it to the Loan
                        newELC.Loan_Application__c = loan.Id;
                        System.debug('Creating new External Loan Contact record...');
                    }
                    newELC.Contact__c = c.Id;
                    newELC.Type__c = contactTypesToUse.get(contactType);
                    newELC.Account__c = c.AccountId;
                    newELC.Company_Name__c = c.Encompass_Company_Name__c;
                    System.debug('Adding External Loan Contact: ' + newELC);
                    loanContactsToUpsert.add(newELC);
                }
            }
            System.debug('loanContactsToUpsert: ' + loanContactsToUpsert);

            try {
                System.debug('Upserting External Loan Contacts...');
                upsert loanContactsToUpsert;
            } catch(Exception ex) {}
        }
    }
}