import { LightningElement, wire} from 'lwc';
import Id from '@salesforce/user/Id';
import { getRecord } from 'lightning/uiRecordApi';
import NAME_FIELD from '@salesforce/schema/User.Name';
import EMAIL_FIELD from '@salesforce/schema/User.Email';
import PHONE_FIELD from '@salesforce/schema/User.Phone';
import MOBILEPHONE_FIELD from '@salesforce/schema/User.MobilePhone';
import MEDIUMPHOTOURL_FIELD from '@salesforce/schema/User.MediumPhotoUrl';

export default class CurrentUserInfo extends LightningElement {
    userId = Id;
    name;
    email;
    error;
    mediumPhotoUrl;
    mobilePhone;
    isLoaded = false;
    @wire(getRecord, { recordId: Id, fields: [NAME_FIELD, EMAIL_FIELD, PHONE_FIELD, MOBILEPHONE_FIELD, MEDIUMPHOTOURL_FIELD]}) 
    userDetails({error, data}) {
        this.isLoaded = true;
        if (data) {
            this.name = data.fields.Name.value;
            this.email = data.fields.Email.value;
            this.mediumPhotoUrl = data.fields.MediumPhotoUrl.value;
            this.mobilePhone = data.fields.MobilePhone.value;
            if (!this.mobilePhone) {
                this.mobilePhone = data.fields.Phone.value;
            }
            
        } else if (error) {
            this.error = error ;
        }
        this.isLoaded = false;
    }
}