/**
 * EncompassJSONParser
 * allows you to use these like objects
 **/

public class EncompassJSONContactParser {

    public class Coborrower {
        public Integer ageAtApplicationYearsCount {get;set;} 
        public String altId {get;set;} 
        public String applicantType {get;set;} 
        public String birthDate {get;set;} 
        public Integer borrowerIndex {get;set;} 
        public String borrowerType {get;set;} 
        public String emailAddressText {get; set;}
        public String firstName {get;set;} 
        public String firstNameWithMiddleName {get;set;} 
        public String fullName {get;set;} 
        public String fullNameWithSuffix {get;set;} 
        public String fannieFirstName {get;set;} 
        public String hmda2003RaceNationalOriginType {get;set;} 
        public Boolean hmdaNoCoApplicantIndicator {get;set;} 
        public String homePhoneNumber {get;set;}
        public String lastName {get;set;} 
        public String lastNameWithSuffix {get;set;} 
        public String maritalStatusType {get;set;}
        public Integer dependentCount {get;set;}
        public String dependentsAgesDescription {get;set;}
        public String mobilePhone {get;set;}
        public String priorPropertyTitleType {get;set;} 
        public String priorPropertyUsageType {get;set;} 
        public String taxIdentificationIdentifier {get;set;} 
        public String vestingTrusteeOfType {get;set;} 
        public String hmdaCreditScoreForDecisionMaking {get;set;} 
        public String hmdaCreditScoringModel {get;set;} 
        public String hmdaAge {get;set;}
        public String hmdaGenderType {get;set;}

        public Coborrower(JSONParser parser) {
            while (parser.nextToken() != System.JSONToken.END_OBJECT) {
                if (parser.getCurrentToken() == System.JSONToken.FIELD_NAME) {
                    String text = parser.getText();
                    if (parser.nextToken() != System.JSONToken.VALUE_NULL) {
                        if (text == 'ageAtApplicationYearsCount') {
                            ageAtApplicationYearsCount = parser.getIntegerValue();
                        } else if (text == 'altId') {
                            altId = parser.getText();
                        } else if (text == 'applicantType') {
                            applicantType = parser.getText();
                        } else if (text == 'birthDate') {
                            birthDate = parser.getText();
                        } else if (text == 'borrowerIndex') {
                            borrowerIndex = parser.getIntegerValue();
                        } else if (text == 'borrowerType') {
                            borrowerType = parser.getText();
                        } else if ( text == 'emailAddressText' ) {
                          emailAddressText = parser.getText();
                        } else if (text == 'firstName') {
                            firstName = parser.getText();
                        } else if (text == 'firstNameWithMiddleName') {
                            firstNameWithMiddleName = parser.getText();
                        } else if (text == 'fullName') {
                            fullName = parser.getText();
                        } else if (text == 'fullNameWithSuffix') {
                            fullNameWithSuffix = parser.getText();
                        } else if (text == 'fannieFirstName') {
                            fannieFirstName = parser.getText();
                        } else if (text == 'hmda2003RaceNationalOriginType') {
                            hmda2003RaceNationalOriginType = parser.getText();
                        } else if (text == 'hmdaNoCoApplicantIndicator') {
                            hmdaNoCoApplicantIndicator = parser.getBooleanValue();
                        } else if ( text == 'homePhoneNumber' ) {
                          homePhoneNumber = parser.getText();
                        } else if (text == 'lastName') {
                            lastName = parser.getText();
                        } else if (text == 'lastNameWithSuffix') {
                            lastNameWithSuffix = parser.getText();
                        } else if (text == 'maritalStatusType') {
                            maritalStatusType = parser.getText();
                        } else if (text == 'dependentCount') {
                            dependentCount = parser.getIntegerValue();
                        } else if (text == 'dependentsAgesDescription') {
                            dependentsAgesDescription = parser.getText();
                        } else if ( text == 'mobilePhone' ) {
                          mobilePhone = parser.getText();
                        } else if (text == 'priorPropertyTitleType') {
                            priorPropertyTitleType = parser.getText();
                        } else if (text == 'priorPropertyUsageType') {
                            priorPropertyUsageType = parser.getText();
                        } else if (text == 'taxIdentificationIdentifier') {
                            taxIdentificationIdentifier = parser.getText();
                        } else if (text == 'vestingTrusteeOfType') {
                            vestingTrusteeOfType = parser.getText();
                        } else if (text == 'hmdaCreditScoreForDecisionMaking') {
                            hmdaCreditScoreForDecisionMaking = parser.getText();
                        } else if (text == 'hmdaCreditScoringModel') {
                            hmdaCreditScoringModel = parser.getText();
                        } else if (text == 'hmdaAge') {
                            hmdaAge = parser.getText();
                        } else if (text == 'hmdaGenderType') {
                            hmdaGenderType = parser.getText();
                        } else {
                            System.debug(LoggingLevel.WARN, 'Coborrower consuming unrecognized property: '+text);
                            consumeObject(parser);
                        }
                    }
                }
            }
        }
    }
    
