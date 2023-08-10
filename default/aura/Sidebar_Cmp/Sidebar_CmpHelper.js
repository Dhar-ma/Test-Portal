({
    navigateToUrl: function(url) {        
        var urlEvent = $A.get("e.force:navigateToURL");
        urlEvent.setParams({
            "url": url
        });
        urlEvent.fire();
    },
    
    getCurrentUserInfo:function(component){  
        var action = component.get("c.fetchUser");
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                var storeResponse = response.getReturnValue();
                // set current user information on userInfo attribute
                var contactId = storeResponse.ContactId;
                var accountId = storeResponse.AccountId; 
                component.set("v.contactId",contactId);
                component.set("v.accountId",accountId); 
            }
        });
        $A.enqueueAction(action);
    },
    
    showSpinner:function(component){        
        component.set("v.isSpinnerVisible", true);        
    },
    
    hideSpinner:function(component){        
        component.set("v.isSpinnerVisible", false);        
    } ,
    
    reInitChat:function(component){ 
        var action = component.get("c.checkUserType");
        action.setCallback(this, function(response) {
            var state = response.getState();  
            
            if(state === "SUCCESS") {
                var wrapper = response.getReturnValue();
                if(wrapper.isSuccess){ 
                    component.set("v.userLoggedIn", wrapper.data.isLoggedIn);
                    
                    if (!window._laq) { 
                        window._laq = []; 
                    }
                    
                    var chatEndpoint = $A.get("$Label.c.Live_Chat_Endpoint");
                    var deploymentId = $A.get("$Label.c.Live_Agent_Deployment_ID");
                    var orgId = $A.get("$Label.c.Organization_ID");
                    var chatButtonId = $A.get("$Label.c.Chat_Button_ID");
                    
                    
                    liveagent.init(chatEndpoint, deploymentId, orgId);
                    liveagent.enableLogging();
                    liveagent.pingRate = 20000;
                    
                    window._laq.push(function(){ 
                        liveagent.showWhenOnline(chatButtonId, document.getElementById('online-btn'));
                        liveagent.showWhenOffline(chatButtonId, document.getElementById('offline-btn'));
                    });
                }
            }
        });
        $A.enqueueAction(action);
    }
})