/* eslint-disable no-use-before-define */
/* eslint-disable no-unused-vars */
/* eslint-disable vars-on-top */
/* eslint-disable guard-for-in */
import { LightningElement } from "lwc";
import { NavigationMixin } from "lightning/navigation";
import CaseTypsIcons from "@salesforce/resourceUrl/CaseTypsIcons";
import getDependetPicklistValues from "@salesforce/apex/CommunityUtils.getDependetPicklistValues";
import getFinancialAccounts from "@salesforce/apex/CommunityUtils.getFinancialAccounts";
import saveAssociateProductTypes from "@salesforce/apex/CommunityUtils.saveAssociateProductTypes";

export default class HomeScreen_ActionsLWC extends NavigationMixin(
  LightningElement
) {
  objDetail = { sobjectType: "Case" };
  caseType = "Type";
  caseReason = "Action_Type__c";
  productType = "Product_Type__c";
  listCaseType = [];
  caseTypeReasonMap;
  caseReasonProductTypeMap;
  financialAccountTypeMap;
  isDataLoad = false;
  showNewCaseForm = false;
  objectApiName = "Case";
  caseReasonList = [];
  subject;
  caseRec;
  actionType;
  value = "--- None ---";
  Disclosure = "";
  financialAccounts = [];
  listProductType = [];
  productTypesList = [];
  isproductTypesList = false;
  checkBoxvalue = "";
  isaddField = false;
  additionalCaseFieldsList;
  isLoaded = false;
  showSuccessMessage = false;

  connectedCallback() {
    this.getDependetPicklistValue();
    this.getFinancialAccount();
  }

  async getFinancialAccount() {
    this.isLoaded = true;
    let result = await getFinancialAccounts();
    {
      console.log("getFinancialAccounts:" + JSON.stringify(result));
      this.financialAccounts = result;
    }
    this.isLoaded = false;
  }

  async getDependetPicklistValue() {
    let result = await getDependetPicklistValues({
      objDetail: this.objDetail,
      contrfieldApiName: this.caseType,
      depfieldApiName: this.caseReason,
      productTypeField: this.productType
    });
    {
      this.isLoaded = true;
      console.log("result:" + JSON.stringify(result));
      console.log("getDependetPicklistValues:" + JSON.stringify(result));
      console.log(
        "result.isMortgageCommunity:" + result.data.isMortgageCommunity
      );
      this.caseTypeReasonMap = result.data.caseTypeReasonMap;
      this.financialAccountTypeMap = result.data.financialAccountTypeMap;
      this.caseReasonProductTypeMap = result.data.caseReasonProductTypeMap;
      if (result.data.isMortgageCommunity) {
        this.isLoaded = true;
        console.log(
          "result.data.mortgageCaseTypeList:" +
            JSON.stringify(result.data.mortgageCaseTypeList)
        );
        result.data.mortgageCaseTypeList.forEach((element) => {
          console.log("element:" + element);
          if (element) {
            let caseObj = {};
            caseObj.Type = element;
            let type = element.replace(/[^A-Z0-9]/gi, "");
            //   {!$Resource.CaseTypsIcons + '/Icons/'+caseType.Name+'.PNG'}
            let Logo = CaseTypsIcons + "/Icons/" + type + ".PNG";
            caseObj.Logo = Logo;
            caseObj.Name = type;
            console.log("caseObj:" + caseObj);
            this.listCaseType.push(caseObj);
          }
        });
        this.isDataLoad = true;
        console.log("listCaseType:" + JSON.stringify(this.listCaseType));
        this.isLoaded = false;
      } else {
        this.isLoaded = true;
        result.data.caseTypeReasonMap.forEach((element) => {
          let caseObj = {};
          if (element) {
            caseObj.Type = element;
            let type = element;
            caseObj.Name = type.replace(/[^A-Z0-9]/gi, "");
            console.log("caseObj.Name : ", caseObj.Name);
            this.listCaseType.push(caseObj);
          }
        });
        this.isDataLoad = true;
        this.isLoaded = false;
        console.log("listCaseType:" + JSON.stringify(this.listCaseType));
      }
      this.isLoaded = false;
    }
  }

  handleRequestClick(event) {
    this.isLoaded = true;
    this.subject = "";
    this.subject = event.currentTarget.dataset.name;
    this.caseRec = {
      Subject: this.subject,
      Type: this.subject
    };

    console.log("caseType:" + this.subject);
    var caseReasons = this.caseTypeReasonMap[this.subject];
    this.caseReasonList = [];
    this.caseReasonList.push({ label: "--- None ---", value: "None" });

    for (var i = 0; i < caseReasons.length; i++) {
      this.caseReasonList.push({
        label: caseReasons[i],
        value: caseReasons[i]
      });
    }

    console.log("caseReasons:" + JSON.stringify(this.caseTypeReasonMap));
    console.log("caseReasons:" + JSON.stringify(caseReasons));
    this.showNewCaseForm = true;
    this.isLoaded = false;
  }

  handleClose() {
    this.isLoaded = true;
    this.Disclosure = "";
    this.productTypesList = [];
    this.isproductTypesList = false;
    this.isaddField = false;
    this.showNewCaseForm = false;
    this.showSuccessMessage = false;
    this.additionalCaseFieldsList = [];
    this.isLoaded = false;
  }
  handleReset() {
    this.isLoaded = true;
    const inputFields = this.template.querySelectorAll("lightning-input-field");
    if (inputFields) {
      inputFields.forEach((field) => {
        field.reset();
      });
    }
    this.Disclosure = "";
    this.productTypesList = [];
    this.isproductTypesList = false;
    this.showNewCaseForm = false;
    this.isaddField = false;
    this.additionalCaseFieldsList = [];
    this.isLoaded = false;
  }
  onCaseReasonChange(event) {
    this.isLoaded = true;
    this.caseReason = event.detail.value;
    console.log(" this.caseReason:" + this.caseReason);
    console.log("caseRec:" + JSON.stringify(this.caseRec));
    //var caseRec = this.caseRec;
    if (this.caseReason === "Forbearance") {
      const config = {
        type: "standard__webPage",
        attributes: {
          url: "/mortgage-forbearance"
        }
      };
      this[NavigationMixin.Navigate](config);
    }
    this.Disclosure = "";
    if (this.caseReason !== "None") {
      this.Disclosure = "";
      this.productTypesList = [];
      this.isproductTypesList = false;
      var reasonProductTypeProxy = this.caseReasonProductTypeMap;
      var reasonProductTypeMap = JSON.parse(
        JSON.stringify(reasonProductTypeProxy)
      );
      console.log("this.caseRec.Type:" + this.caseRec.Type);
      console.log("parsed reasonProductTypeMap : ", reasonProductTypeMap);
      console.log(
        "reasonProductTypeMap : ",
        reasonProductTypeMap[this.caseRec.Type]
      );
      var finAccountTypeProxy = this.financialAccountTypeMap;
      var finAccountTypeMap = JSON.parse(JSON.stringify(finAccountTypeProxy));

      var serviceProductTypes = reasonProductTypeMap[this.caseRec.Type];
      console.log(
        "serviceProductTypes : " + JSON.stringify(serviceProductTypes)
      );
      var serviceFinAccountTypes = finAccountTypeMap[this.caseRec.Type];

      var additionalCaseFieldsList = [];
      console.log(
        "serviceFinAccountTypes : " + JSON.stringify(serviceFinAccountTypes)
      );
      if (serviceFinAccountTypes) {
        var finAccountConfig = serviceFinAccountTypes[this.caseReason];
        console.log("finAccountConfig : ", JSON.stringify(finAccountConfig));
        if (finAccountConfig) {
          var finAccountTypes = finAccountConfig.productTypeValues;
          var financialAccounts = this.financialAccounts;

          console.log(
            "finAccountConfig.disclosure :",
            finAccountConfig.disclosure
          );
          this.Disclosure = finAccountConfig.disclosure;
          console.log("financialAccounts:" + JSON.stringify(financialAccounts));
          for (var key in financialAccounts) {
            console.log("key:" + key);
            if (finAccountTypes.includes(financialAccounts[key].recordType, 0))
              this.productTypesList.push({
                value: financialAccounts[key].label,
                label: financialAccounts[key].label
              });
          }
          this.isproductTypesList = true;
          if (finAccountConfig.additionalInputFields) {
            for (var elem in finAccountConfig.additionalInputFields) {
              if (
                !additionalCaseFieldsList.includes(
                  productTypeConfig.additionalInputFields[elem],
                  0
                )
              )
                additionalCaseFieldsList.push(
                  productTypeConfig.additionalInputFields[elem]
                );
            }
          }
        }
      }
      if (serviceProductTypes) {
        this.isproductTypesList = false;
        console.log("caseReason:" + this.caseReason);
        var productTypeConfig = serviceProductTypes[this.caseReason];
        console.log("productTypeConfig :", JSON.stringify(productTypeConfig));
        if (productTypeConfig) {
          var productTypes = productTypeConfig.productTypeValues;
          this.Disclosure = "";
          this.Disclosure = productTypeConfig.disclosure;
          console.log("productTypes :", productTypes);
          if (productTypes) {
            this.productTypesList = [];
            for (var i = 0; i < productTypes.length; i++) {
              this.productTypesList.push({
                label: productTypes[i],
                value: productTypes[i]
              });
            }
            this.isproductTypesList = true;
          }
          console.log(
            "productTypesList:" + JSON.stringify(this.productTypesList)
          );
          if (productTypeConfig.additionalInputFields) {
            for (var keyy in productTypeConfig.additionalInputFields) {
              if (
                !additionalCaseFieldsList.includes(
                  productTypeConfig.additionalInputFields[keyy],
                  0
                )
              )
                additionalCaseFieldsList.push(
                  productTypeConfig.additionalInputFields[keyy]
                );
            }
          }
        }
      }

      this.productTypesList.push({ value: "Other", label: "Other" });
      this.listProductType = this.productTypesList;
      this.isproductTypesList = true;
      if (additionalCaseFieldsList) {
        // helper.displayAdditionalFields(component,additionalCaseFieldsList);
        console.log(
          "additionalCaseFieldsList:" + JSON.stringify(additionalCaseFieldsList)
        );
        this.additionalCaseFieldsList = additionalCaseFieldsList;
        this.isaddField = true;
      }
    } else {
      console.log("inside else:");
      this.Disclosure = "";
      this.productTypesList = [];
      this.isproductTypesList = false;
    }
    this.isLoaded = false;
  }

  handleChange(event) {
    this.checkBoxvalue = event.detail.value;
    console.log("this.checkBoxValue:" + this.checkBoxvalue);
  }

  handleSubmit(event) {
    event.preventDefault();
    console.log("event.detail.fields:" + JSON.stringify(event.detail.fields));
    console.log("this.caseReason:" + this.caseReason);
    const fields = event.detail.fields;
    fields.Action_Type__c = this.caseReason;
    console.log("fields:" + JSON.stringify(fields));
    this.template.querySelector("lightning-record-edit-form").submit(fields);
  }
  async handleCaseSaveSuccess(event) {
    this.isLoaded = true;
    this.showNewCaseForm = false;
    let caseId = event.detail.id;
    console.log("event:" + event.detail.id);
    this.showSuccessMessage = true;

    let result = await saveAssociateProductTypes({
      productTypes: JSON.stringify(this.checkBoxvalue),
      caseId: caseId
    });
    this.isLoaded = false;
  }
  handleCloseSuccessMessage() {
    this.showSuccessMessage = false;
  }
}