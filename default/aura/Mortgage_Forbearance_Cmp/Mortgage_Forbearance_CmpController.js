({
    doInit: function(component, event, helper) {
        component.set("v.form_data", {});
        helper.component = component;
        helper.checkUserLoggedIn(); 
    },
	
    /*handleRequestForbearance : function(component, event, helper) {
		component.set("v.currentStep", "step-2");
	},*/
    
    showEducateYourself: function(component, event, helper) {
		component.set("v.currentStep", "educate-yourself");
	},
    
    handleHomeForbearance : function(component, event, helper) {
		component.set("v.currentStep", "step-1");
	},
    
    handleSkipPaymentHomeOwner: function(component, event, helper) {
		component.set("v.currentStep", "step-3");
        component.set("v.caseRec", {Subject:'Forbearance Request',
                                    Type:'Forbearance Request', 
                                    Sub_Type__c:'Homeowner needing to skip payments'});
	},
        
    handleSubmit: function(component, event, helper) {
        
        event.preventDefault();       // stop the form from submitting
        var fields = event.getParam('fields');
        var caseRec = component.get("v.caseRec");
        fields.Current_Payment_Date__c = caseRec.Current_Payment_Date__c;
        fields.Requested_Payment_Date__c = caseRec.Requested_Payment_Date__c;
        component.find('caseEditForm').submit(fields);
        component.set("v.Spinner", true);
    },
    
    handleFormLoad: function (component, event, helper) {
        var caseRec = component.get("v.caseRec");
        component.find("subject").set("v.value", caseRec.Subject);
        component.find("type").set("v.value", caseRec.Type);
        component.find("sub_type").set("v.value", caseRec.Sub_Type__c);
        component.find("Federally_Backed_Mortgage_Type").set("v.value", caseRec.Federally_Backed_Mortgage_Type__c);
        component.set('v.showSubtype', true);      
    },
        
    handleCaseSaveSuccess: function(component, event, helper) {
        component.set("v.Spinner", false);
        var updatedRecord = JSON.parse(JSON.stringify(event.getParams().response));
        console.log('onsuccess: ', updatedRecord.id);
        if(updatedRecord.id){
            //helper.showToast('success', 'Your request has been submitted successfully!');
            component.set("v.showSuccessMessage", true);
        }        
    },
    
    onerror: function(component, event, helper) {
        component.set("v.Spinner", false);
    },
    
    closeSuccessMessage: function(component, event, helper) {
        component.set("v.currentStep", "step-1");
        component.set("v.form_data", {});
        component.set("v.showSuccessMessage", false);
    },
    
})