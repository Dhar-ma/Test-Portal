/* eslint-disable no-unused-expressions */
/* eslint-disable no-sequences */
import { api, LightningElement, track } from "lwc";
import { NavigationMixin } from "lightning/navigation";
// import getListViewData from "@salesforce/apex/CustomRelatedListController.getListViewData";
import getListViewRecord from "@salesforce/apex/ListViewComponentController.getListViewRecord";
import getObjectListViewRecord from "@salesforce/apex/ListViewComponentController.getObjectListViewRecord";
import FORM_FACTOR from "@salesforce/client/formFactor";
export default class ListViewComponentLWC extends NavigationMixin(
  LightningElement
) {
  // columns = [
  //   {"label":"","fieldName":"rowNumber","hideDefaultActions":"true","initialWidth":"20"},
  //   {
  //     label: "Case Number",
  //     fieldName: "CaseNumber",
  //     type: "url",
  //     typeAttributes: {
  //       label: {
  //         fieldName: "CaseNumber"
  //       }
  //     },
  //     initialWidth: 100
  //   },
  //   { label: "Subject", fieldName: "Subject" },
  //   { label: "Status", fieldName: "Status", initialWidth: 80 },
  //   {
  //     label: "Date/Time Opened",
  //     fieldName: "CreatedDate",
  //     type: "date",
  //     initialWidth: 120,
  //     typeAttributes: {
  //       year: "numeric",
  //       month: "2-digit",
  //       day: "2-digit",
  //       hour: "2-digit",
  //       minute: "2-digit"
  //     }
  //   },
  //   { label: "Product Type", fieldName: "Product_Type__c", initialWidth: 120 }
  // ];
  @track caseList = [];
  newCaseList = [];
  isLoad = false;
  isData;
  iconName;
  @api columns;
  @api objectAPIName;
  @api listViewAPIName;
  @api titleOverride;
  @api actionLabel;
  @api actionURL;
  @api type;
  column;
  contactId;
  urlPrefix;
  isMobile = false;
  displayListView = true;
  formFactor;
  fieldApiNameList = [];
  isLoaded = false;

  async connectedCallback() {
    if (this.columns) {
      this.isLoaded = true;
      let icon = this.objectAPIName.replace(/[A-Z]/g, " $&").trim();
      let newicon = icon.replace(/ /g, "_");
      this.iconName = "standard:" + newicon.toLowerCase();
      this.column = JSON.parse(this.columns);
      console.log("iconName:" + this.iconName);
      console.log("this.column:" + this.column);
      if (this.objectAPIName === "FinServ__AssetsAndLiabilities__c") {
        console.log("this.objectAPIName:" + this.objectAPIName);
        this.iconName = "custom:custom90";
      }
      if (this.objectAPIName === "FinServ__FinancialAccount__c") {
        this.iconName = "custom:custom16";
      }
      this.column.forEach((element) => {
        if (element.fieldName !== "rowNumber") {
          if (
            this.objectAPIName === "Case" ||
            this.objectAPIName === "ServiceAppointment"
          ) {
            if (element.type === "url") {
              if (
                element.typeAttributes.label.fieldName !==
                "Work_Type_Group__rName"
              ) {
                this.fieldApiNameList.push(
                  element.typeAttributes.label.fieldName
                );
              } else {
                this.fieldApiNameList.push("Work_Type_Group__r.Name");
              }
            } else {
              this.fieldApiNameList.push(element.fieldName);
            }
          } else if (this.objectAPIName === "Task") {
            if (element.type === "url") {
              if (element.typeAttributes.label.fieldName === "WhatName") {
                this.fieldApiNameList.push("What.Name");
              } else if (element.typeAttributes.label.fieldName === "WhoName") {
                this.fieldApiNameList.push("Who.Name");
              } else {
                this.fieldApiNameList.push(
                  element.typeAttributes.label.fieldName
                );
              }
            } else {
              this.fieldApiNameList.push(element.fieldName);
            }
          } else if (this.objectAPIName === "FinServ__FinancialAccount__c") {
            console.log("this.objectAPIName:" + this.objectAPIName);
            if (element.type === "url") {
              this.fieldApiNameList.push(
                element.typeAttributes.label.fieldName
              );
            } else {
              this.fieldApiNameList.push(element.fieldName);
            }
          } else if (
            this.objectAPIName === "FinServ__AssetsAndLiabilities__c"
          ) {
            console.log("this.objectAPIName:" + this.objectAPIName);
            this.iconName = "custom:custom90";
            if (element.type === "url") {
              this.fieldApiNameList.push(
                element.typeAttributes.label.fieldName
              );
            } else {
              this.fieldApiNameList.push(element.fieldName);
            }
          }
        }
      });
      // this.getObjectListViewRecord();
      console.log("this.fieldApiNameList::" + this.fieldApiNameList);
      let result = await getListViewRecord({
        fieldApiNameList: this.fieldApiNameList,
        objectName: this.objectAPIName
      });
      {
        this.isData = result.isData;
        this.caseList = result.obj;
        let number = 0;
        console.log("result: " + JSON.stringify(result));
        if (result.isData) {
          this.caseList.forEach((item) => {
            console.log("element44444:" + JSON.stringify(item));
            (item = { ...item }), console.log(item.Id);
            // change subject url
            item.rowNumber = ++number;
            if (this.objectAPIName === "Case") {
              item.NavigationURL = "/loanportal/s/detail/" + item.Id;
            }
            if (this.objectAPIName === "ServiceAppointment") {
              if (item.Work_Type_Group__c) {
                item.workTypeURL =
                  "/loanportal/s/detail/" + item.Work_Type_Group__r.Id;
                item.AppoinmentNumberURL =
                  "/serviceappointment/:" +
                  item.Id +
                  "/" +
                  item.Work_Type_Group__r.Name;
                // eslint-disable-next-line no-self-assign
                item.Work_Type_Group__rName = item.Work_Type_Group__r.Name;
              } else {
                item.AppoinmentNumberURL =
                  "/serviceappointment/:" + item.Id + "/detail";
                item.workTypeURL = "";
                item.WorkTypeGroupName = "";
              }
            }
            if (this.objectAPIName === "Task") {
              item.Subjecturl =
                "/loanportal/s/task/" + item.Id + "/" + item.Subject;
              if (item.WhoId) {
                item.Nameurl = "/loanportal/s/detail/" + item.Who.Id;
                item.WhoName = item.Who.Name;
              }
              if (item.WhatId) {
                //change Related urlk
                item.Relatedurl = "/loanportal/s/detail/" + item.What.Id;
                item.WhatName = item.What.Name;
              }
            }
            if (this.objectAPIName === "FinServ__FinancialAccount__c") {
              item.Nameurl = "/loanportal/s/detail/" + item.Id;
              this.iconName = "custom:custom16";
            }
            if (this.objectAPIName === "FinServ__AssetsAndLiabilities__c") {
              item.Nameurl = "/loanportal/s/detail/" + item.Id;
              this.iconName = "custom:custom90";
            }
            this.newCaseList.push(item);
          });
          console.log("this.newCaseList:" + this.newCaseList);
          this.isLoad = true;
        }
      }
      if (FORM_FACTOR === "Small" || FORM_FACTOR === "Medium") {
        this.isMobile = true;
        console.log("isMobile:" + this.isMobile);
      }
      this.isLoaded = false;
    }
  }

  async getObjectListViewRecord() {
    console.log("getObjectListViewRecord@@@");
    try {
      let response = await getObjectListViewRecord({
        objectName: this.objectAPIName,
        listViewName: this.listViewAPIName
      });

      // if (this.objectAPIName === "FinServ__FinancialAccount__c") {
      //   this.iconName = "utility:custom16_120";
      //   // this.column = taskColumn;
      // }

      console.log("response:" + JSON.stringify(response));
    } catch (error) {
      console.error(error);
    }
  }

  // @wire(getListViewData)
  // listData({ data, error }) {
  //   if (data) {
  //     this.isLoaded = true;
  //     console.log("List data:" + JSON.stringify(data));
  //     this.contactId = data.contactId;
  //     this.urlPrefix = data.urlPrefix;
  //     this.isLoaded = false;
  //   }
  //   if (error) {
  //     console.error(error);
  //   }
  // }
}