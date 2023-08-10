({
    doInit: function(component, event, helper) {
        helper.getContext(component,event,helper);
        helper.component = component;
        var userId = $A.get("$SObjectType.CurrentUser.Id");
        console.log(userId);
        component.set("v.selectedBranch",{});
        helper.getInitialData();
        //helper.initiateFlow(component);
    },
    
    startFlow:function(component, event, helper){
        console.log('flow start');
        helper.initiateFlow(component);
    },
    
    closeFlowModal : function(component, event, helper) {
        component.set("v.isFlowOpen", false);
    },
    
    handleBranchIdChange: function(component, event, helper) {
        var selectedBranchId = component.get("v.selectedBranchId");
        console.log('selectedBranchId',selectedBranchId);
        if(selectedBranchId){
            helper.getBranchInfoAccount(selectedBranchId);
        }
    },
    
    handleStatusChange: function(component, event, helper){
        console.log('handleStatusChange');
        console.log('flow status :',event.getParam("status"));
       
        if(event.getParam("status") === "FINISHED") {
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
        }
    },
    
})