    public String encompassId {get;set;} 
    public List<Applications> applications {get;set;} 
    public String applicationTakenMethodType {get;set;} 
    public Double borrowerPaidClosingCostsAmount {get;set;} 
    public Double borrowerPaidFHAVAClosingCostsAmount {get;set;} 
    public Integer borrowerPairCount {get;set;} 
    public Double borrowerRequestedLoanAmount {get;set;}
    public Double cashFromToBorrowerAmount {get;set;} 
    public String channel {get;set;} 
    public String closingCostProgram {get;set;} 
    public List<Contacts> contacts {get;set;}
    public List<Associates> associates {get;set;}
    public List<CustomFields> customFields {get;set;}
    public List<InterimServicing> interimServices {get;set;}
    public Boolean copyBrokerToLenderIndicator {get;set;} 
    public String copyLoanNumLenderCaseNum {get;set;} 
    public String currentFirstMortgageHolderType {get;set;} 
    public String docEngine {get;set;} 
    public Double estimatedClosingCostsAmount {get;set;} 
    public String fundingFeeList {get;set;}

    /**
    public String interviewersId {get;set;} 
    public String inverviewerName {get;set;} 
    public String lenderCaseIdentifier {get;set;} 
    public String lenderChannel {get;set;} 
    public String loanAmortizationType {get;set;} 
    public String loanCreatedDateUtc {get;set;} 
    **/
    
    public String loanNumber {get;set;} 
    
    /**
    public String loanPurposeOfRefinanceType {get;set;} 
    public String loanSource {get;set;} 
    public String mersNumber {get;set;} 
    public String referralSource {get;set;}
    public String milestoneApprovedDueDate {get;set;} 
    public String milestoneCompletedDueDate {get;set;} 
    public String milestoneCurrentDateUtc {get;set;} 
    public String milestoneCurrentName {get;set;} 
    public String milestoneFileStartedDate {get;set;} 
    public String milestoneFundedDueDate {get;set;} 
    public String milestoneStage {get;set;} 
    public String milestoneSubmittedDueDate {get;set;} 
    public String mortgageType {get;set;} 
    public String occupancyType {get;set;} 
    public String openingDocsLoanProgramType {get;set;} 
    public String organizationCode {get;set;} 
    public String originationDate {get;set;} 
    public Boolean paymentScheduleCalcRequiredIndicator {get;set;} 
    public Boolean pmiIndicator {get;set;} 
    public String print2003Application {get;set;} 
    public String proposedMortgageInsuranceAmount {get;set;} 
    public Boolean enforceCountyLoanLimit {get;set;} 
    public String requestedInterestRatePercentUI {get;set;} 
    public String homeCounselingProvidersServiceNames {get;set;} 
    public String homeCounselingProvidersDistance {get;set;} 
    public String titleHolderName1 {get;set;} 
    public String titleHolderName2 {get;set;} 
    public Double totalClosingCostsAmount {get;set;} 
    public Double totalFeesCostAmount {get;set;} 
    public Boolean underwritingEscrowIndicator {get;set;} 
    public String usdaGovernmentLoanType {get;set;} 
    public String useNew2015FormsIndicator {get;set;} 
    public Integer currentApplicationIndex {get;set;} 
    public String interviewerEmail {get;set;} 
    public String emXmlVersionId {get;set;} 
    public Boolean currentApplicationIsPrimary {get;set;} 
    public String loanCreatedDate {get;set;} 
    public String loanIdNumber {get;set;} 
    public String initialInterestRateUI {get;set;} 
    public String systemIdGuid {get;set;} 
    public Boolean use2018DiIndicator {get;set;} 
    public String encompassVersion {get;set;} 
    
    public InternalContacts internalContact {get;set;}
    public CustomFields customField {get;set;}
    public InterimServicing interimService {get;set;}
    public underwritingConditionLogs underwritingLogs {get;set;}

    **/
    
