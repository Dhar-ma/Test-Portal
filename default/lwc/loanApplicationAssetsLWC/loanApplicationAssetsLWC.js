/* eslint-disable guard-for-in */
/* eslint-disable vars-on-top */
/**
 * @description       :
 * @author            :
 * @group             :
 * @last modified on  : 04-17-2023
 * @last modified by  :
 **/

/**
 * @description       :
 * @author            :
 * @group             :
 * @last modified on  : 04-17-2023
 * @last modified by  :
 **/
import { LightningElement, api } from "lwc";
import getAssetList from "@salesforce/apex/BusinessLoanFormController.getAssetList";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import saveAsset from "@salesforce/apex/BusinessLoanFormController.saveAsset";

export default class LoanApplicationAssetsLWC extends LightningElement {
  AssetsAcolumns = [
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
    { label: "Year Acquired", fieldName: "year_Acquired__c" }
  ];

  AssetsBcolumns = [
    {
      label: "Action",
      type: "button-icon",
      typeAttributes: {
        iconName: "utility:edit",
        name: "edit",
        action: "ScheduleBForm"
      }
    },
    { label: "No Shares or Bond Amount", fieldName: "CashOrMarketValue" },
    { label: "Descriptions", fieldName: "Description__c" },
    { label: "Title In Name Of", fieldName: "Titled_In_Name_Of__c" },
    {
      label: "Amount At Which Carried On This Statement",
      fieldName: "Amount_Carried_on_Statemen__c"
    }
  ];

  AssetsCcolumns = [
    {
      label: "Action",
      type: "button-icon",
      typeAttributes: {
        iconName: "utility:edit",
        name: "edit",
        action: "ScheduleCForm"
      }
    },
    { label: "Name Of Bank/CU", fieldName: "FinancialInstitutionName" },
    {
      label: "Collateral Pledged as Security Or Name Of Comaker",
      fieldName: "Collateral_Pledged__c"
    },
    { label: "Monthly Payment", fieldName: "Payment__c" },
    { label: "Current Balance", fieldName: "Balance__c" }
  ];

  AssetsDcolumns = [
    {
      label: "Action",
      type: "button-icon",
      typeAttributes: {
        iconName: "utility:edit",
        name: "edit",
        action: "ScheduleDForm"
      }
    },
    { label: "Name Of Creditor", fieldName: "FinancialInstitutionName" },
    { label: "Collateral", fieldName: "Collateral_Pledged__c" },
    { label: "Monthly Payment", fieldName: "Payment__c" },
    { label: "Current Balance", fieldName: "Balance__c" }
  ];

  AssetsEcolumns = [
    {
      label: "Action",
      type: "button-icon",
      typeAttributes: {
        iconName: "utility:edit",
        name: "edit",
        action: "ScheduleFForm"
      }
    },
    { label: "Insurance Company", fieldName: "FinancialInstitutionName" },
    { label: "Insured", fieldName: "Insure__c" },
    { label: "Beneficiary", fieldName: "Beneficiary__c" },
    { label: "Cash Value", fieldName: "Cash_Value__c" }
  ];

  ScheduleAAssets = [];
  ScheduleBAssets = [];
  ScheduleCAssets = [];
  ScheduleDAssets = [];
  ScheduleFAssets = [];
  showScheduleAForm = false;
  showScheduleBForm = false;
  showScheduleCForm = false;
  showScheduleDForm = false;
  showScheduleFForm = false;
  @api residentialLoanApplication;
  @api currentTab;

  connectedCallback() {
    this.NewAsset = {};
    this.Assets = {};
    var loanApplicationId = this.residentialLoanApplication.Id;
    console.log("loanApplicationId:" + loanApplicationId);
    if (loanApplicationId) {
      this.getAssetList(loanApplicationId);
    }
  }

