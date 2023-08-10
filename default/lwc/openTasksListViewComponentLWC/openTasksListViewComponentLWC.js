/* eslint-disable no-unused-expressions */
/* eslint-disable no-sequences */
import { LightningElement, wire } from "lwc";
import getOpenTask from "@salesforce/apex/ListViewComponentController.getOpenTask";
import SUBJECT_FIELD from "@salesforce/schema/Task.Subject";
import STATUS_FIELD from "@salesforce/schema/Task.Status";
import ACTIVITY_DATE_FIELD from "@salesforce/schema/Task.ActivityDate";
import WHO_ID_FIELD from "@salesforce/schema/Task.WhoId";
import WHAT_ID_FIELD from "@salesforce/schema/Task.WhatId";
import FORM_FACTOR from "@salesforce/client/formFactor";
const COLS = [
  {
    label: "",
    fieldName: "rowNumber",
    hideDefaultActions: true,
    initialWidth: 20
  },
  {
    label: "Name",
    fieldName: "Subjecturl",
    type: "url",
    typeAttributes: {
      label: {
        fieldName: SUBJECT_FIELD.fieldApiName
      },
      target: "_top",
      title: SUBJECT_FIELD.fieldApiName
    }
  },
  {
    label: "Name",
    fieldName: "Nameurl",
    type: "url",
    typeAttributes: {
      label: {
        fieldName: "WhoName"
      },
      target: "_top",
      title: "WhoName"
    }
  },
  {
    label: "Related To",
    fieldName: "Relatedurl",
    type: "url",
    typeAttributes: {
      label: {
        fieldName: "WhatName"
      },
      target: "_top",
      title: "WhatName"
    }
  },
  {
    label: "Due Date",
    fieldName: ACTIVITY_DATE_FIELD.fieldApiName
  },
  {
    label: "Status",
    fieldName: STATUS_FIELD.fieldApiName
  }
];
export default class OpenTasksListViewComponentLWC extends LightningElement {
  columns = COLS;
  rowOffset = 0;
  taskList = [];
  isLoad = false;
  isMobile = false;
  Who = WHO_ID_FIELD;
  What = WHAT_ID_FIELD;

  connectedCallback() {
    if (FORM_FACTOR === "Small" || FORM_FACTOR === "Medium") {
      this.isMobile = true;
      console.log("isMobileOpen task:" + this.isMobile);
    }
  }

  @wire(getOpenTask)
  openTask({ data, error }) {
    if (data) {
      console.log("Tasks#####:" + JSON.stringify(data));
      data.forEach((item) => {
        console.log("Item.Id:" + item);
        (item = { ...item }), console.log(item.Id);
        item.rowNumber = ++this.rowOffset;
        //change subject url
        item.Subjecturl = "/loanportal/s/task/" + item.Id + "/" + item.Subject;
        //change Name url
        if (item.WhoId) {
          item.Nameurl = "/loanportal/s/detail/" + item.Who.Id;
          item.WhoName = item.Who.Name;
        }
        if (item.WhatId) {
          //change Related urlk
          item.Relatedurl = "/loanportal/s/detail/" + item.What.Id;
          item.WhatName = item.What.Name;
        }
        this.taskList.push(item);
      });
      console.log(
        "@@@@@@@@@@@@@@@@@@@@@@taskList:" + JSON.stringify(this.taskList)
      );
      this.isLoad = true;
    } else if (error) {
      console.error(error);
    }
  }
}