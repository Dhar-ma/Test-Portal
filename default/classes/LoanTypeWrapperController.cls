/**
 * @description       : 
 * @author            : 'Amol K'
 * @group             : 
 * @last modified on  : 02-03-2023
 * @last modified by  : 'Amol K'
**/
public class LoanTypeWrapperController {
    @AuraEnabled(cacheable=true)
    public static ActionResult getLoanTypes(){
        System.debug('In getLoanTypes in controller');
        try{
            return new ActionResult(new map<string, object>{
                'loanTypes'=>getPicklistValues('Loan_Program__c', 'Loan_Type__c')
                    });
            
        }catch(Exception exec){
            System.debug(exec);
            return new ActionResult(exec);
        }
    }
    
    @AuraEnabled(cacheable=true)
    public static ActionResult getInitialData(String loanApplicationId){
        System.debug('In get intialData in controller');
        ResidentialLoanApplication loanApplication = new ResidentialLoanApplication();
        
        try{
            if(loanApplicationId != NULL && !String.isBlank(loanApplicationId)){
                
                List<ResidentialLoanApplication> loanApplicationList = [SELECT Id, Name, Loan_Program__r.Loan_Type__c                                                                        
                                                                        FROM ResidentialLoanApplication
                                                                        WHERE Id = :loanApplicationId];
                
                if(loanApplicationList != null && !loanApplicationList.isEmpty()){
                    System.debug('loanApplicationList: '+loanApplicationList[0]);
                    loanApplication = loanApplicationList[0];
                } 
            }
            System.debug('loanApplication :'+loanApplication);
            return new ActionResult(new map<string, object>{'loanApplication'=>loanApplication });
            
        }catch(Exception exec){
            System.debug('Controller getInitialData Exception'+exec);
            return new ActionResult(exec);
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
        return lstPickvals;
    }
}