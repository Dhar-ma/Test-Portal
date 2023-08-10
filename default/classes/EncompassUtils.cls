public class EncompassUtils {

    public static Account getTestAccount() {
        Account a = new Account();
        a.Name = 'Test Account';
        return a;
    }

    public static Opportunity getTestLoan( Account a ) {
        Opportunity o = new Opportunity();
        o.AccountId = a.Id;
        o.CloseDate = Date.today().addDays( 45 );
        o.Name = 'Test Opp';
        o.StageName = 'New';
        return o;

    }
    public static ResidentialLoanApplication getTestLoanApplication() {
        Account a = getTestAccount();
        insert a;
        Opportunity o = getTestLoan( a );
        insert o;

        ResidentialLoanApplication rla = new ResidentialLoanApplication();
        rla.Loan_GUID__c = '25319b36-703c-4430-a25f-166930b0acf5';
        rla.OpportunityId = o.Id;
        rla.Name = '123';
        return rla;
    }

    public static LoanApplicant getTestLoanApplicant(ResidentialLoanApplication rla, String borrowerType) {
        LoanApplicant la = new LoanApplicant();
        la.LoanApplicationId = rla.Id;
        la.BorrowerType = borrowerType;
        la.Name = 'Test-' + borrowerType;
        return la;
    }

    public static Contact getTestContact( Account a ) {
        Contact c = new Contact();
        c.FirstName = 'Test';
        c.LastName = 'Tester';
        c.Email = 'test@sampletest.com';
        c.AccountId = a.Id;
        c.Birthdate = Date.today().addDays( -2048 );
        c.Phone = '5128675309';
        return c;
    }

    public static List<SObject> dedupeList( List<SObject> objList ) {
        Set<String> s = new Set<String>();
        List<SObject> returnThese = new List<SObject>();
        Map<String, SObject> mis = new Map<String, SObject>();

        for ( SObject so : objList ) {
            System.debug( '\nEncompassUtils and ' + so.get( 'Encompass_Id__c' ) + '\n' );
            s.add( ( String )so.get( 'Encompass_Id__c' ));
            mis.put( ( String )so.get( 'Encompass_Id__c' ), so );
        }

        for ( String i : s ) {
            returnThese.add( mis.get( i ));
        }

        System.debug( returnThese );
        return returnThese;

    }

    public static Set<String> ListToSet( List<String> ls ) {
        Set<String> sSet = new Set<String>();
        for ( String s : ls ) {
            sSet.add( s );
        }
        return sSet;
    }

    public static Map<String, String> getExternalContactTypes() {
        Schema.DescribeFieldResult fieldResult = Contact.Type__c.getDescribe();
        List<Schema.PicklistEntry> pe = fieldResult.getPicklistValues();
        Map<String, String> contactTypeMap = new Map<String, String>();
        for ( Schema.PicklistEntry p : pe ) {
            contactTypeMap.put(String.valueOf(p.value), String.valueOf(p.label));
        }
        return contactTypeMap;
    }

    public static List<String> getEmailDomains() {
        Encompass_Loan_Controls__mdt setting = [SELECT Internal_Email_Domains__c FROM Encompass_Loan_Controls__mdt WHERE DeveloperName = 'Default' LIMIT 1];
        return setting.Internal_Email_Domains__c.split(',');
    }
}