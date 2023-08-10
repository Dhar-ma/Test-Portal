import {LightningElement, track, wire, api} from 'lwc';

import {ShowToastEvent} from 'lightning/platformShowToastEvent';
import checkMember from '@salesforce/apex/UserRegistrationFormController.checkMember';
import findAccounts from '@salesforce/apex/UserRegistrationFormController.findAccounts';
import siteSignUp from '@salesforce/apex/UserRegistrationFormController.siteSignUp';

/** The delay used when debouncing event handlers before invoking Apex. */
const DELAY = 300;

class signUpData {
    constructor( firstName, lastName, dateOfBirth, email, phone, memberId, address,
                 city, state, zip, country, accountId, accountName,
                 isUnemployed, middlename, workEmail, cellphone, last4SocialSecurity,
                 emergencyContactFirstName, emergencyContactLastName, emergencyContactPhone,
                 emergencyContactRelationship, areYou1199Member ) {
        this.firstName = firstName;
        this.lastname = lastName;
        this.dateOfBirth = dateOfBirth;
        this.email = email;
        this.phone = phone;
        this.memberId = memberId;
        this.address = address;
        this.city = city;
        this.state = state;
        this.zip = zip;
        this.country = country;
        this.accountName = accountName;
        this.accountId = accountId;

        this.isUnemployed = isUnemployed;
        this.middlename = middlename;
        this.workEmail = workEmail;
        this.cellphone = cellphone;
        this.last4SocialSecurity = last4SocialSecurity;
        this.emergencyContactFirstName = emergencyContactFirstName;
        this.emergencyContactLastName = emergencyContactLastName;
        this.emergencyContactPhone = emergencyContactPhone;
        this.emergencyContactRelationship = emergencyContactRelationship;
        this.areYou1199Member = areYou1199Member;
    }
}

export default class Memeberform extends LightningElement {

    @track spinner;
    @track isMemeber = false ;
    @track isUnemployed = false ;
    @track memberId = '';
    @track searchKey = '';
    @track accounts ;
    @track firstname;
    @track lastname;
    @track middlename;
    @track dateOfBirth;
    @track email;
    @track workEmail;
    @track phone;
    @track cellphone;
    @track last4SocialSecurity;

    @track address;
    @track city;
    @track state;
    @track zip;
    @track country;

    @track accountId = '';
    @track accountName;

    @track emergencyContactFirstName;
    @track emergencyContactLastName;
    @track emergencyContactPhone;
    @track emergencyContactRelationship;
    @track areYou1199Member;

   /* @wire(findContacts, { searchKey: '$searchKey' })
    contacts;*/
   

    handleKeyChange(event) {
        let self = this;

        if( event.target.value == null || event.target.value == '' ){
            self.accounts = [];
        }
        self.accountName = '';
        self.accountId = '';
        // Debouncing this method: Do not update the reactive property as long as this function is
        // being called within a delay of DELAY. This is to avoid a very large number of Apex method calls.
        window.clearTimeout(this.delayTimeout);

        const searchKey = event.target.value;
        if( searchKey ) {
            // eslint-disable-next-line @lwc/lwc/no-async-operation
            //  this.delayTimeout = setTimeout(() => {
            self.searchKey = searchKey;
            findAccounts({searchKey: this.searchKey}).then(result => {
                self.accounts = result;
            }).catch(error => {
                console.log('error ', error);
                const event = new ShowToastEvent({
                    title: 'Error',
                    message: error,
                    variant: 'error'
                });
                self.dispatchEvent(event);
                self.spinner = false;
            });
            // }, DELAY);
        }
    }


    submit() {
        let self = this;
        let isValid = this.isValidForm();
        if( isValid ){

            self.spinner = true;
            checkMember( { memberId: self.memberId, 
                dateOfBirthStr: self.dateOfBirth,
                last4SocialSecurity: self.last4SocialSecurity,
            }).then( result => {
                if (result.isSuccess) {
                    const event = new ShowToastEvent({
                        title: 'Success',
                        message: result.Message,
                        variant: 'success'
                    });
                    self.dispatchEvent(event);
                } else {
                    const event = new ShowToastEvent({
                        title: 'Error',
                        message: result.Message,
                        variant: 'error'
                    });
                    self.dispatchEvent(event);
                }
                self.spinner = false;
            }).catch(error => {
                console.log( 'error ', error );
                const event = new ShowToastEvent({
                    title: 'Error',
                    message: error,
                    variant: 'error'
                });
                self.dispatchEvent(event);
                self.spinner = false;
            });
        }
    }

    handleMemberId(){
        this.isMemeber = true;
    }
    cancelsignUp(){
        this.isMemeber = false;
    }

    signUp(){
        let self = this;
        console.log( 'signUpinfo' );
        let isValid = this.isValidForm();
        if( isValid ){
            self.spinner = true;
            let signUpinfo = new signUpData(self.firstname, self.lastname, self.dateOfBirth, self.email,
                self.phone, self.memberId, self.address, self.city, self.state, self.zip, self.country,
                self.accountId, self.accountName, self.isUnemployed, self.middlename,
                self.workEmail, self.cellphone, self.last4SocialSecurity,
                self.emergencyContactFirstName, self.emergencyContactLastName,
                self.emergencyContactPhone, self.emergencyContactRelationship, self.areYou1199Member);

            console.log( 'signUpinfo', signUpinfo  );
            siteSignUp({
                jsonSignUpData: JSON.stringify(signUpinfo)
            }).then(result => {
                console.log( 'siteSignUp ', result );
                self.spinner = false;

                if (result.isSuccess) {
                    self.isMemeber = false;
                    const event = new ShowToastEvent({
                        title: 'Success',
                        message: result.Message,
                        variant: 'success'
                    });
                    self.dispatchEvent(event);
                } else {
                    const event = new ShowToastEvent({
                        title: 'Error',
                        message: result.Message,
                        variant: 'error'
                    });
                    self.dispatchEvent(event);
                }
                self.spinner = false;
            }).catch(error => {
                console.log('error ', error);
                const event = new ShowToastEvent({
                    title: 'Error',
                    message: error,
                    variant: 'error'
                });
                self.dispatchEvent(event);
                self.spinner = false;
            });

        }
    }

