({
	doInit: function(component, event, helper) {
        helper.component = component;
        helper.loadInitialData(); 
    },
    
    handleNewApplication: function(component, event, helper) {       
        helper.navigateToUrl('/new-application'); 
    },
    
    handleEditApplication: function(component, event, helper) {       
        var selectedItem = event.currentTarget.dataset.row;
        console.log('selectedItem', selectedItem);
        if(selectedItem){
            var listApplications = component.get("v.listApplications");
            var selectedRec = listApplications[selectedItem];
            helper.navigateToUrl('/new-application?id='+selectedRec.Id); 
        }      
        
    },
    
})