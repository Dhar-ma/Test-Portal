({
	doInit: function(component, event, helper) {
        console.log('New Application Form');
        helper.component = component;
        
        component.set("v.Yes_No_options", [
            {'label': 'Yes', 'value': 'Yes'},
            {'label': 'No', 'value': 'No'}
        ]);
        
        component.set("v.purposeOfLoanoptions", [
            {'label': 'Payroll', 'value': 'Payroll'},
            {'label': 'Lease Mortgage Interest', 'value': 'Lease Mortgage Interest'},
            {'label': 'Utilities', 'value': 'Utilities'},
            {'label': 'Other', 'value': 'Other'}
        ]);
        
        var loanProgramId = 'a105w000007scsC';
        
        component.set("v.LoanApplication", {Purpose_of_Loan: '', Loan_Program__c:loanProgramId,
                                            Status__c:'Incomplete'});        
        component.set("v.CertificationAndAuthRec", {});        
        
        var recordId = helper.getURLParameter('id');
        console.log('New Application Form recordId : ',recordId);
        if(recordId){
            helper.loadLoanApplicationData(recordId);
        }else{
             helper.loadInitialData(loanProgramId);
            component.set("v.showFormTypeSelector", true);
        }     
    },
    
    handleBusinessAccountChange: function(component, event, helper) {
        var selectedBusinessInfoAccountId = component.get("v.selectedBusinessInfoAccountId")
        if(selectedBusinessInfoAccountId){
            helper.getBusinessInfoAccount(selectedBusinessInfoAccountId);
        }else{
            component.set("v.businessInfoAccount", {});        
        }
    },
    
    handleContactChange: function(component, event, helper) {
        var selectedBusinessOwnerContactId = component.get("v.selectedBusinessOwnerContactId")
        if(selectedBusinessOwnerContactId){
            helper.getContactInfo(selectedBusinessOwnerContactId);
        }else{
            component.set("v.OwnerRec", {});        
        }
    },
    
    showApplicationQuestionTab: function(component, event, helper) {
        
        var checked = component.find("read-me").get("v.checked");
        if(checked){
            component.set("v.currentTab", "1");
        }else{
            helper.showErrorToast('Please read instruction and mark the checkbox');
        }        
    },
    
    checkEligibility: function(component, event, helper) {
        var valid = helper.validateEligibiltyInfo();        
        if(valid){  
            var isValidAnswers = helper.validateEligibilityAnswers();
            
            if(!isValidAnswers){
                component.set("v.isEligibleForLoan", false);
            }else{
                helper.saveLoanApplicationData(component.get("v.LoanApplication"), "2", null);
            }            
        }else{
            helper.showErrorToast('Please answer all the questions');
        }
    },
    
    saveAccountInfo: function(component, event, helper) {
        var valid = helper.validateAccountInfo();        
        if(valid){            
            helper.saveAccountData(component.get("v.businessInfoAccount"), "3");
        }else{
            helper.showErrorToast('Please correct/enter all required fields');
        }
    },
    
    showNewContactForm: function(component, event, helper) {
        component.set("v.OwnerRec", {});
        component.set("v.selectedBusinessOwnerContactId", '');        
        component.set("v.showContactForm", true);
    },
    
    editContactForm: function(component, event, helper) {
        
        var selectedItem = event.currentTarget.dataset.row;
        console.log('selectedItem', selectedItem);
        if(selectedItem){
            var listOwners = component.get("v.listOwners");
            component.set("v.OwnerRec", listOwners[selectedItem]);
            component.set("v.selectedBusinessOwnerContactId", listOwners[selectedItem].Contact__r.Id);
            component.set("v.showContactForm", true);
        }
    },
    
    saveOwnerForm: function(component, event, helper) {
        
        var valid = helper.validateContactInfo();        
        if(valid){            
            var ownerRec = component.get("v.OwnerRec");
            ownerRec.Loan_Application__c = component.get("v.LoanApplication").Id;
            helper.saveOwnerData(ownerRec);
        }else{
            helper.showErrorToast('Please correct/enter all required fields');
        }
    },
    
    hideContactForm: function(component, event, helper) {        
       component.set("v.showContactForm", false);
    },
    
    cancelForm : function(component, event, helper) {
        helper.navigateToUrl('/my-applications');
    },
    
    validateOwnersInfo: function(component, event, helper) {
        var valid = helper.validateOwnersInfo();        
        if(valid){            
            component.set("v.currentTab", "4");
        }else{
            helper.showErrorToast('All business owners added must have 90 or higher percent of total ownership of business')
        }
    },
    
    saveLoanInfo: function(component, event, helper) {
        
        var valid = helper.validateLoanAppInfo();        
        if(valid){            
            var loanApplication = component.get("v.LoanApplication");            
            console.log('LoanApplication', JSON.stringify(loanApplication));
            helper.saveLoanApplicationData(loanApplication, "5", null);
        }else{
            helper.showErrorToast('Please correct/enter all required fields')
        }
    },
    
    submitApplication: function(component, event, helper) {
        
        var valid = helper.validateCertificationInfo();        
        if(valid){
            var certificationAndAuthRec =  component.get("v.CertificationAndAuthRec");
            var loanApplication = component.get("v.LoanApplication");  
            certificationAndAuthRec.Loan_Application__c = loanApplication.Id;
            helper.saveCertificationInfo(certificationAndAuthRec);
        }else{
            helper.showErrorToast('Please correct/enter all required fields')
        }
        
    },
        
    showCalulator:function(component, event, helper) {
        component.set("v.showCalulator", true);
    },
    
    hideCalulator:function(component, event, helper) {
        component.set("v.showCalulator", false);
    },
    
    getCalculatedValues:function(component, event, helper) {
        var objChild = component.find('calcComp');
        var average_Monthly_Payroll_Costs = objChild.get("v.average_Monthly_Payroll_Costs");
        var total_Estimated_Requested_Loan_Amount = objChild.get("v.total_Estimated_Requested_Loan_Amount");
        console.log('average_Monthly_Payroll_Costs', average_Monthly_Payroll_Costs);
        console.log('total_Estimated_Requested_Loan_Amount', total_Estimated_Requested_Loan_Amount);

        component.set("v.LoanApplication.Average_Monthly_Payroll__c",parseFloat(average_Monthly_Payroll_Costs).toFixed(2) );
        
        if(total_Estimated_Requested_Loan_Amount < 10000000){
            component.set("v.LoanApplication.Loan_Request_Amount__c", parseFloat(total_Estimated_Requested_Loan_Amount).toFixed(2));
        }else{
             component.set("v.LoanApplication.Loan_Request_Amount__c", 10000000);
        }
        
        
        component.set("v.showCalulator", false);
    },
    
    setCertificationTab:function(component, event, helper) {
        component.set("v.currentTab", "6");
    },
    
    checkApplicationType:function(component, event, helper) {
        var loantype = component.find("loan-type").get("v.value");
        if(loantype === 'Paycheck Protection Program'){
            component.set("v.showFormTypeSelector", false);
        }
    },
    closeSelectApplicationType:function(component, event, helper) {
        component.set("v.showFormTypeSelector", false);
    },

})