/* eslint-disable no-unused-expressions */
/* eslint-disable no-sequences */
import { api, LightningElement, track, wire } from "lwc";
import { NavigationMixin } from "lightning/navigation";
import getListViewData from "@salesforce/apex/CustomRelatedListController.getListViewData";
import { getListUi } from "lightning/uiListApi";
import CASE_OBJECT from "@salesforce/schema/Case";
// import CASE_NUMBER from "@salesforce/schema/Case.CaseNumber";
import FORM_FACTOR from "@salesforce/client/formFactor";
export default class CaseListViewLWC extends NavigationMixin(LightningElement) {
  columns = [
    {
      label: "",
      fieldName: "rowNumber",
      hideDefaultActions: true,
      initialWidth: 20
    },
    {
      label: "Case Number",
      fieldName: "casenumberurl", //casenumberurl
      type: "url",
      typeAttributes: {
        label: {
          fieldName: "CaseNumber"
        }
      },
      initialWidth: 100
    },
    { 
      label: "Subject", 
      fieldName: "subjecturl",
      type: "url",
      typeAttributes: {
        label: {
          fieldName: "Subject"
        }
      } 
    },
    { 
      label: "Status", 
      fieldName: "Status", 
      initialWidth: 80
    },
    {
      label: "Date/Time Opened",
      fieldName: "CreatedDate",
      type: "date",
      initialWidth: 120,
      typeAttributes: {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
      }
    },
    { label: "Product Type", fieldName: "Product_Type__c", initialWidth: 120 }
  ];
  @track caseList = [];
  newCaseList = [];
  isLoad = false;
  @api objectAPIName;
  @api listViewAPIName;
  @api titleOverride;
  @api actionLabel;
  @api actionURL;
  @api type;
  contactId;
  urlPrefix;
  isMobile = false;
  displayListView = true;
  formFactor;

  @wire(getListViewData)
  listData({ data, error }) {
    if (data) {
      console.log("List data:" + JSON.stringify(data));
      this.contactId = data.contactId;
      this.urlPrefix = data.urlPrefix;
    }
    if (error) {
      console.error(error);
    }
  }
  @wire(getListUi, {
    objectApiName: '$objectAPIName',
    listViewApiName: '$listViewAPIName'
  })
  listView({ data, error }) {
    if (data) {
      let number = 0;
      data.records.records.forEach((element) => {
        this.caseList.push({
          rowNumber: ++number,
          Id: element.fields.Id.value,
          CaseNumber: element.fields.CaseNumber.value
            ? element.fields.CaseNumber.value
            : " ",
          Subject: element.fields.Subject.value
            ? element.fields.Subject.value
            : " ",
          Status: element.fields.Status.value
            ? element.fields.Status.value
            : " ",
          CreatedDate: element.fields.CreatedDate.value
            ? element.fields.CreatedDate.value
            : " ",
          Product_Type__c: element.fields.Product_Type__c.value
            ? element.fields.Product_Type__c.value
            : " "
        });
      });
      this.caseList.forEach((item) => {
        (item = { ...item }), console.log(item.Id);
        //change subject url
        item.casenumberurl = "/loanportal/s/detail/" + item.Id;
        item.subjecturl = "/loanportal/s/detail/" + item.Id;
        this.newCaseList.push(item);
      });
      console.log("_____________________" + JSON.stringify(this.caseList));
      this.isLoad = true;
    }
    if (error) {
      console.error("@@@@@@@@@@@@@@2:  " + JSON.stringify(error));
    }
  }

  connectedCallback() {
    if (FORM_FACTOR === "Small" || FORM_FACTOR === "Medium") {
      this.isMobile = true;
      console.log("isMobile:" + this.isMobile);
    }
  }

  @wire(getListViewData)
  wiredListViewData({ error, data }) {
    if (data) {
      console.log("response:", data);
      this.contactId = data.contactId;
      this.urlPrefix = data.urlPrefix;
      this.displayListView = true;
    } else if (error) {
      console.log("error", error);
    }
  }
}