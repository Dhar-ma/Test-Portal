public without sharing class ListViewController {
	
    @AuraEnabled(cacheable=true)
    public static ActionResult getApplicationList(String Communiy){ 
        try{
            List<ResidentialLoanApplication> loanApplicationList = new List<ResidentialLoanApplication>();
            if(Communiy == 'Mortgage'){
                loanApplicationList = [SELECT Id, Name, OpportunityId, Loan_Program__r.Name,
                                                                    Status, LoanPurpose, CreatedDate 
                                                                    FROM ResidentialLoanApplication 
                                                                    WHERE CreatedbyId =: UserInfo.getUserId() AND
                                                                    Loan_Program__r.Loan_Type__c = 'Mortgage Loan'
                                                                    Order by CreatedDate desc];
            }else{
                loanApplicationList = [SELECT Id, Name, OpportunityId, Loan_Program__r.Name,
                                                                    Status, LoanPurpose, CreatedDate 
                                                                    FROM ResidentialLoanApplication WHERE CreatedbyId =: UserInfo.getUserId()
                                                                    Order by CreatedDate desc];
            }
            
            System.debug('loanApplicationList: '+loanApplicationList[1].Loan_Program__r.Name);
            System.debug('Communiy: '+Communiy);
            return new ActionResult(new map<string, object>{'listApplications'=>loanApplicationList });
        }catch(Exception exec){
            System.debug(exec);
            return new ActionResult(exec);
        }
    }
}