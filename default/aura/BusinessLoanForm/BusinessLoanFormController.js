({
    doInit : function(component, event, helper) {
        console.log('doInit mortgage');
        helper.component = component;
        //MortgageLoanProgram
        
        component.set("v.Yes_No_options", [
            {'label': 'Yes', 'value': true},
            {'label': 'No', 'value': false}
        ]);
                
        component.set("v.MaritalStatus", [
            {'label': 'Married', 'value': 'Married'},
            {'label': 'Separated', 'value': 'Separated'},
            {'label': 'Unmarried', 'value': 'Unmarried'}
        ]);
        
        component.set("v.financialDetails",{
            'AssetScheduleAFinancialValue' : 0.00,
            'AssetScheduleBFinancialValue' : 0.00,
            'AssetScheduleCFinancialValue' : 0.00,
            'AssetScheduleDFinancialValue' : 0.00,
            'AssetScheduleFFinancialValue' : 0.00,
            'LiabilityScheduleAFinancialValue' : 0.00,
            'LiabilityScheduleBFinancialValue' : 0.00,
            'LiabilityScheduleCFinancialValue' : 0.00,
            'LiabilityScheduleDFinancialValue' : 0.00,
            'LiabilityScheduleFFinancialValue' : 0.00,
        });
                        
        component.set("v.ApplicationQuestion", {});
        component.set("v.ResidentialLoanApplication", {});
        component.set("v.LoanApplicant", {});
        component.set("v.NewLoanApplicant", {});
        component.set("v.LoanApplicantAddress",{});
        component.set("v.LoanApplicantMalingAddress",{});
        component.set("v.LoanApplicantEmployment",{});
        component.set("v.currentUserContact",{});
        component.set("v.currentUser",{});
        component.set("v.LoanApplicantIncomes",{});
        
        var recordId ;
        if(helper.getURLParameter('id')){
            recordId = helper.getURLParameter('id');
            console.log('recordId :',recordId);
        }
        helper.loadInitialData(recordId);
    },
    
    showBusinessInfoTab: function(component, event, helper) {
        
        var checked = component.find("read-me").get("v.checked");
        if(checked){
            component.set("v.currentTab", "1");
        }else{
            helper.showErrorToast('Please read instruction and mark the checkbox');
        }        
    },
    
    saveLoanApplicantInfo : function(component, event, helper) {
        var actionName = event.getSource().get("v.value");
        var loanApplicationId = component.get("v.ResidentialLoanApplication").Id;
        if(loanApplicationId){
            console.log('saveLoanApplicantInfo loanApplicationId:',loanApplicationId);
            if(actionName == 'CreditApproval'){
                helper.saveLoanApplicant('2',loanApplicationId);
            }else{
                helper.saveLoanApplicant('1',loanApplicationId);
            }
        }else{
            helper.showErrorToast('Please Create Loan Application First');
        }
    },
    
    saveApplicantQuestions : function(component, event, helper) {
        console.log('saveLoanapplicantQuestions');
        var loanApplicant = component.get("v.NewLoanApplicant");
        console.log('loanApplicant Id : '+loanApplicant);
        if(loanApplicant.Id){
            var applicationQuestions = component.get("v.ApplicationQuestion");
            if(!applicationQuestions.Id){
                applicationQuestions.Name = loanApplicant.Name+' Declaration';
                applicationQuestions.Loan_Program__c = component.get("v.selectedMortgageType");
                applicationQuestions.LoanApplicationId = loanApplicant.LoanApplicationId;;
                applicationQuestions.LoanApplicantId = loanApplicant.Id;
                applicationQuestions.Question_Type__c = 'Application Question';
            }
            helper.saveLoanapplicantQuestion('3',applicationQuestions,'Application Question');
        }else{
            helper.showErrorToast('Please Complete Loan Applicant Form');
        }
    },
    
    saveApplicantAddress : function(component, event, helper) {
        
        var loanApplicant = component.get("v.NewLoanApplicant");
        if(loanApplicant.Id){
            var loanApplicantAddress = component.get("v.LoanApplicantAddress");
            if(!loanApplicantAddress.Id){
                loanApplicantAddress.Name = loanApplicant.Name+' Present Address';
                loanApplicantAddress.ResidencyType = 'Present Address';
                loanApplicantAddress.LoanApplicationId = loanApplicant.LoanApplicationId; 
                loanApplicantAddress.LoanApplicantId = loanApplicant.Id; 
            }
            console.log('loanApplicantAddress  : ',JSON.stringify(loanApplicantAddress));
            var loanApplicantMailingAddress = component.get("v.LoanApplicantMalingAddress");
            if(!loanApplicantMailingAddress.Id){
                loanApplicantMailingAddress.Name = loanApplicant.Name+' Mailing Address';
                loanApplicantMailingAddress.ResidencyType = 'Mailing Address';
                loanApplicantMailingAddress.LoanApplicationId = loanApplicant.LoanApplicationId; 
                loanApplicantMailingAddress.LoanApplicantId = loanApplicant.Id; 
            }
            console.log('loanApplicantMailingAddress  : ',JSON.stringify(loanApplicantMailingAddress));
            helper.saveAddress('4',loanApplicantAddress, loanApplicantMailingAddress);
        }else{
            helper.showErrorToast('Please Complete Loan Applicant Form');
        }
    },
    
    saveApplicantEmployment : function(component, event, helper) {
        
        var loanApplicant = component.get("v.NewLoanApplicant");
        if(loanApplicant.Id){
            helper.saveEmployment('5');
        }else{
            helper.showErrorToast('Please Complete Loan Applicant Form');
        }
    },
    
    saveApplicantIncomes : function(component, event, helper) {
        var actionName = event.getSource().get("v.title");
        var loanApplicant = component.get("v.NewLoanApplicant");
        if(loanApplicant.Id){
            helper.saveIncomes('0',actionName);
        }else{
            helper.showErrorToast('Please Complete Loan Applicant Form');
        }
    },
    
    editBorrowerForm: function(component, event, helper) {
        component.set("v.Spinner", true);
        var selectedItem = event.currentTarget.dataset.row;
        var borrowerList = component.get("v.LoanApplicant");
        var loanApplicantId = borrowerList[selectedItem].Id;
        if(loanApplicantId ){
            component.set("v.DeclarationQuestions",{});
            helper.getLoanApplicantRecord(loanApplicantId);
        }else{
            component.set("v.Spinner", false);
            helper.showErrorToast('Please complete previous steps');
        }
        
    },
    
    showNewBorrowerForm: function(component, event, helper) {
        console.log('In showNewBorrowerForm');
        component.set("v.Spinner", true);
        component.set("v.NewLoanApplicant", {});
        component.set("v.ApplicationQuestion", {});
        component.set("v.LoanApplicantAddress", {});
        component.set("v.LoanApplicantMalingAddress", {});
        component.set("v.LoanApplicantEmployment", {});
        component.set("v.LoanApplicantIncomes", {});
        component.set("v.NewLoanApplicant.BorrowerType",'CoBorrower');
        console.log('NewLoanApplicant : ',JSON.stringify(component.get("v.NewLoanApplicant")));
        component.set("v.showBorrowerForm", true);
        helper.setDeclarationQuestions();
        component.set("v.Spinner", false);
    },
    
    showTradeInFrom : function(component, event, helper) {
        var response = event.getSource().get("v.checked");
        component.set("v.ResidentialLoanApplication.Add_Trade_In__c", response);
    },
    
    setSelfEmployment : function(component, event, helper) {
		var response = event.getSource().get("v.checked");       
        component.set("v.LoanApplicantEmployment.IsSelfEmployed", response);
    },
    
    hideBorrowerForm: function(component, event, helper) {        
        component.set("v.showBorrowerForm", false);
    },
    
    saveLoanInformation: function(component, event, helper) {
        console.log('saveLoanInformation');
        var valid = helper.validateForm('businessInfo');
        if(!valid){
            helper.showErrorToast('Please enter all required fields');
        }else{
            helper.saveLoanApplication("2");   
        }
        
    },
    
    saveApplicationLoanInfo: function(component, event, helper) {
        console.log('saveLoanInformation');
        var loanApplication = component.get("v.ResidentialLoanApplication");
        var valid = helper.validateForm('loanApp-form');
        if(valid && loanApplication.Id){
            helper.saveLoanInformation("3");  
        }else{
            helper.showErrorToast('Please enter all required fields');
        }
        
    },
    
    getLoanapplicationQuestion : function(component, event, helper) {
        var loanApplicants = component.get("v.LoanApplicant");
        var loanAppliant;
        for(var key in loanApplicants){
            console.log('loanAppliant :', loanApplicants[key]);
            if(loanApplicants[key].BorrowerType == 'Borrower'){
                loanAppliant = loanApplicants[key];
            }
        }
        if(loanAppliant.Id){
            helper.getLoanapplicationQuestion(loanAppliant.Id);  
        }else{
            helper.setDeclarationQuestions(null,'Declaration');
            helper.showErrorToast('Please complete previous steps');
        }
        
    },
    
    saveApplicationDeclaration : function(component, event, helper) {
        console.log('saveLoanapplicantQuestions');
        var loanApplicant = component.get("v.NewLoanApplicant");
        console.log('loanApplicant Id : ',loanApplicant);
        var loanApplication = component.get("v.ResidentialLoanApplication");
        if(loanApplicant.Id){
            var applicationQuestions = component.get("v.ApplicationQuestion");
            if(!applicationQuestions.Id){
                applicationQuestions.Name = loanApplication.Name+' Declaration';
                applicationQuestions.Loan_Program__c = component.get("v.selectedMortgageType");
                applicationQuestions.LoanApplicationId = loanApplication.Id;
                applicationQuestions.Question_Type__c = 'Declaration';
                applicationQuestions.LoanApplicantId = loanApplicant.Id;
            }
            helper.saveLoanapplicantQuestion('4',applicationQuestions,'Declaration');
        }else{
            helper.showErrorToast('Please Complete Loan Applicant Form');
        }
    },
    
    saveFinancialStatement: function(component, event, helper) {
        console.log('saveLoanInformation');
        var loanApplication = component.get("v.ResidentialLoanApplication");
        var valid = helper.validateForm('financialStatement');
        if(valid && loanApplication.Id){
            helper.saveLoanInformation("7");  
        }else{
            helper.showErrorToast('Please enter all required fields');
        }
        
    },
    
    editCertificationForm : function(component, event, helper) {
        var selectedItem = event.currentTarget.dataset.row;
        console.log('selectedItem : ',selectedItem);
        var borrowerList = component.get("v.LoanApplicant");
        var loanApplicantId = borrowerList[selectedItem].Id;
		console.log('loanApplicantId : ',loanApplicantId);
        if(loanApplicantId){
            helper.getCertificationRecord(loanApplicantId);
            component.set("v.showCertificationForm", true);
        }else{
            helper.showErrorToast('Please complete loan applicant form first');
        }
    },
    
    submitFullApp : function(component, event, helper) {
        var loanApplication = component.get("v.ResidentialLoanApplication");
        if(loanApplication.Status == 'Pre-App Approved' || loanApplication.Status == 'Full App Started'){
            helper.updateLoanApplicationStatus('Full App Completed');
            helper.progressBarSetup('Full App Completed');
        } 
    },
    
    saveCertificationForm : function(component, event, helper) {
        helper.saveCertificationRecord('6');
    },
    
    showCertificationForm : function(component, event, helper) {
        component.set("v.showCertificationForm", true);
    },
        
    hideCertificationForm : function(component, event, helper) {
        component.set("v.showCertificationForm", false);
    },
    
    
    handleBusinessAccountChange: function(component, event, helper) {
        var selectedBusinessInfoAccountId = component.get("v.selectedBusinessInfoAccountId")
        if(selectedBusinessInfoAccountId){
            var loanApplication = component.get("v.ResidentialLoanApplication");
            loanApplication.AccountId = selectedBusinessInfoAccountId;
            component.set("v.ResidentialLoanApplication", loanApplication);
            helper.getBusinessInfoAccount(selectedBusinessInfoAccountId);
        }
    },
    
    onGroup: function(component, event) {
        console.log('onGroup');
        var changeValue = false;
        var selectedlabel = event.getSource().get("v.label");
        console.log('selectedlabel : ',selectedlabel);
        if(selectedlabel == 'Yes'){
            changeValue = true;
        }
        console.log('changeValue : ',changeValue);
        var fieldName = event.getSource().get("v.name");
        console.log('selectedname : ',fieldName);
        if(fieldName == 'HasDeclaredBankruptcy'){
            component.set("v.ApplicationQuestion.HasDeclaredBankruptcy",changeValue);  
        }
        if(fieldName == 'IsPresentlyDelinquent'){
            component.set("v.ApplicationQuestion.IsPresentlyDelinquent",changeValue);  
        }
        if(fieldName == 'IsPartyToLawsuit'){
            component.set("v.ApplicationQuestion.IsPartyToLawsuit",changeValue);  
        }
        if(fieldName == 'IsBusinessForSale__c'){
            component.set("v.ApplicationQuestion.IsBusinessForSale__c",changeValue);  
        }
        if(fieldName == 'HasBusinessRelocated__c'){
            component.set("v.ApplicationQuestion.HasBusinessRelocated__c",changeValue);  
        }
        if(fieldName == 'IsBusinessNameChangeIn5Years__c'){
            component.set("v.ApplicationQuestion.IsBusinessNameChangeIn5Years__c",changeValue);  
        }
        console.log('ApplicationQuestion value :',JSON.stringify(component.get("v.ApplicationQuestion")));
    },

    closeSelectApplicationType : function(component, event, helper) {
        component.set("v.showFormTypeSelector", false);
    },
    
    setBusinessType:function(component, event, helper) {
        var loantype = component.find("loan-type").get("v.value");
        var BusinessOptions = component.get("v.BusinessOptions");
        console.log('loantype :',loantype);
        console.log('BusinessOptions :',BusinessOptions);
        var loanProgramMap = component.get("v.BusinessLoanProgramMap");

        if(loantype){
            var cosumerType = loanProgramMap.get(loantype).Name;
            component.set("v.selectedBusinessType",loantype);
            component.set("v.BusinessLoanProgram",loanProgramMap.get(loantype));
            
        }else{
            component.set("v.selectedBusinessType",BusinessOptions[0].value);
            component.set("v.BusinessLoanProgram",loanProgramMap.get(BusinessOptions[0].value));
        }
        component.set("v.showFormTypeSelector", false);
    },
    
    getBorrowerAddress : function(component, event, helper) {
        var response = event.getSource().get("v.checked");
         console.log('checkBoxState :',response); 
        if(response){
            var loanApplicant = component.get("v.LoanApplicant");
            for(var key in loanApplicant){
                console.log('Loan Applicant : ',loanApplicant[key]);
                if(loanApplicant[key].BorrowerType == 'Borrower'){
                    console.log('Borrower Id :',loanApplicant[key].Id);
                    helper.getBorrowerAddress(loanApplicant[key].Id);
                    break;
                }
            }  
        }
    },
    
    copyAddress : function(component, event, helper) {
        var loanApplicantAddress = component.get("v.LoanApplicantAddress");
        var loanApplicantMailingAddress = component.get("v.LoanApplicantMalingAddress");
        loanApplicantMailingAddress.ResidenceStreet = loanApplicantAddress.ResidenceStreet;
        loanApplicantMailingAddress.ResidenceCity = loanApplicantAddress.ResidenceCity;
        loanApplicantMailingAddress.ResidenceCountry = loanApplicantAddress.ResidenceCountry;
        loanApplicantMailingAddress.ResidenceState = loanApplicantAddress.ResidenceState;
        loanApplicantMailingAddress.ResidencePostalCode = loanApplicantAddress.ResidencePostalCode;
        component.set("v.LoanApplicantMalingAddress",loanApplicantMailingAddress);
    },
	
	calculateTotalIncome : function(component, event, helper) {
        var totalIncome = 0;
        var Base_Monthly_Salary = parseFloat(component.get("v.LoanApplicantIncomes.Base_Monthly_Salary__c"));
        var Monthly_Overtime_Amount = parseFloat(component.get("v.LoanApplicantIncomes.Monthly_Overtime_Amount__c"));
        var Monthly_Bonus_Amount = parseFloat(component.get("v.LoanApplicantIncomes.Monthly_Bonus_Amount__c"));
        var Monthly_Commission_Amount = parseFloat(component.get("v.LoanApplicantIncomes.Monthly_Commission_Amount__c"));
        var Devidends_Interest = parseFloat(component.get("v.LoanApplicantIncomes.Devidends_Interest__c"));
        var Net_rental_Income = parseFloat(component.get("v.LoanApplicantIncomes.Net_rental_Income__c"));
        var Other_Income = parseFloat(component.get("v.LoanApplicantIncomes.Other_Income__c"));
        var Total_Combined_Monthly_Expenses_Debt = parseFloat(component.get("v.LoanApplicantIncomes.Total_Combined_Monthly_Expenses_Debt__c"));
        var Other_Total_Montly_Expenses_Debt = parseFloat(component.get("v.LoanApplicantIncomes.Other_Total_Montly_Expenses_Debt__c"));
        if(Base_Monthly_Salary){
            totalIncome = totalIncome+Base_Monthly_Salary;
        }
        if(Monthly_Overtime_Amount){
            totalIncome = totalIncome+Monthly_Overtime_Amount;
        }
        if(Monthly_Bonus_Amount){
            totalIncome = totalIncome+Monthly_Bonus_Amount;
        }
        if(Monthly_Commission_Amount){
            totalIncome = totalIncome+Monthly_Commission_Amount;
        }
        if(Devidends_Interest){
            totalIncome = totalIncome+Devidends_Interest;
        }
        if(Net_rental_Income){
            totalIncome = totalIncome+Net_rental_Income;
        }
        if(Other_Income){
            totalIncome = totalIncome+Other_Income;
        }
        if(Total_Combined_Monthly_Expenses_Debt){
            totalIncome = totalIncome+Total_Combined_Monthly_Expenses_Debt;
        }
        if(Other_Total_Montly_Expenses_Debt){
            totalIncome = totalIncome+Other_Total_Montly_Expenses_Debt;
        }
        component.set("v.LoanApplicantIncomes.MonthlyIncomeAmount",totalIncome);
        
    },
    
    
    cancelForm : function(component, event, helper) {
        helper.navigateToUrl('/my-applications');
    },

    setCertificationTab:function(component, event, helper) {
        component.set("v.currentTab", "10");
    },
    
    submitPreApp :function(component, event, helper) {
        
        var loanApplication = component.get("v.ResidentialLoanApplication");
        
        console.log('loanApplication : ',loanApplication.Total_Ownership__c);
        if(loanApplication.Total_Ownership__c >= 90 && loanApplication.Id){
            helper.updateLoanApplicationStatus('Pre-App Completed');
        }else{
            console.log('All business owners in total must equal 90% or higher of the total ownership of the business.');
            var message = 'All business owners in total must equal 90% or higher of the total ownership of the business.';
            helper.showErrorToast(message);
        }
        
    },
    
    setCollateralInfo : function(component, event, helper) {
        console.log('setCollateralInfo');
		var response = event.getSource().get("v.checked");    
        console.log('setCollateralInfo : response',response);
        component.set("v.ResidentialLoanApplication.hasCollateralInfo__c", response);
    },
    
    getFinancialDetails : function(component, event, helper) {
        var loanApplication = component.get("v.ResidentialLoanApplication");
        if(loanApplication.Id){
            helper.setFinancialDetails(loanApplication.Id);
        }else{
            helper.showErrorToast('Please complete Business Information form');
        }
    },
    
    getCollateralInfo : function(component, event, helper) {
        console.log('getCollateralInfo');
        var loanApplication = component.get("v.ResidentialLoanApplication");
        if(loanApplication.Id){
            component.set("v.Spinner", true);
            helper.getCollateralInfo(loanApplication.Id);
        }else{
            helper.showErrorToast('Please complete Business Information form');
        }
    },
    
    editCollateralInfo : function(component, event, helper) {
        var selectedItem = event.currentTarget.dataset.row;
        var collateralInfoList = component.get("v.collateralInfoList");
        var collateralInfo = collateralInfoList[selectedItem];
        if(collateralInfo ){
            component.set("v.NewCollateralInfo",collateralInfo);
            component.set("v.showCollateralInfoForm", true);
        }else{
            component.set("v.NewCollateralInfo",{});
            helper.showErrorToast('Please complete previous steps');
        }
    },
    
    saveCollateralInfo : function(component, event, helper) {
        var loanApplication = component.get("v.ResidentialLoanApplication");
        if(loanApplication.Id){
            helper.saveCollateralInfo(loanApplication.Id);
        }else{
            helper.showErrorToast('Please complete Business Information form');
        }
    },
    
    addNewCollateralInfo: function(component, event, helper) {
        component.set("v.NewCollateralInfo", {});
        component.set("v.showCollateralInfoForm", true);
    },
    
    hideCollateralInfoForm: function(component, event, helper) {
        component.set("v.showCollateralInfoForm", false);
    },
})