({
    getContactId: function(component, event, helper) {
        let action = component.get("c.getListViewData");
        action.setCallback(this, function(response){
            let state = response.getState();
            if (state === "SUCCESS") {
                console.log('response:', response.getReturnValue());
                component.set("v.contactId", response.getReturnValue().contactId);
                component.set("v.urlPrefix", response.getReturnValue().urlPrefix);
                component.set("v.displayListView",true);
            }   
            else if(state === "ERROR"){
                console.error('error');
                let errors = response.getError();
                let message = 'There was an error';
                if (errors && Array.isArray(errors) && errors.length > 0) {
                    message = errors[0].message;
                }
                console.error('error', message);
            }
        });
        $A.enqueueAction(action);	
    },

    setFormFactor: function(component, event, helper) {
        if($A.get("$Browser.formFactor") == 'PHONE' || $A.get("$Browser.isTablet")) {
            component.set("v.isMobile", true);
        }
        console.log("isMobile", component.get("v.isMobile"));
    },
})