({
    component:null,
    
    checkUserLoggedIn : function() {        
        this.component.set("v.Spinner", true);  
        
        this.callServer("checkUserType", null, false, function(response) {             
            if(!response.isSuccess) {
                this.showErrorToast(response.error);
                this.component.set("v.Spinner", false); 
                return;
            }
            var resultMap = response.data;
            console.log('data from server', resultMap);
            if(resultMap.isLoggedIn){
                this.navigateToUrl('/my-applications');
            }
            this.component.set("v.Spinner", false);
        });
    },

    
    validateEligibiltyInfo: function() {        
        var valid = this.component.find('eligibilty-form').reduce(function (validSoFar, inputCmp) {
            // Displays error messages for invalid fields
            inputCmp.showHelpMessageIfInvalid();
            return validSoFar && inputCmp.get('v.validity').valid;
        }, true);
        return valid;
    },
    
    validateContactInfo : function() {        
        var valid = this.component.find('user-form').reduce(function (validSoFar, inputCmp) {
            // Displays error messages for invalid fields
            console.log('validateContactInfo valid : ',valid);
            inputCmp.showHelpMessageIfInvalid();
            return validSoFar && inputCmp.get('v.validity').valid;
        }, true);
        return valid;
    },
    
    validateAnswers: function() {        
        var form_data = this.component.get("v.form_data");
        
        if(form_data.q1 == 'Yes' || form_data.q2 == 'Yes' || form_data.q3 == 'Yes' || form_data.q4 == 'Yes'){
            return false;
        }
        
        return true;
    },
    
    navigateToUrl: function(url) {        
        var urlEvent = $A.get("e.force:navigateToURL");
        urlEvent.setParams({
            "url": url
        });
        urlEvent.fire();
    },
    
    createNewUser : function(contactRec) {        
        this.component.set("v.Spinner", true);  
        
        var form_data = this.component.get("v.form_data");  
        
        var contact = {
            FirstName : form_data.FirstName,
            LastName : form_data.LastName,
            Email : form_data.Email,
            MobilePhone : form_data.MobilePhone,
            Birthdate : form_data.Birthdate,
            Social_Security_Number__c : form_data.Social_Security_Number__c
        };
        /*var account = {
            Name : form_data.businessName,
            BillingPostalCode : form_data.businessZipcode,
            Phone : form_data.businessPhoneNumber
        };*/
        
        var param ={
            contactStr : JSON.stringify(contact),
            //accountStr : JSON.stringify(account)
        };
        
        this.callServer("createNewUser", param, false, function(response) {
            console.log('create user response : ',response);
            if(!response.isSuccess) {
                //this.showErrorToast(response.error);
                this.component.set("v.currentStep", "step-5");
                this.component.set("v.errorMsg", response.error);
                this.component.set("v.Spinner", false); 
                return;
            }
            var resultMap = response.data;
            console.log('data from server', resultMap);
            
            this.component.set("v.currentStep", "step-4");
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
        console.log('in showErrorToast method');
        this.showToast("error", message);
    },
    
    showToast : function(toastType, message) {
        console.log('In show toast');
        
        //var toastEvent = $A.get("e.force:showToast");
        //console.log('toastEvent',toastEvent);
        debugger;
        var toastTitle = toastType == "success" ? "Success!" : "Error!";
        console.log('toastType : ',toastType);
        console.log('toastTitle : ',toastTitle);
        console.log('message : ',message);
        /*toastEvent.setParams({
            Type : toastType,
            title: toastTitle,            
            message: message
        });
        toastEvent.fire();*/
        component.find('notifLib').showToast({
            "title": toastTitle,
            "message": message
        });
        
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
})