    public EncompassJSONContactParser(JSONParser parser) {
        while (parser.nextToken() != System.JSONToken.END_OBJECT) {
            if (parser.getCurrentToken() == System.JSONToken.FIELD_NAME) {
                String text = parser.getText();
                if (parser.nextToken() != System.JSONToken.VALUE_NULL) {
                    if (text == 'encompassId') {
                        encompassId = parser.getText();
                    } else if (text == 'applications') {
                        applications = arrayOfApplications(parser);
                    } else if (text == 'applicationTakenMethodType') {
                        applicationTakenMethodType = parser.getText();
                    } else if (text == 'borrowerPaidClosingCostsAmount') {
                        borrowerPaidClosingCostsAmount = parser.getDoubleValue();
                    } else if (text == 'borrowerPaidFHAVAClosingCostsAmount') {
                        borrowerPaidFHAVAClosingCostsAmount = parser.getDoubleValue();
                    } else if (text == 'borrowerPairCount') {
                        borrowerPairCount = parser.getIntegerValue();
                    } else if ( text == 'borrowerRequestedLoanAmount' ) {
                        borrowerRequestedLoanAmount = parser.getIntegerValue();
                    } else if (text == 'cashFromToBorrowerAmount') {
                        cashFromToBorrowerAmount = parser.getDoubleValue();
                    } else if (text == 'channel') {
                        channel = parser.getText();
                    } else if (text == 'closingCostProgram') {
                        closingCostProgram = parser.getText();
                    } else if (text == 'contacts') {
                        contacts = arrayOfContacts(parser);
                    } else if (text == 'associates') {
                        associates = arrayOfAssociates(parser);
//                    } else if ( text == 'contact' ) {
//                        internalContact = new InternalContacts( parser );
                    } else if ( text == 'interimServicing' ) {
                        interimServices = arrayOfInterimServicing( parser );
                    } else if ( text == 'customFields' ) {
                        customFields = arrayOfCustomFields( parser ); 
                    } else if ( text == 'underwritingConditionLogs' ) {
                     //   underwritingConditionLogs = arrayOfUnderwritingConditionLogs( parser );
                    } else if (text == 'copyBrokerToLenderIndicator') {
                        copyBrokerToLenderIndicator = parser.getBooleanValue();
                    } else if (text == 'copyLoanNumLenderCaseNum') {
                        copyLoanNumLenderCaseNum = parser.getText();
                    } else if (text == 'currentFirstMortgageHolderType') {
                        currentFirstMortgageHolderType = parser.getText();
                    } else if (text == 'docEngine') {
                        docEngine = parser.getText();
                    } else if (text == 'estimatedClosingCostsAmount') {
                        estimatedClosingCostsAmount = parser.getDoubleValue();
                    } else if (text == 'fundingFeeList') {
                        fundingFeeList = parser.getText();
                    } else if (text == 'interviewersId') {
                    
                    /**
                        interviewersId = parser.getText();
                    } else if (text == 'inverviewerName') {
                        inverviewerName = parser.getText();
                    } else if (text == 'lenderCaseIdentifier') {
                        lenderCaseIdentifier = parser.getText();
                    } else if (text == 'referralSource') {
                        referralSource = parser.getText();
                    } else if (text == 'lenderChannel') {
                        lenderChannel = parser.getText();
                    } else if (text == 'loanAmortizationType') {
                        loanAmortizationType = parser.getText();
                    } else if (text == 'loanCreatedDateUtc') {
                        loanCreatedDateUtc = parser.getText();
                    } else if (text == 'loanNumber') {
                        loanNumber = parser.getText();
                    } else if (text == 'loanPurposeOfRefinanceType') {
                        loanPurposeOfRefinanceType = parser.getText();
                    } else if (text == 'loanSource') {
                        loanSource = parser.getText();
                    } else if (text == 'mersNumber') {
                        mersNumber = parser.getText();
                    } else if (text == 'milestoneApprovedDueDate') {
                        milestoneApprovedDueDate = parser.getText();
                    } else if (text == 'milestoneCompletedDueDate') {
                        milestoneCompletedDueDate = parser.getText();
                    } else if (text == 'milestoneCurrentDateUtc') {
                        milestoneCurrentDateUtc = parser.getText();
                    } else if (text == 'milestoneCurrentName') {
                        milestoneCurrentName = parser.getText();
                    } else if (text == 'milestoneFileStartedDate') {
                        milestoneFileStartedDate = parser.getText();
                    } else if (text == 'milestoneFundedDueDate') {
                        milestoneFundedDueDate = parser.getText();
                    } else if (text == 'milestoneStage') {
                        milestoneStage = parser.getText();
                    } else if (text == 'milestoneSubmittedDueDate') {
                        milestoneSubmittedDueDate = parser.getText();
                    } else if (text == 'mortgageType') {
                        mortgageType = parser.getText();
                    } else if (text == 'occupancyType') {
                        occupancyType = parser.getText();
                    } else if (text == 'openingDocsLoanProgramType') {
                        openingDocsLoanProgramType = parser.getText();
                    } else if (text == 'organizationCode') {
                        organizationCode = parser.getText();
                    } else if (text == 'originationDate') {
                        originationDate = parser.getText();
                    } else if (text == 'paymentScheduleCalcRequiredIndicator') {
                        paymentScheduleCalcRequiredIndicator = parser.getBooleanValue();
                    } else if (text == 'pmiIndicator') {
                        pmiIndicator = parser.getBooleanValue();
                    } else if (text == 'print2003Application') {
                        print2003Application = parser.getText();
                    } else if (text == 'profitManagement') {
                        //profitManagement = new ProfitManagement(parser);
                    } else if (text == 'proposedMortgageInsuranceAmount') {
                        proposedMortgageInsuranceAmount = parser.getText();
                    } else if (text == 'enforceCountyLoanLimit') {
                        enforceCountyLoanLimit = parser.getBooleanValue();
                    } else if (text == 'requestedInterestRatePercentUI') {
                        requestedInterestRatePercentUI = parser.getText();
                    } else if (text == 'homeCounselingProvidersServiceNames') {
                        homeCounselingProvidersServiceNames = parser.getText();
                    } else if (text == 'homeCounselingProvidersDistance') {
                        homeCounselingProvidersDistance = parser.getText();
                    } else if (text == 'titleHolderName1') {
                        titleHolderName1 = parser.getText();
                    } else if (text == 'titleHolderName2') {
                        titleHolderName2 = parser.getText();
                    } else if (text == 'totalClosingCostsAmount') {
                        totalClosingCostsAmount = parser.getDoubleValue();
                    } else if (text == 'totalFeesCostAmount') {
                        totalFeesCostAmount = parser.getDoubleValue();
                    } else if (text == 'underwritingEscrowIndicator') {
                        underwritingEscrowIndicator = parser.getBooleanValue();
                    } else if (text == 'usdaGovernmentLoanType') {
                        usdaGovernmentLoanType = parser.getText();
                    } else if (text == 'useNew2015FormsIndicator') {
                        useNew2015FormsIndicator = parser.getText();
                    } else if (text == 'currentApplicationIndex') {
                        currentApplicationIndex = parser.getIntegerValue();
                    } else if (text == 'interviewerEmail') {
                        interviewerEmail = parser.getText();
                    } else if (text == 'emXmlVersionId') {
                        emXmlVersionId = parser.getText();
                    } else if (text == 'currentApplicationIsPrimary') {
                        currentApplicationIsPrimary = parser.getBooleanValue();
                    } else if (text == 'loanCreatedDate') {
                        loanCreatedDate = parser.getText();
                    } else if (text == 'loanIdNumber') {
                        loanIdNumber = parser.getText();
                    } else if (text == 'initialInterestRateUI') {
                        initialInterestRateUI = parser.getText();
                    } else if (text == 'systemIdGuid') {
                        systemIdGuid = parser.getText();
                    } else if (text == 'use2018DiIndicator') {
                        use2018DiIndicator = parser.getBooleanValue();
                    } else if (text == 'encompassVersion') {
                        encompassVersion = parser.getText();
                    } else if (text == 'elliUCDFields') {
                        //elliUCDFields = new ElliUCDFields(parser);
                    
                    **/
                    
                    } else {
                        System.debug(LoggingLevel.WARN, 'JSON2Apex consuming unrecognized property: '+text);
                        consumeObject(parser);
                    }
                }
            }
        }
    }
   
