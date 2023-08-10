({
	component:null,
    
    getAssetList : function(loanApplicationId){
        var param ={
            loanApplicationId : loanApplicationId
        }
        this.component.set("v.Spinner", true);
        console.log('getPicklists - param -', param);
        this.callServer("getAssetList", param, false, function(response) {             
            if(!response.isSuccess) {
                console.log('error : ',response.error);
                this.showErrorToast(response.error);
                this.component.set("v.Spinner", false); 
                return;
            }
            var resultMap = response.data;
            console.log('getPicklistValues data from server', resultMap);
            this.component.set("v.Spinner", false); 
            this.component.set("v.Assets", resultMap.assets);
            
            var ScheduleAAssets = [];
            var ScheduleBAssets = [];
            var ScheduleCAssets = [];
            var ScheduleDAssets = [];
            var ScheduleFAssets = [];
            
            for(var key in resultMap.assets){
                if(resultMap.assets[key].Schedule_Form_Type__c == 'ScheduleAForm'){
                    ScheduleAAssets.push(resultMap.assets[key]);
                }
                if(resultMap.assets[key].Schedule_Form_Type__c == 'ScheduleBForm'){
                    ScheduleBAssets.push(resultMap.assets[key]);
                }
                if(resultMap.assets[key].Schedule_Form_Type__c == 'ScheduleCForm'){
                    ScheduleCAssets.push(resultMap.assets[key]);
                }
                if(resultMap.assets[key].Schedule_Form_Type__c == 'ScheduleDForm'){
                    ScheduleDAssets.push(resultMap.assets[key]);
                }
                if(resultMap.assets[key].Schedule_Form_Type__c == 'ScheduleFForm'){
                    ScheduleFAssets.push(resultMap.assets[key]);
                }
            }
            
            this.component.set("v.ScheduleAAssets",ScheduleAAssets);
            this.component.set("v.ScheduleBAssets",ScheduleBAssets);
            this.component.set("v.ScheduleCAssets",ScheduleCAssets);
            this.component.set("v.ScheduleDAssets",ScheduleDAssets);
            this.component.set("v.ScheduleFAssets",ScheduleFAssets);
        });

    },
    
    getPicklistValues : function(tabName){
        var param ={
            type : tabName
        }
        this.component.set("v.Spinner", true);
        console.log('getPicklists - param -', param);
        this.callServer("getPicklists", param, false, function(response) {             
            if(!response.isSuccess) {
                console.log('error : ',response.error);
                this.showErrorToast(response.error);
                this.component.set("v.Spinner", false); 
                return;
            }
            var resultMap = response.data;
            console.log('getPicklistValues data from server', resultMap);
            this.component.set("v.Spinner", false); 
            this.component.set("v.AssetClasses", resultMap.assetOrLiabilityClass);
            this.component.set("v.AssetTypes", resultMap.assetOrLiabilityType);
            this.component.set("v.AccountTypes", resultMap.accountType);
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
    
    saveAssetForm : function(tabToSet,ScheduleType){
        console.log('saveAssetForm');
        this.component.set("v.Spinner", true);
        var NewAsset = this.component.get("v.NewAsset");
        var AssetsLength = Object.keys(this.component.get("v.Assets")).length;
        console.log('AssetsLength: ',ScheduleType+' '+AssetsLength);
        
        var loanApplication = this.component.get("v.ResidentialLoanApplication");
        if(!NewAsset.Schedule_Form_Type__c){
            NewAsset.Schedule_Form_Type__c = ScheduleType;
        }
        if(!NewAsset.Name){
            NewAsset.Name = loanApplication.Name+' '+ScheduleType+' '+AssetsLength;
        }
        var param ={
            asset : JSON.stringify(NewAsset),
            loanApplicationId : loanApplication.Id
        }
        
        console.log('saveAsset - param -', param);
        this.callServer("saveAsset", param, false, function(response) {             
            if(!response.isSuccess) {
                console.log('error : ',response.error);
                this.showErrorToast(response.error);
                this.component.set("v.Spinner", false); 
                return;
            }
            var resultMap = response.data;
            console.log('saveAsset data from server', resultMap);
            this.component.set("v.Assets",resultMap.assets);
            this.component.set("v.Spinner", false);
            this.component.set("v.currentTab", tabToSet);
            
            if(ScheduleType == 'ScheduleAForm'){
                this.component.set("v.showScheduleAForm", false);
                this.component.set("v.ScheduleAAssets",resultMap.assets);
            }
            if(ScheduleType == 'ScheduleBForm'){
                this.component.set("v.showScheduleBForm", false);
                this.component.set("v.ScheduleBAssets",resultMap.assets);
            }
            if(ScheduleType == 'ScheduleCForm'){
                this.component.set("v.ScheduleCAssets",resultMap.assets);
                this.component.set("v.showScheduleCForm", false);
            }
            if(ScheduleType == 'ScheduleDForm'){
                this.component.set("v.ScheduleDAssets",resultMap.assets);
                this.component.set("v.showScheduleDForm", false);
            }
            if(ScheduleType == 'ScheduleFForm'){
                this.component.set("v.ScheduleFAssets",resultMap.assets);
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