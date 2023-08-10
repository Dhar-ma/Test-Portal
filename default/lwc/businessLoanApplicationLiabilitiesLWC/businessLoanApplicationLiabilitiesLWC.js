/* eslint-disable guard-for-in */
/* eslint-disable vars-on-top */

import { LightningElement, api } from "lwc";
import getLiabilityList from "@salesforce/apex/BusinessLoanFormController.getLiabilityList";
import saveLiability from "@salesforce/apex/BusinessLoanFormController.saveLiability";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
export default class BusinessLoanApplicationLiabilitiesLWC extends LightningElement {
  LiabilitiesAcolumns = [
    {
      label: "Action",
      type: "button-icon",
      typeAttributes: {
        iconName: "utility:edit",
        name: "edit",
        action: "ScheduleAForm"
      }
    },
    { label: "Type of Property", fieldName: "Type_of_Property__c" },
    { label: "Tiled In Named Of", fieldName: "Titled_In_Name_Of__c" },
    { label: "Cost", fieldName: "Cost__c" },
    { label: "Year Acquired", fieldName: "Year_Acquired__c" }
  ];

  LiabilitiesBcolumns = [
    {
      label: "Action",
      type: "button-icon",
      typeAttributes: {
        iconName: "utility:edit",
        name: "edit",
        action: "ScheduleBForm"
      }
    },
    { label: "No Shares or Bond Amount", fieldName: "PresentMarketValue__c" },
    { label: "Descriptions", fieldName: "Description__c" },
    { label: "Title In Name Of", fieldName: "Titled_In_Name_Of__c" },
    {
      label: "Amount At Which Carried On This Statement",
      fieldName: "Amount_Carried_on_Statemen__c"
    }
  ];

  LiabilitiesCcolumns = [
    {
      label: "Action",
      type: "button-icon",
      typeAttributes: {
        iconName: "utility:edit",
        name: "edit",
        action: "ScheduleCForm"
      }
    },
    { label: "Name Of Bank/CU", fieldName: "CreditorName" },
    {
      label: "Collateral Pledged as Security Or Name Of Comaker",
      fieldName: "Collateral_Pledged__c"
    },
    { label: "Monthly Payment", fieldName: "Payment__c" },
    { label: "Current Balance", fieldName: "Balance__c" }
  ];

  LiabilitiesDcolumns = [
    {
      label: "Action",
      type: "button-icon",
      typeAttributes: {
        iconName: "utility:edit",
        name: "edit",
        action: "ScheduleDForm"
      }
    },
    { label: "Name Of Creditor", fieldName: "CreditorName" },
    { label: "Collateral", fieldName: "Collateral_Pledged__c" },
    { label: "Monthly Payment", fieldName: "Payment__c" },
    { label: "Current Balance", fieldName: "Balance__c" }
  ];

  LiabilitiesEcolumns = [
    {
      label: "Action",
      type: "button-icon",
      typeAttributes: {
        iconName: "utility:edit",
        name: "edit",
        action: "ScheduleFForm"
      }
    },
    { label: "Insurance Company", fieldName: "CreditorName" },
    { label: "Insured", fieldName: "Insure__c" },
    { label: "Beneficiary", fieldName: "Beneficiary__c" },
    { label: "Cash Value", fieldName: "Cash_Value__c" }
  ];

  ScheduleALiabilities = [];
  ScheduleBLiabilities = [];
  ScheduleCLiabilities = [];
  ScheduleDLiabilities = [];
  ScheduleFLiabilities = [];
  showScheduleAForm = false;
  showScheduleBForm = false;
  showScheduleCForm = false;
  showScheduleDForm = false;
  showScheduleFForm = false;
  @api residentialLoanApplication;
  @api currentTab;
  NewLiability = {};
  Liabilities = {};

  connectedCallback() {
    this.NewLiability = {};
    this.Liabilities = {};
    var loanApplicationId = this.residentialLoanApplication.Id;
    console.log("loanApplicationId:" + loanApplicationId);
    if (loanApplicationId) {
      this.getLiabilityList(loanApplicationId);
    }
  }

  showLiabilitiesForm(event) {
    //helper.getLoanApplicantMap();
    let actionName = event.currentTarget.dataset.action;
    console.log("showLiabilitiesForm actionName: ", actionName);
    this.NewLiability = {};

    //this.showLiabilitiesForm = true;
    if (actionName === "ScheduleAForm") {
      this.showScheduleAForm = true;
    }
    if (actionName === "ScheduleBForm") {
      this.showScheduleBForm = true;
    }
    if (actionName === "ScheduleCForm") {
      this.showScheduleCForm = true;
    }
    if (actionName === "ScheduleDForm") {
      this.showScheduleDForm = true;
    }
    if (actionName === "ScheduleFForm") {
      this.showScheduleFForm = true;
    }
  }

