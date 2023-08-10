/**********************************************************
@class      LoanApplicantIntegrationService
@brief      Call the Encompass API to create or update borrower accounts
@testClass  LoanApplicantIntegrationServiceTest
@author     Rob Sullivan
@version    2/15/20   Rob Sullivan
@bug        No known defects.
@todo       None.
@copyright  (c)2020 EMS.  All Rights Reserved. Unauthorized use is prohibited.
***********************************************************/

public with sharing class LoanApplicantIntegrationService implements IntegrationInterface {

    //--------------------------------------------------------------------------
    // Constants

    //--------------------------------------------------------------------------
    // Types
    public class BorrowerIntegrationServiceRequest {
        String applicationId;
        Borrower borrower = new Borrower();

        public BorrowerIntegrationServiceRequest(LoanApplicant la) {
            this.applicationId = la.LoanApplication.ApplicationExtIdentifier;
            this.borrower.firstName = la.Contact.FirstName;
            this.borrower.lastName = la.Contact.LastName;
            this.borrower.emailAddressText = la.Contact.Email;
            this.borrower.homePhoneNumber = la.Contact.Phone;
            this.borrower.mobilePhone = la.Contact.MobilePhone;
            this.borrower.taxIdentificationIdentifier = la.Contact.SSN__c;
            this.borrower.birthDate = la.Contact.Birthdate;
            this.borrower.workEmailAddress = la.Contact.Work_Email__c;
            this.borrower.maritalStatusType = la.MaritalStatus;
            this.borrower.dependentCount = la.DependentCount;
            this.borrower.dependentsAgesDescription = la.DependentsAge;
            this.borrower.schoolingTermYears = Integer.valueOf(la.Years_in_School__c);
        }
    }

    public class CoBorrowerIntegrationServiceRequest {
        String applicationId;
        Borrower coborrower = new Borrower();

        public CoBorrowerIntegrationServiceRequest(LoanApplicant la) {
            this.applicationId = la.LoanApplication.ApplicationExtIdentifier;
            this.coborrower.firstName = la.Contact.FirstName;
            this.coborrower.lastName = la.Contact.LastName;
            this.coborrower.emailAddressText = la.Contact.Email;
            this.coborrower.homePhoneNumber = la.Contact.Phone;
            this.coborrower.mobilePhone = la.Contact.MobilePhone;
            this.coborrower.taxIdentificationIdentifier = la.Contact.SSN__c;
            this.coborrower.birthDate = la.Contact.Birthdate;
            this.coborrower.workEmailAddress = la.Contact.Work_Email__c;
            this.coborrower.maritalStatusType = la.MaritalStatus;
            this.coborrower.dependentCount = la.DependentCount;
            this.coborrower.dependentsAgesDescription = la.DependentsAge;
            this.coborrower.schoolingTermYears = Integer.valueOf(la.Years_in_School__c);
        }
    }

    public class Borrower {
        String firstName;
        String lastName;
        String emailAddressText;
        String homePhoneNumber;
        String mobilePhone;
        String taxIdentificationIdentifier;
        Date birthDate;
        String workEmailAddress;
        String maritalStatusType;
        Integer dependentCount;
        String dependentsAgesDescription;
        Integer schoolingTermYears;
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
        System.debug(LoggingLevel.DEBUG, 'Starting LoanApplicantIntegrationService.performIntegrationCallouts...');
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
        System.debug(LoggingLevel.DEBUG, 'Starting LoanApplicantIntegrationService.performIntegrationCalloutsFuture...');
        if (!Test.isRunningTest()) {
            sendLoanApplicants(recordIdsToIntegrate);
        }
    }

    public static void sendLoanApplicants(Set<Id> recordIdsToIntegrate) {
        System.debug(LoggingLevel.DEBUG, 'Starting LoanApplicantIntegrationService.sendLoanApplicants...');

        OutboundIntegrationService service = new OutboundIntegrationService();
        Integrated_Object__mdt objectConfig = service.getIntegratedObjectConfiguration('LoanApplicant', false);

        LoanApplicant record;
        record = Database.query(OutboundIntegrationService.createSalesforceQuery(objectConfig, recordIdsToIntegrate));
        System.debug('record: ' + record);

        String requestBody = null;
        requestBody = createRequestBody(objectConfig, record);
        System.debug('requestBody: ' + requestBody);
        HttpResponse response;
        if (String.isNotBlank(requestBody)) {
            // Update the Encompass borrower contact
            HttpRequest req = CalloutUtility.returnEncompassRequest('Update_Borrower_Contact', requestBody, null, null);
            req.setEndpoint(req.getEndpoint().replace('{loanId}', record.LoanApplication.Loan_GUID__c));
            req.setEndpoint(req.getEndpoint().replace('{applicationId}', record.LoanApplication.ApplicationExtIdentifier));
            response = new Http().send(req);
            System.debug('response status: ' + response.getStatus());
        }
    }

    //---------------------------------------------------------------------
    // Helpers
    private static String createRequestBody(Integrated_Object__mdt objectConfig, LoanApplicant record) {
        String result;
        if (record.BorrowerType == 'Borrower') {
            result = JSON.serialize(new BorrowerIntegrationServiceRequest(record));
        } else {
            result = JSON.serialize(new CoBorrowerIntegrationServiceRequest(record));
        }
        return result;
    }
}