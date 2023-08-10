({
	doInit : function(component, event, helper) {
		helper.initiateFlow(component);
	},
    
    handleStatusChange: function(component, event, helper){
        console.log('handleStatusChange');
        console.log('flow status :',event.getParam("status"));
       
        /*if(event.getParam("status") === "FINISHED") {
            component.set("v.isFlowOpen",false);
            var outputVariables = event.getParam("outputVariables");
            var outputVar;
            for(var i = 0; i < outputVariables.length; i++) {
                outputVar = outputVariables[i];
                if(outputVar.name === "accountId"){
                    console.log('outputVar : ',outputVar.value);
                    component.set("v.selectedBranchId",outputVar.value);
                }
            }
        }*/
    }
})