({
    component:null,
    
    getInitialData: function() {        
        this.component.set("v.Spinner", true);  
        
        this.callServer("getInitialData", null, false, function(response) {             
            if(!response.isSuccess) {
                this.showErrorToast(response.error);
                this.component.set("v.Spinner", false); 
                return;
            }
            var resultMap = response.data;
            console.log('data from server branch selection : ', JSON.stringify(resultMap));
            if(resultMap.account){

                this.component.set("v.selectedBranch", this.setContactNames(resultMap.account));
                this.component.set("v.selectedBranchId", resultMap.account.Id);
                this.component.set("v.showdata", true);
            }
            this.component.set("v.groupTypeId", resultMap.groupTypeId);
            //this.component.set("v.showdata", true);
            this.component.set("v.Spinner", false);
        });
    },

    setContactNames :function(account) {
        if(account.Primary_Contact_1__c) {
            account.Primary_Contact_1__r.Name = account.Primary_Contact_1__r.FirstName +' ' + account.Primary_Contact_1__r.LastName;
        }
        if(account.Primary_Contact_2__c) {
            account.Primary_Contact_2__r.Name = account.Primary_Contact_2__r.FirstName +' ' + account.Primary_Contact_2__r.LastName;
        }
        if(account.Primary_Contact_3__c) {
            account.Primary_Contact_3__r.Name = account.Primary_Contact_3__r.FirstName +' ' + account.Primary_Contact_3__r.LastName;
        }
        if(account.Primary_Contact_4__c) {
            account.Primary_Contact_4__r.Name = account.Primary_Contact_4__r.FirstName +' ' + account.Primary_Contact_4__r.LastName;
        }
        return account;
    },
    
    getBranchInfoAccount : function(selectedBranchId) {        
        //this.component.set("v.Spinner", true);  
        console.log('getBranchInfoAccount');
        var param={
            branchId: selectedBranchId
        };
        this.callServer("getBranchInfoAccount", param, false, function(response) {             
            if(!response.isSuccess) {
                console.log('server error');
                this.showErrorToast(response.error);
                this.component.set("v.Spinner", false); 
                return;
            }
            var resultMap = response.data;
            console.log('data from server', resultMap)
            this.component.set("v.selectedBranch", this.setContactNames(resultMap.account));
            this.component.set("v.Spinner", false);
            this.component.set("v.showdata", true);
        });
    },
    
    
    callServer : function(apexMethod, params, cacheable, callback) {
		console.log('in call server');        
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
    
    initiateFlow : function(component) {
        console.log('initiateFlow');
        var inputVariables = [
            {
                name : 'workGroupType',
                type : 'String',
                value : component.get("v.groupTypeId")//'0VS5w000000YqFMGA0'
            }
        ];
        component.set("v.isFlowOpen",true);
        var flow = component.find("flowData");
        flow.startFlow("Get_Account_From_Service_Territory",inputVariables);
    },

    getContext:function(component,event,helper) {
        if($A.get("$Browser.formFactor") == 'PHONE' || $A.get("$Browser.isTablet")) {
            component.set("v.isMobile", true);
        }
    },
})