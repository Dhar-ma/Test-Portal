({
    doInit : function(component, event, helper){
        
        helper.getCurrentUserInfo(component);
        helper.reInitChat(component);
    },
    
    startChat : function(component, event, helper) {
        var chatButtonId = $A.get("$Label.c.Chat_Button_ID");
        liveagent.startChat(chatButtonId);
    },
    
    showContactInfo : function(component, event, helper){
        component.set("v.contactInfoVisible", true);
    },
    
    beginFlow : function(component, event, helper){
        var inputVariables = [
            {
                name : 'contactId',
                type : 'String',
                value : component.get("v.contactId")
            },
            {
                name : 'accountId',
                type : 'String',
                value : component.get("v.accountId")
            }
        ];
        component.set("v.isFlowOpen", true);
        var flow = component.find("flowData");
        flow.startFlow("Appointment_Scheduling_Flow",inputVariables); 
    },
    
    closeFlowModal : function(component, event, helper) {
        component.set("v.isFlowOpen", false);
    },

    openCaseForm : function(component, event, helper){
        var urlEvent = $A.get("e.force:navigateToURL");
        urlEvent.setParams({
            "url": "/submit-case"
        });
        
        urlEvent.fire();
    },
    
    hideContactInfo : function(component, event, helper){
        component.set("v.contactInfoVisible", false);
    },
    
    openKnowledgeTab : function(component, event, helper){
        var urlEvent = $A.get("e.force:navigateToURL");
        urlEvent.setParams({
            "url": "/help-center"
        });
        
        urlEvent.fire();
    },
    
    handleStatusChange: function(component, event, helper){
       
        if(event.getParam("status") === "FINISHED") {
            component.set("v.isFlowOpen",false);
        }
    },
})