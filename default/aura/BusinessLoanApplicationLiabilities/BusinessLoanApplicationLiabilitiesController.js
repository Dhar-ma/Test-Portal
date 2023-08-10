({
	doInit : function(component, event, helper) {
        
        helper.component = component;
        
		component.set("v.NewLiability",{});
        component.set("v.Liabilities",{});

        var loanApplicationId = component.get("v.ResidentialLoanApplication").Id;
        if(loanApplicationId){
            helper.getLiabilityList(loanApplicationId);
        }
        //helper.getPicklistValues('Asset');
	},
    
    showLiabilityForm: function(component, event, helper) {
        //helper.getLoanApplicantMap();
        var actionName = event.getSource().get("v.title");
        console.log('showLiabilityForm actionName: ',actionName);
        
        component.set("v.NewLiability", {});
        
        if(actionName == 'ScheduleAForm'){
            component.set("v.showScheduleAForm", true);
        }
        if(actionName == 'ScheduleBForm'){
            component.set("v.showScheduleBForm", true);
        }
        if(actionName == 'ScheduleCForm'){
            component.set("v.showScheduleCForm", true);
        }
        if(actionName == 'ScheduleDForm'){
            component.set("v.showScheduleDForm", true);
        }
        if(actionName == 'ScheduleFForm'){
            component.set("v.showScheduleFForm", true);
        }
       
    },
    
    hideLiabilityForm: function(component, event, helper) {
		//var actionName = event.getSource().get("v.title");
        //console.log('showLiabilityForm actionName: ',actionName);
        //component.set("v.showAssetsForm", false);
        
        component.set("v.showScheduleAForm", false);
        component.set("v.showScheduleBForm", false);
        component.set("v.showScheduleCForm", false);
        component.set("v.showScheduleDForm", false);
        component.set("v.showScheduleFForm", false);
    },
    
    saveLiabilitiesForm: function(component, event, helper) {
        
        var liabilityForm = component.get("v.NewLiability");
        console.log('LiabilityForm',JSON.stringify(liabilityForm));
        
        var actionName = event.getSource().get("v.title");
        console.log('actionName : ',actionName);
        
        var valid = helper.validateForm(actionName);
        console.log('isValid : ',valid);
        
        var loanApplicationId = component.get("v.ResidentialLoanApplication").Id;
        if(loanApplicationId){
            if(valid){
                helper.saveLiabilityForm("8",actionName); 
            }else{
                helper.showErrorToast('Please enter all required fields');  
            }
        }else{
            helper.showErrorToast('Please complete previous steps');
        }
    },
    
    editLiabilityForm : function(component, event, helper){
        var selectedItem = event.currentTarget.dataset.row;
        var actionName = event.currentTarget.title;
        console.log('formName : ',actionName);
        
        if(actionName == 'ScheduleAForm'){
            var Liabilities = component.get("v.ScheduleALiabilities");
            component.set("v.NewLiability", Liabilities[selectedItem]);
            component.set("v.showScheduleAForm", true);
        }
        if(actionName == 'ScheduleBForm'){
            var Liabilities = component.get("v.ScheduleBLiabilities");
            component.set("v.NewLiability", Liabilities[selectedItem]);
            component.set("v.showScheduleBForm", true);
        }
        if(actionName == 'ScheduleCForm'){
            var Liabilities = component.get("v.ScheduleCLiabilities");
            component.set("v.NewLiability", Liabilities[selectedItem]);
            component.set("v.showScheduleCForm", true);
        }
        if(actionName == 'ScheduleDForm'){
            var Liabilities = component.get("v.ScheduleDLiabilities");
            component.set("v.NewLiability", Liabilities[selectedItem]);
            component.set("v.showScheduleDForm", true);
        }
        if(actionName == 'ScheduleFForm'){
            var Liabilities = component.get("v.ScheduleFLiabilities");
            component.set("v.NewLiability", Liabilities[selectedItem]);
            component.set("v.showScheduleFForm", true);
        }
    },
})