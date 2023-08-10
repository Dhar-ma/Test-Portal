import { LightningElement, api, track } from 'lwc';

const DEFAULT_BACKGROUND = 'background:#262A6E;';
const DEFAULT_COLOR = 'color:white;';
const DEFAULT_FOOTER_DESCRIPTION = 'Enter HTML or Plain Text in the Component Attributes to change this description.';
const NUM_LINKS = ['One', 'Two', 'Three'];
export default class LoanCommunityFooter extends LightningElement {
    _footerDescription = DEFAULT_FOOTER_DESCRIPTION;
    containerStyle;
    @track links;
    @api backgroundColor;
    
    @api fontColor;

    @api linkSectionOneTitle;
    @api linkSectionOneLinkOneLabel;
    @api linkSectionOneLinkOneUrl;
    @api linkSectionOneLinkTwoLabel;
    @api linkSectionOneLinkTwoUrl;
    @api linkSectionOneLinkThreeLabel;
    @api linkSectionOneLinkThreeUrl;
    @api linkSectionTwoTitle;
    @api linkSectionTwoLinkOneLabel;
    @api linkSectionTwoLinkOneUrl;
    @api linkSectionTwoLinkTwoLabel;
    @api linkSectionTwoLinkTwoUrl;
    @api linkSectionTwoLinkThreeLabel;
    @api linkSectionTwoLinkThreeUrl;

    @api 
    get footerDescription() {
        return this._footerDescription;
    }
    set footerDescription(value) {
        this._footerDescription = value;
    }

    connectedCallback() {
        this.setLinkData();
        this.setContainerStyle();
    }

    setLinkData() {
        let links = {};
        try {
        links.sectionOne = this.setLinks('linkSectionOne');
        links.sectionTwo = this.setLinks('linkSectionTwo');
        console.log('links:', links);
        }
        catch(error) {
            console.error(error);
        }
        this.links = links;
    }

    setLinks(section) {
        
        if(this[`${section}Title`]) {
            let linkContainer = {};
            let links = [];
            console.log(this[`${section}Title`])
            linkContainer.title = this[`${section}Title`];
            NUM_LINKS.forEach(linkNumber => {
                let link = {};
                if(this[`${section}Link${linkNumber}Label`]) {
                    link.label = this[`${section}Link${linkNumber}Label`]
                    console.log(this[`${section}Link${linkNumber}Label`]);
                }
                else {
                    link.label = null;
                }
                if(this[`${section}Link${linkNumber}Url`]) {
                    link.url = this[`${section}Link${linkNumber}Url`]
                    console.log(this[`${section}Link${linkNumber}Url`]);
                }
                else {

                }
                if(Object.keys(link).length > 0) {
                    links.push(link);
                }
            });
            if(links.length > 0) {
                linkContainer.links = links;
            }
            return linkContainer;
        }
        return null;
    }

    setContainerStyle() {
        let style = '';
        style += this.backgroundColor && this.backgroundColor != '' ? `background:${this.backgroundColor};` : DEFAULT_BACKGROUND;
        style += this.fontColor && this.fontColor != '' ? `color:${this.fontColor};` : DEFAULT_COLOR;
        this.containerStyle = style;
    }
}