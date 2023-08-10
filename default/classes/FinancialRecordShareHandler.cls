public class FinancialRecordShareHandler{
    
    public static void shareFinancialAccounts(List<FinServ__FinancialAccount__c> lstFinancialAccounts){
        
        Set<Id> setAccountIds = new Set<Id>();
        
        for(FinServ__FinancialAccount__c finAcc :lstFinancialAccounts){
            
            setAccountIds.add(finAcc.FinServ__PrimaryOwner__c);
        }
        
        Map<Id,Id> mapAccountId_UserId = getUserRecords(setAccountIds);
        List<FinServ__FinancialAccount__share> lstAccountShares = new List<FinServ__FinancialAccount__share>();
        
        for(FinServ__FinancialAccount__c finAcc :lstFinancialAccounts){
            
            //create sharing records
            if(mapAccountId_UserId.containsKey(finAcc.FinServ__PrimaryOwner__c)){
                
                lstAccountShares.add(new FinServ__FinancialAccount__share(
                    
                    ParentId = finAcc.Id,
                    UserOrGroupId = mapAccountId_UserId.get(finAcc.FinServ__PrimaryOwner__c),
                    AccessLevel = 'Read',
                    RowCause = Schema.FinServ__FinancialAccount__share.RowCause.Manual
                ));
            }
        }
        
        if(!lstAccountShares.isEmpty()){
            try{
                Database.insert(lstAccountShares,false);
            }
            catch(Exception e){
                System.debug(e.getMessage());
            }
        }
    }
    
    public static void shareFinancialGoals(List<FinServ__FinancialGoal__c> lstFinancialGoals){
        
        Set<Id> setAccountIds = new Set<Id>();
        
        for(FinServ__FinancialGoal__c finGoal :lstFinancialGoals){
            
            setAccountIds.add(finGoal.FinServ__PrimaryOwner__c);
        }
        
        Map<Id,Id> mapAccountId_UserId = getUserRecords(setAccountIds);
        List<FinServ__FinancialGoal__share> lstGoalShares = new List<FinServ__FinancialGoal__share>();
        
        for(FinServ__FinancialGoal__c finGoal :lstFinancialGoals){
            
            //create sharing records
            if(mapAccountId_UserId.containsKey(finGoal.FinServ__PrimaryOwner__c)){
                
                lstGoalShares.add(new FinServ__FinancialGoal__share(
                    
                    ParentId = finGoal.Id,
                    UserOrGroupId = mapAccountId_UserId.get(finGoal.FinServ__PrimaryOwner__c),
                    AccessLevel = 'Read',
                    RowCause = Schema.FinServ__FinancialGoal__share.RowCause.Manual
                ));
            }
        }
        
        if(!lstGoalShares.isEmpty()){
            try{
                Database.insert(lstGoalShares,false);
            }
            catch(Exception e){
                System.debug(e.getMessage());
            }
        }
    }
    
    public static Map<Id,Id> getUserRecords(Set<Id> setAccountIds){
    
        Map<Id,Id> mapAccountId_UserId = new Map<Id,Id>();
        
        List<Contact> lstRelatedContacts = [SELECT Id, AccountId,
                                            (SELECT Id FROM Users)
                                            FROM Contact
                                            WHERE AccountId IN :setAccountIds];
        
        if(!lstRelatedContacts.isEmpty()){
            
            for(Contact contactRec :lstRelatedContacts){
                
                if(!contactRec.Users.isEmpty()){
                    
                    mapAccountId_UserId.put(contactRec.AccountId, contactRec.Users[0].Id);
                }
            }
        }
        
        return mapAccountId_UserId;
    }
}