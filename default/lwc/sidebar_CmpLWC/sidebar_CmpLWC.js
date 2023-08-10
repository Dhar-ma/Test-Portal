import { LightningElement } from "lwc";
import SidebarResources from "@salesforce/resourceUrl/SidebarResources";
import fetchUser from "@salesforce/apex/CommunityUtils.fetchUser";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { NavigationMixin } from "lightning/navigation";
import checkUserType from "@salesforce/apex/CommunityUtils.checkUserType";
import Company_Address from "@salesforce/label/c.Company_Address";
import Company_Name from "@salesforce/label/c.Company_Name";
import Company_Phone from "@salesforce/label/c.Company_Phone";
import Chat_Button_ID from "@salesforce/label/c.Chat_Button_ID";
import Company_Email from "@salesforce/label/c.Company_Email";
import LiveAgentDeployment from "@salesforce/resourceUrl/LiveAgentDeployment";

export default class Sidebar_CmpLWC extends NavigationMixin(LightningElement) {
  Company_Address = Company_Address;
  Company_Name = Company_Name;
  Company_Phone = Company_Phone;
  Chat_Button_ID = Chat_Button_ID;
  Company_Email = Company_Email;
  flowInputVariables;
  contactId;
  isLoggedIn;
  accountId;
  contactInfoVisible = false;
  flowApiName = "Appointment_Scheduling_Flow";
  isFlowOpen = false;
  calenderLogo = SidebarResources + "/Calendar.png";
  qustionLog = SidebarResources + "/Question.png";
  LayerLogo = SidebarResources + "/Layer.png";
  contactUsLogo = SidebarResources + "/contactus.svg";

  async connectedCallback() {
    //check user type;
    let userType = await checkUserType();
    {
      console.log("userType:" + JSON.stringify(userType.data.isLoggedIn));
      this.isLoggedIn = userType.data.isLoggedIn;
    }
    //fetch user info
    let result = await fetchUser();
    {
      console.log("reult:" + JSON.stringify(result));
      this.contactId = result.ContactId;
      this.accountId = result.AccountId;
    }
    if (this.contactId && this.accountId) {
      this.flowInputVariables = [
        {
          name: "contactId",
          type: "String",
          value: this.contactId
        },
        {
          name: "accountId",
          type: "String",
          value: this.accountId
        }
      ];
    } else {
      this.flowInputVariables = [
        {
          name: "contactId",
          type: "String"
        },
        {
          name: "accountId",
          type: "String"
        }
      ];
    }
  }

  beginFlow() {
    this.isFlowOpen = true;
  }

  showContactInfo() {
    this.contactInfoVisible = true;
  }

  startChat() {
    console.log("startChat");
    // const config = {
    //   type: "standard__webPage",
    //   attributes: {
    //     url: "/loanportal/s/submit-case"
    //   }
    // };
    // this[NavigationMixin.Navigate](config);
    LiveAgentDeployment.startChat(Chat_Button_ID);
  }

  openKnowledgeTab() {
    const config = {
      type: "standard__webPage",
      attributes: {
        url: "/help-center"
      }
    };
    this[NavigationMixin.Navigate](config);
  }

  openCaseForm() {
    console.log("openCaseForm");
    console.log("startChat");
    const config = {
      type: "standard__webPage",
      attributes: {
        url: "/loanportal/s/submit-case"
      }
    };
    this[NavigationMixin.Navigate](config);
  }

  handleClose() {
    this.isFlowOpen = false;
    this.contactInfoVisible = false;
  }
  handleFlowStatusChange(event) {
    console.log(
      "flowInputVariables:" + JSON.stringify(this.flowInputVariables)
    );
    console.log("flow status", event.detail.status);
    if (event.detail.status === "STARTED") {
      this.dispatchEvent(
        new ShowToastEvent({
          //title: "Success",
          //message: "Flow Started Succesfully",
          variant: "success"
        })
      );
    }
  }
}