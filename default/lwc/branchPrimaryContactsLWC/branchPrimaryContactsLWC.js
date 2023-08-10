import { api, LightningElement } from "lwc";

export default class BranchPrimaryContactsLWC extends LightningElement {
  //   @api selectedBranch;

  _selectedBranch;
  @api
  get selectedBranch() {
    return this._selectedBranch;
  }

  set selectedBranch(value) {
    console.log("@@@@@@@@@@@@@@@@@@value:", JSON.parse(JSON.stringify(value)));
    this._selectedBranch = value;
  }
  connectedCallback() {
    console.log("@@@@@@@@@@@@@@@@@Child component:");

    console.log("############:" + JSON.stringify(this.selectedBranch));
  }
}