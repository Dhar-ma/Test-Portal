import { LightningElement, api } from 'lwc';

export default class BranchPrimaryContacts extends LightningElement {
    _selectedBranch   
    @api 
    get selectedBranch () {
        return this._selectedBranch;
    }
   
    set selectedBranch(value) {
        console.log('value:', JSON.parse(JSON.stringify(value)));
        this._selectedBranch = value;
    }
}