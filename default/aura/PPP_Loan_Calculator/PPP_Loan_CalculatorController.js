({   
    doInit: function(component, event, helper) {
        helper.component = component;
        component.set("v.form_data",{});
    },
    
    showMoretext : function(component, event, helper) {
        var cmpTarget = component.find('text-info');
        $A.util.addClass(cmpTarget, 'show');
    },
    
    calculatePayrollCosts : function(component, event, h) {
        
        if(h.validateform("calc-form")){
            
            var form_data = component.get("v.form_data");
            
            var totalPayrollGrossWages = h.getNumber(form_data.totalGS) - h.getNumber(form_data.totalGSExceed100K) -
                h.getNumber(form_data.residenceNotInUSA);
            
            component.set("v.totalPayrollGrossWages", totalPayrollGrossWages);
            
            var total_Other_Payroll_Costs = h.getNumber(form_data.totalPaidLeave) + h.getNumber(form_data.healthBenefit) + 
                h.getNumber(form_data.retirementBenefit) + h.getNumber(form_data.EPST) + h.getNumber(form_data.EPLT) -
                (h.getNumber(form_data.coronaAct70001) + h.getNumber(form_data.coronaAct70003));
            
            component.set("v.total_Other_Payroll_Costs", total_Other_Payroll_Costs);
            
            var total_Payroll_Cost = totalPayrollGrossWages + total_Other_Payroll_Costs;
            
            var months = h.monthDiff(new Date(form_data.start_date), new Date(form_data.end_date));
            
            var average_Monthly_Payroll_Costs = total_Payroll_Cost / months;
            
            component.set("v.average_Monthly_Payroll_Costs", average_Monthly_Payroll_Costs);
            
            var loan_Amount_based_on_Payroll_Only = average_Monthly_Payroll_Costs *2.5;
            
          
            var total_Estimated_Requested_Loan_Amount = loan_Amount_based_on_Payroll_Only +  h.getNumber(form_data.outstandingAmount) -
                h.getNumber(form_data.advanceLoan);
            
            component.set("v.total_Estimated_Requested_Loan_Amount", total_Estimated_Requested_Loan_Amount);
            
        }else{
            h.showErrorToast('Please correct/enter all required fields')
        }
        
        
    }
})