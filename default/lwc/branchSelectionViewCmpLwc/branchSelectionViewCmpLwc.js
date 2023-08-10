/**
 * @description       :
 * @author            : 'Amol K'
 * @group             :
 * @last modified on  : 02-03-2023
 * @last modified by  : 'Amol K'
 **/
import { LightningElement, track, api, wire } from "lwc";
import FORM_FACTOR from "@salesforce/client/formFactor";
import Id from "@salesforce/user/Id";
// import USER_OBJECT from "@salesforce/schema/User";
import getInitialData from "@salesforce/apex/Branch_Selection_View_Controller.getInitialData";
import getBranchInfoAccount from "@salesforce/apex/Branch_Selection_View_Controller.getBranchInfoAccount";

export default class BranchSelectionViewCmpLwc extends LightningElement {
  // userId = USER_OBJECT;
  selectedBranchInfo;
  @track flowStatus = "";
  _selectedBranch = {
    Primary_Contact_1__c: "",
    Primary_Contact_2__c: "",
    Primary_Contact_3__c: "",
    Primary_Contact_4__c: ""
  };
  @track primary3MedPhoto;
  @track primarycon3MedPhotUrl;
  @api recordId;
  accountId = this.recordId;
  flowApiName = "Get_Account_From_Service_Territory";
  flowInputVariables = [
    {
      name: "accountId",
      type: "String",
      value: this.accountId
    }
  ];
  @track spinner = false;
  @track showdata = false;
  @track selectedBranchId = "";
  @track selectedBranch;
  @track isFlowOpen = false;
  @track groupTypeId = "";
  @track isMobile = false;
  @track userId = Id;
  isselectedBranchInfo = false;

  connectedCallback() {
    this.getContext();
    this.selectedBranch = {};
    this.getInitialData();
    console.log("@@@@@@@@@@@userId Object:" + this.userId);
  }
  getContext() {
    console.log("The device form factor is: " + FORM_FACTOR);
    if (FORM_FACTOR === "Medium" || FORM_FACTOR === "Small") {
      this.isMobile = true;
    }
  }
  getInitialData() {
    this.spinner = true;
    getInitialData()
      .then((result) => {
        if (!result.isSuccess) {
          this.Spinner = false;
          this.isselectedBranchInfo = false;
        }
        // eslint-disable-next-line vars-on-top
        var resultMap = result.data;
        this.selectedBranchInfo = result.data.account;
        console.log(
          "Result Map:selectedBranchInfo:" +
            JSON.stringify(this.selectedBranchInfo)
        );
        this.isselectedBranchInfo = true;
        console.log(
          "data from server branch selection : " + JSON.stringify(resultMap)
        );
        console.log("ResultMap.Account::" + JSON.stringify(resultMap.account));
        if (resultMap.account) {
          this.selectedBranch = this.setContactNames(resultMap.account);
          console.log(
            "Selected Branch :" + JSON.stringify(this.selectedBranch)
          );
          this.selectedBranchId = resultMap.account.Id;
          this.showdata = true;
          this.isselectedBranchInfo = true;
        }
        this.groupTypeId = resultMap.groupTypeId;
        console.log("Data after If ::" + this.groupTypeId);
        console.log("Data after If :::" + resultMap.accountId);
        this.spinner = false;
        this.isselectedBranchInfo = true;
      })
      .catch((error) => {
        console.log("Error" + error);
        this.Spinner = false;
      });
  }

  startFlow() {
    this.isFlowOpen = true;
    this.flowStatus = "STARTED";
  }
  handleClose() {
    this.isFlowOpen = false;
  }
  initiateFlow() {
    console.log("initiateFlow");
    this.isFlowOpen = true;
    console.log("isFlowOpen" + this.isFlowOpen);
    const inputVariables = [
      {
        name: "workGroupType",
        type: "String",
        value: this.groupTypeId
      }
    ];
    console.log("Input Variables");
    this.template
      .querySelector("c-flow-runtime")
      .startFlow("Get_Account_From_Service_Territory", inputVariables);
  }

  @wire(getBranchInfoAccount, { branchId: "$userId" })
  getBranchInfoAccount({ error, data }) {
    if (error) {
      this.spinner = false;
    }
    if (data) {
      console.log("data from server@@:", data);
      this.selectedBranchInfo = data;
      this.isselectedBranchInfo = true;
      console.log("Selected Branch :::::::::::::", this.selectedBranchInfo);
    }
  }

  // setContactNames(account) {
  //   if (account.Primary_Contact_1__c) {
  //     account.Primary_Contact_1__r.Name =
  //       account.Primary_Contact_1__r.FirstName +
  //       " " +
  //       account.Primary_Contact_1__r.LastName;
  //   }
  //   if (account.Primary_Contact_2__c) {
  //     account.Primary_Contact_2__r.Name =
  //       account.Primary_Contact_2__r.FirstName +
  //       " " +
  //       account.Primary_Contact_2__r.LastName;
  //   }
  //   if (account.Primary_Contact_3__c) {
  //     account.Primary_Contact_3__r.Name =
  //       account.Primary_Contact_3__r.FirstName +
  //       " " +
  //       account.Primary_Contact_3__r.LastName;
  //   }
  //   if (account.Primary_Contact_4__c) {
  //     account.Primary_Contact_4__r.Name =
  //       account.Primary_Contact_4__r.FirstName +
  //       " " +
  //       account.Primary_Contact_4__r.LastName;
  //   }
  //   return account;
  // }

  handleChangeBranch() {
    let selectedBranchId = this.selectedBranchId;
    console.log("selectedBranchId", selectedBranchId);
    if (selectedBranchId) {
      this.getBranchInfoAccount(selectedBranchId);
    }
  }
}