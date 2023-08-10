({	
    component:null,
    
	getDependentPicklistValue: function() {
        
        this.callServer("getMortgageDependetPicklistValues", null, false, function(response) {
            if(!response.isSuccess) {
                this.showErrorToast(response.error);
                this.component.set("v.Spinner", false);
                return;
            }
            var resultMap = response.data;
            console.log('resultMap : ',resultMap);
            console.log('caseTypeList : ',resultMap.caseTypeList);
            var caseTypes = [];
            for (var singlekey in resultMap.caseTypeList) {
                var caseObj = {};
                caseObj.Type = resultMap.caseTypeList[singlekey];
                caseObj.Name = resultMap.caseTypeList[singlekey].replace(/[^A-Z0-9]/ig, "");
                console.log('caseObj.Name : ',caseObj.Name);
                //caseTypes.push(singlekey);
                caseTypes.push(caseObj);
            }
            console.log('caseTypes : ',caseTypes);
            this.component.set("v.listCaseType",caseTypes);
        });
    },
    
    navigateToUrl: function(url) {        
        var urlEvent = $A.get("e.force:navigateToURL");
        urlEvent.setParams({
            "url": url
        });
        urlEvent.fire();
    },
    
    navigateToRecord: function(id) {        
        var navEvt = $A.get("e.force:navigateToSObject");
        navEvt.setParams({
            "recordId": id,
            "slideDevName": "detail"
        });
        navEvt.fire();
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