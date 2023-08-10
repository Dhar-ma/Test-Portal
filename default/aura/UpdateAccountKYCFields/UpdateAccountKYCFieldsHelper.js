({
    component:null,
    
    getCurrentAccountInfo : function(){
        this.component.set("v.Spinner", true);
        console.log('getInitialData - method -');
        this.callServer("getInitialData", null, false, function(response) {             
            if(!response.isSuccess) {
                console.log('error : ',response.error);
                this.showErrorToast(response.error);
                this.component.set("v.Spinner", false); 
                return;
            }
            var resultMap = response.data;
            console.log('getInitialData data from server', resultMap);
            this.component.set("v.Spinner", false); 
            this.component.set("v.AccountRec", resultMap.account);
            this.component.set("v.UserRec", resultMap.currentUser);
            if(resultMap.account.FinServ__InvestmentObjectives__c){
                this.component.set("v.SelectedInvestmentObjectives", resultMap.account.FinServ__InvestmentObjectives__c.split(","));
                console.log('SelectedInvestmentObjectives', this.component.get("v.SelectedInvestmentObjectives"));
            }
            if(resultMap.account.FinServ__PersonalInterests__c){
                this.component.set("v.SelectedPersonalInterests",resultMap.account.FinServ__PersonalInterests__c.split(","));
                console.log('SelectedPersonalInterests', this.component.get("v.SelectedPersonalInterests"));
            }
            if(resultMap.account.FinServ__FinancialInterests__c){
                this.component.set("v.SelectedFinancialInterest", resultMap.account.FinServ__FinancialInterests__c.split(","));
                console.log('SelectedFinancialInterest', this.component.get("v.SelectedFinancialInterest"));
            }
            this.component.set("v.ContactRec", resultMap.contact);
            this.component.set("v.Citizenship", resultMap.Citizenship);
            this.component.set("v.MaritalStatus", resultMap.MaritalStatus);
            this.component.set("v.TaxBracket", resultMap.TaxBracket);
            this.component.set("v.TimeHorizon", resultMap.TimeHorizon);
            this.component.set("v.RiskTolerance", resultMap.RiskTolerance);
            this.component.set("v.InvestmentExperience", resultMap.InvestmentExperience);
            if(resultMap.PersonalInterests){
                var result = resultMap.PersonalInterests;
                var PersonalInterests = [];
                for (var key in result) {
                    PersonalInterests.push({label: result[key],value: result[key]});
                }
                this.component.set("v.PersonalInterests", PersonalInterests);
            }
            if(resultMap.FinancialInterests){
                var result = resultMap.FinancialInterests;
                var FinancialInterests = [];
                for (var key in result) {
                    FinancialInterests.push({label: result[key],value: result[key]});
                }
                this.component.set("v.FinancialInterests", FinancialInterests);
            }
            if(resultMap.InvestmentObjectives){
                var result = resultMap.InvestmentObjectives;
                var InvestmentObjectives = [];
                for (var key in result) {
                    InvestmentObjectives.push({label: result[key],value: result[key]});
                }
                this.component.set("v.InvestmentObjectives", InvestmentObjectives);            }
        });

    },
    
    UpdateAccountDetails : function(){
        this.component.set("v.Spinner", true);
        var account = this.component.get("v.AccountRec");
        var userRec = this.component.get("v.UserRec");
        var contact = this.component.get("v.ContactRec");
        console.log('contact : ',JSON.stringify(contact));
       // delete account.Contacts;
        var param = {
            accountRec : JSON.stringify(account),
            contactRec : JSON.stringify(contact),
            userRec: JSON.stringify(userRec)
         };
        console.log('updateAccountKYCDetails - method -param',param);
        this.callServer("updateAccountKYCDetails", param, false, function(response) {             
            if(!response.isSuccess) {
                console.log('error : ',response.error);
                this.showErrorToast(response.error);
                this.component.set("v.Spinner", false); 
                return;
            }
            var resultMap = response.data;
            console.log('updateAccountKYCDetails data from server', resultMap);
            this.component.set("v.Spinner", false); 
            this.component.set("v.AccountRec", resultMap.account);
            this.component.set("v.showKYCEditForm", false);
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
    
    handleActionFailedState : function(errors) {
        var errorTxt;
        console.log('errors',errors);
        if(errors) {
            var errorMsgs = [];
            for(var index in errors) {
                errorMsgs.push(errors[index].message);
            }            
            errorTxt = errorMsgs.join('<br/>');
        } else {
            errorTxt = 'Something went wrong!';
        }
        console.log('\n errorTxt:', errorTxt);
        //this.showErrorToast(errorTxt);
        return errorTxt;
    },
    
	showErrorToast : function(message) {
        console.log('in showErrorToast method');
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
})