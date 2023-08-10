/**
 * @description       : 
 * @author            : 'Amol K'
 * @group             : 
 * @last modified on  : 02-20-2023
 * @last modified by  : 'Amol K'
**/
({
  component: null,
  //Method to get initial data
  loadInitialData: function (recordId) {
    this.component.set("v.Spinner", true);

    var param = {
      loanApplicationId: recordId
    };
    this.callServer("getInitialData", param, false, function (response) {
      if (!response.isSuccess) {
        this.showErrorToast(response.error);
        this.component.set("v.Spinner", false);
        return;
      }

      this.component.set("v.Spinner", false);
      var resultMap = response.data;
      var vehicleTypeMap = resultMap.vehicleTypeMakeMap.data.vehicleTypeMakeMap;
      console.log("resultMap ConsumerLoan", resultMap);
      this.component.set("v.ConsumerLoanProgram", resultMap.loanProgram);
      this.component.set("v.currentUserContact", resultMap.currentUserContact);
      this.component.set("v.vehicleTypeMakeMap", vehicleTypeMap);
      this.component.set("v.purposeOfLoan", resultMap.loanPurpose);
      this.component.set("v.VehicleType", resultMap.vehicleType);

      //Set default loan applicant if loanApplicationId not available
      if (Object.keys(resultMap.loanApplication).length === 0) {
        if (Object.keys(resultMap.currentUserContact).length != 0) {
          this.component.set("v.NewLoanApplicant", {
            Name: resultMap.currentUserContact.Name,
            First_Name__c: resultMap.currentUserContact.FirstName,
            Last_Name__c: resultMap.currentUserContact.LastName,
            Email__c: resultMap.currentUserContact.Email,
            Account__c: resultMap.currentUserContact.AccountId,
            Phone__c: resultMap.currentUserContact.Phone,
            SSN__c: resultMap.currentUserContact.Social_Security_Number__c,
            Mobile__c: resultMap.currentUserContact.MobilePhone,
            BorrowerType: "Borrower"
          });

          this.component.set("v.LoanApplicant", [
            this.component.get("v.NewLoanApplicant")
          ]);
        }
      } else {
        //set existing LoanApplication record
        console.log("resultMap.loanApplication :", resultMap.loanApplication);
        this.component.set(
          "v.ResidentialLoanApplication",
          resultMap.loanApplication
        );
        this.component.set(
          "v.LoanApplicant",
          resultMap.loanApplication.LoanApplicants
        );
        this.component.set(
          "v.selectedConsumerType",
          resultMap.loanApplication.Loan_Program__c
        );
        this.component.set("v.showFormTypeSelector", false);
        this.component.find("read-me").set("v.checked", true);
        this.component.set(
          "v.NewLoanApplicant",
          resultMap.loanApplication.LoanApplicants[0]
        );
        this.component.set(
          "v.vehicleMakeList",
          vehicleTypeMap[resultMap.loanApplication.Consumer_Types__c]
        );
      }
      //create map of select loan program type
      var ConsumerOptionsMap = [];
      for (var key in resultMap.loanProgram) {
        ConsumerOptionsMap.push({
          key: resultMap.loanProgram[key].Name,
          value: resultMap.loanProgram[key].Id
        });
      }
      this.component.set("v.ConsumerOptions", ConsumerOptionsMap);
      var selectedConsumerType = this.component.get("v.selectedConsumerType");

      //map to get selected loan program data
      var consumerLoanProgramMap = new Map();
      for (var key in resultMap.loanProgram) {
        if (selectedConsumerType) {
          if (selectedConsumerType == resultMap.loanProgram[key].Id) {
            this.component.set(
              "v.ConsumerLoanProgram",
              resultMap.loanProgram[key]
            );
          }
        }
        consumerLoanProgramMap.set(
          resultMap.loanProgram[key].Id,
          resultMap.loanProgram[key]
        );
      }
      this.component.set("v.ConsumerLoanProgramMap", consumerLoanProgramMap);

      //Set Loan Application Status
      if (resultMap.loanApplication.Status) {
        this.progressBarSetup(resultMap.loanApplication.Status);
      } else {
        var statusOptions = ["Started", "Pre-App Completed", "Pending"];
        this.component.set("v.statusOption", statusOptions);
      }

      //Set Require Document Id for loan application
      this.component.set(
        "v.requiredDocumentIds",
        resultMap.requiredDocumentIds
      );
    });
  },

  //Save Loan application record
  saveLoanApplication: function (tabToSet) {
    var consumerType = this.component.get("v.ConsumerLoanProgram").Name;
    var loanApplicationObject = this.component.get(
      "v.ResidentialLoanApplication"
    );

    loanApplicationObject.Loan_Program__c = this.component.get(
      "v.selectedConsumerType"
    );
    loanApplicationObject.AccountId = this.component.get(
      "v.currentUserContact"
    ).AccountId;
    loanApplicationObject.Name =
      this.component.get("v.currentUserContact").Name + " " + consumerType;
    if (!loanApplicationObject.Status) {
      loanApplicationObject.Status = "Started";
    }
    delete loanApplicationObject.LoanApplicants;

    var param = {
      loanApplication: JSON.stringify(loanApplicationObject),
      loanApplicant: JSON.stringify(this.component.get("v.NewLoanApplicant"))
    };
    this.callServer("saveLoanApplication", param, false, function (response) {
      if (!response.isSuccess) {
        this.showErrorToast(response.error);
        this.component.set("v.Spinner", false);
        return;
      }

      var resultMap = response.data;
      this.component.set(
        "v.ResidentialLoanApplication",
        resultMap.loanApplication
      );
      this.component.set("v.LoanApplicant", resultMap.loanApplicantList);
      this.component.set("v.NewLoanApplicant", resultMap.loanApplicant);
      this.component.set(
        "v.requiredDocumentIds",
        resultMap.requiredDocumentIds
      );
      this.component.set("v.Spinner", false);
      this.component.set("v.currentTab", tabToSet);
    });
  },

  //Function to save loan applicant record
  saveLoanApplicant: function (tabToSet, loanApplicationId) {
    var loanApplicant = this.component.get("v.NewLoanApplicant");
    if (!loanApplicant.Id) {
      loanApplicant.Name =
        loanApplicant.First_Name__c + " " + loanApplicant.Last_Name__c;
      loanApplicant.LoanApplicationId = loanApplicationId;
    }
    //delete related LoanApplicantDeclarations records
    if (loanApplicant.LoanApplicantDeclarations) {
      delete loanApplicant.LoanApplicantDeclarations;
    }

    this.component.set("v.Spinner", true);
    var param = {
      loanApplicant: JSON.stringify(loanApplicant)
    };
    this.callServer("saveLoanApplicant", param, false, function (response) {
      if (!response.isSuccess) {
        this.showErrorToast(response.error);
        this.component.set("v.Spinner", false);
        return;
      }
      var resultMap = response.data;
      this.component.set("v.Spinner", false);
      this.component.set("v.NewLoanApplicant", resultMap.loanApplicantRecord);
      this.component.set("v.LoanApplicant", resultMap.loanApplicantList);
      this.component.set("v.PersonalInfoCurrentTab", tabToSet);
    });
  },
  //Funtion to save laon applicant declaration questions
  saveLoanapplicantQuestion: function (tabToSet) {
    var loanApplicant = this.component.get("v.NewLoanApplicant");
    var applicationQuestions = this.component.get("v.ApplicationQuestion");

    if (!applicationQuestions.Id) {
      applicationQuestions.Name = loanApplicant.Name + " Declaration";
      applicationQuestions.Loan_Program__c = this.component.get(
        "v.selectedMortgageType"
      );
      applicationQuestions.LoanApplicationId = loanApplicant.LoanApplicationId;
      applicationQuestions.LoanApplicantId = loanApplicant.Id;
    }

    var param = {
      applicationQuestions: JSON.stringify(applicationQuestions)
    };
    this.component.set("v.Spinner", true);
    this.callServer(
      "saveLoanapplicantQuestions",
      param,
      false,
      function (response) {
        if (!response.isSuccess) {
          this.showErrorToast(response.error);
          this.component.set("v.Spinner", false);
          return;
        }
        var resultMap = response.data;
        this.component.set(
          "v.ApplicationQuestion",
          resultMap.applicationQuestion
        );
        this.component.set("v.Spinner", false);
        this.component.set("v.PersonalInfoCurrentTab", tabToSet);
      }
    );
  },

  //Function to save loan applicant mailing address and present address
  saveAddress: function (
    tabToSet,
    loanApplicantAddress,
    loanApplicantMailingAddress
  ) {
    var param = {
      loanApplicantAddress: JSON.stringify(loanApplicantAddress),
      loanApplicantMailingAddress: JSON.stringify(loanApplicantMailingAddress)
    };
    console.log("saveAddress param:", param);
    this.callServer(
      "saveLoanApplicantAddress",
      param,
      false,
      function (response) {
        if (!response.isSuccess) {
          this.showErrorToast(response.error);
          this.component.set("v.Spinner", false);
          return;
        }
        var resultMap = response.data;
        console.log("saveLoanApplicantAddress data from server", resultMap);
        this.component.set("v.Spinner", false);
        this.component.set("v.PersonalInfoCurrentTab", tabToSet);
      }
    );
  },

  //Function to save loan applicant employment details
  saveEmployment: function (tabToSet) {
    var loanApplicant = this.component.get("v.NewLoanApplicant");
    var loanApplicantEmployment = this.component.get(
      "v.LoanApplicantEmployment"
    );
    if (!loanApplicantEmployment.Id) {
      loanApplicantEmployment.Name = loanApplicant.Name + " Employment";
      loanApplicantEmployment.LoanApplicationId =
        loanApplicant.LoanApplicationId;
      loanApplicantEmployment.LoanApplicantId = loanApplicant.Id;
    }
    var param = {
      loanApplicantEmployment: JSON.stringify(loanApplicantEmployment)
    };
    this.component.set("v.Spinner", true);
    this.callServer(
      "saveLoanApplicantEmployment",
      param,
      false,
      function (response) {
        if (!response.isSuccess) {
          this.showErrorToast(response.error);
          this.component.set("v.Spinner", false);
          return;
        }
        var resultMap = response.data;
        console.log("saveLoanApplicantEmployment data from server", resultMap);
        this.component.set("v.Spinner", false);
        this.component.set("v.PersonalInfoCurrentTab", tabToSet);
      }
    );
  },
  //Function to save loan applicant Incomes details
  saveIncomes: function (tabToSet) {
    var loanApplicant = this.component.get("v.NewLoanApplicant");
    var loanApplicantIncomes = this.component.get("v.LoanApplicantIncomes");

    if (!loanApplicantIncomes.Id) {
      loanApplicantIncomes.Name = loanApplicant.Name + " Income";
      loanApplicantIncomes.LoanApplicationId = loanApplicant.LoanApplicationId;
      loanApplicantIncomes.LoanApplicantId = loanApplicant.Id;
    }

    var param = {
      loanApplicantIncomes: JSON.stringify(loanApplicantIncomes)
    };
    this.callServer(
      "saveLoanApplicantIncome",
      param,
      false,
      function (response) {
        if (!response.isSuccess) {
          this.showErrorToast(response.error);
          this.component.set("v.Spinner", false);
          return;
        }
        var resultMap = response.data;
        this.component.set("v.Spinner", false);
        this.component.set("v.PersonalInfoCurrentTab", tabToSet);

        //Set TotalMonthlyIncome, TotalMonthlyExpense, Debt_To_Income_Ratio__c values
        this.component.set(
          "v.ResidentialLoanApplication.TotalMonthlyIncome__c",
          resultMap.loanApplication.TotalMonthlyIncome__c
        );
        this.component.set(
          "v.ResidentialLoanApplication.TotalMonthlyExpense__c",
          resultMap.loanApplication.TotalMonthlyExpense__c
        );
        this.component.set(
          "v.ResidentialLoanApplication.Debt_To_Income_Ratio__c",
          resultMap.loanApplication.Debt_To_Income_Ratio__c
        );
      }
    );
  },

  //Function to save Loan Applicant Expense details
  saveApplicantExpense: function (tabToSet) {
    var loanApplicant = this.component.get("v.NewLoanApplicant");
    if (loanApplicant.LoanApplicantDeclarations) {
      delete loanApplicant.LoanApplicantDeclarations;
    }

    this.component.set("v.Spinner", true);
    var param = {
      loanApplicant: JSON.stringify(loanApplicant)
    };

    this.callServer("saveLoanApplicant", param, false, function (response) {
      if (!response.isSuccess) {
        this.showErrorToast(response.error);
        this.component.set("v.Spinner", false);
        return;
      }
      var resultMap = response.data;
      this.component.set("v.Spinner", false);
      this.component.set("v.PersonalInfoCurrentTab", tabToSet);

      //Set TotalMonthlyIncome, TotalMonthlyExpense, Debt_To_Income_Ratio__c values
      this.component.set(
        "v.ResidentialLoanApplication.TotalMonthlyIncome__c",
        resultMap.loanApplication.TotalMonthlyIncome__c
      );
      this.component.set(
        "v.ResidentialLoanApplication.TotalMonthlyExpense__c",
        resultMap.loanApplication.TotalMonthlyExpense__c
      );
      this.component.set(
        "v.ResidentialLoanApplication.Debt_To_Income_Ratio__c",
        resultMap.loanApplication.Debt_To_Income_Ratio__c
      );
    });
  },

  //Fuction to update loan Applicatoin status
  updateLoanApplicationStatus: function (applicationStatus) {
    var loanApplicationObject = this.component.get(
      "v.ResidentialLoanApplication"
    );
    loanApplicationObject.Status = applicationStatus;

    if (loanApplicationObject.LoanApplicationProperties) {
      delete loanApplicationObject.LoanApplicationProperties;
    }
    if (loanApplicationObject.LoanApplicants) {
      delete loanApplicationObject.LoanApplicants;
    }
    var param = {
      loanApplication: JSON.stringify(loanApplicationObject)
    };
    this.callServer(
      "updateLoanApplicationStatus",
      param,
      false,
      function (response) {
        if (!response.isSuccess) {
          this.showErrorToast(response.error);
          this.component.set("v.Spinner", false);
          return;
        }
        var resultMap = response.data;
        var loanApplicationObj = this.component.get(
          "v.ResidentialLoanApplication"
        );
        loanApplicationObj.Status = applicationStatus;
        this.component.set("v.ResidentialLoanApplication", loanApplicationObj);
      }
    );
  },

  //Function to get Borrower Loan applicant address if 'same as borrower' checkbox is checked
  getBorrowerAddress: function (loanApplicantId) {
    this.component.set("v.Spinner", true);
    var param = {
      loanApplicantId: loanApplicantId
    };
    this.callServer("getApplicantAddress", param, false, function (response) {
      if (!response.isSuccess) {
        this.showErrorToast(response.error);
        this.component.set("v.Spinner", false);
        return;
      }
      this.component.set("v.Spinner", false);
      var resultMap = response.data;
      var applicantPresentAddress = this.component.get(
        "v.LoanApplicantAddress"
      );

      //Set Co-Borrower Present Address Like Borrower Present Address
      applicantPresentAddress.ResidenceStreet =
        resultMap.borrowerPresentAddress.ResidenceStreet;
      applicantPresentAddress.ResidenceCity =
        resultMap.borrowerPresentAddress.ResidenceCity;
      applicantPresentAddress.ResidenceCountry =
        resultMap.borrowerPresentAddress.ResidenceCountry;
      applicantPresentAddress.ResidenceState =
        resultMap.borrowerPresentAddress.ResidenceState;
      applicantPresentAddress.ResidencePostalCode =
        resultMap.borrowerPresentAddress.ResidencePostalCode;
      this.component.set("v.LoanApplicantAddress", applicantPresentAddress);

      //Set Co-Borrower Maling Address Like Borrower Maling Address
      var applicantMalingAddress = this.component.get(
        "v.LoanApplicantMalingAddress"
      );
      applicantMalingAddress.ResidenceStreet =
        resultMap.borrowerMailingAddress.ResidenceStreet;
      applicantMalingAddress.ResidenceCity =
        resultMap.borrowerMailingAddress.ResidenceCity;
      applicantMalingAddress.ResidenceCountry =
        resultMap.borrowerMailingAddress.ResidenceCountry;
      applicantMalingAddress.ResidenceState =
        resultMap.borrowerMailingAddress.ResidenceState;
      applicantMalingAddress.ResidencePostalCode =
        resultMap.borrowerMailingAddress.ResidencePostalCode;
      this.component.set(
        "v.LoanApplicantMalingAddress",
        applicantMalingAddress
      );
    });
  },

  //Function to set required documents
  getCertificationRecord: function (loanApplicantId) {
    this.component.set("v.Spinner", true);

    var param = {
      loanApplicantId: loanApplicantId
    };

    this.callServer(
      "getApplicantCertificationValues",
      param,
      false,
      function (response) {
        if (!response.isSuccess) {
          this.showErrorToast(response.error);
          this.component.set("v.Spinner", false);
          return;
        }
        var resultMap = response.data;
        this.component.set("v.Spinner", false);
        if (resultMap.declaration) {
          this.component.set("v.ApplicationQuestion", resultMap.declaration[0]);
        }
      }
    );
  },

  //Function to save Certification Record
  saveCertificationRecord: function (tabToSet) {
    this.component.set("v.Spinner", true);
    var declaration = this.component.get("v.ApplicationQuestion");
    var loanApplication = this.component.get("v.ResidentialLoanApplication");

    var param = {
      applicationCertification: JSON.stringify(declaration)
    };

    this.callServer(
      "saveApplicantCertification",
      param,
      false,
      function (response) {
        if (!response.isSuccess) {
          this.showErrorToast(response.error);
          this.component.set("v.Spinner", false);
          return;
        }
        var resultMap = response.data;
        this.component.set("v.Spinner", false);
        this.component.set("v.currentTab", tabToSet);
        this.component.set("v.showCertificationForm", false);
      }
    );
  },

  //Function to set Loan Applicant Consent Details
  saveLoanapplicantConsent: function (tabToSet, actionName) {
    var loanApplication = this.component.get("v.ResidentialLoanApplication");
    var loanApplicant = this.component.get("v.NewLoanApplicant");
    var applicationQuestions = this.component.get("v.ApplicationQuestion");

    if (!applicationQuestions.Id) {
      applicationQuestions.Name = loanApplicant.Name + " Consent Declaration";
      applicationQuestions.Loan_Program__c = this.component.get(
        "v.selectedMortgageType"
      );
      applicationQuestions.LoanApplicationId = loanApplicant.LoanApplicationId;
      applicationQuestions.LoanApplicantId = loanApplicant.Id;
    }

    var param = {
      applicationQuestions: JSON.stringify(applicationQuestions)
    };

    this.component.set("v.Spinner", true);
    this.callServer(
      "saveLoanapplicantQuestions",
      param,
      false,
      function (response) {
        if (!response.isSuccess) {
          this.showErrorToast(response.error);
          this.component.set("v.Spinner", false);
          return;
        }
        var resultMap = response.data;
        this.component.set(
          "v.ApplicationQuestion",
          resultMap.applicationQuestion
        );
        this.component.set("v.PersonalInfoCurrentTab", tabToSet);
        this.component.set("v.Spinner", false);
        this.component.set("v.showBorrowerForm", false);

        //Update Loan Application Status If Application is Submited
        if (
          actionName == "PreAppSubmit" &&
          loanApplication.Status == "Started"
        ) {
          this.updateLoanApplicationStatus("Pre-App Completed");
        }
        if (actionName == "AddCoBorrower") {
          $A.enqueueAction(this.component.get("c.showNewBorrowerForm"));
        }
      }
    );
  },

  //Function to Get Loan Applicant Record on Edit
  getLoanApplicantRecord: function (loanApplicantId) {
    var questions = this.component.get("v.ConsumerLoanProgram");

    var param = {
      loanApplicantRecId: loanApplicantId
    };
    this.callServer(
      "getLoanApplicantRecords",
      param,
      false,
      function (response) {
        if (!response.isSuccess) {
          this.showErrorToast(response.error);
          this.component.set("v.Spinner", false);
          return;
        }
        var resultMap = response.data;

        this.component.set("v.Spinner", false);
        this.component.set("v.showBorrowerForm", true);
        this.component.set("v.NewLoanApplicant", resultMap.loanApplicant);
        this.component.set("v.LoanApplicantAddress", resultMap.presentAddress);
        this.component.set(
          "v.LoanApplicantMalingAddress",
          resultMap.mailingAddress
        );
        this.component.set(
          "v.LoanApplicantEmployment",
          resultMap.applicantEmployment
        );
        this.component.set(
          "v.IsSelfEmployed",
          resultMap.applicantEmployment.IsSelfEmployed
        );
        this.component.set("v.LoanApplicantIncomes", resultMap.applicantIncome);

        if (resultMap.loanApplicant.LoanApplicantDeclarations) {
          this.component.set(
            "v.ApplicationQuestion",
            resultMap.loanApplicant.LoanApplicantDeclarations[0]
          );
          this.setDeclarationQuestions(
            resultMap.loanApplicant.LoanApplicantDeclarations[0]
          );
        } else {
          this.component.set("v.ApplicationQuestion", {});
          this.setDeclarationQuestions(null);
        }
      }
    );
  },

  //Function to set Loan Applicant Questions
  setDeclarationQuestions: function (loanApplicantDeclaration) {
    var questions = this.component.get("v.ConsumerLoanProgram");
    var LoanApplicationDeclaration = [];
    for (var key in questions.Application_Questions__r) {
      var declaration = {};
      declaration.Description =
        questions.Application_Questions__r[key].Description__c;
      declaration.Loan_Declaration_Field =
        questions.Application_Questions__r[key].Loan_Declaration_Field__c;
      declaration.Name = questions.Application_Questions__r[key].Name;
      declaration.QuestionType =
        questions.Application_Questions__r[key].Question_Type__c;
      if (loanApplicantDeclaration) {
        declaration.Answer =
          loanApplicantDeclaration[
            questions.Application_Questions__r[key].Loan_Declaration_Field__c
          ];
      }
      LoanApplicationDeclaration.push(declaration);
    }
    this.component.set("v.DeclarationQuestions", LoanApplicationDeclaration);
  },

  //Function to Set Progress bar according to current status
  progressBarSetup: function (currentStatus) {
    var statusOptions = ["Started", "Pre-App Completed"];
    if (currentStatus == "Started" || currentStatus == "Pre-App Completed") {
      statusOptions.push("Pending");
    } else if (currentStatus == "Pre-App Denied") {
      statusOptions.push("Pre-App Denied");
    } else if (
      currentStatus == "Pre-App Approved" ||
      currentStatus == "Full App Started" ||
      currentStatus == "Full App Completed"
    ) {
      statusOptions.push("Pre-App Approved");
      statusOptions.push("Full App Started");
      statusOptions.push("Full App Completed");
      if (currentStatus == "Pre-App Approved") {
        var loanApp = this.component.get("v.ResidentialLoanApplication");
        loanApp.Status = "Full App Started";
        this.component.set("v.ResidentialLoanApplication", loanApp);
      }
      if (
        currentStatus != "Pre-App Approved" &&
        currentStatus != "Full App Started"
      ) {
        statusOptions.push("Loan Pending");
      }
    } else if (
      currentStatus == "Loan Pending" ||
      currentStatus == "Loan Approved" ||
      currentStatus == "Loan Denied"
    ) {
      statusOptions.push("Pre-App Approved");
      statusOptions.push("Full App Started");
      statusOptions.push("Full App Completed");
      statusOptions.push(currentStatus);
    }
    console.log("statusOption : ", statusOptions);
    this.component.set("v.statusOption", statusOptions);
  },

  setLoanTerms: function () {
    var terms = [];
    for (var i = 12; i <= 84; i += 12) {
      terms.push(i);
    }
    this.component.set("v.LoanTerms", terms);
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

  getURLParameter: function (param) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)); //You get the whole decoded URL of the page.
    var sURLVariables = sPageURL.split("&"); //Split by & so that you get the key value pairs separately in a list
    var sParameterName;
    var i;
    var value = "";
    for (i = 0; i < sURLVariables.length; i++) {
      sParameterName = sURLVariables[i].split("="); //to split the key from the value.

      if (sParameterName[0] === param) {
        //lets say you are looking for param name - firstName
        value = sParameterName[1];
      }
    }
    console.log("Param value" + value);
    return value;
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

  navigateToUrl: function (url) {
    var urlEvent = $A.get("e.force:navigateToURL");
    urlEvent.setParams({
      url: url
    });
    urlEvent.fire();
  },

  validateForm: function (formId) {
    var valid = this.component
      .find(formId)
      .reduce(function (validSoFar, inputCmp) {
        // Displays error messages for invalid fields
        inputCmp.showHelpMessageIfInvalid();
        return validSoFar && inputCmp.get("v.validity").valid;
      }, true);
    return valid;
  },

  validatePersonalInfoForm: function () {
    var valid = this.component
      .find("PersonalInfo")
      .reduce(function (validSoFar, inputCmp) {
        // Displays error messages for invalid fields
        inputCmp.showHelpMessageIfInvalid();
        return validSoFar && inputCmp.get("v.validity").valid;
      }, true);
    return valid;
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
  }
});