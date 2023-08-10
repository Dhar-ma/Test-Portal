({
    component:null,
    
    loadInitialData : function(loanProgramId) {        
        this.component.set("v.Spinner", true);  
        
        var param={
            loanProgramId:loanProgramId
        };
        console.log('loadInitialData param : ',param);
        this.callServer("getInitialData", param, false, function(response) {             
            if(!response.isSuccess) {
                this.showErrorToast(response.error);
                this.component.set("v.Spinner", false); 
                return;
            }
            var resultMap = response.data;
            console.log('data from server', resultMap);
            this.component.set("v.currentUserId", resultMap.currentUser.Id);
            this.component.set("v.currentUserAccountId", resultMap.currentUserAccount.Id);            
            this.component.set("v.businessInfoAccount", resultMap.currentUserAccount);
            this.component.set("v.selectedBusinessInfoAccountId", resultMap.currentUserAccount.Id);
            this.component.set("v.statusOption", resultMap.statusOption);
            this.component.set("v.requiredDocumentIds", resultMap.requiredDocumentIds);
            
            this.component.set("v.listOwners", [
                {Contact__r: resultMap.currentUserContact}]);
            
            this.component.set("v.Spinner", false);
        });
    },
    
     loadLoanApplicationData : function(recordId) {        
        this.component.set("v.Spinner", true);  
         var param = {
             recordId : recordId
         };
        this.callServer("getLoanApplicationData", param, false, function(response) {             
            if(!response.isSuccess) {
                this.showErrorToast(response.error);
                this.component.set("v.Spinner", false); 
                return;
            }
            var resultMap = response.data;
            console.log('data from server', resultMap);
            this.component.set("v.currentUserId", resultMap.currentUser.Id);
            this.component.set("v.currentUserAccountId", resultMap.currentUserAccount.Id);            
            
            if(resultMap.loanApp.Purpose_of_Loan__c){
                resultMap.loanApp.Purpose_of_Loan = resultMap.loanApp.Purpose_of_Loan__c.split(';');
            }else{
                resultMap.loanApp.Purpose_of_Loan = '';
            }         
            
            this.component.set("v.LoanApplication", resultMap.loanApp);
            this.component.set("v.statusOption", resultMap.statusOption);  
            this.component.set("v.requiredDocumentIds", resultMap.requiredDocumentIds);
            //this.component.set("v.businessInfoAccount", resultMap.currentUserAccount);
            this.component.set("v.selectedBusinessInfoAccountId", resultMap.loanApp.Account__c);
                        
            this.component.set("v.listOwners", resultMap.listOwners);
            this.component.set("v.CertificationAndAuthRec",resultMap.certificationAndAuthRec);
             
            this.component.set("v.Spinner", false);
            this.component.find("read-me").set("v.checked", true);
        });
    },
    
    getBusinessInfoAccount : function(selectedBusinessInfoAccountId) {        
        this.component.set("v.Spinner", true);  
        var param ={
            accountId :selectedBusinessInfoAccountId
        };
        this.callServer("getBusinessInfo", param, false, function(response) {             
            if(!response.isSuccess) {
                this.showErrorToast(response.error);
                this.component.set("v.Spinner", false); 
                return;
            }
            var resultMap = response.data;
            console.log('data from server', resultMap);   
            if( selectedBusinessInfoAccountId == resultMap.account.Id){
                this.component.set("v.businessInfoAccount", resultMap.account);
            }            
            this.component.set("v.Spinner", false);
        });
    },
    
    getContactInfo : function(contactId) {        
        this.component.set("v.Spinner", true);  
        var param ={
            contactId :contactId
        };
        this.callServer("getContactInfo", param, false, function(response) {             
            if(!response.isSuccess) {
                this.showErrorToast(response.error);
                this.component.set("v.Spinner", false); 
                return;
            }
            var resultMap = response.data;
            console.log('data from server', resultMap);   
            if( contactId == resultMap.contact.Id){
                this.component.set("v.OwnerRec.Contact__r", resultMap.contact);
                this.component.set("v.OwnerRec.Contact__c", resultMap.contact.Id);
            }            
            this.component.set("v.Spinner", false);
        });
    },
    
    saveLoanApplicationData : function(loanApplication, tabToSet, callback) {        
        this.component.set("v.Spinner", true);  
        
        if(loanApplication.Purpose_of_Loan){
            loanApplication.Purpose_of_Loan__c = loanApplication.Purpose_of_Loan.join(';');
            delete loanApplication.Purpose_of_Loan;
        }
        var fetchDocumentIds = false;
        if(!loanApplication.Id){
            fetchDocumentIds = true;
        }
        
        var param ={
            loanApplicationStr : JSON.stringify(loanApplication)
        };
        console.log('saveLoanApplicationData - param -', param);
        this.callServer("saveLoanApplicationData", param, false, function(response) {             
            if(!response.isSuccess) {
                this.showErrorToast(response.error);
                this.component.set("v.Spinner", false); 
                return;
            }
            var resultMap = response.data;
            console.log('data from server', resultMap);
            
            if(resultMap.loanApp.Purpose_of_Loan__c){
                resultMap.loanApp.Purpose_of_Loan = resultMap.loanApp.Purpose_of_Loan__c.split(';');
            }else{
                resultMap.loanApp.Purpose_of_Loan = '';
            }   
            this.component.set("v.LoanApplication",resultMap.loanApp);
            if(tabToSet){
                this.component.set("v.currentTab", tabToSet);
            }       
            if(fetchDocumentIds){
                this.fetchRequiredDocumentsIds(resultMap.loanApp.Id);
            }
            if(callback){
               callback.call(this,resultMap.loanApp.Id ); 
            }
            this.component.set("v.Spinner", false);
        });
    },
    
    fetchRequiredDocumentsIds : function(recordId) {        
        this.component.set("v.Spinner", true);  

        var param ={
            recordId : recordId
        };
        console.log('getRequiredDocumentFileIds - param -', param);
        this.callServer("getRequiredDocumentFileIds", param, false, function(response) {             
            if(!response.isSuccess) {
                this.showErrorToast(response.error);
                this.component.set("v.Spinner", false); 
                return;
            }
            var resultMap = response.data;
            console.log('data from server', resultMap);
            this.component.set("v.requiredDocumentIds", resultMap.requiredDocumentIds);
            this.component.set("v.Spinner", false);
        });
    },
    
    saveAccountData : function(account, tabToSet) {        
        this.component.set("v.Spinner", true);  
		delete account.Name;
        var param ={
            accountStr : JSON.stringify(account)
        };
        console.log('saveAccountData - param -', param);
        this.callServer("saveAccountData", param, false, function(response) {             
            if(!response.isSuccess) {
                this.showErrorToast(response.error);
                this.component.set("v.Spinner", false); 
                return;
            }
            var resultMap = response.data;
            console.log('data from server', resultMap);
            this.component.set("v.currentTab", tabToSet);
            var loanApplication = this.component.get("v.LoanApplication");   
            loanApplication.Account__c = resultMap.account.Id;
            this.saveLoanApplicationData(loanApplication,null,null);
            this.component.set("v.Spinner", false);
        });
    },
    
    saveOwnerData : function(OwnerRec) {        
        this.component.set("v.Spinner", true);

        var contact = OwnerRec.Contact__r;
        delete OwnerRec.Contact__r;
        delete contact.AccountId;
        var owner = OwnerRec;
        var param ={
            contactStr : JSON.stringify(contact),
            ownerStr : JSON.stringify(owner)
        };
        console.log('saveOwnerData - param -', param);
        this.callServer("saveOwnerData", param, false, function(response) {             
            if(!response.isSuccess) {
                this.showErrorToast(response.error);
                this.component.set("v.Spinner", false); 
                return;
            }
            var resultMap = response.data;
            console.log('data from server', resultMap);
            this.component.set("v.showContactForm", false);
            this.component.set("v.listOwners", resultMap.listOwners);
            this.component.set("v.Spinner", false);
        });
    },
    
    saveCertificationInfo : function(certificationAndAuthRec) {        
        this.component.set("v.Spinner", true);  

        var param ={
            certificationAndAuthStr : JSON.stringify(certificationAndAuthRec)
        };
        console.log('saveCertificationInfo - param -', param);
        this.callServer("saveCertificationInfo", param, false, function(response) {             
            if(!response.isSuccess) {
                this.showErrorToast(response.error);
                this.component.set("v.Spinner", false); 
                return;
            }
            var resultMap = response.data;
            console.log('data from server', resultMap);
           
            this.component.set("v.CertificationAndAuthRec",resultMap.certificationAndAuthRec);

            var loanApplication = this.component.get("v.LoanApplication");
            loanApplication.Status__c = 'Submitted';
            this.saveLoanApplicationData(loanApplication,null, function(appId) {
                
                this.showToast('success','Application saved Successfully!');
                this.navigateToUrl('/my-applications');
            });
            
            
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
    
    validateAccountInfo: function() {        
        var valid = this.component.find('account-form').reduce(function (validSoFar, inputCmp) {
            // Displays error messages for invalid fields
            inputCmp.showHelpMessageIfInvalid();
            return validSoFar && inputCmp.get('v.validity').valid;
        }, true);
        return valid;
    },
    
    validateContactInfo: function() {        
        var valid = this.component.find('contact-form').reduce(function (validSoFar, inputCmp) {
            // Displays error messages for invalid fields
            inputCmp.showHelpMessageIfInvalid();
            return validSoFar && inputCmp.get('v.validity').valid;
        }, true);
        return valid;
    },
    
    validateLoanAppInfo: function() {        
        var valid = this.component.find('loanApp-form').reduce(function (validSoFar, inputCmp) {
            // Displays error messages for invalid fields
            inputCmp.showHelpMessageIfInvalid();
            return validSoFar && inputCmp.get('v.validity').valid;
        }, true);
        return valid;
    },
    
    validateCertificationInfo: function() {        
        var valid = this.component.find('cert-form').reduce(function (validSoFar, inputCmp) {
            // Displays error messages for invalid fields
            inputCmp.showHelpMessageIfInvalid();
            return validSoFar && inputCmp.get('v.validity').valid;
        }, true);
        return valid;
    },
    
    validateEligibilityAnswers: function() {        
        var loanApplication = this.component.get("v.LoanApplication");
        
        if(loanApplication.Eligibility_Question_1__c == 'Yes' || loanApplication.Eligibility_Question_2__c == 'Yes' 
           || loanApplication.Eligibility_Question_5__c == 'Yes' || loanApplication.Eligibility_Question_6__c == 'Yes'){
            return false;
        }
        
        return true;
    },
    
    validateOwnersInfo: function() {        
        var listOwners = this.component.get("v.listOwners");
        var total = 0;
        for(var indx=0; indx < listOwners.length; indx++){
            if(listOwners[indx].Percent_of_Ownership__c){
                total += listOwners[indx].Percent_of_Ownership__c;
            }
        }
        if(total < 90){
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
})