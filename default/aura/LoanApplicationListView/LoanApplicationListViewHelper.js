({
    loadInitialData : function() {        
        this.component.set("v.Spinner", true);  
        
        this.callServer("getApplicationList", null, false, function(response) {             
            if(!response.isSuccess) {
                this.showErrorToast(response.error);
                this.component.set("v.Spinner", false); 
                return;
            }
            var resultMap = response.data;
            console.log('data from server', resultMap);            
            this.component.set("v.listApplications", resultMap.listApplications);
            
            this.component.set("v.Spinner", false);
        });
    },
    
    navigateToUrl: function(url) {        
        var urlEvent = $A.get("e.force:navigateToURL");
        urlEvent.setParams({
            "url": url
        });
        urlEvent.fire();
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