({	
    component:null,
    getWorkTypesMap : function() {
        
        this.component.set("v.Spinner", true);  
        
        this.callServer("getWorkGroupTypeMap", null, false, function(response) {             
            if(!response.isSuccess) {
                this.showErrorToast(response.error);
                this.component.set("v.Spinner", false); 
                return;
            }
            var resultMap = response.data;
            console.log('getWorkGroupType resultMap : ',resultMap);
            var groupTypeList = resultMap.appointmentTypes;
            if(resultMap.isMortgageCommunity && groupTypeList.length){
                var workType = [];
                for (var singlekey in groupTypeList) {
                    workType.push(groupTypeList[singlekey]);
                }
                this.component.set("v.workType",workType);
            }else{
                var workType = [];
                for (var singlekey in resultMap.workTypeGroupMap) {
                    workType.push(singlekey);
                }
                this.component.set("v.workType",workType);
            }
            
            this.component.set("v.workTypeWorkGroupMap",resultMap.workTypeGroupMap);
            
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
})