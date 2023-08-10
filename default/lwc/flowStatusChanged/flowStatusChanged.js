import { LightningElement, api, track } from 'lwc';
import {ShowToastEvent} from "lightning/platformShowToastEvent";
import Id from "@salesforce/user/Id";
export default class FlowStatusChanged extends LightningElement {
	userId=Id;
    flowApiName = "Get_Account_From_Service_Territory"; // api name of your flow
    @api recordId;
	// Setting flow input variables
	//recId = selectedBranchInfo.Id;

	@track accountId;
	flowInputVariables = [
		{
			name: "accountId",
			type: "String",
			value: this.userId//'0015w00002DnAxUAAV' //this.accountId,
		},
	];

        // do something when flow status changed
	handleFlowStatusChange(event) {
        //this.accountId = this.recordId;
		console.log("flow status", event.detail.status);
		if (event.detail.status === "STARTED") {
			this.dispatchEvent(
				new ShowToastEvent({
					//title: "Success",
					//message: "Flow Started Succesfully",
					variant: "success",
				})
			);
		}
	}
    
    _flowStatus;  
    @api 
    get flowStatus () {
        return this._flowStatus;
    }
   
    set flowStatus(value) {
        console.log('value:', JSON.parse(JSON.stringify(value)));
        this._flowStatus = value;
    }
}