public without sharing class Branch_Selection_View_Controller {

     @AuraEnabled
    public static ActionResult getInitialData(){ 
        try{
            
            Map<string, object> resultData = new Map<string, object>();
            
            User currentUser = [SELECT Id, Name, ContactId, Contact.Preferred_Branch__c                               
                                FROM User WHERE Id=: UserInfo.getUserId()];
            
            if(currentUser.ContactId != null && currentUser.Contact.Preferred_Branch__c != null){
                return getBranchInfoAccount(currentUser.Contact.Preferred_Branch__c);
            }
            String groupTypeId = getWorkGroupTypeId();
            resultData.put('groupTypeId', groupTypeId);
            return new ActionResult(resultData);
        }catch(Exception exec){
            System.debug(exec);
            return new ActionResult(exec);
        }
    }
    
    public static String getWorkGroupTypeId(){
        
        Branch_Selection_Group_Type_Id__mdt[] Community_List = [SELECT MasterLabel, QualifiedApiName, Group_Type_Id__c 
                                                            FROM Branch_Selection_Group_Type_Id__mdt];
        if(!Community_List.isEmpty()){
            return Community_List[0].Group_Type_Id__c;
        }
        return null;
    }
    @AuraEnabled(cacheable=true)
    public static ActionResult getBranchInfoAccount(string branchId){ 
        try{
            
            Map<string, object> resultData = new Map<string, object>();
            
            User currentUser = [SELECT Id, Name, ContactId, Contact.Preferred_Branch__c                               
                                FROM User WHERE Id=: UserInfo.getUserId()];
            
            if(currentUser.ContactId != null){
                Contact contactRec = new Contact(Id = currentUser.ContactId);
                if(currentUser.Contact.Preferred_Branch__c != branchId){
                    contactRec.Preferred_Branch__c = branchId;
                    update contactRec;
                }
            }
            System.debug('Branch_Selection_View_Controller resultData:'+resultData);
            Account account = [SELECT Id, Name, 
                               Primary_Contact_1__c, Primary_Contact_1__r.FirstName, Primary_Contact_1__r.LastName,
                               Primary_Contact_1__r.Title, Primary_Contact_1__r.Email, Primary_Contact_1__r.MediumPhotoUrl,
                               Primary_Contact_2__c, Primary_Contact_2__r.FirstName, Primary_Contact_2__r.LastName,
                               Primary_Contact_2__r.Title, Primary_Contact_2__r.Email, Primary_Contact_2__r.MediumPhotoUrl,
                               Primary_Contact_3__c, Primary_Contact_3__r.FirstName, Primary_Contact_3__r.LastName,
                               Primary_Contact_3__r.Title, Primary_Contact_3__r.Email, Primary_Contact_3__r.MediumPhotoUrl,
                               Primary_Contact_4__c, Primary_Contact_4__r.FirstName, Primary_Contact_4__r.LastName,
                               Primary_Contact_4__r.Title, Primary_Contact_4__r.Email, Primary_Contact_4__r.MediumPhotoUrl,
								BillingStreet, BillingCity, BillingState, BillingPostalCode, BillingCountry                               
                               FROM Account WHERE Id=: branchId];
            
            resultData.put('account', account); 
            String groupTypeId = getWorkGroupTypeId();
            resultData.put('groupTypeId', groupTypeId);
            return new ActionResult(resultData);
        }catch(Exception exec){
            System.debug(exec);
            return new ActionResult(exec);
        }
    }
}