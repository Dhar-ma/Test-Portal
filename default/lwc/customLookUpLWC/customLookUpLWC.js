/* eslint-disable no-unused-vars */
/* eslint-disable @lwc/lwc/no-api-reassignments */
/**
 * @description       :
 * @author            :
 * @group             :
 * @last modified on  : 03-15-2023
 * @last modified by  :
 **/
import { LightningElement, api } from "lwc";
import fetchRecords from "@salesforce/apex/ReusableLookupController.fetchRecords";
/** The delay used when debouncing event handlers before invoking Apex. */
const DELAY = 500;

export default class CustomLookUpLWC extends LightningElement {
  @api label = "Parent Account";
  @api required;
  @api selectedIconName = "standard:account";
  @api objectLabel = "Account";
  recordsList = [];
  selectedRecordName;
  selectedAccountId;
  @api objectApiName = "Account";
  @api fieldApiName = "Name";
  @api searchString = "";
  @api whereClause;
  @api value;
  @api placeholder;
  message;
  isLoaded = false;

  preventClosingOfSerachPanel = false;

  get methodInput() {
    return {
      objectApiName: this.objectApiName,
      fieldApiName: this.fieldApiName,
      searchString: this.searchString,
      whereClause: this.whereClause,
      value: this.value
    };
  }

  get showRecentRecords() {
    if (!this.recordsList) {
      return false;
    }
    return this.recordsList.length > 0;
  }
  get isMessage() {
    let isMessage = this.message ? true : false;
    return isMessage;
  }

  //getting the default selected record
  connectedCallback() {
    if (this.selectedRecordId) {
      this.fetchSobjectRecords(true);
    }
  }

  //call the apex method
  async fetchSobjectRecords(loadEvent) {
    this.message = "";
    this.recordsList = [];
    console.log("fetchSobjectRecords");
    try {
      let result = await fetchRecords({
        inputWrapper: this.methodInput
      });
      console.log("fetchSobjectRecords:" + JSON.stringify(result));
      this.isLoaded = true;
      if (loadEvent && result) {
        this.selectedRecordName = result[0].mainField;
      } else if (result) {
        this.recordsList = JSON.parse(JSON.stringify(result));
      } else {
        this.recordsList = [];
      }
      if (!result.length > 0) {
        this.message = this.searchString
          ? "No Records Found for '" + this.searchString + "'"
          : "";
        console.log("else" + this.message);
      }
      this.isLoaded = false;
    } catch (error) {
      this.isLoaded = false;
      console.log(error);
      this.message = error ? true : false;
    }
  }

  get isValueSelected() {
    return this.selectedRecordId;
  }

  //handler for calling apex when user change the value in lookup
  handleChange(event) {
    this.searchString = event.target.value;
    console.log("this.searchString:" + this.searchString);
    this.fetchSobjectRecords(false);
  }

  //handler for clicking outside the selection panel
  handleBlur() {
    this.recordsList = [];
    this.preventClosingOfSerachPanel = false;
  }

  //handle the click inside the search panel to prevent it getting closed
  handleDivClick() {
    this.preventClosingOfSerachPanel = true;
  }

  //handler for deselection of the selected item
  handleCommit() {
    this.selectedRecordId = "";
    this.selectedRecordName = "";
    const selectedEvent = new CustomEvent("commit");
    //dispatching the custom event
    this.dispatchEvent(selectedEvent);
  }

  //handler for selection of records from lookup result list
  handleSelect(event) {
    //this.isLoaded = true;
    let selectedRecord = {
      mainField: event.currentTarget.dataset.mainfield,
      subField: event.currentTarget.dataset.subfield,
      id: event.currentTarget.dataset.id
    };
    this.selectedRecordId = selectedRecord.id;
    this.selectedRecordName = selectedRecord.mainField;
    this.recordsList = [];
    // Creates the event
    const selectedEvent = new CustomEvent("valueselected", {
      detail: selectedRecord
    });
    //dispatching the custom event
    this.dispatchEvent(selectedEvent);
    this.isLoaded = false;
  }

  //to close the search panel when clicked outside of search input
  handleInputBlur(event) {
    // Debouncing this method: Do not actually invoke the Apex call as long as this function is
    // being called within a delay of DELAY. This is to avoid a very large number of Apex method calls.
    window.clearTimeout(this.delayTimeout);
    // eslint-disable-next-line @lwc/lwc/no-async-operation
    this.delayTimeout = setTimeout(() => {
      if (!this.preventClosingOfSerachPanel) {
        this.recordsList = [];
      }
      this.preventClosingOfSerachPanel = false;
    }, DELAY);
  }
}