  editLiabilityForm(event) {
    console.log("event:" + JSON.stringify(event.detail.row));
    console.log("event:" + event.detail.action.action);
    let selectedItem = event.detail.row;
    let actionName = event.detail.action.action;

    // console.log("actionName : ", actionName);
    // console.log("selectedItem : ", selectedItem);

    if (actionName === "ScheduleAForm") {
      this.NewLiability = selectedItem;
      this.showScheduleAForm = true;
    }
    if (actionName === "ScheduleBForm") {
      this.NewLiability = selectedItem;
      this.showScheduleBForm = true;
    }
    if (actionName === "ScheduleCForm") {
      this.NewLiability = selectedItem;
      this.showScheduleCForm = true;
    }
    if (actionName === "ScheduleDForm") {
      this.NewLiability = selectedItem;
      this.showScheduleDForm = true;
    }
    if (actionName === "ScheduleFForm") {
      this.NewLiability = selectedItem;
      this.showScheduleFForm = true;
    }
    console.log("NewLiability: " + JSON.stringify(this.NewLiability));
  }

  hideLiabilitiesForm() {
    this.showScheduleAForm = false;
    this.showScheduleBForm = false;
    this.showScheduleCForm = false;
    this.showScheduleDForm = false;
    this.showScheduleFForm = false;
  }

  saveLiabilityForm(event) {
    var assetForm = this.NewLiability;
    console.log("LiabilityForm", JSON.stringify(assetForm));

    var actionName = event.target.title;
    console.log("actionName : ", actionName);

    var valid = this.validateForm(actionName);
    console.log("isValid : ", valid);

    var loanApplicationId = this.residentialLoanApplication.Id;
    if (loanApplicationId) {
      if (valid) {
        console.log("valid loan application : ");
        this.saveLiabilityForms("8", actionName);
      } else {
        this.showErrorToast(
          "Error",
          "Please enter all required fields",
          "error"
        );
      }
    } else {
      console.log("else : ");
      this.showErrorToast("Error", "Please complete previous steps", "error");
    }
  }

  validateForm(className) {
    this.isLoaded = true;
    let isValid = true;
    let inputFields = this.template.querySelectorAll(className);
    inputFields.forEach((inputField) => {
      if (!inputField.checkValidity()) {
        inputField.reportValidity();
        isValid = false;
      }
    });
    this.isLoaded = false;
    return isValid;
  }

  async getLiabilityList(loanApplicationId) {
    var param = {
      loanApplicationId: loanApplicationId
    };
    this.isLoaded = true;
    console.log("getPicklists - param -", param);
    try {
      let response = await getLiabilityList({
        loanApplicationId: loanApplicationId
      });
      if (!response.isSuccess) {
        console.log("error : ", response.error);
        this.showErrorToast("Error", response.error, "error");
        this.isLoaded = false;
        return;
      }
      var resultMap = response.data;
      console.log("getPicklistValues data from server", resultMap);
      this.isLoaded = false;
      this.Liabilities = resultMap.liabilities;

      var ScheduleALiabilities = [];
      var ScheduleBLiabilities = [];
      var ScheduleCLiabilities = [];
      var ScheduleDLiabilities = [];
      var ScheduleFLiabilities = [];

      for (var key in resultMap.liabilities) {
        if (
          resultMap.liabilities[key].Schedule_Form_Type__c === "ScheduleAForm"
        ) {
          ScheduleALiabilities.push(resultMap.liabilities[key]);
        }
        if (
          resultMap.liabilities[key].Schedule_Form_Type__c === "ScheduleBForm"
        ) {
          ScheduleBLiabilities.push(resultMap.liabilities[key]);
        }
        if (
          resultMap.liabilities[key].Schedule_Form_Type__c === "ScheduleCForm"
        ) {
          ScheduleCLiabilities.push(resultMap.liabilities[key]);
        }
        if (
          resultMap.liabilities[key].Schedule_Form_Type__c === "ScheduleDForm"
        ) {
          ScheduleDLiabilities.push(resultMap.liabilities[key]);
        }
        if (
          resultMap.liabilities[key].Schedule_Form_Type__c === "ScheduleFForm"
        ) {
          ScheduleFLiabilities.push(resultMap.liabilities[key]);
        }
      }

      this.ScheduleALiabilities = ScheduleALiabilities;
      this.ScheduleBLiabilities = ScheduleBLiabilities;
      this.ScheduleCLiabilities = ScheduleCLiabilities;
      this.ScheduleDLiabilities = ScheduleDLiabilities;
      this.ScheduleFLiabilities = ScheduleFLiabilities;
    } catch (error) {
      console.error(error);
      this.isLoaded = false;
      this.showErrorToast("Error", error, "error");
    }
  }

