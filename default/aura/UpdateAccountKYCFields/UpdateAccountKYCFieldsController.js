({
    doInit: function(component, event, helper) {
        helper.component = component;
        var userId = $A.get("$SObjectType.CurrentUser.AccountId");
        console.log('userId :',userId);
        helper.getCurrentAccountInfo();
        component.set("v.AccountRec",{});
        component.set("v.ContactRec",{});
        component.set("v.UserRec",{});
    },
    
    UpdateKYCDetails : function(component, event, helper) {
		console.log('Success');
        helper.UpdateAccountDetails(); 
	},
    
	hideAccountForm : function(component, event, helper) {
		console.log('Success');
        component.set("v.showKYCEditForm", false); 
	},
    
    editKYCDetails: function(component, event, helper) {
    	component.set("v.showKYCEditForm", true); 
	},
    handlePersonalInterestsChange: function (component, event) {
        var selectedOptionValue = event.getParam("value");
        var account = component.get("v.AccountRec")
        account.FinServ__PersonalInterests__c = selectedOptionValue.toString();
        component.set("v.AccountRec",account);
    },
    handleFinancialInterestsChange: function (component, event) {
        var selectedOptionValue = event.getParam("value");
        var account = component.get("v.AccountRec")
        account.FinServ__FinancialInterests__c = selectedOptionValue.toString();
        component.set("v.AccountRec",account);
    },
    handleInvestmentObjectivesChange: function (component, event) {
        var selectedOptionValue = event.getParam("value");
        var account = component.get("v.AccountRec")
        account.FinServ__InvestmentObjectives__c = selectedOptionValue.toString();
        component.set("v.AccountRec",account);
    }
    
})