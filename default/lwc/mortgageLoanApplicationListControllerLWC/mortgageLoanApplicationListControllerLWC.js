import { LightningElement } from "lwc";
import getApplicationList from "@salesforce/apex/ListViewController.getApplicationList";
import { NavigationMixin } from "lightning/navigation";
export default class MortgageLoanApplicationListControllerLWC extends LightningElement {
  listApplications = [];
  isNoData = true;
  column = [
    {
      label: "Date",
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
  isload = false;
  async connectedCallback() {
    await this.getApplicationList();
  }

  handleNewApplication() {
    const config = {
      type: "standard__webPage",
      attributes: {
        url: "/new-application"
      }
    };
    this[NavigationMixin.Navigate](config);
  }

  async getApplicationList() {
    try {
      let response = await getApplicationList({ Communiy: "Mortgage" });
      if (!response.isSuccess) {
        // this.showErrorToast(response.error);
        this.isNoData = false;
        // this.component.set("v.Spinner", false);
        return;
      }
      let resultMap = response.data;
      console.log("resultMap:" + JSON.stringify(resultMap));
      let listApplications = [];
      resultMap.listApplications.forEach((item) => {
        console.log("Item.Id:" + item.Id);
        item = { ...item };
        item.detailurl = "/new-application?id='+selectedRec.Id" + item.Id;
        listApplications.push(item);
      });

      this.listApplications = listApplications;
    } catch (error) {
      console.error(error);
    }
  }
}