/**
 * @description       :
 * @author            : 'Amol K'
 * @group             :
 * @last modified on  : 02-14-2023
 * @last modified by  : 'Amol K'
 **/
import { LightningElement, wire } from "lwc";
import { NavigationMixin } from "lightning/navigation";
import getApplicationList from "@salesforce/apex/ListViewController.getApplicationList";
export default class LoanApplications_ListLWC extends NavigationMixin(
  LightningElement
) {
  Communiy;
  isLoad = false;
  column = [
    {
      label: "CreatedDate",
      fieldName: "CreatedDate",
      type: "date",
      typeAttributes: {
        day: "numeric",
        month: "numeric",
        year: "numeric"
      }
    },
    { label: "Type", fieldName: "Name" },
    { label: "Status", fieldName: "Status__c" },
    {
      label: "Detail",
      fieldName: "detailurl",
      type: "url",
      typeAttributes: {
        label: "View Application",
        tooltip: { label: "View Application" }
      }
    }
  ];

  createNewApplication() {
    const config = {
      type: "standard__webPage",
      attributes: {
        url: "/loanportal/s/new-application"
      }
    };
    this[NavigationMixin.Navigate](config);
  }

  loanApplicationList = [];

  @wire(getApplicationList, { Communiy: null })
  ApplicationList({ error, data }) {
    if (data) {
      console.log("Data", data);
      let loanApplicationList = data.data.listApplications;
      console.log("loanApplicationList:" + JSON.stringify(loanApplicationList));
      loanApplicationList.forEach((item) => {
        console.log("Item.Id:" + item.Id);
        item = { ...item };
        item.detailurl = "/loanportal/s/new-application?id=" + item.Id;
        if (item.Loan_Program__c) {
          item.Name = item.Loan_Program__r.Name;
        }
        this.loanApplicationList.push(item);
      });
      this.isLoad = true;
    } else if (error) {
      console.error("Error:", error);
    }
  }
}