/**
 * @description       :
 * @author            : 'Amol K'
 * @group             :
 * @last modified on  : 02-03-2023
 * @last modified by  : 'Amol K'
 **/
import { LightningElement, wire } from "lwc";
import getApplicationList from "@salesforce/apex/ListViewController.getApplicationList";
import { NavigationMixin } from "lightning/navigation";
export default class LoanApplicationListViewLwc extends NavigationMixin(
  LightningElement
) {
  Communiy = "";
  listApplicationsList;
  loanProgram;
  @wire(getApplicationList, { Communiy: "$Communiy" })
  loanApplicationList({ data, error }) {
    if (data) {
      this.listApplicationsList = data.data.listApplications;
    } else if (error) {
      console.log("error :  " + JSON.stringify(error));
    }
  }
  handleNewApplication() {
    // Navigate to a URL
    this[NavigationMixin.Navigate](
      {
        type: "standard__webPage",
        attributes: {
          //url: 'https://consumer-portal-demo-dev-ed-fsc.my.site.com/loanportal/s/new-application'
          url: "/loanportal/s/new-application"
        }
      },
      true // Replaces the current page in your browser history with the URL
    );
  }
  handleEditApplication(event) {
    let loanApplicationId = event.currentTarget.dataset.id;
    console.log("loanApplicationId:" + loanApplicationId);
    this[NavigationMixin.Navigate](
      {
        type: "standard__webPage",
        attributes: {
          ///loanportal/s/new-application?id=0cd5w000000kAbxAAE
          url: "/loanportal/s/new-application?id=" + loanApplicationId
        }
      },
      true // Replaces the current page in your browser history with the URL
    );
  }
}