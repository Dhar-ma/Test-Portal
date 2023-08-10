/**********************************************************
@class      ContactIntegrationService
@brief      Call the Encompass API to create or update loan contacts
@testClass  ContactIntegrationServiceTest
@author     Rob Sullivan
@version    1/2/20   Rob Sullivan
@bug        No known defects.
@todo       None.
@copyright  (c)2020 EMS.  All Rights Reserved. Unauthorized use is prohibited.
***********************************************************/

public with sharing class ContactIntegrationService implements IntegrationInterface {

    //--------------------------------------------------------------------------
    // Constants

    //--------------------------------------------------------------------------
    // Types
    public class ContactIntegrationServiceRequest {
        //String Id;
        Integer categoryId;
        String companyName;
        //Integer fees;
        ContactLicense personalContactLicense = new ContactLicense();
        //ContactLicense businessContactLicense = new ContactLicense();
        //Boolean noSpam;
        String firstName;
        String lastName;
        //String accessLevel;
        MailingAddress currentMailingAddress = new MailingAddress();
        String businessWebUrl;
        String jobTitle;
        String workPhone;
        String homePhone;
        String mobilePhone;
        String faxNumber;
        //String personalEmail;
        String businessEmail;
        String salutation;

        public ContactIntegrationServiceRequest(Contact c) {
            //this.Id = c.Id;
            this.categoryId = Integer.valueOf(c.Encompass_Category__c);
            this.companyName = c.Account.Name;
            //this.fees = null;
            //this.personalContactLicense.licenseAuthName = null;
            //this.personalContactLicense.licenseAuthType = null;
            //this.personalContactLicense.licenseIssueDate = null;
            if (c.License_Num__c != null) {
                this.personalContactLicense.licenseNumber = c.License_Num__c;
            }
            //this.personalContactLicense.licenseStateCode = null;
            //this.businessContactLicense.licenseAuthName = null;
            //this.businessContactLicense.licenseAuthType = null;
            //this.businessContactLicense.licenseIssueDate = null;
            //this.businessContactLicense.licenseNumber = null;
            //this.businessContactLicense.licenseStateCode = null;
            //this.noSpam = null;
            this.firstName = c.FirstName;
            this.lastName = c.LastName;
            //this.accessLevel = null;
            this.currentMailingAddress.street1 = c.MailingStreet;
            //this.currentMailingAddress.street2 = null;
            this.currentMailingAddress.city = c.MailingCity;
            this.currentMailingAddress.state = c.MailingState;
            this.currentMailingAddress.zip = c.MailingPostalCode;
            this.businessWebUrl = c.Account.Website;
            this.jobTitle = c.Title;
            this.workPhone = c.Phone;
            this.homePhone = c.HomePhone;
            this.mobilePhone = c.MobilePhone;
            this.faxNumber = c.Fax;
            //this.personalEmail = null;
            this.businessEmail = c.Email;
            this.salutation = c.Salutation;
        }
    }

    public class ContactLicense {
        //String licenseAuthName;
        //String licenseAuthType;
        //Datetime licenseIssueDate;
        String licenseNumber;
        //String licenseStateCode;
    }

    public class MailingAddress {
        String street1;
        //String street2;
        String city;
        String state;
        String zip;
    }

    public static Set<Id> isRecordIds = new Set<Id>();

    //--------------------------------------------------------------------------
    // Methods
    /**
    * The main entry for processing the updated records and calling the external API.
    *
    * @param integrationConfiguration the configuration metadata for the incoming records
    * @param recordIdsToIntegrate the set of records to be integrated
    * @param isCreate flag to specify whether the incoming records are being created or updated
    */
    public void performIntegrationCallouts(Integrated_Object__mdt integrationConfiguration, Set<Id> recordIdsToIntegrate, Boolean isCreate) {
        System.debug(LoggingLevel.DEBUG, 'Starting ContactIntegrationService.performIntegrationCallouts...');
        System.debug(LoggingLevel.DEBUG, 'integrationConfiguration: ' + integrationConfiguration);
        System.debug(LoggingLevel.DEBUG, 'recordIdsToIntegrate: ' + recordIdsToIntegrate);
        // Break the records into the number to be processed each callout and call the future method for each group of records.
        Integer index = 0;
        Set<Id> subsetToIntegrate = new Set<Id>();
        for (Id recId : recordIdsToIntegrate) {
            index++;
            subsetToIntegrate.add(recId);
            if (math.mod(index, (Integer)integrationConfiguration.Maximum_Records_Per_Call__c) == 0 || index == recordIdsToIntegrate.size()) {
                System.debug(LoggingLevel.DEBUG, 'subsetToIntegrate: ' + subsetToIntegrate);
                performIntegrationCalloutsFuture(integrationConfiguration.Endpoint__c, subsetToIntegrate, isCreate);
                subsetToIntegrate.clear();
            }
        }
    }

    /**
    * Future method to callout to the API.
    *
    * The logic needs to be in a future call because the caller
    * and this program creates/updates the integration status records
    * and that will call unpersisted changes before a callout.
    *
    * @param endpointUrl the API url to call
    * @param recordIdsToIntegrate the set of records to be integrated
    * @param isCreate flag to specify whether the incoming records are being created or updated
    */
    @Future (Callout=true)
    public static void performIntegrationCalloutsFuture(String endpointUrl, Set<Id> recordIdsToIntegrate, Boolean isCreate) {
        System.debug(LoggingLevel.DEBUG, 'Starting ContactIntegrationService.performIntegrationCalloutsFuture...');
        if (!Test.isRunningTest()) {
            sendContacts(recordIdsToIntegrate);
        }
    }

    public static void sendContacts(Set<Id> recordIdsToIntegrate) {
        System.debug(LoggingLevel.DEBUG, 'Starting ContactIntegrationService.sendContacts...');

        OutboundIntegrationService service = new OutboundIntegrationService();
        Integrated_Object__mdt objectConfig = service.getIntegratedObjectConfiguration('Contact', false);

        Contact record;
        record = Database.query(OutboundIntegrationService.createSalesforceQuery(objectConfig, recordIdsToIntegrate));
        System.debug('record: ' + record);
        System.debug('acct name: ' + record.Account.Name);

        String requestBody = null;
        if (String.isNotBlank(record.Encompass_Category__c)) {
            requestBody = createRequestBody(objectConfig, record);
        }
        System.debug('requestBody: ' + requestBody);
        HttpResponse response;
        if (String.isNotBlank(requestBody)) {
            if (record.Encompass_Id__c != null) {
                // Update the Encompass contact
                response = new Http().send(CalloutUtility.returnEncompassRequest('Update_Business_Contact', requestBody, record.Encompass_Id__c, null));
                System.debug('response status: ' + response.getStatus());
            } else {
                // Create a new Encompass contact
                response = new Http().send(CalloutUtility.returnEncompassRequest('Create_Business_Contact', requestBody, null, null));
                System.debug('response status: ' + response.getStatus());
                try {
                    CalloutUtility.assertSuccessCode('Create_Business_Contact', response.getStatusCode());
                    String newContactGUID = response.getHeader('Location').substringAfterLast('/');
                    System.debug('newContactGUID: ' + newContactGUID);
                    updateContact(record.Id, newContactGUID, 'Contact');
                } catch (Exception e) {
                }
            }
        }
    }

    //---------------------------------------------------------------------
    // Helpers
    private static String createRequestBody(Integrated_Object__mdt objectConfig, Contact record) {
        return JSON.serialize(new ContactIntegrationServiceRequest(record));
    }

    // write the Contact GUID to the contact record in Salesforce
    private static void updateContact(Id contactId, String contactGUID, String objectType) {
        sObject contact = Schema.getGlobalDescribe().get(objectType).newSObject();
        contact.Id = contactId;
        contact.put('Encompass_Id__c', contactGUID);
        update contact;
    }
}