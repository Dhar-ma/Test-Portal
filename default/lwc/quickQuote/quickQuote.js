import { LightningElement, api, wire } from 'lwc';
import { getPicklistValues } from 'lightning/uiObjectInfoApi';
import TYPE_FIELD from '@salesforce/schema/Case.Type';
import ACTION_TYPE from '@salesforce/schema/Case.Action_Type__c';
import PRODUCT_TYPE from '@salesforce/schema/Case.Product_Type__c';
//import SURE_QUOTE_LOGO from '@salesforce/resourceUrl/sure_quote';
export default class QuickQuote extends LightningElement {
   // sureQuoteLogo = SURE_QUOTE_LOGO;
    @api recordTypeId;
    fieldMap;



    // @wire(getPicklistValues, { recordTypeId: '0125w000001PsvFAAS', fieldApiName: TYPE_FIELD })
    // picklistInfo1({data, error}) {
    //     if(data) {
    //         let values = [];
    //         console.log('piclistvalues:',data);
    //         data.values.forEach(value => {
    //             values.push(value.label);
    //         })
    //         console.log('values:', values);
    //     }
    //     else if(error) {
    //         console.error(error);
    //     }
    // }

    @wire(getPicklistValues, { recordTypeId: '0125w000001PsvFAAS', fieldApiName: ACTION_TYPE })
    picklistInfo2({data, error}) {
        if(data) {
            let values = {};
            console.log('piclistvalues:',data);
            for (const property in data.controllerValues) { 
                values[data.controllerValues[property]] = {serviceType:property, actionTypes:{}}
            }

            data.values.forEach(value => {
                if(value.validFor && value.validFor.length > 0) {
                    value.validFor.forEach(validFor => {
                        values[validFor].actionTypes[value.label] = {actionType:value.label, productTypes:[]};
                    });
                }
            });
            // data.values.forEach(value => {
            //     values.push(value.label);
            // })
            // console.log('values:', values);

            console.log('map:', values);
            this.fieldMap = values;
            this.recordTypeId = '0125w000001PsvFAAS';
        }
        else if(error) {
            console.error(error);
        }
    }

    @wire(getPicklistValues, { recordTypeId: '$recordTypeId', fieldApiName: PRODUCT_TYPE })
    picklistInfo3({data, error}) {
        if(data) {
            let values = {};
            console.log('piclistvalues:',data);
            for (const property in data.controllerValues) { 
                values[data.controllerValues[property]] = {actionType:property, productTypes:[]};
            }

            data.values.forEach(value => {
                if(value.validFor && value.validFor.length > 0) {
                    value.validFor.forEach(validFor => {
                        values[validFor].productTypes.push(value.label)
                    });
                }
            });

            console.log('values:', values);
        }
        else if(error) {
            console.error(error);
        }
    }
}