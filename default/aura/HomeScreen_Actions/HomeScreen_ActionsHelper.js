/* eslint-disable no-console */
({
  component: null,

  checkUserLoggedIn: function () {
    this.component.set("v.Spinner", true);

    this.callServer("checkUserType", null, false, function (response) {
      if (!response.isSuccess) {
        this.showErrorToast(response.error);
        this.component.set("v.Spinner", false);
        return;
      }
      var resultMap = response.data;
      this.component.set("v.userLoggedIn", resultMap.isLoggedIn);
      this.component.set("v.Spinner", false);
    });
  },

  getFinancialAccountList: function () {
    this.component.set("v.Spinner", true);
    this.callServer("getFinancialAccounts", null, false, function (response) {
      if (!response.isSuccess) {
        this.showErrorToast(response.error);
        this.component.set("v.Spinner", false);
        return;
      }

      var finAccountsList = response.data;

      if (finAccountsList.length > 0) {
        var options = [];
        for (var counter = 0; counter < finAccountsList.length; counter++) {
          var pickLabel = finAccountsList[counter].Name;

          if (finAccountsList[counter].Account_Last_4_digits__c)
            pickLabel +=
              " (**" + finAccountsList[counter].Account_Last_4_digits__c + ")";

          pickLabel +=
            " - " + finAccountsList[counter].FinServ__FinancialAccountType__c;

          options.push({
            value: finAccountsList[counter].Id,
            label: pickLabel,
            recordType:
              finAccountsList[counter].FinServ__FinancialAccountType__c
          });
        }
        this.component.set("v.financialAccounts", options);
        this.component.set("v.Spinner", false);
      }
    });
  },

  saveProductTypes: function (caseId) {
    var productTypes = this.component.get("v.selectedProductTypes");
    var param = {
      productTypes: JSON.stringify(productTypes),
      caseId: caseId
    };

    this.callServer(
      "saveAssociateProductTypes",
      param,
      false,
      function (response) {
        if (!response.isSuccess) {
          this.showErrorToast(response.error);
          this.component.set("v.Spinner", false);
          return;
        }
      }
    );
  },

  getDependentPicklistValue: function () {
    var objDetail = this.component.get("v.objDetail");
    var caseType = this.component.get("v.caseType");
    var caseReason = this.component.get("v.caseReason");
    var productType = this.component.get("v.productType");

    var param = {
      objDetail: objDetail,
      contrfieldApiName: caseType,
      depfieldApiName: caseReason,
      productTypeField: productType
    };

    this.callServer(
      "getDependetPicklistValues",
      param,
      false,
      function (response) {
        if (!response.isSuccess) {
          this.showErrorToast(response.error);
          this.component.set("v.Spinner", false);
          return;
        }
        var resultMap = response.data;
        this.component.set("v.caseTypeReasonMap", resultMap.caseTypeReasonMap);
        this.component.set(
          "v.caseReasonProductTypeMap",
          resultMap.caseReasonProductTypeMap
        );
        this.component.set(
          "v.financialAccountTypeMap",
          resultMap.financialAccountTypeMap
        );

        if (resultMap.isMortgageCommunity) {
          var caseTypes = [];
          for (var singlekey in resultMap.mortgageCaseTypeList) {
            var caseObj = {};
            caseObj.Type = resultMap.mortgageCaseTypeList[singlekey];
            caseObj.Name = resultMap.mortgageCaseTypeList[singlekey].replace(
              /[^A-Z0-9]/gi,
              ""
            );
            console.log("caseObj.Name : ", caseObj.Name);
            caseTypes.push(caseObj);
          }
          console.log("caseTypes : ", caseTypes);
          this.component.set("v.listCaseType", caseTypes);
        } else {
          var caseTypes = [];
          for (var singlekey in resultMap.caseTypeReasonMap) {
            var caseObj = {};
            caseObj.Type = singlekey;
            caseObj.Name = singlekey.replace(/[^A-Z0-9]/gi, "");
            console.log("caseObj.Name : ", caseObj.Name);
            //caseTypes.push(singlekey);
            caseTypes.push(caseObj);
          }
          console.log("caseTypes : ", caseTypes);
          this.component.set("v.listCaseType", caseTypes);
        }
      }
    );
  },

  navigateToUrl: function (url) {
    var urlEvent = $A.get("e.force:navigateToURL");
    urlEvent.setParams({
      url: url
    });
    urlEvent.fire();
  },

  navigateToRecord: function (id) {
    var navEvt = $A.get("e.force:navigateToSObject");
    navEvt.setParams({
      recordId: id,
      slideDevName: "detail"
    });
    navEvt.fire();
  },

  callServer: function (apexMethod, params, cacheable, callback) {
    var method = "c." + apexMethod;
    var action = this.component.get(method);

    if (params) {
      action.setParams(params);
    }

    if (cacheable) {
      action.setStorable();
    }
    action.setCallback(this, function (response) {
      var state = response.getState();

      if (state === "SUCCESS") {
        callback.call(this, response.getReturnValue());
      } else if (state === "ERROR") {
        this.handleActionFailedState(response.getError());
        this.component.set("v.Spinner", false);
      }
    });
    $A.enqueueAction(action);
  },

  showErrorToast: function (message) {
    console.log("in showErrorToast method");
    this.showToast("error", message);
  },

  showToast: function (toastType, message) {
    var toastEvent = $A.get("e.force:showToast");
    var toastTitle = toastType == "success" ? "Success!" : "Error!";
    toastEvent.setParams({
      type: toastType,
      title: toastTitle,
      message: message,
      duration: 8000
    });
    toastEvent.fire();
  },

  handleActionFailedState: function (errors) {
    var errorTxt;
    console.log("errors", errors);
    if (errors) {
      var errorMsgs = [];
      for (var index in errors) {
        errorMsgs.push(errors[index].message);
      }
      errorTxt = errorMsgs.join("<br/>");
    } else {
      errorTxt = "Something went wrong!";
    }
    console.log("\n errorTxt:", errorTxt);
    //this.showErrorToast(errorTxt);
    return errorTxt;
  },

  displayAdditionalFields: function (cmp, additionalFields) {
    var componentParams = [];
    componentParams.push([
      "lightning:card",
      { "aura:id": "additionalFieldsContainer" }
    ]);
    console.log("additionalFields:" + JSON.stringify(additionalFields));
    // eslint-disable-next-line guard-for-in
    for (var key in additionalFields) {
      componentParams.push([
        "lightning:inputField",
        { fieldName: additionalFields[key] }
      ]);
      console.log("key:" + key);
    }

    $A.createComponents(
      componentParams,
      function (components, status, errorMessage) {
        if (status === "SUCCESS") {
          var container = components[0].get("v.body");

          for (var index = 1; index < components.length; index++) {
            container.push(components[index]);
          }

          components[0].set("v.body", container);

          var formComponent = cmp.find("additionalFieldsPlaceholder");
          var componentBody = formComponent.get("v.body");
          componentBody.push(components[0]);
          console.log("container:" + container);
          formComponent.set("v.body", componentBody);
        } else if (status === "INCOMPLETE") {
          console.log("No response from server or client is offline.");
          // Show offline error
        } else if (status === "ERROR") {
          console.log("Error: " + errorMessage);
          // Show error message
        }
      }
    );
  }
});