  showAssetsForm(event) {
    //helper.getLoanApplicantMap();
    let actionName = event.currentTarget.dataset.action;
    console.log("showAssetsForm actionName: ", actionName);
    this.NewAsset = {};

    //this.showAssetsForm = true;
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

  editAssetForm(event) {
    console.log("event:" + JSON.stringify(event.detail.row));
    console.log("event:" + event.detail.action.action);
    let selectedItem = event.detail.row;
    let actionName = event.detail.action.action;

    // console.log("actionName : ", actionName);
    // console.log("selectedItem : ", selectedItem);

    if (actionName === "ScheduleAForm") {
      this.NewAsset = selectedItem;
      this.showScheduleAForm = true;
    }
    if (actionName === "ScheduleBForm") {
      this.NewAsset = selectedItem;
      this.showScheduleBForm = true;
    }
    if (actionName === "ScheduleCForm") {
      this.NewAsset = selectedItem;
      this.showScheduleCForm = true;
    }
    if (actionName === "ScheduleDForm") {
      this.NewAsset = selectedItem;
      this.showScheduleDForm = true;
    }
    if (actionName === "ScheduleFForm") {
      this.NewAsset = selectedItem;
      this.showScheduleFForm = true;
    }
    console.log("NewAsset: " + JSON.stringify(this.NewAsset));
  }

  hideAssetsForm() {
    this.showScheduleAForm = false;
    this.showScheduleBForm = false;
    this.showScheduleCForm = false;
    this.showScheduleDForm = false;
    this.showScheduleFForm = false;
  }

  saveAssetForm(event) {
    var assetForm = this.NewAsset;
    console.log("AssetForm", JSON.stringify(assetForm));

    var actionName = event.target.title;
    console.log("actionName : ", actionName);

    var valid = this.validateForm(actionName);
    console.log("isValid : ", valid);

    var loanApplicationId = this.residentialLoanApplication.Id;
    if (loanApplicationId) {
      if (valid) {
        console.log("valid loan application : ");
        this.saveAssetForms("7", actionName);
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
  showErrorToast(title, message, variant) {
    const evt = new ShowToastEvent({
      title: title,
      message: message,
      variant: variant,
      mode: "dismissable"
    });
    this.dispatchEvent(evt);
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

  async getAssetList(loanApplicationId) {
    var param = {
      loanApplicationId: loanApplicationId
    };
    this.isLoaded = true;
    console.log("getPicklists - param -", param);
    try {
      let response = await getAssetList({
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
      this.Assets = resultMap.assets;

      var ScheduleAAssets = [];
      var ScheduleBAssets = [];
      var ScheduleCAssets = [];
      var ScheduleDAssets = [];
      var ScheduleFAssets = [];

      for (var key in resultMap.assets) {
        if (resultMap.assets[key].Schedule_Form_Type__c === "ScheduleAForm") {
          ScheduleAAssets.push(resultMap.assets[key]);
        }
        if (resultMap.assets[key].Schedule_Form_Type__c === "ScheduleBForm") {
          ScheduleBAssets.push(resultMap.assets[key]);
        }
        if (resultMap.assets[key].Schedule_Form_Type__c === "ScheduleCForm") {
          ScheduleCAssets.push(resultMap.assets[key]);
        }
        if (resultMap.assets[key].Schedule_Form_Type__c === "ScheduleDForm") {
          ScheduleDAssets.push(resultMap.assets[key]);
        }
        if (resultMap.assets[key].Schedule_Form_Type__c === "ScheduleFForm") {
          ScheduleFAssets.push(resultMap.assets[key]);
        }
      }

      this.ScheduleAAssets = ScheduleAAssets;
      this.ScheduleBAssets = ScheduleBAssets;
      this.ScheduleCAssets = ScheduleCAssets;
      this.ScheduleDAssets = ScheduleDAssets;
      this.ScheduleFAssets = ScheduleFAssets;
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
  //     this.AssetClasses = resultMap.assetOrLiabilityClass;
  //     this.AssetTypes = resultMap.assetOrLiabilityType;
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

  async saveAssetForms(tabToSet, ScheduleType) {
    console.log("saveAssetForms");
    this.isLoaded = true;

    var NewAsset = this.NewAsset;

    this.template.querySelectorAll(".ScheduleForm").forEach((element) => {
      NewAsset[element.dataset.fieldName] = element.value;
    });

    console.log("NewAsset: " + JSON.stringify(NewAsset));
    var AssetsLength = this.Assets ? Object.keys(this.Assets).length : 0;
    console.log("AssetsLength: ", ScheduleType + " " + AssetsLength);

    var loanApplication = this.residentialLoanApplication;
    if (!NewAsset.Schedule_Form_Type__c) {
      NewAsset.Schedule_Form_Type__c = ScheduleType;
    }
    if (!NewAsset.Name) {
      NewAsset.Name =
        loanApplication.Name + " " + ScheduleType + " " + AssetsLength;
    }
    var param = {
      asset: JSON.stringify(NewAsset),
      loanApplicationId: loanApplication.Id
    };

    console.log("saveAsset - param -", param);
    try {
      let response = await saveAsset({
        asset: JSON.stringify(NewAsset),
        loanApplicationId: loanApplication.Id
      });
      if (!response.isSuccess) {
        console.log("error : ", response.error);
        this.showErrorToast(response.error);
        this.isLoaded = false;
        return;
      }
      var resultMap = response.data;
      console.log("saveAsset data from server", resultMap);
      this.Assets = resultMap.assets;
      this.isLoaded = false;
      // this.currentTab = tabToSet;

      if (ScheduleType === "ScheduleAForm") {
        this.showScheduleAForm = false;
        this.ScheduleAAssets = resultMap.assets;
      }
      if (ScheduleType === "ScheduleBForm") {
        this.showScheduleBForm = false;
        this.ScheduleBAssets = resultMap.assets;
      }
      if (ScheduleType === "ScheduleCForm") {
        this.ScheduleCAssets = resultMap.assets;
        this.showScheduleCForm = false;
      }
      if (ScheduleType === "ScheduleDForm") {
        this.ScheduleDAssets = resultMap.assets;
        this.showScheduleDForm = false;
      }
      if (ScheduleType === "ScheduleFForm") {
        this.ScheduleFAssets = resultMap.assets;
        this.showScheduleFForm = false;
      }
    } catch (error) {
      console.error(error);
      this.isLoaded = false;
      this.showErrorToast("Error", error, "error");
    }
  }

  handelAddress(event) {
    let LoanApplicantAddress = JSON.parse(JSON.stringify(this.NewAsset));
    LoanApplicantAddress.ResidenceStreet = event.detail.street;
    LoanApplicantAddress.ResidenceCity = event.detail.city;
    LoanApplicantAddress.ResidenceCountry = event.detail.country;
    LoanApplicantAddress.ResidenceState = event.detail.province;
    LoanApplicantAddress.ResidencePostalCode = event.detail.postalCode;
    this.NewAsset = LoanApplicantAddress;
  }
}