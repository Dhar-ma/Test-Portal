({
	doInit: function(component, event, helper) {
        helper.component = component;
        component.set("v.form_data", {});
        //helper.checkUserLoggedIn(); 
    },
    
    checkEligibility: function(component, event, helper) {
        
        var valid = helper.validateEligibiltyInfo();
        if(valid){
            
            var isValidAnswers = helper.validateAnswers();
            
            component.set("v.isEligibleForLoan", isValidAnswers);
            
            component.set("v.currentStep", "step-2");
        }else{
            helper.showErrorToast('Please answer all the questions');
        }
    },
    
    cancelForm: function(component, event, helper) {
        helper.navigateToUrl('/');
    },
    
    navigateToLogin: function(component, event, helper) {
        helper.navigateToUrl('/login');
    },
    
    showNewUserForm : function(component, event, helper) {
        component.set("v.currentStep", "step-3");
    },
    
    handleNewUserSubmit: function(component, event, helper) {
        
        var valid = helper.validateContactInfo();
        if(valid){            
            helper.createNewUser();
        }else{
            helper.showErrorToast('Please enter valid data');
        }
    },
    
})