  // async getPicklistValues(tabName) {
  //   var param = {
  //     type: tabName
  //   };
  //   this.isLoaded = true;
  //   console.log("getPicklists - param -", param);
  //   try {
  //     // let response = await getPicklists({ type: tabName });
  //     if (!response.isSuccess) {
  //       console.log("error : ", response.error);
  //       this.showErrorToast(response.error);
  //       this.isLoaded = false;
  //       return;
  //     }
  //     var resultMap = response.data;
  //     console.log("getPicklistValues data from server", resultMap);
  //     this.isLoaded = false;
  //     this.LiabilityClasses = resultMap.assetOrLiabilityClass;
  //     this.LiabilityTypes = resultMap.assetOrLiabilityType;
  //     this.AccountTypes = resultMap.accountType;
  //   } catch (error) {
  //     console.error(error);
  //   }
  // }

  getLoanApplicantMap() {
    console.log("getLoanApplicantMap");
    var loanApplicants = this.LoanApplicant;
    var loanApplicantMap = [];

    for (var key in loanApplicants) {
      loanApplicantMap.push({
        label: loanApplicants[key].Name,
        value: loanApplicants[key].Id
      });
    }
    console.log("loanApplicantMap : ", loanApplicantMap);
    this.LoanApplicantMap = loanApplicantMap;
  }

  async saveLiabilityForms(tabToSet, ScheduleType) {
    console.log("saveLiabilityForms");
    this.isLoaded = true;

    var NewLiability = this.NewLiability;

    this.template.querySelectorAll(".ScheduleForm").forEach((element) => {
      NewLiability[element.dataset.fieldName] = element.value;
    });

    console.log("NewLiability: " + JSON.stringify(NewLiability));
    var LiabilitiesLength = this.Liabilities
      ? Object.keys(this.Liabilities).length
      : 0;
    console.log("LiabilitiesLength: ", ScheduleType + " " + LiabilitiesLength);

    var loanApplication = this.residentialLoanApplication;
    if (!NewLiability.Schedule_Form_Type__c) {
      NewLiability.Schedule_Form_Type__c = ScheduleType;
    }
    if (!NewLiability.Name) {
      NewLiability.Name =
        loanApplication.Name + " " + ScheduleType + " " + LiabilitiesLength;
    }
    var param = {
      asset: JSON.stringify(NewLiability),
      loanApplicationId: loanApplication.Id
    };

    console.log("saveLiability - param -", param);
    try {
      let response = await saveLiability({
        liability: JSON.stringify(NewLiability),
        loanApplicationId: loanApplication.Id
      });
      if (!response.isSuccess) {
        console.log("error : ", response.error);
        this.showErrorToast("Error", response.error, "error");
        this.isLoaded = false;
        return;
      }
      var resultMap = response.data;
      console.log("saveLiability data from server", JSON.stringify(resultMap));
      this.Liabilities = resultMap.liabilities;
      this.isLoaded = false;

      if (ScheduleType === "ScheduleAForm") {
        this.showScheduleAForm = false;
        this.ScheduleALiabilities = resultMap.liabilities;
      }
      if (ScheduleType === "ScheduleBForm") {
        this.showScheduleBForm = false;
        this.ScheduleBLiabilities = resultMap.liabilities;
      }
      if (ScheduleType === "ScheduleCForm") {
        this.ScheduleCLiabilities = resultMap.liabilities;

        this.showScheduleCForm = false;
      }
      if (ScheduleType === "ScheduleDForm") {
        this.ScheduleDLiabilities = resultMap.liabilities;

        this.showScheduleDForm = false;
      }
      if (ScheduleType === "ScheduleFForm") {
        this.ScheduleFLiabilities = resultMap.liabilities;
        this.showScheduleFForm = false;
      }
    } catch (error) {
      console.error(error);
      this.isLoaded = false;
      this.showErrorToast("Error", error, "error");
    }
  }
  showErrorToast(title, message, variant) {
    const evt = new ShowToastEvent({
      title: title,
      message: message,
      variant: variant,
      mode: "dismissable"
    });
    this.dispatchEvent(evt);
  }

  handelAddress(event) {
    let LoanApplicantAddress = JSON.parse(JSON.stringify(this.NewLiability));
    LoanApplicantAddress.ResidenceStreet = event.detail.street;
    LoanApplicantAddress.ResidenceCity = event.detail.city;
    LoanApplicantAddress.ResidenceCountry = event.detail.country;
    LoanApplicantAddress.ResidenceState = event.detail.province;
    LoanApplicantAddress.ResidencePostalCode = event.detail.postalCode;
    this.NewLiability = LoanApplicantAddress;
  }
}