({
	component:null,
    
    getInitData : function() {
        this.component.set("v.Spinner", true); 
        this.callServer("getAppointmentTypes", null, false, function(response) { 
            if(!response.isSuccess) {
                this.showErrorToast(response.error);
                this.component.set("v.Spinner", false); 
                return;
            }
            
            var resultMap = response.data;
            var appointmentTypeList = resultMap.appointmentTypes;
            var appointmentTypes = [];
            for (var key in appointmentTypeList) {
                var appointment = {};
                appointment.Type = appointmentTypeList[key];
                appointment.Name = appointmentTypeList[key].replace(/[^A-Z0-9]/ig, "");
                console.log('appointment.Type : ',appointment.Type);
                console.log('appointment.Name : ',appointment.Name);
                //caseTypes.push(singlekey);
                appointmentTypes.push(appointment);
            }
            console.log('appointmentTypes : ',appointmentTypes);
            this.component.set("v.appointmentTypes", appointmentTypes);
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