    public class Borrower {
        public Integer ageAtApplicationYearsCount {get;set;} 
        public String altId {get;set;} 
        public String applicantType {get;set;} 
        public String birthDate {get;set;} 
        public String borrowerType {get;set;} 
        public String emailAddressText {get;set;}
        public String firstName {get;set;} 
        public String firstNameWithMiddleName {get;set;} 
        public String fullName {get;set;} 
        public String fullNameWithSuffix {get;set;} 
        public String fannieFirstName {get;set;} 
        public String hmda2003RaceNationalOriginType {get;set;} 
        public String homePhoneNumber {get;set;}
        public Boolean isBorrower {get;set;} 
        public String lastName {get;set;} 
        public String lastNameWithSuffix {get;set;} 
        public String maritalStatusType {get;set;}
        public Integer dependentCount {get;set;}
        public String dependentsAgesDescription {get;set;}
        public String mobilePhone {get;set;}
        public String priorPropertyTitleType {get;set;} 
        public String priorPropertyUsageType {get;set;} 
        public String taxIdentificationIdentifier {get;set;} 
        public String transactionPurposeDescription {get;set;} 
        public Integer validDaysForConsentCount {get;set;} 
        public String vestingTrusteeOfType {get;set;} 
        public Boolean sSA89MortgageServiceIndicator {get;set;} 
        public String hmdaAge {get;set;}
        public String hmdaGenderType {get;set;}

