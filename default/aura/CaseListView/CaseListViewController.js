({
	doInit: function(component, event, helper) {
        helper.setFormFactor(component,event,helper);
        helper.getContactId(component,event,helper);
    },

    handleNavigationAction: function(component,event,helper) {
        var urlEvent = $A.get("e.force:navigateToURL");
        urlEvent.setParams({
            "url": component.get('!v.actionUrl')
        });
        urlEvent.fire();
    }
})