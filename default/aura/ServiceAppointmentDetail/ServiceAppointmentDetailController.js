({
    doInit : function(component, event, helper) {
        console.log('doInit ServiceAppointment');
        helper.component = component;
    },
    
	cancelAppointment : function(component, event, helper) {
        var recordId = component.get("v.recordId");
        console.log('recordId',recordId);
        helper.cancelServiceAppointment(recordId);
    },   
})