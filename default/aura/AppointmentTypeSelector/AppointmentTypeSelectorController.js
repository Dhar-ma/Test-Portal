({
	doInit : function(component, event, helper) {
		helper.component = component;
        helper.getInitData();
	},
    
    setAppointmentType : function(component, event, helper) {
        var type = event.srcElement.value;
        component.set("v.selectedAppointmentType",type);
    },
})