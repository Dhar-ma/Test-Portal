/**
 * @description       : 
 * @author            : 'Amol K'
 * @group             : 
 * @last modified on  : 02-20-2023
 * @last modified by  : 'Amol K'
**/
({
  doInit: function (component, event, helper) {
    console.log("doInit mortgage");
    helper.component = component;
    //MortgageLoanProgram

    component.set("v.Yes_No_options", [
      { label: "Yes", value: true },
      { label: "No", value: false }
    ]);

    component.set("v.consentOption", [
      { label: "I Accept", value: true },
      { label: "I Decline", value: false }
    ]);

    component.set("v.MaritalStatus", [
      { label: "Married", value: "Married" },
      { label: "Separated", value: "Separated" },
      { label: "Unmarried", value: "Unmarried" }
    ]);

    component.set("v.ApplicationQuestion", {});
    component.set("v.ResidentialLoanApplication", {});
    component.set("v.LoanApplicant", {});
    component.set("v.NewLoanApplicant", {});
    component.set("v.LoanApplicantAddress", {});
    component.set("v.LoanApplicantMalingAddress", {});
    component.set("v.LoanApplicantEmployment", {});
    component.set("v.currentUserContact", {});
    component.set("v.LoanApplicantIncomes", {});
    helper.setLoanTerms();
    var recordId;
    if (helper.getURLParameter("id")) {
      recordId = helper.getURLParameter("id");
      console.log("recordId :", recordId);
    }
    helper.loadInitialData(recordId);
  },

  showApplicationQuestionTab: function (component, event, helper) {
    var checked = component.find("read-me").get("v.checked");
    if (checked) {
      component.set("v.currentTab", "1");
    } else {
      helper.showErrorToast("Please read instruction and mark the checkbox");
    }
  },

  saveLoanApplicantInfo: function (component, event, helper) {
    var actionName = event.getSource().get("v.value");

    var loanApplicationId = component.get("v.ResidentialLoanApplication").Id;
    if (loanApplicationId) {
      console.log(
        "saveLoanApplicantInfo loanApplicationId:",
        loanApplicationId
      );
      if (actionName == "CreditApproval") {
        helper.saveLoanApplicant("2", loanApplicationId);
      } else {
        helper.saveLoanApplicant("1", loanApplicationId);
      }
    } else {
      helper.showErrorToast("Please Create Loan Application First");
    }
  },

  saveApplicantQuestions: function (component, event, helper) {
    console.log("saveLoanapplicantQuestions");
    var loanApplicant = component.get("v.NewLoanApplicant");
    console.log("loanApplicant Id : ", loanApplicant);
    if (loanApplicant.Id) {
      helper.saveLoanapplicantQuestion("3");
    } else {
      helper.showErrorToast("Please Complete Loan Applicant Form");
    }
  },

  saveApplicantAddress: function (component, event, helper) {
    var loanApplicant = component.get("v.NewLoanApplicant");
    if (loanApplicant.Id) {
      var loanApplicantAddress = component.get("v.LoanApplicantAddress");
      if (!loanApplicantAddress.Id) {
        loanApplicantAddress.Name = loanApplicant.Name + " Present Address";
        loanApplicantAddress.ResidencyType = "Present Address";
        loanApplicantAddress.LoanApplicationId =
          loanApplicant.LoanApplicationId;
        loanApplicantAddress.LoanApplicantId = loanApplicant.Id;
      }
      console.log(
        "loanApplicantAddress  : ",
        JSON.stringify(loanApplicantAddress)
      );
      var loanApplicantMailingAddress = component.get(
        "v.LoanApplicantMalingAddress"
      );
      if (!loanApplicantMailingAddress.Id) {
        loanApplicantMailingAddress.Name =
          loanApplicant.Name + " Mailing Address";
        loanApplicantMailingAddress.ResidencyType = "Mailing Address";
        loanApplicantMailingAddress.LoanApplicationId =
          loanApplicant.LoanApplicationId;
        loanApplicantMailingAddress.LoanApplicantId = loanApplicant.Id;
      }
      console.log(
        "loanApplicantMailingAddress  : ",
        JSON.stringify(loanApplicantMailingAddress)
      );
      helper.saveAddress(
        "4",
        loanApplicantAddress,
        loanApplicantMailingAddress
      );
    } else {
      helper.showErrorToast("Please Complete Loan Applicant Form");
    }
  },

  saveApplicantEmployment: function (component, event, helper) {
    var loanApplicant = component.get("v.NewLoanApplicant");
    if (loanApplicant.Id) {
      helper.saveEmployment("5");
    } else {
      helper.showErrorToast("Please Complete Loan Applicant Form");
    }
  },

  saveApplicantIncomes: function (component, event, helper) {
    var loanApplicant = component.get("v.NewLoanApplicant");
    if (loanApplicant.Id) {
      helper.saveIncomes("6");
    } else {
      helper.showErrorToast("Please Complete Loan Applicant Form");
    }
  },

  saveApplicantExpense: function (component, event, helper) {
    var loanApplicant = component.get("v.NewLoanApplicant");
    if (loanApplicant.Id) {
      helper.saveApplicantExpense("7");
    } else {
      helper.showErrorToast("Please Complete Loan Applicant Form");
    }
  },

  saveApplicantConsent: function (component, event, helper) {
    var actionName = event.getSource().get("v.title");
    console.log("actionName : ", actionName);
    var loanApplicant = component.get("v.NewLoanApplicant");
    console.log("loanApplicant Id : ", loanApplicant);
    if (loanApplicant.Id) {
      helper.saveLoanapplicantConsent("0", actionName);
    } else {
      helper.showErrorToast("Please Complete Loan Applicant Form");
    }
  },

  editBorrowerForm: function (component, event, helper) {
    component.set("v.Spinner", true);
    var selectedItem = event.currentTarget.dataset.row;
    var borrowerList = component.get("v.LoanApplicant");
    var loanApplicantId = borrowerList[selectedItem].Id;
    if (loanApplicantId) {
      helper.getLoanApplicantRecord(loanApplicantId);
    } else {
      component.set("v.Spinner", false);
      helper.showErrorToast("Please complete previous steps");
    }
  },

  showNewBorrowerForm: function (component, event, helper) {
    console.log("In showNewBorrowerForm");
    component.set("v.Spinner", true);
    component.set("v.NewLoanApplicant", {});
    component.set("v.ApplicationQuestion", {});
    component.set("v.LoanApplicantAddress", {});
    component.set("v.LoanApplicantMalingAddress", {});
    component.set("v.LoanApplicantEmployment", {});
    component.set("v.LoanApplicantIncomes", {});
    component.set("v.NewLoanApplicant.BorrowerType", "CoBorrower");
    console.log(
      "NewLoanApplicant : ",
      JSON.stringify(component.get("v.NewLoanApplicant"))
    );
    component.set("v.showBorrowerForm", true);
    helper.setDeclarationQuestions(null);
    component.set("v.Spinner", false);
  },

  showTradeInFrom: function (component, event, helper) {
    var response = event.getSource().get("v.checked");
    component.set("v.ResidentialLoanApplication.Add_Trade_In__c", response);
  },

  setSelfEmployment: function (component, event, helper) {
    var response = event.getSource().get("v.checked");
    component.set("v.LoanApplicantEmployment.IsSelfEmployed", response);
  },

  hideBorrowerForm: function (component, event, helper) {
    component.set("v.showBorrowerForm", false);
  },

  saveLoanInformation: function (component, event, helper) {
    console.log("saveLoanInformation");
    var valid = helper.validateForm("vehicleLoanInfo");
    if (!valid) {
      helper.showErrorToast("Please enter all required fields");
    } else {
      helper.saveLoanApplication("2");
    }
  },

  editCertificationForm: function (component, event, helper) {
    var selectedItem = event.currentTarget.dataset.row;
    console.log("selectedItem : ", selectedItem);
    var borrowerList = component.get("v.LoanApplicant");
    var loanApplicantId = borrowerList[selectedItem].Id;
    console.log("loanApplicantId : ", loanApplicantId);
    if (loanApplicantId) {
      helper.getCertificationRecord(loanApplicantId);
      component.set("v.showCertificationForm", true);
    } else {
      helper.showErrorToast("Please complete loan applicant form first");
    }
  },

  submitFullApp: function (component, event, helper) {
    var loanApplication = component.get("v.ResidentialLoanApplication");
    if (
      loanApplication.Status == "Pre-App Approved" ||
      loanApplication.Status == "Full App Started"
    ) {
      helper.updateLoanApplicationStatus("Full App Completed");
      helper.progressBarSetup("Full App Completed");
    }
  },

  saveCertificationForm: function (component, event, helper) {
    helper.saveCertificationRecord("5");
  },

  showCertificationForm: function (component, event, helper) {
    component.set("v.showCertificationForm", true);
  },

  hideCertificationForm: function (component, event, helper) {
    component.set("v.showCertificationForm", false);
  },

  onGroup: function (component, event) {
    console.log("onGroup");
    var changeValue = false;
    var selectedlabel = event.getSource().get("v.label");
    console.log("selectedlabel : ", selectedlabel);
    if (selectedlabel == "Yes") {
      changeValue = true;
    }
    console.log("changeValue : ", changeValue);
    var fieldName = event.getSource().get("v.name");
    console.log("selectedname : ", fieldName);
    if (fieldName == "HasOutstandingJudgement") {
      component.set(
        "v.ApplicationQuestion.HasOutstandingJudgement",
        changeValue
      );
    }
    if (fieldName == "HasDeclaredBankruptcy") {
      component.set("v.ApplicationQuestion.HasDeclaredBankruptcy", changeValue);
    }
    if (fieldName == "HasPropertyForeclosed") {
      component.set("v.ApplicationQuestion.HasPropertyForeclosed", changeValue);
    }
    if (fieldName == "IsPartyToLawsuit") {
      component.set("v.ApplicationQuestion.IsPartyToLawsuit", changeValue);
    }
    if (fieldName == "HasDeedSurrender") {
      component.set("v.ApplicationQuestion.HasDeedSurrender", changeValue);
    }
    if (fieldName == "IsPresentlyDelinquent") {
      component.set("v.ApplicationQuestion.IsPresentlyDelinquent", changeValue);
    }
    if (fieldName == "HasBorrowedMoney") {
      component.set("v.ApplicationQuestion.HasBorrowedMoney", changeValue);
    }
    if (fieldName == "IsCoSignerUndisclDebt") {
      component.set("v.ApplicationQuestion.IsCoSignerUndisclDebt", changeValue);
    }
    if (fieldName == "IsPrimaryResidence") {
      component.set("v.ApplicationQuestion.IsPrimaryResidence", changeValue);
    }
    if (fieldName == "HasOwnershipInterest") {
      component.set("v.ApplicationQuestion.HasOwnershipInterest", changeValue);
    }
    if (fieldName == "Is_Obligated_To_Pay__c") {
      component.set(
        "v.ApplicationQuestion.Is_Obligated_To_Pay__c",
        changeValue
      );
    }
    if (fieldName == "Is_US_Citizen__c") {
      component.set("v.ApplicationQuestion.Is_US_Citizen__c", changeValue);
    }
    if (fieldName == "Is_Permanent_Resident_Alien__c") {
      component.set(
        "v.ApplicationQuestion.Is_Permanent_Resident_Alien__c",
        changeValue
      );
    }
    if (fieldName == "Applicant_Consent__c") {
      component.set("v.ApplicationQuestion.Applicant_Consent__c", changeValue);
    }
    console.log(
      "ApplicationQuestion value :",
      JSON.stringify(component.get("v.ApplicationQuestion"))
    );
  },

  closeSelectApplicationType: function (component, event, helper) {
    component.set("v.showFormTypeSelector", false);
  },

  setMortgageType: function (component, event, helper) {
    var loantype = component.find("loan-type").get("v.value");
    var consumerOptions = component.get("v.ConsumerOptions");
    var loanProgramMap = component.get("v.ConsumerLoanProgramMap");
    var vehicleTypeMakeMap = component.get("v.vehicleTypeMakeMap");

    if (loantype) {
      var cosumerType = loanProgramMap.get(loantype).Name;
      var vehicleTypeMakeList = vehicleTypeMakeMap[cosumerType];
      component.set("v.selectedConsumerType", loantype);
      component.set("v.ConsumerLoanProgram", loanProgramMap.get(loantype));
      component.set("v.vehicleMakeList", vehicleTypeMakeMap[cosumerType]);
    } else {
      component.set("v.selectedConsumerType", consumerOptions[0].value);
      component.set(
        "v.ConsumerLoanProgram",
        loanProgramMap.get(consumerOptions[0].value)
      );
      component.set(
        "v.vehicleMakeList",
        vehicleTypeMakeMap[consumerOptions[0].key]
      );
      console.log("vehicleMakeList :", component.get("v.vehicleMakeList"));
    }
    var ResidentialLoanApplication = component.get(
      "v.ResidentialLoanApplication"
    );
    ResidentialLoanApplication.Consumer_Types__c = component.get(
      "v.ConsumerLoanProgram"
    ).Name;
    component.set("v.ResidentialLoanApplication", ResidentialLoanApplication);
    component.set("v.showFormTypeSelector", false);
  },

  getBorrowerAddress: function (component, event, helper) {
    var response = event.getSource().get("v.checked");
    console.log("checkBoxState :", response);
    if (response) {
      var loanApplicant = component.get("v.LoanApplicant");
      for (var key in loanApplicant) {
        console.log("Loan Applicant : ", loanApplicant[key]);
        if (loanApplicant[key].BorrowerType == "Borrower") {
          console.log("Borrower Id :", loanApplicant[key].Id);
          helper.getBorrowerAddress(loanApplicant[key].Id);
          break;
        }
      }
    }
  },

  copyAddress: function (component, event, helper) {
    var loanApplicantAddress = component.get("v.LoanApplicantAddress");
    var loanApplicantMailingAddress = component.get(
      "v.LoanApplicantMalingAddress"
    );
    loanApplicantMailingAddress.ResidenceStreet =
      loanApplicantAddress.ResidenceStreet;
    loanApplicantMailingAddress.ResidenceCity =
      loanApplicantAddress.ResidenceCity;
    loanApplicantMailingAddress.ResidenceCountry =
      loanApplicantAddress.ResidenceCountry;
    loanApplicantMailingAddress.ResidenceState =
      loanApplicantAddress.ResidenceState;
    loanApplicantMailingAddress.ResidencePostalCode =
      loanApplicantAddress.ResidencePostalCode;
    component.set("v.LoanApplicantMalingAddress", loanApplicantMailingAddress);
  },

  calculateTotalIncome: function (component, event, helper) {
    var totalIncome = 0;
    var Base_Monthly_Salary = parseFloat(
      component.get("v.LoanApplicantIncomes.Base_Monthly_Salary__c")
    );
    var Monthly_Overtime_Amount = parseFloat(
      component.get("v.LoanApplicantIncomes.Monthly_Overtime_Amount__c")
    );
    var Monthly_Bonus_Amount = parseFloat(
      component.get("v.LoanApplicantIncomes.Monthly_Bonus_Amount__c")
    );
    var Monthly_Commission_Amount = parseFloat(
      component.get("v.LoanApplicantIncomes.Monthly_Commission_Amount__c")
    );
    var Devidends_Interest = parseFloat(
      component.get("v.LoanApplicantIncomes.Devidends_Interest__c")
    );
    var Net_rental_Income = parseFloat(
      component.get("v.LoanApplicantIncomes.Net_rental_Income__c")
    );
    var Other_Income = parseFloat(
      component.get("v.LoanApplicantIncomes.Other_Income__c")
    );
    var Total_Combined_Monthly_Expenses_Debt = parseFloat(
      component.get(
        "v.LoanApplicantIncomes.Total_Combined_Monthly_Expenses_Debt__c"
      )
    );
    var Other_Total_Montly_Expenses_Debt = parseFloat(
      component.get(
        "v.LoanApplicantIncomes.Other_Total_Montly_Expenses_Debt__c"
      )
    );
    if (Base_Monthly_Salary) {
      totalIncome = totalIncome + Base_Monthly_Salary;
    }
    if (Monthly_Overtime_Amount) {
      totalIncome = totalIncome + Monthly_Overtime_Amount;
    }
    if (Monthly_Bonus_Amount) {
      totalIncome = totalIncome + Monthly_Bonus_Amount;
    }
    if (Monthly_Commission_Amount) {
      totalIncome = totalIncome + Monthly_Commission_Amount;
    }
    if (Devidends_Interest) {
      totalIncome = totalIncome + Devidends_Interest;
    }
    if (Net_rental_Income) {
      totalIncome = totalIncome + Net_rental_Income;
    }
    if (Other_Income) {
      totalIncome = totalIncome + Other_Income;
    }
    if (Total_Combined_Monthly_Expenses_Debt) {
      totalIncome = totalIncome + Total_Combined_Monthly_Expenses_Debt;
    }
    if (Other_Total_Montly_Expenses_Debt) {
      totalIncome = totalIncome + Other_Total_Montly_Expenses_Debt;
    }
    component.set("v.LoanApplicantIncomes.MonthlyIncomeAmount", totalIncome);
  },

  calculateTotalExpenses: function (component, event, helper) {
    var totalExpense = 0;
    var Outstanding_Loans_Expenses = parseFloat(
      component.get("v.NewLoanApplicant.Outstanding_Loans_Expenses__c")
    );
    var Credit_Cards_Expenses = parseFloat(
      component.get("v.NewLoanApplicant.Credit_Cards_Expenses__c")
    );
    var Lines_of_Credit_Expenses = parseFloat(
      component.get("v.NewLoanApplicant.Lines_of_Credit_Expenses__c")
    );
    var Alimony_Expenses = parseFloat(
      component.get("v.NewLoanApplicant.Alimony_Expenses__c")
    );
    var Child_Support_Expenses = parseFloat(
      component.get("v.NewLoanApplicant.Child_Support_Expenses__c")
    );
    var Other_Expenses = parseFloat(
      component.get("v.NewLoanApplicant.Other_Expenses__c")
    );
    if (Outstanding_Loans_Expenses) {
      totalExpense = totalExpense + Outstanding_Loans_Expenses;
    }
    if (Credit_Cards_Expenses) {
      totalExpense = totalExpense + Credit_Cards_Expenses;
    }
    if (Lines_of_Credit_Expenses) {
      totalExpense = totalExpense + Lines_of_Credit_Expenses;
    }
    if (Alimony_Expenses) {
      totalExpense = totalExpense + Alimony_Expenses;
    }
    if (Child_Support_Expenses) {
      totalExpense = totalExpense + Child_Support_Expenses;
    }
    if (Other_Expenses) {
      totalExpense = totalExpense + Other_Expenses;
    }
    console.log("totalExpense :", totalExpense);
    component.set(
      "v.NewLoanApplicant.Monthly_Expenses_Amount__c",
      totalExpense
    );
  },

  cancelForm: function (component, event, helper) {
    helper.navigateToUrl("/my-applications");
  },

  setCertificationTab: function (component, event, helper) {
    component.set("v.currentTab", "7");
  }
});