        public Borrower(JSONParser parser) {
            while (parser.nextToken() != System.JSONToken.END_OBJECT) {
                if (parser.getCurrentToken() == System.JSONToken.FIELD_NAME) {
                    String text = parser.getText();
                    if (parser.nextToken() != System.JSONToken.VALUE_NULL) {
                        if (text == 'ageAtApplicationYearsCount') {
                            ageAtApplicationYearsCount = parser.getIntegerValue();
                        } else if (text == 'altId') {
                            altId = parser.getText();
                        } else if (text == 'applicantType') {
                            applicantType = parser.getText();
                        } else if (text == 'birthDate') {
                            birthDate = parser.getText();
                        } else if (text == 'borrowerType') {
                            borrowerType = parser.getText();
                        } else if ( text == 'emailAddressText' ) {
                          emailAddressText = parser.getText();
                        } else if (text == 'firstName') {
                            firstName = parser.getText();
                        } else if (text == 'firstNameWithMiddleName') {
                            firstNameWithMiddleName = parser.getText();
                        } else if (text == 'fullName') {
                            fullName = parser.getText();
                        } else if (text == 'fullNameWithSuffix') {
                            fullNameWithSuffix = parser.getText();
                        } else if (text == 'fannieFirstName') {
                            fannieFirstName = parser.getText();
                        } else if (text == 'hmda2003RaceNationalOriginType') {
                            hmda2003RaceNationalOriginType = parser.getText();
                        } else if ( text == 'homePhoneNumber' ) {
                          homePhoneNumber = parser.getText();
                        } else if (text == 'isBorrower') {
                            isBorrower = parser.getBooleanValue();
                        } else if (text == 'lastName') {
                            lastName = parser.getText();
                        } else if (text == 'lastNameWithSuffix') {
                            lastNameWithSuffix = parser.getText();
                        } else if (text == 'maritalStatusType') {
                            maritalStatusType = parser.getText();
                        } else if (text == 'dependentCount') {
                            dependentCount = parser.getIntegerValue();
                        } else if (text == 'dependentsAgesDescription') {
                            dependentsAgesDescription = parser.getText();
                        } else if ( text == 'mobilePhone' ) {
                            mobilePhone = parser.getText();
                        } else if (text == 'priorPropertyTitleType') {
                            priorPropertyTitleType = parser.getText();
                        } else if (text == 'priorPropertyUsageType') {
                            priorPropertyUsageType = parser.getText();
                        } else if (text == 'taxIdentificationIdentifier') {
                            taxIdentificationIdentifier = parser.getText();
                        } else if (text == 'transactionPurposeDescription') {
                            transactionPurposeDescription = parser.getText();
                        } else if (text == 'validDaysForConsentCount') {
                            validDaysForConsentCount = parser.getIntegerValue();
                        } else if (text == 'vestingTrusteeOfType') {
                            vestingTrusteeOfType = parser.getText();
                        } else if (text == 'sSA89MortgageServiceIndicator') {
                            sSA89MortgageServiceIndicator = parser.getBooleanValue();
                        } else if (text == 'hmdaAge') {
                            hmdaAge = parser.getText();
                        } else if (text == 'hmdaGenderType') {
                            hmdaGenderType = parser.getText();
                        } else {
                            System.debug(LoggingLevel.WARN, 'Borrower consuming unrecognized property: '+text);
                            consumeObject(parser);
                        }
                    }
                }
            }
        }
    }
    
    /**
    public class virtualFields {
      public String LogMScurrentMilestone {get;set;}
      
      public virtualFields( JSONParser parser ) {
        while (parser.nextToken() != System.JSONToken.END_OBJECT) {
          if (parser.getCurrentToken() == System.JSONToken.FIELD_NAME) {
            String text = parser.getText();
            if (parser.nextToken() != System.JSONToken.VALUE_NULL) {
              if (text == 'Log.MS.currentMilestone') {   
                LogMScurrentMilestone = parser.getText();
                System.debug( LogMScurrentMilestone );
              } else {
                System.debug(LoggingLevel.WARN, 'Log.MS.currentMilestone consuming unrecognized property: '+text);
                consumeObject(parser);
              }
            }
          }
        } 
      }
    }       
    **/

    public class Contacts {
        public String id {get;set;} 
        public String contactType {get;set;} 
        public String address {get;set;} 
        public String city {get;set;} 
        public String email {get;set;} 
        public String name {get;set;} 
        public String loginId {get;set;}
        public String postalCode {get;set;} 
        public String state {get;set;} 
        public Integer contactIndex {get;set;} 
        public String companyId {get;set;} 
        public String phone {get;set;}
        public String cell {get; set;}
        public String contactName {get;set;}
        public String nmlsLicense {get;set;} 
        public Boolean addToCdContactInfo {get;set;} 
        public String clause {get;set;} 
        public String personalLicenseNumber {get; set;}
        public InternalContact contact {get;set;}
        public Contacts(JSONParser parser) {
            while (parser.nextToken() != System.JSONToken.END_OBJECT) {
                if (parser.getCurrentToken() == System.JSONToken.FIELD_NAME) {
                    String text = parser.getText();
                    if (parser.nextToken() != System.JSONToken.VALUE_NULL) {
                        if (text == 'id') {
                            id = parser.getText();
                        } else if (text == 'contactType') {
                            contactType = parser.getText();
                        } else if (text == 'address') {
                            address = parser.getText();
                        } else if (text == 'city') {
                            city = parser.getText();
                        } else if (text == 'email') {
                            email = parser.getText();
                        } else if (text == 'name') {
                            name = parser.getText();
                        } else if (text == 'contact') {
                          contact = new InternalContact( parser );
                        } else if (text == 'postalCode') {
                            postalCode = parser.getText();
                        } else if ( text == 'loginId' ) {
                          loginId = parser.getText();
                        } else if (text == 'state') {
                            state = parser.getText();
                        } else if (text == 'contactIndex') {
                            contactIndex = parser.getIntegerValue();
                        } else if (text == 'companyId') {
                            companyId = parser.getText();
                        } else if ( text == 'personalLicenseNumber' ) {
                            personalLicenseNumber = parser.getText();
                        } else if (text == 'phone') {
                            phone = parser.getText();
                        } else if (text == 'cell') {
                            cell = parser.getText();
                        } else if (text == 'contactName') {
                            contactName = parser.getText();
                        } else if (text == 'nmlsLicense') {
                            nmlsLicense = parser.getText();
                        } else if (text == 'addToCdContactInfo') {
                            addToCdContactInfo = parser.getBooleanValue();
                        } else if (text == 'clause') {
                            clause = parser.getText();
                        } else {
                            System.debug(LoggingLevel.WARN, 'Contacts consuming unrecognized property: '+text);
                            consumeObject(parser);
                        }
                    }
                }
            }
        }
    }

