({	
    component:null,
    getLoanType : function() {
        
        this.component.set("v.Spinner", true);  
        console.log('getLoanType');
        this.callServer("getLoanTypes", null, false, function(response) {             
            if(!response.isSuccess) {
                this.showErrorToast(response.error);
                this.component.set("v.Spinner", false); 
                return;
            }
            var resultMap = response.data;
            console.log('resultMap : ',JSON.stringify(resultMap));
            this.component.set("v.LoanTypes",resultMap.loanTypes);
            this.component.set("v.Spinner", false);
        });
        
    },
    
    getCosumerType : function(loanApplicantId) {
        console.log('getCosumerType');
        this.component.set("v.Spinner", true);
        var param ={
            loanApplicationId : loanApplicantId
        };
        this.callServer("getInitialData", param, false, function(response) {             
            if(!response.isSuccess) {
                this.showErrorToast(response.error);
                this.component.set("v.Spinner", false); 
                return;
            }
            var resultMap = response.data;
            console.log('Loan_Type__c : ',resultMap.loanApplication);
            console.log('resultMap : ',JSON.stringify(resultMap));
            this.component.set("v.showSelectLoanType",false);
            if(resultMap.loanApplication.Loan_Program__r){
                this.component.set("v.selectedLoanType",resultMap.loanApplication.Loan_Program__r.Loan_Type__c);
                this.component.set("v.showLoanType",true);
                
            }
            if(Object.keys(resultMap.loanApplication).length === 0){
                this.component.set("v.showSelectLoanType",true);
            }
            this.component.set("v.Spinner", false);
        });
    },
    
    callServer : function(apexMethod, params, cacheable, callback) {        
        var method = "c." + apexMethod;
        var action = this.component.get(method);
        
        if(params) {
            action.setParams(params);
        }
        
        if(cacheable) {
            action.setStorable();
        }
        action.setCallback(this, function(response) {
            var state = response.getState(); 
            
            if(state === "SUCCESS") {
                callback.call(this, response.getReturnValue())
            } else if(state === "ERROR") {
                this.handleActionFailedState( response.getError());
                this.component.set("v.Spinner", false);
            }
        });
        $A.enqueueAction(action);
    },    
    
    showErrorToast : function(message) {
        this.showToast("error", message);
    },
    
    showToast : function(toastType, message) {
        var toastEvent = $A.get("e.force:showToast");
        var toastTitle = toastType == "success" ? "Success!" : "Error!";
        toastEvent.setParams({
            "type" : toastType,
            "title": toastTitle,            
            "message": message,
            "duration": 8000
        });
        toastEvent.fire();
    },
    
    getURLParameter: function(param) {        
        var sPageURL = decodeURIComponent(window.location.search.substring(1)); //You get the whole decoded URL of the page.
        var sURLVariables = sPageURL.split('&'); //Split by & so that you get the key value pairs separately in a list
        var sParameterName;
        var i;
        var value = '';
        for (i = 0; i < sURLVariables.length; i++) {
            sParameterName = sURLVariables[i].split('='); //to split the key from the value.
            
            if (sParameterName[0] === param) { //lets say you are looking for param name - firstName
                value = sParameterName[1];
            }
        }
        console.log('Param value'+value);
        return value;
    },
})