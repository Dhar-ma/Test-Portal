/* eslint-disable guard-for-in */
/* eslint-disable vars-on-top */
import { LightningElement } from "lwc";
import checkUserType from "@salesforce/apex/CommunityUtils.checkUserType";
import Mortgage_Forbearance_Icons from "@salesforce/resourceUrl/Mortgage_Forbearance_Icons";
export default class MortgageForbearanceLWC extends LightningElement {
  form_data = {};
  isLoaded = false;
  userLoggedIn = true;
  caseRec = {};
  currentStep = "step-1";
  showSuccessMessage = false;
  yes_no_options = [
    { label: "Yes", value: "Yes" },
    { label: "No", value: "No" }
  ];

  get getcurrentStep3() {
    return this.currentStep === "step-3";
  }
  get getcurrentStep1() {
    return this.currentStep === "step-1";
  }

  get loanWithDXFinancial() {
    return this.form_data.loanWithDXFinancial === "Yes";
  }
  get getloanWithDXFinancialNo() {
    return this.form_data.loanWithDXFinancial === "No";
  }

  get Federally_Backed_Mortgage_Type() {
    let Federally_Backed_Mortgage_Type = [
      {
        label: "Fannie Mae or Freddie Mac",
        value: "Fannie Mae or Freddie Mac"
      },
      {
        label: "Federal Housing Administration (FHA)",
        value: "Federal Housing Administration (FHA)"
      },
      {
        label: "VA Loans",
        value: "VA Loans"
      },
      {
        label: "USDA Loans",
        value: "USDA Loans"
      },
      {
        label: "HUD",
        value: "HUD"
      },
      {
        label: "I don’t know",
        value: "I don’t know"
      }
    ];

    return Federally_Backed_Mortgage_Type;
  }

  get Sub_Type__c() {
    return this.caseRec.Sub_Type__c === "Homeowner needing to skip payments";
  }

  handleRadioGroup(event) {
    let form_data = JSON.parse(JSON.stringify(this.form_data));
    let loanWithDXFinancial = event.target.value;
    form_data.loanWithDXFinancial = loanWithDXFinancial;
    console.log(event.target.value);
    this.form_data = form_data;
  }

  faq_img = Mortgage_Forbearance_Icons + "/faq_img.png";
  survey = Mortgage_Forbearance_Icons + "/survey.svg";
  jason_briscoe = Mortgage_Forbearance_Icons + "/jason_briscoe.png";
  request = Mortgage_Forbearance_Icons + "/request.svg";

  connectedCallback() {
    this.form_data = {};
    this.checkUserLoggedIn();
  }

  get educateYourself() {
    return this.currentStep === "educate-yourself";
  }

  async checkUserLoggedIn() {
    this.isLoaded = true;
    try {
      let response = await checkUserType();
      if (!response.isSuccess) {
        //this.showErrorToast(response.error)
        this.isLoaded = false;
        return;
      }
      var resultMap = response.data;
      console.log("data from server", resultMap);
      this.userLoggedIn = resultMap.isLoggedIn;
      this.isLoaded = false;
    } catch (error) {
      console.error(error);
    }
  }

  handleActionFailedState(errors) {
    var errorTxt;
    console.log("errors", errors);
    if (errors) {
      var errorMsgs = [];
      for (var index in errors) {
        errorMsgs.push(errors[index].message);
      }
      errorTxt = errorMsgs.join("<br/>");
    } else {
      errorTxt = "Something went wrong!";
    }
    console.log("\n errorTxt:", errorTxt);
    //this.showErrorToast(errorTxt);
    return errorTxt;
  }

  showEducateYourself() {
    this.currentStep = "educate-yourself";
  }

  handleHomeForbearance() {
    this.currentStep = "step-1";
  }

  handleSkipPaymentHomeOwner() {
    this.currentStep = "step-3";
    this.caseRec = {
      Subject: "Forbearance Request",
      Type: "Forbearance Request",
      Sub_Type__c: "Homeowner needing to skip payments"
    };
  }

  handleChange(event) {
    let caseRec = JSON.parse(JSON.stringify(this.caseRec));
    let Federally_Backed_Mortgage_Type = event.target.value;
    caseRec.Federally_Backed_Mortgage_Type__c = Federally_Backed_Mortgage_Type;

    this.caseRec = caseRec;
  }

  handleSubmit(event) {
    event.preventDefault(); // stop the form from submitting
    var fields = event.detail.fields;
    var caseRec = {};

    this.template.querySelectorAll(".caseRec").forEach((element) => {
      caseRec[element.name] = element.value;
    });

    fields.Current_Payment_Date__c = caseRec.Current_Payment_Date__c;
    fields.Requested_Payment_Date__c = caseRec.Requested_Payment_Date__c;

    console.log("fields:" + JSON.stringify(fields));

    this.template.querySelector(".caseEditForm").submit(fields);
    this.isLoaded = true;
  }

  handleFormLoad(event) {
    var caseRec = event.detail.records;
    console.log("caseRec: " + JSON.stringify(caseRec));
    // component.find("subject").set("v.value", caseRec.Subject);
    // component.find("type").set("v.value", caseRec.Type);
    // component.find("sub_type").set("v.value", caseRec.Sub_Type__c);
    // component.find("Federally_Backed_Mortgage_Type").set("v.value", caseRec.Federally_Backed_Mortgage_Type__c);
    // component.set('v.showSubtype', true);
  }

  handleCaseSaveSuccess(event) {
    this.isLoaded = false;
    // var updatedRecord = JSON.parse(JSON.stringify(event.getParams().response));
    console.log("onsuccess: ", event.detail.id);
    if (event.detail.id) {
      //helper.showToast('success', 'Your request has been submitted successfully!');
      this.showSuccessMessage = true;
    }
  }

  onerror() {
    this.isLoaded = false;
  }

  closeSuccessMessage() {
    this.currentStep = "step-1";
    this.form_data = {};
    this.showSuccessMessage = false;
  }
}