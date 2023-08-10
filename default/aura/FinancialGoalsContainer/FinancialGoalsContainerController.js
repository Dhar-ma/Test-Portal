({
	doInit : function(component, event, helper) {
		var action = component.get("c.fetchUser"); 
        action.setCallback(this, function(response) {
            var state = response.getState(); 
            if (state === "SUCCESS") {   
                if(response.getReturnValue() && response.getReturnValue().AccountId){
                    component.set("v.currentAccountId", response.getReturnValue().AccountId);
                }
            }
        });
        $A.enqueueAction(action);
	}
})