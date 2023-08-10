({
	component:null,
    
    getLiabilityList : function(loanApplicationId){
        var param ={
            loanApplicationId : loanApplicationId
        }
        this.component.set("v.Spinner", true);
        console.log('getLiabilityList - param -', param);
        this.callServer("getLiabilityList", param, false, function(response) {             
            if(!response.isSuccess) {
                console.log('error : ',response.error);
                this.showErrorToast(response.error);
                this.component.set("v.Spinner", false); 
                return;
            }
            var resultMap = response.data;
            console.log('getLiabilityList data from server', resultMap);
            this.component.set("v.Spinner", false); 
            this.component.set("v.Liabilities", resultMap.liabilities);
            
            var ScheduleALiabilities = [];
            var ScheduleBLiabilities = [];
            var ScheduleCLiabilities = [];
            var ScheduleDLiabilities = [];
            var ScheduleFLiabilities = [];
            
            for(var key in resultMap.liabilities){
                if(resultMap.liabilities[key].Schedule_Form_Type__c == 'ScheduleAForm'){
                    ScheduleALiabilities.push(resultMap.liabilities[key]);
                }
                if(resultMap.liabilities[key].Schedule_Form_Type__c == 'ScheduleBForm'){
                    ScheduleBLiabilities.push(resultMap.liabilities[key]);
                }
                if(resultMap.liabilities[key].Schedule_Form_Type__c == 'ScheduleCForm'){
                    ScheduleCLiabilities.push(resultMap.liabilities[key]);
                }
                if(resultMap.liabilities[key].Schedule_Form_Type__c == 'ScheduleDForm'){
                    ScheduleDLiabilities.push(resultMap.liabilities[key]);
                }
                if(resultMap.liabilities[key].Schedule_Form_Type__c == 'ScheduleFForm'){
                    ScheduleFLiabilities.push(resultMap.liabilities[key]);
                }
            }
            
            this.component.set("v.ScheduleALiabilities",ScheduleALiabilities);
            this.component.set("v.ScheduleBLiabilities",ScheduleBLiabilities);
            this.component.set("v.ScheduleCLiabilities",ScheduleCLiabilities);
            this.component.set("v.ScheduleDLiabilities",ScheduleDLiabilities);
            this.component.set("v.ScheduleFLiabilities",ScheduleFLiabilities);
        });

    },
    
    getLoanApplicantMap : function(){
        console.log('getLoanApplicantMap');
        var loanApplicants = this.component.get("v.LoanApplicant");
        var loanApplicantMap = [];
        for(var key in loanApplicants){
            loanApplicantMap.push({label: loanApplicants[key].Name, value: loanApplicants[key].Id});
        }
        console.log('loanApplicantMap : ',loanApplicantMap);
        this.component.set("v.LoanApplicantMap",loanApplicantMap);
    },
    
	saveLiabilityForm : function(tabToSet,ScheduleType){
        console.log('saveLiabilityForm');
        this.component.set("v.Spinner", true);
        var NewLiability = this.component.get("v.NewLiability");
        var LiabilitiesLength = Object.keys(this.component.get("v.Liabilities")).length;
        
        var loanApplication = this.component.get("v.ResidentialLoanApplication");
        if(!NewLiability.Schedule_Form_Type__c){
            NewLiability.Schedule_Form_Type__c = ScheduleType;
        }
        if(!NewLiability.Name){
            NewLiability.Name = loanApplication.Name+' '+ScheduleType+' '+LiabilitiesLength;
        }
        var param ={
            liability : JSON.stringify(NewLiability),
            loanApplicationId : loanApplication.Id
        }
        
        console.log('saveLiability - param -', param);
        this.callServer("saveLiability", param, false, function(response) {             
            if(!response.isSuccess) {
                console.log('error : ',response.error);
                this.showErrorToast(response.error);
                this.component.set("v.Spinner", false); 
                return;
            }
            var resultMap = response.data;
            console.log('saveLiability data from server', resultMap);
            this.component.set("v.Liabilities",resultMap.liabilities);
            this.component.set("v.Spinner", false);
            this.component.set("v.currentTab", tabToSet);
            
            if(ScheduleType == 'ScheduleAForm'){
                this.component.set("v.showScheduleAForm", false);
                this.component.set("v.ScheduleALiabilities",resultMap.liabilities);
            }
            if(ScheduleType == 'ScheduleBForm'){
                this.component.set("v.showScheduleBForm", false);
                this.component.set("v.ScheduleBLiabilities",resultMap.liabilities);
            }
            if(ScheduleType == 'ScheduleCForm'){
                this.component.set("v.ScheduleCLiabilities",resultMap.liabilities);
                this.component.set("v.showScheduleCForm", false);
            }
            if(ScheduleType == 'ScheduleDForm'){
                this.component.set("v.ScheduleDLiabilities",resultMap.liabilities);
                this.component.set("v.showScheduleDForm", false);
            }
            if(ScheduleType == 'ScheduleFForm'){
                this.component.set("v.ScheduleFLiabilities",resultMap.liabilities);
                this.component.set("v.showScheduleFForm", false);
            }
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
    
    validateForm: function(formId) {        
        var valid = this.component.find(formId).reduce(function (validSoFar, inputCmp) {
            // Displays error messages for invalid fields
            inputCmp.showHelpMessageIfInvalid();
            return validSoFar && inputCmp.get('v.validity').valid;
        }, true);
        return valid;
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