    public class Associates {
        public String id { get; set; }
        public String loanAssociateType { get; set; }
        public String name { get; set; }
        public String phone { get; set; }
        public String cellPhone { get; set; }
        public String fax { get; set; }
        public String email { get; set; }
        public String roleName { get; set; }
        public String roleId { get; set; }
        public Associates(JSONParser parser) {
            while (parser.nextToken() != System.JSONToken.END_OBJECT) {
                if (parser.getCurrentToken() == System.JSONToken.FIELD_NAME) {
                    String text = parser.getText();
                    if (parser.nextToken() != System.JSONToken.VALUE_NULL) {
                        if (text == 'id') {
                            id = parser.getText();
                        } else if (text == 'loanAssociateType') {
                            loanAssociateType = parser.getText();
                        } else if (text == 'name') {
                            name = parser.getText();
                        } else if (text == 'cellPhone') {
                            cellPhone = parser.getText();
                        } else if (text == 'fax') {
                            fax = parser.getText();
                        } else if (text == 'email') {
                            email = parser.getText();
                        } else if (text == 'roleName') {
                            roleName = parser.getText();
                        } else if (text == 'roleId') {
                            roleId = parser.getText();
                        } else {
                            System.debug(LoggingLevel.WARN, 'Associates consuming unrecognized property: '+text);
                            consumeObject(parser);
                        }
                    }
                }
            }
        }
    }

    public class Residences {
        public String id {get;set;} 
        public String addressCity {get;set;} 
        public String addressPostalCode {get;set;} 
        public String addressState {get;set;} 
        public String addressStreetLine1 {get;set;} 
        public String applicantType {get;set;} 
        public String residencyType {get;set;}
        public Boolean mailingAddressIndicator {get;set;}

        public Residences(JSONParser parser) {
            while (parser.nextToken() != System.JSONToken.END_OBJECT) {
                if (parser.getCurrentToken() == System.JSONToken.FIELD_NAME) {
                    String text = parser.getText();
                    if (parser.nextToken() != System.JSONToken.VALUE_NULL) {
                        if (text == 'id') {
                            id = parser.getText();
                        } else if (text == 'addressCity') {
                            addressCity = parser.getText();
                        } else if (text == 'addressPostalCode') {
                            addressPostalCode = parser.getText();
                        } else if (text == 'addressState') {
                            addressState = parser.getText();
                        } else if (text == 'addressStreetLine1') {
                            addressStreetLine1 = parser.getText();
                        } else if (text == 'applicantType') {
                            applicantType = parser.getText();
                        } else if (text == 'residencyType') {
                            residencyType = parser.getText();
                        } else if (text == 'mailingAddressIndicator') {
                            mailingAddressIndicator = parser.getBooleanValue();
                        } else {
                            System.debug(LoggingLevel.WARN, 'Residences consuming unrecognized property: '+text);
                            consumeObject(parser);
                        }
                    }
                }
            }
        }
    }

    public class Employment {
        public String id {get;set;}
        public String addressCity {get;set;}
        public String addressPostalCode {get;set;}
        public String addressState {get;set;}
        public String addressStreetLine1 {get;set;}
        public Boolean currentEmploymentIndicator {get;set;}
        public String email {get;set;}
        public String employerName {get;set;}
        public String owner {get;set;}
        public String phoneNumber {get;set;}
        public String positionDescription {get;set;}

        public Employment(JSONParser parser) {
            while (parser.nextToken() != System.JSONToken.END_OBJECT) {
                if (parser.getCurrentToken() == System.JSONToken.FIELD_NAME) {
                    String text = parser.getText();
                    if (parser.nextToken() != System.JSONToken.VALUE_NULL) {
                        if (text == 'id') {
                            id = parser.getText();
                        } else if (text == 'addressCity') {
                            addressCity = parser.getText();
                        } else if (text == 'addressPostalCode') {
                            addressPostalCode = parser.getText();
                        } else if (text == 'addressState') {
                            addressState = parser.getText();
                        } else if (text == 'addressStreetLine1') {
                            addressStreetLine1 = parser.getText();
                        } else if (text == 'mailingAddressIndicator') {
                            currentEmploymentIndicator = parser.getBooleanValue();
                        } else if (text == 'email') {
                            email = parser.getText();
                        } else if (text == 'employerName') {
                           employerName = parser.getText();
                        } else if (text == 'owner') {
                           owner = parser.getText();
                        } else if (text == 'employerName') {
                           employerName = parser.getText();
                        } else if (text == 'phoneNumber') {
                            phoneNumber = parser.getText();
                        } else if (text == 'positionDescription') {
                            positionDescription = parser.getText();
                        } else {
                            System.debug(LoggingLevel.WARN, 'Employment consuming unrecognized property: '+text);
                            consumeObject(parser);
                        }
                    }
                }
            }
        }
    }

