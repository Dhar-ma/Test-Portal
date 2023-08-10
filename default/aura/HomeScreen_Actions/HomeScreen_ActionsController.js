({
  doInit: function (component, event, helper) {
    helper.component = component;
    helper.checkUserLoggedIn();
    helper.getFinancialAccountList();
    helper.getDependentPicklistValue();
  },

  hideCaseForm: function (component, event, helper) {
    component.set("v.showNewCaseForm", false);
    component.set("v.showSubtype", false);
    component.set("v.showOpenNewAccountLink", false);
    component.set("v.caseRec", {});
  },

  handleRequestClick: function (component, event, helpler) {
    component.set("v.listProductType", null);
    var caseType = event.getSource().get("v.name");
    console.log("caseType : ", caseType);
    var caseTypeReasonMap = component.get("v.caseTypeReasonMap");
    console.log("caseTypeReasonMap : ", JSON.stringify(caseTypeReasonMap));
    component.set("v.Disclosure", "");
    var caseReasons = caseTypeReasonMap[caseType];
    var caseReasonList = [];
    caseReasonList.push("--- None ---");
    for (var i = 0; i < caseReasons.length; i++) {
      caseReasonList.push(caseReasons[i]);
    }

    component.set("v.listCaseReason", caseReasonList);
    console.log("caseReasonList :", component.get("v.listCaseReason"));

    component.set("v.caseRec", { Subject: caseType, Type: caseType });
    component.set("v.showNewCaseForm", true);
  },

  onCaseReasonChange: function (component, event, helper) {
    var caseReason = event.getSource().get("v.value");
    console.log("caseReason : ", caseReason);
    var caseRec = component.get("v.caseRec");
    console.log("caseRec : ", JSON.stringify(caseRec));
    var formComponent = component.find("additionalFieldsContainer");
    if (formComponent) {
      formComponent.destroy();
    }

    if (caseReason == "Forbearance") {
      helper.navigateToUrl("/mortgage-forbearance");
    }
    component.set("v.Disclosure", "");
    if (caseReason != "--- None ---") {
      component.set("v.caseReason", caseReason);
      var reasonProductTypeProxy = component.get("v.caseReasonProductTypeMap");
      var reasonProductTypeMap = JSON.parse(
        JSON.stringify(reasonProductTypeProxy)
      );
      console.log("parsed reasonProductTypeMap : ", reasonProductTypeMap);
      var finAccountTypeProxy = component.get("v.financialAccountTypeMap");
      var finAccountTypeMap = JSON.parse(JSON.stringify(finAccountTypeProxy));

      var serviceProductTypes = reasonProductTypeMap[caseRec.Type];
      console.log("serviceProductTypes : ", serviceProductTypes);
      var serviceFinAccountTypes = finAccountTypeMap[caseRec.Type];
      var productTypesList = [];
      var additionalCaseFieldsList = [];

      if (serviceFinAccountTypes) {
        var finAccountConfig = serviceFinAccountTypes[caseReason];
        console.log("finAccountConfig : ", finAccountConfig);
        if (finAccountConfig) {
          var finAccountTypes = finAccountConfig.productTypeValues;
          var financialAccounts = component.get("v.financialAccounts");

          console.log(
            "finAccountConfig.disclosure :",
            finAccountConfig.disclosure
          );
          component.set("v.Disclosure", finAccountConfig.disclosure);

          for (var key in financialAccounts) {
            if (finAccountTypes.includes(financialAccounts[key].recordType, 0))
              productTypesList.push({
                value: financialAccounts[key].label,
                label: financialAccounts[key].label
              });
          }

          if (finAccountConfig.additionalInputFields) {
            for (var key in finAccountConfig.additionalInputFields) {
              if (
                !additionalCaseFieldsList.includes(
                  productTypeConfig.additionalInputFields[key],
                  0
                )
              )
                additionalCaseFieldsList.push(
                  productTypeConfig.additionalInputFields[key]
                );
            }
          }
        }
      }

      if (serviceProductTypes) {
        var productTypeConfig = serviceProductTypes[caseReason];
        console.log("productTypeConfig :", productTypeConfig);
        if (productTypeConfig) {
          var productTypes = productTypeConfig.productTypeValues;
          component.set("v.Disclosure", productTypeConfig.disclosure);
          console.log("productTypes :", productTypes);
          if (productTypes) {
            for (var i = 0; i < productTypes.length; i++) {
              productTypesList.push({
                value: productTypes[i],
                label: productTypes[i]
              });
            }
          }

          if (productTypeConfig.additionalInputFields) {
            for (var key in productTypeConfig.additionalInputFields) {
              if (
                !additionalCaseFieldsList.includes(
                  productTypeConfig.additionalInputFields[key],
                  0
                )
              )
                additionalCaseFieldsList.push(
                  productTypeConfig.additionalInputFields[key]
                );
            }
          }
        }
      }

      productTypesList.push({ value: "Other", label: "Other" });
      component.set("v.listProductType", productTypesList);

      if (additionalCaseFieldsList) {
        helper.displayAdditionalFields(component, additionalCaseFieldsList);
      }
    } else {
      component.set("v.listProductType", null);
    }
  },

  applyForLoan: function (component, event, helper) {
    helper.navigateToUrl("/new-application");
  },

  trackApplications: function (component, event, helper) {
    helper.navigateToUrl("/my-applications");
  },

  handleSubmit: function (component, event, helper) {
    console.log("hanlde submit");
    event.preventDefault(); // stop the form from submitting
    var fields = event.getParam("fields");
    console.log("fields:" + JSON.stringify(fields));
    var caseRec = component.get("v.caseRec");
    fields.Action_Type__c = component.get("v.caseReason");
    console.log("fields:" + JSON.stringify(fields));
    component.find("caseEditForm").submit(fields);
    component.set("v.Spinner", true);
  },

  handleCaseSaveSuccess: function (component, event, helper) {
    component.set("v.Spinner", false);
    var updatedRecord = JSON.parse(JSON.stringify(event.getParams().response));

    if (updatedRecord.id) {
      helper.saveProductTypes(updatedRecord.id);
      component.set("v.showNewCaseForm", false);
      component.set("v.showSuccessMessage", true);
    }
  },

  handleFormLoad: function (component, event, helper) {
    var caseRec = component.get("v.caseRec");
    component.find("typeInput").set("v.value", caseRec.Type);
    component.find("subject").set("v.value", caseRec.Subject);
  },

  closeSuccessMessage: function (component, event, helper) {
    component.set("v.caseRec", {});
    component.set("v.showSuccessMessage", false);
  },

  handleForbearanceSelect: function (component, event, helper) {
    var selectedMenuItemValue = event.getParam("value");

    if (selectedMenuItemValue == "Mortgage") {
      helper.navigateToUrl("/mortgage-forbearance");
    } else {
      component.set("v.caseRec", {
        Subject: "Forbearance Request - " + selectedMenuItemValue,
        Type: "Mortgage Request / Maintenance"
      });
      component.set("v.showNewCaseForm", true);
    }
  }
});