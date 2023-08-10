/* eslint-disable vars-on-top */
/**
 * @description       :
 * @author            : 'Amol K'
 * @group             :
 * @last modified on  : 02-22-2023
 * @last modified by  : 'Amol K'
 **/
import { LightningElement, wire } from "lwc";
import getInitialData from "@salesforce/apex/LoanTypeWrapperController.getInitialData";
import { CurrentPageReference } from "lightning/navigation";
import getLoanTypes from "@salesforce/apex/LoanTypeWrapperController.getLoanTypes";

export default class LoanTypeWrapperLwc extends LightningElement {
  selectedLoanType = "";
  showSelectLoanType = false;
  LoanTypes;
  isMortage = false;
  isConsumer = false;
  isBusiness = false;
  isLoaded = false;

  @wire(CurrentPageReference)
  getStateParameters(currentPageReference) {
    if (currentPageReference) {
      this.urlId = currentPageReference.state?.id;
    }
    console.log("urlId:" + this.urlId);
  }

  connectedCallback() {
    if (this.urlId) {
      this.getCosumerType(this.urlId);
    } else {
      this.getLoanType();
    }
  }

  async getLoanType() {
    let result = await getLoanTypes();
    {
      this.isLoaded = true;
      console.log("result:" + JSON.stringify(result));
      this.LoanTypes = result.data.loanTypes;
      this.showSelectLoanType = true;
      this.isLoaded = false;
    }
  }

  showLoanSelection(event) {
    this.isLoaded = true;
    console.log(event.target.value);
    this.selectedLoanType = event.target.value;
    this.isLoaded = false;
  }

  showSelectedLoanProgram() {
    this.isLoaded = true;
    this.isMortage = this.selectedLoanType === "Mortgage Loan" ? true : false;
    this.isConsumer = this.selectedLoanType === "Consumer Loan" ? true : false;
    this.isBusiness = this.selectedLoanType === "Business Loan" ? true : false;
    this.showSelectLoanType = false;
    this.isLoaded = false;
  }
  async getCosumerType(urlId) {
    this.isLoaded = true;
    let result = await getInitialData({
      loanApplicationId: urlId
    });
    let selectedLoanType = result.data.loanApplication.Loan_Program__r
      .Loan_Type__c
      ? result.data.loanApplication.Loan_Program__r.Loan_Type__c
      : "";
    this.selectedLoanType = selectedLoanType;
    this.isMortage = selectedLoanType === "Mortgage Loan" ? true : false;
    this.isConsumer = selectedLoanType === "Consumer Loan" ? true : false;
    this.isBusiness = selectedLoanType === "Business Loan" ? true : false;
    console.log("Result ::" + JSON.stringify(result));
    this.isLoaded = false;
  }
}