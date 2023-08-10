/**
 * @description       :
 * @author            :
 * @group             :
 * @last modified on  : 03-15-2023
 * @last modified by  :
 **/
({
  component: null,
  //Function to get Initial records
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

      var resultMap = response.data;
      console.log("resultMap:" + JSON.stringify(resultMap));
      this.component.set("v.Spinner", false);
      this.component.set("v.BusinessLoanProgram", resultMap.loanProgram);
      this.component.set("v.currentUserContact", resultMap.currentUserContact);
      this.component.set("v.currentUser", resultMap.currentUser);

      //Set Purpose of Loan Option values
      var LoanPurposeMap = [];
      for (var key in resultMap.loanPurpose) {
        LoanPurposeMap.push({
          label: resultMap.loanPurpose[key],
          value: resultMap.loanPurpose[key]
        });
      }
      this.component.set("v.purposeOfLoan", LoanPurposeMap);

      //Set Default Loan Applicant record if loan application Id not available
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
        //Set Existing loan application values
        this.component.set(
          "v.LoanApplicant",
          resultMap.loanApplication.LoanApplicants
        );
        this.component.set(
          "v.selectedBusinessType",
          resultMap.loanApplication.Loan_Program__c
        );
        this.component.set("v.showFormTypeSelector", false);
        this.component.find("read-me").set("v.checked", true);
        this.component.set(
          "v.NewLoanApplicant",
          resultMap.loanApplication.LoanApplicants[0]
        );
      }

      //Set Existing Purpose_of_Loan Values
      if (resultMap.loanApplication.Purpose_of_Loan__c) {
        resultMap.loanApplication.Purpose_of_Loan =
          resultMap.loanApplication.Purpose_of_Loan__c.split(";");
      } else {
        resultMap.loanApplication.Purpose_of_Loan = "";
      }
      this.component.set(
        "v.ResidentialLoanApplication",
        resultMap.loanApplication
      );

      //Map to Select Loan Program For Business Loan
      var BusinessOptionsMap = [];
      for (var key in resultMap.loanProgram) {
        BusinessOptionsMap.push({
          key: resultMap.loanProgram[key].Name,
          value: resultMap.loanProgram[key].Id
        });
      }
      this.component.set("v.BusinessOptions", BusinessOptionsMap);

      //Map to get selected loan program record details
      var selectedBusinessType = this.component.get("v.selectedBusinessType");
      var businessLoanProgramMap = new Map();
      for (var key in resultMap.loanProgram) {
        //Set Selected Loan program for existing laon application
        if (selectedBusinessType) {
          if (selectedBusinessType == resultMap.loanProgram[key].Id) {
            this.component.set(
              "v.BusinessLoanProgram",
              resultMap.loanProgram[key]
            );
          }
        }
        businessLoanProgramMap.set(
          resultMap.loanProgram[key].Id,
          resultMap.loanProgram[key]
        );
      }
      this.component.set("v.BusinessLoanProgramMap", businessLoanProgramMap);

      //Set Loan Application progress bar according current status
      if (resultMap.loanApplication.Status) {
        this.progressBarSetup(resultMap.loanApplication.Status);
      } else {
        var statusOptions = ["Started", "Pre-App Completed", "Pending"];
        this.component.set("v.statusOption", statusOptions);
      }

      //Set Required documents
      this.component.set(
        "v.requiredDocumentIds",
        resultMap.requiredDocumentIds
      );
    });
  },

  //Function to save laon application records
  saveLoanApplication: function (tabToSet) {
    var loanApplicationObject = this.component.get(
      "v.ResidentialLoanApplication"
    );
    loanApplicationObject.Loan_Program__c = this.component.get(
      "v.selectedBusinessType"
    );

    //Set Status if loan application Id is not available
    if (!loanApplicationObject.Status) {
      loanApplicationObject.Status = "Started";
    }

    if (loanApplicationObject.Purpose_of_Loan) {
      delete loanApplicationObject.Purpose_of_Loan;
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
      //Set Purpose of Loan Values
      if (resultMap.loanApplication.Purpose_of_Loan__c) {
        resultMap.loanApplication.Purpose_of_Loan =
          resultMap.loanApplication.Purpose_of_Loan__c.split(";");
      } else {
        resultMap.loanApplication.Purpose_of_Loan = "";
      }
      //Set Loan Application, Loan Applicants, Required Documents Data
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

  //Function to save Loan Information values
  saveLoanInformation: function (tabToSet) {
    var loanApplicationObject = this.component.get(
      "v.ResidentialLoanApplication"
    );
    delete loanApplicationObject.LoanApplicants;

    if (loanApplicationObject.Purpose_of_Loan) {
      loanApplicationObject.Purpose_of_Loan__c =
        loanApplicationObject.Purpose_of_Loan.join(";");
      delete loanApplicationObject.Purpose_of_Loan;
    }

    var param = {
      loanApplication: JSON.stringify(loanApplicationObject)
    };

    this.callServer(
      "saveApplicationLoanInformation",
      param,
      false,
      function (response) {
        if (!response.isSuccess) {
          this.showErrorToast(response.error);
          this.component.set("v.Spinner", false);
          return;
        }
        var resultMap = response.data;
        if (resultMap.loanApplication.Purpose_of_Loan__c) {
          resultMap.loanApplication.Purpose_of_Loan =
            resultMap.loanApplication.Purpose_of_Loan__c.split(";");
        } else {
          resultMap.loanApplication.Purpose_of_Loan = "";
        }

        this.component.set(
          "v.ResidentialLoanApplication",
          resultMap.loanApplication
        );
        this.component.set("v.Spinner", false);
        this.component.set("v.currentTab", tabToSet);
      }
    );
  },

  //Function to save laon applicant details
  saveLoanApplicant: function (tabToSet, loanApplicationId) {
    var loanApplicant = this.component.get("v.NewLoanApplicant");
    if (!loanApplicant.Id) {
      loanApplicant.Name =
        loanApplicant.First_Name__c + " " + loanApplicant.Last_Name__c;
      loanApplicant.LoanApplicationId = loanApplicationId;
    }
    //delete relatet LoanApplicantDeclarations records
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
      this.component.set(
        "v.ResidentialLoanApplication.Total_Ownership__c",
        resultMap.loanApplication.Total_Ownership__c
      );
      this.component.set("v.PersonalInfoCurrentTab", tabToSet);
    });
  },

  //Function to save Business Loan Applicant Questions
  saveLoanapplicantQuestion: function (
    tabToSet,
    applicationQuestions,
    QuestionType
  ) {
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
        if (QuestionType == "Declaration") {
          this.component.set("v.currentTab", tabToSet);
        }
        if (QuestionType == "Application Question") {
          this.component.set("v.PersonalInfoCurrentTab", tabToSet);
        }
      }
    );
  },

  //Function to save laon applicant address
  saveAddress: function (
    tabToSet,
    loanApplicantAddress,
    loanApplicantMailingAddress
  ) {
    var param = {
      loanApplicantAddress: JSON.stringify(loanApplicantAddress),
      loanApplicantMailingAddress: JSON.stringify(loanApplicantMailingAddress)
    };

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
        this.component.set("v.Spinner", false);
        this.component.set("v.PersonalInfoCurrentTab", tabToSet);
      }
    );
  },

  //Function to save Loan applicant Income details
  saveIncomes: function (tabToSet, actionName) {
    var loanApplicant = this.component.get("v.NewLoanApplicant");
    var loanApplicantIncomes = this.component.get("v.LoanApplicantIncomes");

    //Set loan applicationId and Loan ApplicantId if loanApplicantIncomeId is not available
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
        this.component.set("v.showBorrowerForm", false);

        //Open New Loan Applicant Form
        if (actionName == "AddCoBorrower") {
          $A.enqueueAction(this.component.get("c.showNewBorrowerForm"));
        }
      }
    );
  },

  //Function to Update Loan Application Status
  updateLoanApplicationStatus: function (applicationStatus) {
    var loanApplicationObject = this.component.get(
      "v.ResidentialLoanApplication"
    );
    loanApplicationObject.Status = applicationStatus;

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

  //Function to set Loan applicant Co-Borrower Address same as Borrower address
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

      //Set Co-Borrower Present Address Like Borrower Present Address
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

  //Function to save certification details
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

  //Function to ge Loan application Question
  getLoanapplicationQuestion: function (loanApplicantId) {
    this.component.set("v.Spinner", true);
    var param = {
      loanApplicantId: loanApplicantId
    };
    this.callServer(
      "getApplicationDeclaration",
      param,
      false,
      function (response) {
        if (!response.isSuccess) {
          this.showErrorToast(response.error);
          this.component.set("v.Spinner", false);
          return;
        }
        var resultMap = response.data;
        var applicationDeclarations;
        this.component.set("v.Spinner", false);

        if (resultMap.declaration) {
          this.component.set("v.ApplicationQuestion", resultMap.declaration[0]);
          applicationDeclarations = resultMap.declaration[0];
        }
        if (applicationDeclarations) {
          //Declaration Question with answer
          this.setDeclarationQuestions(applicationDeclarations, "Declaration");
        } else {
          //Declaration Question
          this.component.set("v.ApplicationQuestion", {});
          this.setDeclarationQuestions(null, "Declaration");
        }
      }
    );
  },

  //Function to set Declaration Questions according to Question Type
  setDeclarationQuestions: function (declarationRec, questionType) {
    var loanProgram = this.component.get("v.BusinessLoanProgram");
    var questions = loanProgram.Application_Questions__r;
    var applicationDeclarations;
    var ApplicationQuestions = [];
    var LoanApplicationDeclaration = [];

    if (questionType == "Declaration") {
      for (var key in questions) {
        if (questions[key].Question_Type__c == "Declaration") {
          ApplicationQuestions.push(questions[key]);
        }
      }
    } else {
      for (var key in questions) {
        if (questions[key].Question_Type__c == "Application Question") {
          ApplicationQuestions.push(questions[key]);
        }
      }
    }

    for (var key in ApplicationQuestions) {
      var declaration = {};
      declaration.Description = ApplicationQuestions[key].Description__c;
      if (declarationRec) {
        declaration.Answer =
          declarationRec[ApplicationQuestions[key].Loan_Declaration_Field__c];
      }
      declaration.Loan_Declaration_Field =
        ApplicationQuestions[key].Loan_Declaration_Field__c;
      declaration.Name = ApplicationQuestions[key].Name;
      declaration.QuestionType = ApplicationQuestions[key].Question_Type__c;
      LoanApplicationDeclaration.push(declaration);
    }
    this.component.set("v.DeclarationQuestions", LoanApplicationDeclaration);
    console.log("LoanApplicationDeclaration : ", LoanApplicationDeclaration);
  },

  //Function to get Loan Applicant Record on edit
  getLoanApplicantRecord: function (loanApplicantId) {
    var param = {
      loanApplicantRecId: loanApplicantId
    };
    console.log("getLoanApplicantRecords - param -", param);
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
        console.log("data from server", resultMap);

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

        //Set loan applicant declarations for selected loan applicant
        if (resultMap.loanApplicant.LoanApplicantDeclarations) {
          this.component.set(
            "v.ApplicationQuestion",
            resultMap.loanApplicant.LoanApplicantDeclarations[0]
          );
          this.setDeclarationQuestions(
            resultMap.loanApplicant.LoanApplicantDeclarations[0],
            "Application Question"
          );
        } else {
          this.component.set("v.ApplicationQuestion", {});
          this.setDeclarationQuestions(null, "Application Question");
        }
      }
    );
  },

  //Function to get Business Account Information On Change Of Selected Business Account
  getBusinessInfoAccount: function (selectedBusinessInfoAccountId) {
    this.component.set("v.Spinner", true);
    var param = {
      accountId: selectedBusinessInfoAccountId
    };
    this.callServer("getBusinessInfo", param, false, function (response) {
      if (!response.isSuccess) {
        this.showErrorToast(response.error);
        this.component.set("v.Spinner", false);
        return;
      }
      var resultMap = response.data;
      //Set Loan Application Detilas According Selected Business Account
      if (selectedBusinessInfoAccountId == resultMap.account.Id) {
        this.component.set(
          "v.ResidentialLoanApplication.Name",
          resultMap.account.Name
        );
        this.component.set(
          "v.ResidentialLoanApplication.Business_TIN__c",
          resultMap.account.Business_TIN__c
        );
        this.component.set(
          "v.ResidentialLoanApplication.DBA_or_Tradename__c",
          resultMap.account.DBA_or_Tradename__c
        );
        this.component.set(
          "v.ResidentialLoanApplication.Number_of_Employees__c",
          resultMap.account.Number_of_Employees__c
        );
        this.component.set(
          "v.ResidentialLoanApplication.Business_Classification__c",
          resultMap.account.Business_Classification__c
        );
        this.component.set(
          "v.ResidentialLoanApplication.Street__c",
          resultMap.account.BillingStreet
        );
        this.component.set(
          "v.ResidentialLoanApplication.City__c",
          resultMap.account.BillingCity
        );
        this.component.set(
          "v.ResidentialLoanApplication.State__c",
          resultMap.account.BillingState
        );
        this.component.set(
          "v.ResidentialLoanApplication.Country__c",
          resultMap.account.BillingCountry
        );
        this.component.set(
          "v.ResidentialLoanApplication.PostalCode__c",
          resultMap.account.BillingPostalCode
        );
      }
      this.component.set("v.Spinner", false);
    });
  },

  //Function to set Financial Details By Calculating Assets And Liabilites Values
  setFinancialDetails: function (loanApplicationId) {
    this.component.set("v.Spinner", true);
    var financialDetails = this.component.get("v.financialDetails");

    var param = {
      loanApplicationId: loanApplicationId
    };

    this.callServer(
      "getLoanApplicationAssetsAndLiabilities",
      param,
      false,
      function (response) {
        if (!response.isSuccess) {
          this.showErrorToast(response.error);
          this.component.set("v.Spinner", false);
          return;
        }
        var resultMap = response.data;
        var assets = resultMap.assets;
        var liabilities = resultMap.liabilities;

        //Calculate Asset's Financial Details
        if (assets) {
          for (var key in assets) {
            if (assets[key].Schedule_Form_Type__c == "ScheduleAForm") {
              financialDetails.AssetScheduleAFinancialValue =
                financialDetails.AssetScheduleAFinancialValue +
                assets[key].Cost__c;
            }
            if (assets[key].Schedule_Form_Type__c == "ScheduleBForm") {
              financialDetails.AssetScheduleBFinancialValue =
                financialDetails.AssetScheduleBFinancialValue +
                assets[key].PresentMarketValue;
            }
            if (assets[key].Schedule_Form_Type__c == "ScheduleCForm") {
              financialDetails.AssetScheduleCFinancialValue =
                financialDetails.AssetScheduleCFinancialValue +
                assets[key].Payment__c;
            }
            if (assets[key].Schedule_Form_Type__c == "ScheduleDForm") {
              financialDetails.AssetScheduleDFinancialValue =
                financialDetails.AssetScheduleDFinancialValue +
                assets[key].Payment__c;
            }
            if (assets[key].Schedule_Form_Type__c == "ScheduleFForm") {
              financialDetails.AssetScheduleFFinancialValue =
                financialDetails.AssetScheduleFFinancialValue +
                assets[key].Cash_Value__c;
            }
          }
        }

        //Calculate Asset's liabilities Details
        if (liabilities) {
          for (var key in liabilities) {
            if (liabilities[key].Schedule_Form_Type__c == "ScheduleAForm") {
              financialDetails.LiabilityScheduleAFinancialValue =
                financialDetails.LiabilityScheduleAFinancialValue +
                liabilities[key].Cost__c;
            }
            if (liabilities[key].Schedule_Form_Type__c == "ScheduleBForm") {
              financialDetails.LiabilityScheduleBFinancialValue =
                financialDetails.LiabilityScheduleBFinancialValue +
                liabilities[key].PresentMarketValue__c;
            }
            if (liabilities[key].Schedule_Form_Type__c == "ScheduleCForm") {
              financialDetails.LiabilityScheduleCFinancialValue =
                financialDetails.LiabilityScheduleCFinancialValue +
                liabilities[key].Payment__c;
            }
            if (liabilities[key].Schedule_Form_Type__c == "ScheduleDForm") {
              financialDetails.LiabilityScheduleDFinancialValue =
                financialDetails.LiabilityScheduleDFinancialValue +
                liabilities[key].Payment__c;
            }
            if (liabilities[key].Schedule_Form_Type__c == "ScheduleFForm") {
              financialDetails.LiabilityScheduleFFinancialValue =
                financialDetails.LiabilityScheduleFFinancialValue +
                liabilities[key].Cash_Value__c;
            }
          }
        }
        this.component.set("v.Spinner", false);
        this.component.set("v.financialDetails", financialDetails);
      }
    );
  },

  //Set Loan Application Progress Bar according to current status
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

  //Function to get Collateral Info
  getCollateralInfo: function (loanApplicationId) {
    var param = {
      loanApplicationId: loanApplicationId
    };

    this.callServer(
      "getCollateralInformation",
      param,
      false,
      function (response) {
        if (!response.isSuccess) {
          this.showErrorToast(response.error);
          this.component.set("v.Spinner", false);
          return;
        }
        var resultMap = response.data;
        this.component.set("v.collateralTypes", resultMap.collateralTypes);
        this.component.set(
          "v.collateralInfoList",
          resultMap.collateralInfoList
        );
        this.component.set("v.Spinner", false);
      }
    );
  },

  //Function to Save Collateral Info
  saveCollateralInfo: function (loanApplicationId) {
    var collateralInfo = this.component.get("v.NewCollateralInfo");
    this.component.set("v.Spinner", true);
    var param = {
      collateralInfo: JSON.stringify(collateralInfo),
      loanApplicationId: loanApplicationId
    };

    this.callServer(
      "saveCollateralInformation",
      param,
      false,
      function (response) {
        if (!response.isSuccess) {
          this.showErrorToast(response.error);
          this.component.set("v.Spinner", false);
          return;
        }
        var resultMap = response.data;
        this.component.set("v.NewCollateralInfo", resultMap.collateralInfo);
        this.component.set(
          "v.collateralInfoList",
          resultMap.collateralInfoList
        );
        this.component.set("v.showCollateralInfoForm", false);
        this.component.set("v.Spinner", false);
      }
    );
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