    public class Applications {
        public String id {get;set;} 
        public String applicationId {get;set;} 
        public Integer applicationIndex {get;set;} 
        public Borrower borrower {get;set;} 
        public Coborrower coborrower {get;set;} 
        public Boolean incomeOtherThanBorrowerUsedIndicator {get;set;} 
        public Boolean jointAssetLiabilityReportingIndicator {get;set;} 
        public String propertyUsageType {get;set;} 
        public String proposedMortgageInsuranceAmount {get;set;} 
        public List<Residences> residences {get;set;}
        public List<Employment> employment {get;set;}

        public Applications(JSONParser parser) {
            while (parser.nextToken() != System.JSONToken.END_OBJECT) {
                if (parser.getCurrentToken() == System.JSONToken.FIELD_NAME) {
                    String text = parser.getText();
                    if (parser.nextToken() != System.JSONToken.VALUE_NULL) {
                        if (text == 'id') {
                            id = parser.getText();
                        } else if (text == 'applicationId') {
                            applicationId = parser.getText();
                        } else if (text == 'applicationIndex') {
                            applicationIndex = parser.getIntegerValue();
                        } else if (text == 'borrower') {
                            borrower = new Borrower(parser);
                        } else if (text == 'coborrower') {
                            coborrower = new Coborrower(parser);
                        } else if (text == 'incomeOtherThanBorrowerUsedIndicator') {
                            incomeOtherThanBorrowerUsedIndicator = parser.getBooleanValue();
                        } else if (text == 'jointAssetLiabilityReportingIndicator') {
                            jointAssetLiabilityReportingIndicator = parser.getBooleanValue();
                        } else if (text == 'propertyUsageType') {
                            propertyUsageType = parser.getText();
                        } else if (text == 'proposedMortgageInsuranceAmount') {
                            proposedMortgageInsuranceAmount = parser.getText();
                        } else if (text == 'residences') {
                            residences = arrayOfResidences(parser);
                        } else if (text == 'employment') {
                            employment = arrayOfEmployment(parser);
                        } else {
                            System.debug(LoggingLevel.WARN, 'Applications consuming unrecognized property: '+text);
                            consumeObject(parser);
                        }
                    }
                }
            }
        }
    }

    public class CustomFields {
      public String cfid {get;set;}
      public String fieldName {get;set;}
      public String stringValue {get;set;}
      //public String dateValue {get;set;}
      //public Integer numericValue {get;set;}

      public CustomFields( JSONParser parser ) {
        while (parser.nextToken() != System.JSONToken.END_OBJECT) {
          if (parser.getCurrentToken() == System.JSONToken.FIELD_NAME) {
            String text = parser.getText();
            if (parser.nextToken() != System.JSONToken.VALUE_NULL) {
              if (text == 'id') {
                cfid = parser.getText();
              } else if (text == 'fieldName') {
                fieldName = parser.getText();  
              } else if ( text == 'stringValue' ) {
                stringValue = parser.getText();
              }
            }
          }
        }
      }
    }    


    //
    // added Nov 2018    
    //
    
    /**
    
    public class underwritingConditionLogs {
      public String cleared {get;set;}
      public String dateClearedUtc {get;set;}
      public String statusDescription {get;set;}
      public String guid {get;set;}
      public String priorTo {get;set;}
      public String description {get;set;}
      public String title {get;set;}
     
      
      public underwritingConditionLogs (JSONParser parser) {
        while (parser.nextToken() != System.JSONToken.END_OBJECT) {
          if (parser.getCurrentToken() == System.JSONToken.FIELD_NAME) {
            String text = parser.getText();
            if (parser.nextToken() != System.JSONToken.VALUE_NULL) {
              if (text == 'cleared') {
                cleared = parser.getText();
              } else if (text == 'dateClearedUtc') {
                dateClearedUtc = parser.getText();  
              } else if ( text == 'statusDescription ' ) {
                statusDescription = parser.getText();
              } else if ( text == 'guid' ) {
                guid = parser.getText();
              } else if ( text == 'priorTo' ) {
                priorTo = parser.getText();
              } else if ( text == 'description' ) {
                description = parser.getText();
              } else if ( text == 'title' ) {
                title = parser.getText();
              }
            }
          }
        }
      }
    }    
    **/

    public class InternalContact {
        public String entityId { get; set; }
        public String entityType { get; set; }
        public String entityURI { get; set; }

