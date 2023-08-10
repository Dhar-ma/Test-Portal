({
    doInit: function(component, event, helper) {
        console.log('FormFactor:', $A.get("$Browser.formFactor"));
        console.log('')
        if($A.get("$Browser.formFactor") == 'PHONE' && component.get("v.section") == 'Sidebar') {
            component.set("v.sectionClass", 'hide');
        }
        else if($A.get("$Browser.formFactor") == 'DESKTOP' && component.get("v.section") == 'Sidebar') {
            component.set("v.sectionClass", 'show');
        }
        else if($A.get("$Browser.formFactor") == 'PHONE' && component.get("v.section") == 'Main') {
            component.set("v.sectionClass", '');
        }
        else if($A.get("$Browser.formFactor") == 'DESKTOP' && component.get("v.section") == 'Main') {
            component.set("v.sectionClass", 'hide');
        }
    },
})