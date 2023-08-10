public without sharing class UserAccountController {
	
    @AuraEnabled
    public static ActionResult getInitialData(){
        try{
            User currentUser = [SELECT Id, AccountId, ContactId, AboutMe FROM User 
                                WHERE Id = :UserInfo.getUserId()];
            
            Account account = [SELECT Id, FinServ__PersonalInterests__c,
                               FinServ__FinancialInterests__c, FinServ__InvestmentExperience__c,
                               FinServ__NetWorth__c, FinServ__TimeHorizon__c,
                               FinServ__InvestmentObjectives__c, FinServ__RiskTolerance__c
                               FROM Account WHERE Id = :currentUser.AccountId];
            
            Contact contact = [SELECT Id, FinServ__PrimaryCitizenship__c, 
                               FinServ__CountryOfBirth__c, FinServ__SecondaryCitizenship__c,
                               FinServ__MaritalStatus__c,FinServ__TaxBracket__c, FinServ__WeddingAnniversary__c,
                               FinServ__LastFourDigitSSN__c, FinServ__Occupation__c, FinServ__TaxId__c,
                               FinServ__NumberOfDependents__c, FinServ__LanguagesSpoken__c
                               FROM Contact WHERE Id = :currentUser.ContactId];
            
            return new ActionResult(new map<string, object>{'account'=>account,
                'contact'=>contact,'currentUser'=>currentUser,
                'Citizenship'=>getPicklistValues('Account', 'FinServ__PrimaryCitizenship__pc'),
                'PersonalInterests'=>getPicklistValues('Account', 'FinServ__PersonalInterests__c'),
                'FinancialInterests'=>getPicklistValues('Account', 'FinServ__FinancialInterests__c'),
                'MaritalStatus'=>getPicklistValues('Account', 'FinServ__MaritalStatus__pc'),
                'TaxBracket'=>getPicklistValues('Account', 'FinServ__TaxBracket__pc'),
                'InvestmentExperience'=>getPicklistValues('Account', 'FinServ__InvestmentExperience__c'),
                'InvestmentObjectives'=>getPicklistValues('Account', 'FinServ__InvestmentObjectives__c'),
                'TimeHorizon'=>getPicklistValues('Account', 'FinServ__TimeHorizon__c'),
                'RiskTolerance'=>getPicklistValues('Account', 'FinServ__RiskTolerance__c')});
            
        }catch(Exception ex){
            System.debug('UserAccountController getInitialData Exception'+ex);
            return new ActionResult(ex);
        }
    }
    
    @AuraEnabled
    public static ActionResult updateAccountKYCDetails(String accountRec,String contactRec, String userRec){
       	                                     
        try{
            System.debug('accountRec :: '+accountRec);
            Account personAccount = (Account) Json.deserialize(accountRec, Account.class);
            System.debug('personAccount before upsert:'+personAccount);
            upsert personAccount;
            
            System.debug('contactRec :: '+contactRec);
            Contact personContact = (Contact) Json.deserialize(contactRec, Contact.class);
            System.debug('personContact before upsert:'+personContact);
            upsert personContact;
            
            System.debug('userRec :: '+userRec);
            User currentUser = (User) Json.deserialize(userRec, User.class);
            System.debug('currentUser before upsert:'+currentUser);
            update currentUser;
            
            return new ActionResult(new map<string, object>{'account'=>personAccount, 'contact'=>personContact,
                'currentUser'=>currentUser});
        }catch(Exception ex){
            System.debug('UserAccountController getInitialData Exception'+ex);
            return new ActionResult(ex);
        }
    }
    
    public static List<String> getPicklistValues(String ObjectApi_name,String Field_name){ 
        
        List<String> lstPickvals=new List<String>();
        Schema.SObjectType targetType = Schema.getGlobalDescribe().get(ObjectApi_name);
        Sobject Object_name = targetType.newSObject();
        Schema.sObjectType sobject_type = Object_name.getSObjectType(); 
        Schema.DescribeSObjectResult sobject_describe = sobject_type.getDescribe(); 
        Map<String, Schema.SObjectField> field_map = sobject_describe.fields.getMap(); 
        List<Schema.PicklistEntry> pick_list_values = field_map.get(Field_name).getDescribe().getPickListValues(); 
        for (Schema.PicklistEntry a : pick_list_values) { 
            lstPickvals.add(a.getValue());
        }
		System.debug('lstPickvals : '+lstPickvals);        
        return lstPickvals;
    }
}