        public InternalContact(JSONParser parser) {
            while (parser.nextToken() != System.JSONToken.END_OBJECT) {
                if (parser.getCurrentToken() == System.JSONToken.FIELD_NAME) {
                    String text = parser.getText();
                    if (parser.nextToken() != System.JSONToken.VALUE_NULL) {
                        if (text == 'entityId') {
                            entityId = parser.getText();
                        } else if (text == 'entityType') {
                            entityType = parser.getText();
                        } else if (text == 'entityUri') {
                            entityURI = parser.getText();
                        } else {
                            System.debug(LoggingLevel.WARN, 'InternalContact consuming unrecognized property: ' + text);
                            consumeObject(parser);
                        }
                    }
                }
            }
        }
    }

//
    // added Aug 2018
    //
    
    public class InterimServicing {
      public String servicerLoanNumber {get;set;}
      public String escrowBalance {get;set;}
      public String nextPaymentEscrowCityPropertyTax {get;set;}
      
      public InterimServicing (JSONParser parser) {
        while (parser.nextToken() != System.JSONToken.END_OBJECT) {
          if (parser.getCurrentToken() == System.JSONToken.FIELD_NAME) {
            String text = parser.getText();
            if (parser.nextToken() != System.JSONToken.VALUE_NULL) {
              if (text == 'servicerLoanNumber') {
                servicerLoanNumber = parser.getText();
              } else if (text == 'escrowBalance') {
                escrowBalance = parser.getText();  
              } else if ( text == 'nextPaymentEscrowCityPropertyTax' ) {
                nextPaymentEscrowCityPropertyTax = parser.getText();
              }
            }
          }
        }
      }
    }    
        
    public static EncompassJSONContactParser parse(String json) {
        System.JSONParser parser = System.JSON.createParser(json);
        return new EncompassJSONContactParser(parser);
    }
    
    public static void consumeObject(System.JSONParser parser) {
        Integer depth = 0;
        do {
            System.JSONToken curr = parser.getCurrentToken();
            if (curr == System.JSONToken.START_OBJECT || 
                curr == System.JSONToken.START_ARRAY) {
                depth++;
            } else if (curr == System.JSONToken.END_OBJECT ||
                curr == System.JSONToken.END_ARRAY) {
                depth--;
            }
        } while (depth > 0 && parser.nextToken() != null);
    }
    

    private static List<Contacts> arrayOfContacts(System.JSONParser p) {
        List<Contacts> res = new List<Contacts>();
        if (p.getCurrentToken() == null) p.nextToken();
        while (p.nextToken() != System.JSONToken.END_ARRAY) {
            res.add(new Contacts(p));
        }
        return res;
    }

    private static List<Associates> arrayOfAssociates(System.JSONParser p) {
        List<Associates> res = new List<Associates>();
        if (p.getCurrentToken() == null) p.nextToken();
        while (p.nextToken() != System.JSONToken.END_ARRAY) {
            res.add(new Associates(p));
        }
        return res;
    }

    private static List<CustomFields> arrayOfCustomFields( System.JSONParser p ) {
        List<CustomFields> res = new List<CustomFields>();
        if (p.getCurrentToken() == null) p.nextToken();
        while (p.nextToken() != System.JSONToken.END_ARRAY) {
            res.add(new CustomFields(p));
        }
        return res;
    }

    //
    // Nov 18
    //
    /**
    private static List<underwritingConditionLogs> arrayOfUnderwritingConditionLogs( System.JSONParser p ) {
      List<underwritingConditionLogs> res = new List<underwritingConditionLogs>();
      if ( p.getCurrentToken() == null ) p.nextToken();
      while ( p.nextToken() != System.JSONToken.END_ARRAY ) {
        res.add( new underwritingConditionLogs( p ));
      }
      
      return res;
    }

    **/
    
    private static List<InterimServicing> arrayOfInterimServicing( System.JSONParser p ) {
        List<InterimServicing> res = new List<InterimServicing>();
        if (p.getCurrentToken() == null) p.nextToken();
        while (p.nextToken() != System.JSONToken.END_ARRAY) {
            res.add(new InterimServicing(p));
        }
        return res;
    }

    private static List<Applications> arrayOfApplications(System.JSONParser p) {
        List<Applications> res = new List<Applications>();
        if (p.getCurrentToken() == null) p.nextToken();
        while (p.nextToken() != System.JSONToken.END_ARRAY) {
            res.add(new Applications(p));
        }
        return res;
    }

    private static List<Residences> arrayOfResidences(System.JSONParser p) {
        List<Residences> res = new List<Residences>();
        if (p.getCurrentToken() == null) p.nextToken();
        while (p.nextToken() != System.JSONToken.END_ARRAY) {
            res.add(new Residences(p));
        }
        return res;
    }

    private static List<Employment> arrayOfEmployment(System.JSONParser p) {
        List<Employment> res = new List<Employment>();
        if (p.getCurrentToken() == null) p.nextToken();
        while (p.nextToken() != System.JSONToken.END_ARRAY) {
            res.add(new Employment(p));
        }
        return res;
    }
}