    genericOnChange(event){
        this[event.target.name] = event.target.value;
        
        if(this.disabled){
            this.disabled = false;
        }
        if(event.target.type =='checkbox'){
            this[event.target.name] = event.target.checked;
        }

    }

    isValidForm(){
        const allValid = [...this.template.querySelectorAll('.form__field')]
            .reduce((validSoFar, inputCmp) => {
                if( !inputCmp.value && inputCmp.required){
                    validSoFar = false;
                    inputCmp.setCustomValidity("Complete this field.");

                }else if( inputCmp.required && inputCmp.value && !inputCmp.value.trim()){
                    validSoFar = false;
                    inputCmp.setCustomValidity("Complete this field.");
                }else{
                    inputCmp.setCustomValidity("");
                }
                inputCmp.reportValidity();
                return validSoFar && inputCmp.checkValidity();
            }, true);
        return allValid;
    }


    changeMemberId(event) {
        this.memberId = event.target.value;
        //this.disabled = this.description.trim() ? false : true;
    }

    handleAccounSelect(event) {
        console.log('event', event);
        var currentRecId = event.currentTarget.dataset.id;
        var selectName = event.currentTarget.dataset.name;
        this.searchKey = selectName;
        this.accountId = currentRecId;
        //this.accountName = selectName;
        this.accounts = [];
    }

    get areYou1199MemberOptions() {
        return [{
            "label": "Yes", "value": "Yes"
        },
        {
            "label": "No",
            "value": "No"
        }];
    }

    get stateoptions() {
        return [
            {
                "label": "Alabama", "value": "Alabama"
            },
            {
                "label": "Alaska",
                "value": "Alaska"
            },
            {
                "label": "Arizona",
                "value": "Arizona"
            },
            {
                "label": "Arkansas",
                "value": "Arkansas"
            },
            {
                "label": "California",
                "value": "California"
            },
            {
                "label": "Colorado",
                "value": "Colorado"
            },
            {
                "label": "Connecticut",
                "value": "Connecticut"
            },
            {
                "label": "Delaware",
                "value": "Delaware"
            },
            {
                "label": "District Of Columbia",
                "value": "District Of Columbia"
            },
            {
                "label": "Florida",
                "value": "Florida"
            },
            {
                "label": "Georgia",
                "value": "Georgia"
            },
            {
                "label": "Hawaii",
                "value": "Hawaii"
            },
            {
                "label": "Idaho",
                "value": "Idaho"
            },
            {
                "label": "Illinois",
                "value": "Illinois"
            },
            {
                "label": "Indiana",
                "value": "Indiana"
            },
            {
                "label": "Iowa",
                "value": "Iowa"
            },
            {
                "label": "Kansas",
                "value": "Kansas"
            },
            {
                "label": "Kentucky",
                "value": "Kentucky"
            },
            {
                "label": "Louisiana",
                "value": "Louisiana"
            },
            {
                "label": "Maine",
                "value": "Maine"
            },
            {
                "label": "Maryland",
                "value": "Maryland"
            },
            {
                "label": "Massachusetts",
                "value": "Massachusetts"
            },
            {
                "label": "Michigan",
                "value": "Michigan"
            },
            {
                "label": "Minnesota",
                "value": "Minnesota"
            },
            {
                "label": "Mississippi",
                "value": "Mississippi"
            },
            {
                "label": "Missouri",
                "value": "Missouri"
            },
            {
                "label": "Montana",
                "value": "Montana"
            },
            {
                "label": "Nebraska",
                "value": "Nebraska"
            },
            {
                "label": "Nevada",
                "value": "Nevada"
            },
            {
                "label": "New Hampshire",
                "value": "New Hampshire"
            },
            {
                "label": "New Jersey",
                "value": "New Jersey"
            },
            {
                "label": "New Mexico",
                "value": "New Mexico"
            },
            {
                "label": "New York",
                "value": "New York"
            },
            {
                "label": "North Carolina",
                "value": "North Carolina"
            },
            {
                "label": "North Dakota",
                "value": "North Dakota"
            },
            {
                "label": "Ohio",
                "value": "Ohio"
            },
            {
                "label": "Oklahoma",
                "value": "Oklahoma"
            },
            {
                "label": "Oregon",
                "value": "Oregon"
            },
            {
                "label": "Pennsylvania",
                "value": "Pennsylvania"
            },
            {
                "label": "Rhode Island",
                "value": "Rhode Island"
            },
            {
                "label": "South Carolina",
                "value": "South Carolina"
            },
            {
                "label": "South Dakota",
                "value": "South Dakota"
            },
            {
                "label": "Tennessee",
                "value": "Tennessee"
            },
            {
                "label": "Texas",
                "value": "Texas"
            },
            {
                "label": "Utah",
                "value": "Utah"
            },
            {
                "label": "Vermont",
                "value": "Vermont"
            },
            {
                "label": "Virginia",
                "value": "Virginia"
            },
            {
                "label": "Washington",
                "value": "Washington"
            },
            {
                "label": "West Virginia",
                "value": "West Virginia"
            },
            {
                "label": "Wisconsin",
                "value": "Wisconsin"
            },
            {
                "label": "Wyoming",
                "value": "Wyoming"
            }
        ];
    }
}