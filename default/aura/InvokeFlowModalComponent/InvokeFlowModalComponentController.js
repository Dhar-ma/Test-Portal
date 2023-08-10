({
    myAction : function(component, event, doInit) {
        console.log('in flow method');
        var inputVariables = [];
        var flow = component.find("flowData");
        flow.startFlow("Appointment_Scheduling_Flow");
        console.log('flow end');
    }
})