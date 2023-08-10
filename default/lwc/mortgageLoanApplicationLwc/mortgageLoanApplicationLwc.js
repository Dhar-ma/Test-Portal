/* eslint-disable no-unused-expressions */
/* eslint-disable no-redeclare */
/* eslint-disable guard-for-in */
/* eslint-disable vars-on-top */
/**
 * @description       :
 * @author            : 'Amol K'
 * @group             :
 * @last modified on  : 02-28-2023
 * @last modified by  : 'Amol K'
 **/
import { LightningElement, wire } from "lwc";
import { NavigationMixin } from "lightning/navigation";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { CurrentPageReference } from "lightning/navigation";
import getInitialData from "@salesforce/apex/MortgageLoanApplicationController.getInitialData";
import saveLoanApplication from "@salesforce/apex/MortgageLoanApplicationController.saveLoanApplication";
import saveLoanApplicant from "@salesforce/apex/MortgageLoanApplicationController.saveLoanApplicant";
import saveLoanApplicantAddress from "@salesforce/apex/MortgageLoanApplicationController.saveLoanApplicantAddress";
import saveLoanapplicantQuestions from "@salesforce/apex/MortgageLoanApplicationController.saveLoanapplicantQuestions";
import saveLoanApplicantEmployment from "@salesforce/apex/MortgageLoanApplicationController.saveLoanApplicantEmployment";
import getLoanApplicantRecords from "@salesforce/apex/MortgageLoanApplicationController.getLoanApplicantRecords";
import updateLoanApplicationStatus from "@salesforce/apex/MortgageLoanApplicationController.updateLoanApplicationStatus";
import getApplicantCertificationValues from "@salesforce/apex/MortgageLoanApplicationController.getApplicantCertificationValues";
import getApplicantAddress from "@salesforce/apex/MortgageLoanApplicationController.getApplicantAddress";
import saveAsset from "@salesforce/apex/MortgageLoanApplicationController.saveAsset";
import saveLoanApplicantIncome from "@salesforce/apex/MortgageLoanApplicationController.saveLoanApplicantIncome";
import getPicklists from "@salesforce/apex/MortgageLoanApplicationController.getPicklists";
import saveLiability from "@salesforce/apex/MortgageLoanApplicationController.saveLiability";
import saveApplicantCertification from "@salesforce/apex/MortgageLoanApplicationController.saveApplicantCertification";
export default class MortgageLoanApplicationLwc extends NavigationMixin(
  LightningElement
) {
  columns = [
    {
      label: "Action",
      type: "button-icon",
      typeAttributes: {
        iconName: "utility:edit",
        name: "edit"
      }
    },
    { label: "Name", fieldName: "Name" },
    { label: "SSN", fieldName: "SSN__c" },
    { label: "Home Phone", fieldName: "Phone__c" },
    { label: "Mobile", fieldName: "Mobile__c" },
    { label: "Email", fieldName: "Email__c", type: "Email" }
  ];

  Liabilitiescolumns = [
    {
      label: "Action",
      type: "button-icon",
      typeAttributes: {
        iconName: "utility:edit",
        name: "edit"
      }
    },
    { label: "Name", fieldName: "Name" },
    { label: "Liability Class", fieldName: "LiabilityClass" },
    { label: "Account Type", fieldName: "AccountType" },
    { label: "Monthly Payment", fieldName: "MonthlyPayment" }
  ];

  Assetscolumns = [
    {
      label: "Action",
      type: "button-icon",
      typeAttributes: {
        iconName: "utility:edit",
        name: "edit"
      }
    },
    { label: "Name", fieldName: "Name" },
    { label: "Asset Class", fieldName: "AssetClass" },
    { label: "Asset Type", fieldName: "AssetType" },
    { label: "Account Payment", fieldName: "AccountType" }
  ];

  recordId;
  LoanApplicantMap = [];
  mortgageOptions = [];
  loanProgram = [];
  showAssetsForm = false;
  selectedMortgageType = "";
  MortgageLoanProgramMap = {};
  MortgageLoanProgram = {};
  statusOptions = [];
  requiredDocumentIds;
  currentStatus;
  isShowCertificationForm = false;
  isMortgageOption = false;
  value;
  isTermChecked = false;
  isLoaded = false;
  isMortageType = true;
  urlId = null;
  ResidentialLoanApplication = {};
  LoanApplicationProperty = {};
  LoanApplicant = [];
  LoanApplicantEmployment = {};
  NewLoanApplicant = {};
  showFormTypeSelector = true;
  Assets = [];
  showBorrowerForm = false;
  ApplicationQuestion = {};
  Liabilities = [];
  LoanApplicantAddress = {};
  LoanApplicantMalingAddress = {};
  MortgageTypes = [];
  NewAsset = {};
  OccupancyType = [];
  PropertyType = [];
  purposeOfLoan = [];
  NewLiability = {};
  currentTab = "0";
  showLiabilitiesForm = false;
  IsSelfEmployed = false;
  LoanApplicantIncomes = {};
  DeclarationQuestions = [];
  AssetOrLiabilityClasses = [];
  AssetOrLiabilityTypes = [];
  AccountTypes = [];

  connectedCallback() {
    this.loadInitialData(this.urlId);
  }

  // renderedCallback() {
  //   console.log("before if %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%");
  //   var ele = this.template.querySelector(".slds-vertical-tabs__nav-item");
  //   if (ele !== null) {
  //     console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%");
  //     ele.style.setProperty("--lwc-colorBackgroundAlt", "rgb(247, 56, 56)");
  //   }

  // this.template.querySelector(".button").style.setProperty("-colo", "red");
  // this.template
  //   .querySelector(".button3")
  //   .style.setProperty("--colot", "right");
  // }

  @wire(CurrentPageReference)
  getStateParameters(currentPageReference) {
    if (currentPageReference) {
      this.urlId = currentPageReference.state?.id;
    }
    console.log("urlId:" + this.urlId);
  }

  get Estate_Held_In() {
    let Estate_Held_In = [];
    Estate_Held_In.push(
      {
        label: "--None--",
        value: "---None---"
      },
      {
        label: "Fee Simple",
        value: "Fee Simple"
      },
      {
        label: "Leasehold",
        value: "Leasehold"
      }
    );
    return Estate_Held_In;
  }

  get Manner_In_Which_Title_Held() {
    let Manner_In_Which_Title_Held = [];
    Manner_In_Which_Title_Held.push(
      {
        label: "--None--",
        value: "---None---"
      },
      {
        label: "Individual",
        value: "Individual"
      },
      {
        label: "Joint",
        value: "Joint"
      }
    );
    return Manner_In_Which_Title_Held;
  }

  get isMortageRefinance() {
    return this.MortgageLoanProgram.Program_Type__c === "Refinance"
      ? true
      : false;
  }

  get maritalStatus() {
    let maritalStatus = [
      { label: "Married", value: "Married" },
      { label: "Separated", value: "Separated" },
      { label: "Unmarried", value: "Unmarried" }
    ];
    return maritalStatus;
  }

  get yes_No_options() {
    let yes_No_options = [
      { label: "Yes", value: "true" },
      { label: "No", value: "false" }
    ];
    return yes_No_options;
  }

  get LoanTerms() {
    var terms = [];

    for (var i = 12; i <= 84; i += 12) {
      terms.push({
        label: i,
        value: i
      });
    }
    return terms;
  }

  get NewLoanApplicantBorrowerType() {
    return this.NewLoanApplicant.BorrowerType !== "Borrower" ? true : false;
  }

  get recordIdAndLoanId() {
    console.log(
      "ResidentialLoanApplication.Id : " + this.ResidentialLoanApplication.Id
    );
    console.log("requiredDocumentIds : " + this.requiredDocumentIds);
    return this.requiredDocumentIds && this.ResidentialLoanApplication.Id
      ? true
      : false;
  }

  showApplicationQuestionTab() {
    if (this.isTermChecked) {
      this.currentTab = "";
      this.currentTab = "1";
    } else {
      this.showErrorToast(
        "Error",
        "Please read instruction and mark the checkbox",
        "error"
      );
    }
  }

  cancelForm() {
    ///my-applications
    const config = {
      type: "standard__webPage",
      attributes: {
        url: "/my-applications"
      }
    };
    this[NavigationMixin.Navigate](config);
  }

  handelTermsAndCondition(event) {
    console.log(event.detail.checked);
    this.isTermChecked = event.detail.checked;
  }

  async loadInitialData(recordId) {
    this.isLoaded = true;
    try {
      let response = await getInitialData({ loanApplicationId: recordId });
      if (!response.isSuccess) {
        this.isLoaded = false;
        this.showErrorToast("Error", response.error, "error");
        return;
      }

      var resultMap = response.data;
      console.log("resultMap: " + JSON.stringify(resultMap));
      this.loanProgram = resultMap.loanProgram;
      this.currentUserContact = resultMap.currentUserContact;

      if (Object.keys(resultMap.loanApplication).length === 0) {
        this.NewLoanApplicant = {
          Name: resultMap.currentUserContact.Name,
          First_Name__c: resultMap.currentUserContact.FirstName,
          Last_Name__c: resultMap.currentUserContact.LastName,
          Email__c: resultMap.currentUserContact.Email,
          Account__c: resultMap.currentUserContact.AccountId,
          Phone__c: resultMap.currentUserContact.Phone,
          SSN__c: resultMap.currentUserContact.Social_Security_Number__c,
          Mobile__c: resultMap.currentUserContact.MobilePhone,
          BorrowerType: "Borrower"
        };
        this.LoanApplicant.push(this.NewLoanApplicant);
      } else {
        this.ResidentialLoanApplication = resultMap.loanApplication;
        this.LoanApplicant = resultMap.loanApplication.LoanApplicants;
        this.LoanApplicationProperty =
          resultMap.loanApplication.LoanApplicationProperties[0];
        this.selectedMortgageType = resultMap.loanApplication.Loan_Program__c;
        this.showFormTypeSelector = false;
        this.isTermChecked = true;
        this.NewLoanApplicant = resultMap.loanApplication.LoanApplicants[0];
        this.Assets = resultMap.assets;
        this.Liabilities = resultMap.liabilities;
      }
      console.log("Liabilities:@@@ " + JSON.stringify(this.Liabilities));
      console.log("Assets:@@@ " + JSON.stringify(this.Assets));
      //Set Mortgage Loan Program Option Selection Values
      var mortgageOptionsMap = [];
      for (var key in resultMap.loanProgram) {
        mortgageOptionsMap.push({
          label: resultMap.loanProgram[key].Name,
          value: resultMap.loanProgram[key].Id
        });
      }
      this.mortgageOptions = mortgageOptionsMap;
      this.value = mortgageOptionsMap[0].label;
      this.isMortgageOption = true;

      //Map to Get Selected Loan program Detail
      var mortgageLoanProgramMap = {};
      for (var key in resultMap.loanProgram) {
        //Set Selected Loan program if LoanProgram Id is available
        console.log("this.selectedMortgageType:" + this.selectedMortgageType);
        if (this.selectedMortgageType) {
          if (this.selectedMortgageType === resultMap.loanProgram[key].Id) {
            this.MortgageLoanProgram = resultMap.loanProgram[key];
          }
        }
        mortgageLoanProgramMap[resultMap.loanProgram[key].Id] =
          resultMap.loanProgram[key];
      }
      this.MortgageLoanProgramMap = mortgageLoanProgramMap;

      //Set Loan Application Status according to current status
      if (resultMap.loanApplication.Status) {
        this.progressBarSetup(resultMap.loanApplication.Status);
      } else {
        this.statusOptions.push(
          {
            label: "Started",
            value: "Started"
          },
          {
            label: "Pre-App Completed",
            value: "Pre-App Completed"
          },
          {
            label: "Pending",
            value: "Pending"
          }
        );
        this.ResidentialLoanApplication.Status = "Started";
      }

      //Set Loan Application Picklist values
      this.MortgageTypes.push({
        label: "---None---",
        value: "---None---"
      });

      resultMap.mortgageTypes.forEach((mrttype) => {
        this.MortgageTypes.push({
          label: mrttype,
          value: mrttype
        });
      });

      this.OccupancyType.push({
        label: "---None---",
        value: "---None---"
      });

      resultMap.occupancyType.forEach((oqtype) => {
        this.OccupancyType.push({
          label: oqtype,
          value: oqtype
        });
      });
      this.PropertyType.push({
        label: "---None---",
        value: "---None---"
      });
      resultMap.PropertyType.forEach((prtype) => {
        this.PropertyType.push({
          label: prtype,
          value: prtype
        });
      });
      this.purposeOfLoan.push({
        label: "---None---",
        value: "---None---"
      });

      resultMap.loanPurpose.forEach((purpose) => {
        this.purposeOfLoan.push({
          label: purpose,
          value: purpose
        });
      });

      //Set Loan Application Required Documentation
      this.requiredDocumentIds = resultMap.requiredDocumentIds;
      console.log(
        "MortgageLoanProgram::" + JSON.stringify(this.MortgageLoanProgram)
      );
      this.isLoaded = false;
    } catch (error) {
      this.isLoaded = false;
      console.error(error);
    }
  }

  setMortgageType() {
    var loantype = this.value;
    var mortgage = this.mortgageOptions;
    console.log("loantype :", loantype);
    var loanProgramMap = this.MortgageLoanProgramMap;
    console.log("loanProgramMap :", JSON.stringify(loanProgramMap));
    console.log(
      "selectedMortgage Program : ",
      JSON.stringify(loanProgramMap[loantype])
    );

    if (loantype) {
      this.selectedMortgageType = loantype;
      this.MortgageLoanProgram = loanProgramMap[loantype];
    } else {
      this.selectedMortgageType = mortgage[0].value;
      this.MortgageLoanProgram = loanProgramMap[mortgage[0].value];
    }
    console.log(
      "MortgageLoanProgram::" + JSON.stringify(this.MortgageLoanProgram)
    );
    this.showFormTypeSelector = false;
  }

  saveLoanInformation() {
    this.isLoaded = true;
    this.validateForm("propertyLoanInfo")
      ? this.saveLoanApplication("2")
      : this.showErrorToast(
          "Error",
          "Please enter all required fields",
          "error"
        );
  }

  async saveLoanApplication(tabToSet) {
    var mortgageType = this.MortgageLoanProgram.Name;

    var loanApplicationObject = JSON.parse(
      JSON.stringify(this.ResidentialLoanApplication)
    );
    console.log(
      "loanApplicationObject : " + JSON.stringify(loanApplicationObject)
    );

    this.template.querySelectorAll(".propertyLoanInfo").forEach((element) => {
      if (element.dataset && element.dataset.fieldApiName) {
        loanApplicationObject[element.dataset.fieldApiName] = element.value;
      }
    });

    loanApplicationObject.Loan_Program__c = this.selectedMortgageType;
    loanApplicationObject.AccountId = this.currentUserContact.AccountId;
    loanApplicationObject.Name =
      this.currentUserContact.Name + " " + mortgageType;

    //Set Initial status of Loan Application
    if (!loanApplicationObject.Status) {
      loanApplicationObject.Status = "Started";
    }
    delete loanApplicationObject.LoanApplicationProperties;
    delete loanApplicationObject.LoanApplicants;

    var LoanApplicationProperty = JSON.parse(
      JSON.stringify(this.LoanApplicationProperty)
    );

    this.template.querySelectorAll(".borrowerForm").forEach((element) => {
      if (element.dataset && element.dataset.fieldApiName) {
        LoanApplicationProperty[element.dataset.fieldApiName] = element.value;
      }
    });

    LoanApplicationProperty.LoanPurposeType = loanApplicationObject.LoanPurpose;
    try {
      let response = await saveLoanApplication({
        loanApplication: JSON.stringify(loanApplicationObject),
        applicationProperty: JSON.stringify(LoanApplicationProperty),
        loanApplicant: JSON.stringify(this.NewLoanApplicant)
      });
      {
        if (!response.isSuccess) {
          this.showErrorToast(response.error);
          this.component.set("v.Spinner", false);
          return;
        }
        console.log("saveLoanApplication : " + JSON.stringify(response));
        var resultMap = response.data;
        this.ResidentialLoanApplication = resultMap.loanApplication;
        this.LoanApplicant = resultMap.loanApplicant;
        this.LoanApplicationProperty = resultMap.loanApplicationProperty;
        this.requiredDocumentIds = resultMap.requiredDocumentIds;
        this.isLoaded = false;
        this.currentTab = tabToSet;
      }
    } catch (error) {
      console.error(error);
      this.isLoaded = false;
    }
  }

  editBorrowerForm(event) {
    console.log("editBorrowerForm:" + event.detail.row.Id);
    this.isLoaded = false;
    if (event.detail.row.Id) {
      this.getLoanApplicantRecord(event.detail.row.Id);
    } else {
      this.showErrorToast("Error", "Please complete previous steps", "error");
    }
    this.isLoaded = false;
  }

  async getLoanApplicantRecord(loanApplicantId) {
    this.isLoaded = true;
    try {
      let response = await getLoanApplicantRecords({
        loanApplicantRecId: loanApplicantId
      });

      if (!response.isSuccess) {
        this.showErrorToast("Error", response.error, "error");
        return;
      }
      var resultMap = response.data;
      this.showBorrowerForm = true;
      this.NewLoanApplicant = resultMap.loanApplicant;
      this.LoanApplicantAddress = resultMap.presentAddress;
      this.LoanApplicantMalingAddress = resultMap.mailingAddress;
      this.LoanApplicantEmployment = resultMap.applicantEmployment;
      this.IsSelfEmployed = resultMap.applicantEmployment.IsSelfEmployed;
      this.LoanApplicantIncomes = resultMap.applicantIncome;

      //Set Applicant Declaration for existing Record
      if (resultMap.loanApplicant.LoanApplicantDeclarations) {
        this.ApplicationQuestion =
          resultMap.loanApplicant.LoanApplicantDeclarations[0];
        this.setDeclarationQuestions(
          resultMap.loanApplicant.LoanApplicantDeclarations[0]
        );
      } else {
        this.ApplicationQuestion = {};
        this.setDeclarationQuestions(null);
      }

      this.isLoaded = false;
    } catch (error) {
      this.isLoaded = false;
      console.error(error);
    }
  }

  hideBorrowerForm() {
    this.showBorrowerForm = false;
  }

  setDeclarationQuestions(applicantDeclaration) {
    var questions = JSON.parse(JSON.stringify(this.MortgageLoanProgram));
    var LoanApplicationDeclaration = [];
    for (var key in questions.Application_Questions__r) {
      var declaration = {};
      declaration.Description =
        questions.Application_Questions__r[key].Description__c;
      declaration.Loan_Declaration_Field =
        questions.Application_Questions__r[key].Loan_Declaration_Field__c;
      declaration.Name = questions.Application_Questions__r[key].Name;
      if (applicantDeclaration) {
        declaration.Answer =
          applicantDeclaration[
            questions.Application_Questions__r[key].Loan_Declaration_Field__c
          ];
      }
      LoanApplicationDeclaration.push(declaration);
    }
    console.log(
      "LoanApplicationDeclaration : " +
        JSON.stringify(LoanApplicationDeclaration)
    );
    this.DeclarationQuestions = LoanApplicationDeclaration;
  }

  showNewBorrowerForm() {
    this.isLoaded = true;
    console.log("In showNewBorrowerForm");
    this.NewLoanApplicant = {};
    this.ApplicationQuestion = {};
    this.LoanApplicantAddress = {};
    this.LoanApplicantMalingAddress = {};
    this.LoanApplicantEmployment = {};
    this.LoanApplicantIncomes = {};
    this.NewLoanApplicant.BorrowerType = "CoBorrower";
    console.log("NewLoanApplicant : ", JSON.stringify(this.NewLoanApplicant));
    this.showBorrowerForm = true;
    this.setDeclarationQuestions(null);
    this.isLoaded = false;
  }

  saveLoanApplicantInfo(event) {
    console.log("saveLoanApplicantInfo");
    this.isLoaded = true;
    var actionName = event.currentTarget.dataset.action;
    var loanApplicationId = this.ResidentialLoanApplication.Id;
    console.log("loanApplicationId:" + loanApplicationId);
    loanApplicationId
      ? actionName === "CreditApproval"
        ? this.saveLoanApplicant("3", loanApplicationId, actionName)
        : this.saveLoanApplicant("2", loanApplicationId, actionName)
      : this.showErrorToast(
          "Error",
          "Please Create Loan Application First",
          "error"
        );
    this.isLoaded = false;
  }

  async saveLoanApplicant(tabToSet, loanApplicationId, actionName) {
    console.log("saveLoanApplicant");
    this.isLoaded = true;
    this.PersonalInfoCurrentTab = tabToSet;
    console.log(
      "this.NewLoanApplicant inside save Applicant: $$$$$ " +
        this.NewLoanApplicant
    );
    let loanApplicant = JSON.parse(JSON.stringify(this.NewLoanApplicant));
    if (!loanApplicant.Id) {
      loanApplicant.Name =
        loanApplicant.First_Name__c + " " + loanApplicant.Last_Name__c;
      loanApplicant.LoanApplicationId = loanApplicationId;
    }
    //delete related LoanApplicantDeclarations records
    loanApplicant.LoanApplicantDeclarations
      ? delete loanApplicant.LoanApplicantDeclarations
      : loanApplicant.LoanApplicantDeclarations;
    console.log("param:" + JSON.stringify(loanApplicant));
    if (actionName === "CreditApproval") {
      this.template.querySelectorAll(".certification").forEach((element) => {
        if (element.dataset && element.dataset.fieldApiName) {
          console.log("+++++++ : " + element.dataset.checkbox);
          loanApplicant[element.dataset.fieldApiName] = element.dataset.checkbox
            ? element.checked
            : element.value;
        }
      });
    } else {
      this.template.querySelectorAll(".PersonalInfo").forEach((element) => {
        if (element.dataset && element.dataset.fieldApiName) {
          if (element.value !== loanApplicant[element.dataset.fieldApiName]) {
            loanApplicant[element.dataset.fieldApiName] = element.value;
          }
        }
      });
    }
    console.log("loanApplicant:" + JSON.stringify(loanApplicant));
    try {
      let result = await saveLoanApplicant({
        loanApplicant: JSON.stringify(loanApplicant)
      });

      console.log("result : " + JSON.stringify(result));
      this.NewLoanApplicant = result.data.loanApplicantRecord;
      this.LoanApplicant = result.data.loanApplicantList;
    } catch (error) {
      console.error(error);
    }

    this.isLoaded = false;
  }

  saveApplicantQuestions() {
    this.isLoaded = true;
    this.NewLoanApplicant.Id
      ? this.saveLoanapplicantQuestion("3")
      : this.showErrorToast(
          "Error",
          "Please Complete Loan Applicant Form",
          "error"
        );
    this.isLoaded = false;
  }

  async saveLoanapplicantQuestion(tabToSet) {
    this.isLoaded = true;
    this.PersonalInfoCurrentTab = tabToSet;
    let applicationQuestions = {};
    this.template
      .querySelectorAll(".applicantDeclaration")
      .forEach((element) => {
        if (element.dataset && element.dataset.fieldApiName) {
          applicationQuestions[element.dataset.fieldApiName] = element.checked;
        }
      });

    if (!applicationQuestions.Id) {
      applicationQuestions.Name = this.NewLoanApplicant.Name + " Declaration";
      applicationQuestions.Loan_Program__c = this.consumerLoanType;
      applicationQuestions.LoanApplicationId =
        this.NewLoanApplicant.LoanApplicationId;
      applicationQuestions.LoanApplicantId = this.NewLoanApplicant.Id;
    }
    console.log("applicationQuestions:" + JSON.stringify(applicationQuestions));
    try {
      let response = await saveLoanapplicantQuestions({
        applicationQuestions: JSON.stringify(applicationQuestions)
      });

      console.log("response:" + JSON.stringify(response));
      if (!response.isSuccess) {
        this.showErrorToast("Error", response.error, "error");
        return;
      }
      var resultMap = response.data;
      this.ApplicationQuestion = resultMap.applicationQuestion;
    } catch (error) {
      console.error(error);
    }

    this.isLoaded = false;
  }

  handelLoanApplicantAddress(event) {
    let LoanApplicantAddress = {};
    LoanApplicantAddress.ResidenceStreet = event.detail.street;
    LoanApplicantAddress.ResidenceCity = event.detail.city;
    LoanApplicantAddress.ResidenceCountry = event.detail.country;
    LoanApplicantAddress.ResidenceState = event.detail.province;
    LoanApplicantAddress.ResidencePostalCode = event.detail.postalCode;
    this.LoanApplicantAddress = LoanApplicantAddress;
  }

  handelLoanApplicantMalingAddress(event) {
    let LoanApplicantMalingAddress = {};
    LoanApplicantMalingAddress.ResidenceStreet = event.detail.street;
    LoanApplicantMalingAddress.ResidenceCity = event.detail.city;
    LoanApplicantMalingAddress.ResidenceCountry = event.detail.country;
    LoanApplicantMalingAddress.ResidenceState = event.detail.province;
    LoanApplicantMalingAddress.ResidencePostalCode = event.detail.postalCode;
    this.LoanApplicantMalingAddress = LoanApplicantMalingAddress;
  }

  saveApplicantAddress() {
    this.isLoaded = true;
    //AddressInfo
    let LoanApplicantAddress = JSON.parse(
      JSON.stringify(this.LoanApplicantAddress)
    );
    let LoanApplicantMalingAddress = JSON.parse(
      JSON.stringify(this.LoanApplicantMalingAddress)
    );
    this.template.querySelectorAll(".AddressInfo").forEach((element) => {
      if (element.dataset && element.dataset.fieldApiName) {
        LoanApplicantAddress[element.dataset.fieldApiName] = element.value;
      }
    });
    this.template.querySelectorAll(".AddressInfo").forEach((element) => {
      if (element.dataset && element.dataset.fieldApiName) {
        LoanApplicantMalingAddress[element.dataset.fieldApiName] =
          element.value;
      }
    });
    if (this.NewLoanApplicant.Id) {
      if (!this.LoanApplicantAddress.Id) {
        LoanApplicantAddress.Name =
          this.NewLoanApplicant.Name + " Present Address";
        LoanApplicantAddress.ResidencyType = "Present Address";
        LoanApplicantAddress.LoanApplicationId =
          this.NewLoanApplicant.LoanApplicationId;
        LoanApplicantAddress.LoanApplicantId = this.NewLoanApplicant.Id;
      }
      this.LoanApplicantAddress = LoanApplicantAddress;

      if (!this.LoanApplicantMalingAddress.Id) {
        LoanApplicantMalingAddress.Name =
          this.NewLoanApplicant.Name + " Mailing Address";
        LoanApplicantMalingAddress.ResidencyType = "Mailing Address";
        LoanApplicantMalingAddress.LoanApplicationId =
          this.NewLoanApplicant.LoanApplicationId;
        LoanApplicantMalingAddress.LoanApplicantId = this.NewLoanApplicant.Id;
      }
      this.LoanApplicantMalingAddress = LoanApplicantMalingAddress;
      this.saveAddress("4", LoanApplicantAddress, LoanApplicantMalingAddress);
    } else {
      this.showErrorToast(
        "Error",
        "Please Complete Loan Applicant Form",
        "error"
      );
    }
    this.isLoaded = false;
  }

  async saveAddress(
    tabToSet,
    loanApplicantAddress,
    loanApplicantMailingAddress
  ) {
    this.isLoaded = true;
    this.PersonalInfoCurrentTab = tabToSet;
    try {
      let response = await saveLoanApplicantAddress({
        loanApplicantAddress: JSON.stringify(loanApplicantAddress),
        loanApplicantMailingAddress: JSON.stringify(loanApplicantMailingAddress)
      });

      if (!response.isSuccess) {
        this.showErrorToast("Error", response.error, "error");
        return;
      }
      var resultMap = response.data;
      console.log("saveLoanApplicantAddress data from server", resultMap);
    } catch (error) {
      console.error(error);
    }

    this.isLoaded = false;
  }

  handelEmploymentAddress(event) {
    let LoanApplicantEmployment = {};
    LoanApplicantEmployment.ResidenceStreet = event.detail.street;
    LoanApplicantEmployment.ResidenceCity = event.detail.city;
    LoanApplicantEmployment.ResidenceCountry = event.detail.country;
    LoanApplicantEmployment.ResidenceState = event.detail.province;
    LoanApplicantEmployment.ResidencePostalCode = event.detail.postalCode;
    this.LoanApplicantEmployment = LoanApplicantEmployment;
  }

  saveApplicantEmployment() {
    this.isLoaded = true;
    this.NewLoanApplicant.Id
      ? this.saveEmployment("5")
      : this.showErrorToast(
          "Error",
          "Please Complete Loan Applicant Form",
          "error"
        );
    this.isLoaded = false;
  }

  async saveEmployment(tabToSet) {
    this.isLoaded = true;
    this.PersonalInfoCurrentTab = tabToSet;
    var loanApplicant = JSON.parse(JSON.stringify(this.NewLoanApplicant));
    var loanApplicantEmployment = JSON.parse(
      JSON.stringify(this.LoanApplicantEmployment)
    );
    if (!loanApplicantEmployment.Id) {
      loanApplicantEmployment.Name = loanApplicant.Name + " Employment";
      loanApplicantEmployment.LoanApplicationId =
        loanApplicant.LoanApplicationId;
      loanApplicantEmployment.LoanApplicantId = loanApplicant.Id;
    }
    this.template.querySelectorAll(".employmentInfo").forEach((element) => {
      if (element.dataset && element.dataset.fieldApiName) {
        if (
          loanApplicantEmployment[element.dataset.fieldApiName] !==
          element.value
        ) {
          loanApplicantEmployment[element.dataset.fieldApiName] = element.value;
        }
      }
    });
    try {
      let response = await saveLoanApplicantEmployment({
        loanApplicantEmployment: JSON.stringify(loanApplicantEmployment)
      });

      if (!response.isSuccess) {
        this.showErrorToast("Error", response.error, "error");
        return;
      }
      var resultMap = response.data;
      console.log("resultMap:" + JSON.stringify(resultMap));
    } catch (error) {
      console.error(error);
    }

    this.isLoaded = false;
  }

  calculateTotalIncome() {
    this.isLoaded = true;
    var totalIncome = 0;
    let LoanApplicantIncomes = JSON.parse(
      JSON.stringify(this.LoanApplicantIncomes)
    );
    this.template.querySelectorAll(".IncomeInfo").forEach((element) => {
      if (element.dataset && element.dataset.fieldApiName) {
        LoanApplicantIncomes[element.dataset.fieldApiName] = parseFloat(
          element.value
        );
        totalIncome = parseFloat(totalIncome) + parseFloat(element.value);
        LoanApplicantIncomes.MonthlyIncomeAmount = totalIncome;
      }
    });
    this.LoanApplicantIncomes = LoanApplicantIncomes;
    this.isLoaded = false;
  }

  saveApplicantIncomes() {
    this.isLoaded = true;
    this.NewLoanApplicant.Id
      ? this.saveIncomes("6")
      : this.showErrorToast(
          "Error",
          "Please Complete Loan Applicant Form",
          "error"
        );
    this.isLoaded = false;
  }

  async saveIncomes(tabToSet) {
    this.isLoaded = true;
    this.PersonalInfoCurrentTab = tabToSet;
    var loanApplicant = JSON.parse(JSON.stringify(this.NewLoanApplicant));
    var loanApplicantIncomes = JSON.parse(
      JSON.stringify(this.LoanApplicantIncomes)
    );
    if (!loanApplicantIncomes.Id) {
      loanApplicantIncomes.Name = loanApplicant.Name + " Income";
      loanApplicantIncomes.LoanApplicationId = loanApplicant.LoanApplicationId;
      loanApplicantIncomes.LoanApplicantId = loanApplicant.Id;
    }
    try {
      let response = await saveLoanApplicantIncome({
        loanApplicantIncomes: JSON.stringify(loanApplicantIncomes)
      });

      if (!response.isSuccess) {
        this.showErrorToast("Error", response.error, "error");
        return;
      }
      console.log("saveIncomes : " + JSON.stringify(response));
      var resultMap = response.data;
      //Set TotalMonthlyIncome, TotalMonthlyExpense, Debt_To_Income_Ratio__c values
      this.ResidentialLoanApplication.TotalMonthlyIncome__c =
        resultMap.loanApplication.TotalMonthlyIncome__c;
      this.ResidentialLoanApplication.TotalMonthlyExpense__c =
        resultMap.loanApplication.TotalMonthlyExpense__c;
      this.ResidentialLoanApplication.Debt_To_Income_Ratio__c =
        resultMap.loanApplication.Debt_To_Income_Ratio__c;
    } catch (error) {
      console.error(error);
    }

    this.isLoaded = false;
  }

  calculateTotalExpenses() {
    this.isLoaded = true;
    var totalIncome = 0;
    let LoanApplicantExpenses = JSON.parse(
      JSON.stringify(this.NewLoanApplicant)
    );
    this.template.querySelectorAll(".ExpenseInfo").forEach((element) => {
      if (element.dataset && element.dataset.fieldApiName) {
        LoanApplicantExpenses[element.dataset.fieldApiName] = parseFloat(
          element.value
        );
        totalIncome = parseFloat(totalIncome) + parseFloat(element.value);
        LoanApplicantExpenses.Monthly_Expenses_Amount__c = totalIncome;
      }
    });
    this.NewLoanApplicant = LoanApplicantExpenses;
    this.isLoaded = false;
  }

  saveApplicantExpense(event) {
    var actionName = event.currentTarget.dataset.action;
    console.log("actionName : ", actionName);
    if (this.NewLoanApplicant.Id) {
      this.saveApplicantExpenses("0", actionName);
    } else {
      this.showErrorToast(
        "Error",
        "Please Complete Loan Applicant Form",
        "error"
      );
    }
  }

  async saveApplicantExpenses(tabToSet, actionName) {
    this.PersonalInfoCurrentTab = tabToSet;

    var loanApplication = JSON.parse(
      JSON.stringify(this.ResidentialLoanApplication)
    );
    var loanApplicant = JSON.parse(JSON.stringify(this.NewLoanApplicant));
    if (loanApplicant.LoanApplicantDeclarations) {
      delete loanApplicant.LoanApplicantDeclarations;
    }
    try {
      let response = await saveLoanApplicant({
        loanApplicant: JSON.stringify(loanApplicant)
      });

      if (!response.isSuccess) {
        this.showErrorToast("Error", response.error, "error");
        return;
      }
      console.log("saveApplicantExpenses : " + JSON.stringify(response));
      var resultMap = response.data;
      this.ResidentialLoanApplication.TotalMonthlyIncome__c =
        resultMap.loanApplication.TotalMonthlyIncome__c;
      this.ResidentialLoanApplication.TotalMonthlyExpense__c =
        resultMap.loanApplication.TotalMonthlyExpense__c;
      this.ResidentialLoanApplication.Debt_To_Income_Ratio__c =
        resultMap.loanApplication.Debt_To_Income_Ratio__c;

      if (
        actionName === "PreAppSubmit" &&
        loanApplication.Status === "Started"
      ) {
        this.updateLoanApplicationStatus("Pre-App Completed");
      }
      if (actionName === "AddCoBorrower") {
        this.showNewBorrowerForm();
      }
    } catch (error) {
      console.error("@@@@@" + error);
    }
  }

  async updateLoanApplicationStatus(applicationStatus) {
    this.isLoaded = true;
    var loanApplicationObject = JSON.parse(
      JSON.stringify(this.ResidentialLoanApplication)
    );
    this.showBorrowerForm = false;
    loanApplicationObject.Status = applicationStatus;
    if (loanApplicationObject.LoanApplicationProperties) {
      delete loanApplicationObject.LoanApplicationProperties;
    }
    if (loanApplicationObject.LoanApplicants) {
      delete loanApplicationObject.LoanApplicants;
    }
    try {
      let response = await updateLoanApplicationStatus({
        loanApplication: JSON.stringify(loanApplicationObject)
      });

      if (!response.isSuccess) {
        this.showErrorToast("Error", response.error, "error");
        return;
      }
      var loanApplicationObj = JSON.parse(
        JSON.stringify(this.ResidentialLoanApplication)
      );
      loanApplicationObj.Status = applicationStatus;
      this.ResidentialLoanApplication = loanApplicationObj;
    } catch (error) {
      console.error(error);
    }
    this.isLoaded = false;
  }

  copyAddress(event) {
    let LoanApplicantMalingAddress = {};
    if (event.detail.checked) {
      if (!this.LoanApplicantMalingAddress.Id) {
        LoanApplicantMalingAddress.Name =
          this.NewLoanApplicant.Name + " Mailing Address";
        LoanApplicantMalingAddress.ResidencyType = "Mailing Address";
        LoanApplicantMalingAddress.LoanApplicationId =
          this.NewLoanApplicant.LoanApplicationId;
        LoanApplicantMalingAddress.LoanApplicantId = this.NewLoanApplicant.Id;
      }
      LoanApplicantMalingAddress.ResidenceStreet =
        this.LoanApplicantAddress.ResidenceStreet;
      LoanApplicantMalingAddress.ResidenceCity =
        this.LoanApplicantAddress.ResidenceCity;
      LoanApplicantMalingAddress.ResidenceCountry =
        this.LoanApplicantAddress.ResidenceCountry;
      LoanApplicantMalingAddress.ResidenceState =
        this.LoanApplicantAddress.ResidenceState;
      LoanApplicantMalingAddress.ResidencePostalCode =
        this.LoanApplicantAddress.ResidencePostalCode;
      this.LoanApplicantMalingAddress = LoanApplicantMalingAddress;
    }
  }

  getBorrowerAddress(event) {
    this.isLoaded = true;
    if (event.target.checked) {
      var loanApplicant = JSON.parse(JSON.stringify(this.LoanApplicant));
      for (var key in loanApplicant) {
        if (loanApplicant[key].BorrowerType === "Borrower") {
          this.getBorrowerAddres(loanApplicant[key].Id);
          break;
        }
      }
    }
    this.isLoaded = false;
  }

  async getBorrowerAddres(loanApplicantId) {
    this.isLoaded = true;
    try {
      let response = await getApplicantAddress({
        loanApplicantId: loanApplicantId
      });

      console.log("response:" + JSON.stringify(response));
      if (!response.isSuccess) {
        this.showErrorToast("Error", response.error, "error");
        return;
      }
      var resultMap = response.data;
      if (resultMap.borrowerPresentAddress !== null) {
        //Set Co-Borrower Present Address Like Borrower Present Address
        this.LoanApplicantAddress.ResidenceStreet =
          resultMap.borrowerPresentAddress.ResidenceStreet;
        this.LoanApplicantAddress.ResidenceCity =
          resultMap.borrowerPresentAddress.ResidenceCity;
        this.LoanApplicantAddress.ResidenceCountry =
          resultMap.borrowerPresentAddress.ResidenceCountry;
        this.LoanApplicantAddress.ResidenceState =
          resultMap.borrowerPresentAddress.ResidenceState;
        this.LoanApplicantAddress.ResidencePostalCode =
          resultMap.borrowerPresentAddress.ResidencePostalCode;
      }
      if (this.LoanApplicantMalingAddress !== null) {
        //Set Co-Borrower Maling Address Like Borrower Maling Address
        this.LoanApplicantMalingAddress.ResidenceStreet =
          resultMap.borrowerMailingAddress.ResidenceStreet;
        this.LoanApplicantMalingAddress.ResidenceCity =
          resultMap.borrowerMailingAddress.ResidenceCity;
        this.LoanApplicantMalingAddress.ResidenceCountry =
          resultMap.borrowerMailingAddress.ResidenceCountry;
        this.LoanApplicantMalingAddress.ResidenceState =
          resultMap.borrowerMailingAddress.ResidenceState;
        this.LoanApplicantMalingAddress.ResidencePostalCode =
          resultMap.borrowerMailingAddress.ResidencePostalCode;
      }
    } catch (error) {
      console.error(error);
    }

    this.isLoaded = false;
  }

  editLiabilityForm(event) {
    this.getLoanApplicantMap();
    var Liabilities = {};

    for (const asset of this.Liabilities) {
      console.log("asset:" + JSON.stringify(asset));
      Liabilities[event.detail.row.Id] = asset;
    }
    console.log("Liabilities: " + JSON.stringify(Liabilities));
    this.NewLiability = Liabilities[event.detail.row.Id];
    console.log("NewLiability: " + JSON.stringify(this.NewLiability));
    console.log("NewAsset: " + JSON.stringify(this.NewAsset));
    this.showLiabilitiesForm = true;
  }

  handelAssetLoanApplicant(event) {
    console.log(event.detail.value);
    if (event.detail.value) {
      this.NewAsset.Loan_Applicant__c = event.detail.value;
    }
  }

  handelLiabilitiesLoanApplicant(event) {
    console.log(event.detail.value);
    if (event.detail.value) {
      this.NewLiability.Loan_Applicant__c = event.detail.value;
    }
  }

  getLoanApplicantMap() {
    var loanApplicants = JSON.parse(JSON.stringify(this.LoanApplicant));
    var loanApplicantMap = [];
    for (var key in loanApplicants) {
      loanApplicantMap.push({
        label: loanApplicants[key].Name,
        value: loanApplicants[key].Id
      });
    }
    this.LoanApplicantMap = loanApplicantMap;
  }

  editAssetForm(event) {
    this.getLoanApplicantMap();
    var Assets = {};

    for (const asset of this.Assets) {
      console.log("asset:" + JSON.stringify(asset));
      Assets[event.detail.row.Id] = asset;
    }
    console.log("Assets: " + JSON.stringify(Assets));
    this.NewAsset = Assets[event.detail.row.Id];
    console.log("NewAsset: " + JSON.stringify(this.NewAsset));
    this.showAssetsForm = true;
  }

  hideAssetsForm() {
    this.showAssetsForm = false;
  }
  hideLiabilitiesForm() {
    this.showLiabilitiesForm = false;
  }

  saveLiabilitiesForm() {
    var liabilityForm = this.NewLiability;
    console.log("LiabilityForm", JSON.stringify(liabilityForm));
    var valid = this.validateForm("LiabilityForm");
    console.log("this.LoanApplicant : ", this.LoanApplicant);
    var loanApplicants = this.LoanApplicant;
    var loanApplicant;
    for (var key in loanApplicants) {
      if (loanApplicants[key].Id === liabilityForm.Loan_Applicant__c) {
        loanApplicant = loanApplicants[key];
      }
    }
    var loanApplicationId = this.ResidentialLoanApplication.Id;
    if (loanApplicationId) {
      if (!valid) {
        this.showErrorToast(
          "Error",
          "Please enter all required fields",
          "error"
        );
      } else {
        console.log("valid loan applicant : ", loanApplicant);
        this.saveLiabilityForm("5", loanApplicationId, loanApplicant.Id);
      }
    } else {
      this.showErrorToast("Error", "Please complete previous steps", "error");
    }
  }

  async saveLiabilityForm(tabToSet, loanApplicationId, loanApplicantId) {
    var NewLiability = JSON.parse(JSON.stringify(this.NewLiability));
    this.template.querySelectorAll(".LiabilityForm").forEach((element) => {
      if (element.dataset && element.dataset.fieldApiName) {
        NewLiability[element.dataset.fieldApiName] = element.dataset.checkbox
          ? element.checked
          : element.value;
      }
    });
    console.log("NewLiability:" + JSON.stringify(NewLiability));
    try {
      let response = await saveLiability({
        liability: JSON.stringify(NewLiability),
        loanApplicationId: loanApplicationId,
        loanApplicantId: loanApplicantId
      });

      if (!response.isSuccess) {
        this.showErrorToast("Error", response.error, "error");
        return;
      }
      var resultMap = response.data;
      this.Liabilities = resultMap.liabilities;
      this.currentTab = tabToSet;
      this.showLiabilitiesForm = false;
    } catch (error) {
      console.log("@@@@@@@@@@" + JSON.stringify(error));
      console.error(error);
    }
  }

  saveAssetForm() {
    var assetForm = this.NewAsset;
    console.log("AssetForm", JSON.stringify(assetForm));
    var valid = this.validateForm("AssetForm");
    console.log("isValid : ", valid);
    var loanApplicants = this.LoanApplicant;
    var loanApplicant;
    for (var key in loanApplicants) {
      if (loanApplicants[key].Id === assetForm.Loan_Applicant__c) {
        loanApplicant = loanApplicants[key];
      }
    }
    var loanApplicationId = this.ResidentialLoanApplication.Id;
    if (loanApplicationId) {
      if (!valid) {
        console.log("not valid");
        this.showErrorToast(
          "Error",
          "Please enter all required fields",
          "error"
        );
      } else {
        console.log("valid loan applicant : ", loanApplicant);
        this.saveAssetform("4", loanApplicationId, loanApplicant.Id);
      }
    } else {
      this.showErrorToast("Error", "Please complete previous steps", "error");
    }
  }

  async saveAssetform(tabToSet, loanApplicationId, loanApplicantId) {
    var NewAsset = JSON.parse(JSON.stringify(this.NewAsset));
    this.template.querySelectorAll(".AssetForm").forEach((element) => {
      if (element.dataset && element.dataset.fieldApiName) {
        NewAsset[element.dataset.fieldApiName] = element.value;
      }
    });
    console.log("NewAsset $$$$4 : " + JSON.stringify(NewAsset));
    try {
      let response = await saveAsset({
        asset: JSON.stringify(NewAsset),
        loanApplicationId: loanApplicationId,
        loanApplicantId: loanApplicantId
      });
      if (!response.isSuccess) {
        this.showErrorToast("Error", response.error, "error");
        return;
      }
      var resultMap = response.data;
      this.Assets = resultMap.assets;
      this.currentTab = tabToSet;
      this.showAssetsForm = false;
    } catch (error) {
      console.error(error);
    }
  }

  validateForm(classSelector) {
    this.isLoaded = true;
    let isValid = true;
    let inputFields = this.template.querySelectorAll("." + classSelector);
    inputFields.forEach((inputField) => {
      if (!inputField.checkValidity()) {
        inputField.reportValidity();
        isValid = false;
      }
    });
    this.isLoaded = false;
    return isValid;
  }

  handleMortgageLoanType(event) {
    this.value = event.target.value;
    console.log("App Type", this.value);
  }

  handelPropertyAddress(event) {
    let LoanApplicationProperty = {};
    LoanApplicationProperty.PropertyStreet = event.detail.street;
    LoanApplicationProperty.PropertyCity = event.detail.city;
    LoanApplicationProperty.PropertyCountry = event.detail.country;
    LoanApplicationProperty.PropertyState = event.detail.province;
    LoanApplicationProperty.PropertyPostalCode = event.detail.postalCode;
    this.LoanApplicationProperty = LoanApplicationProperty;
  }

  submitFullApp() {
    this.isLoaded = true;
    var loanApplication = this.ResidentialLoanApplication;
    console.log("loanApplication:" + JSON.stringify(loanApplication));
    console.log("loanApplication.Status:" + loanApplication.Status);
    if (
      loanApplication.Status === "Pre-App Approved" ||
      loanApplication.Status === "Full App Started"
    ) {
      this.updateLoanApplicationStatus("Full App Completed");
      this.progressBarSetup("Full App Completed");
      console.log("End: loanApplication");
    }
    this.isLoaded = false;
  }

  editCertificationForm(event) {
    console.log("editCertificationForm");
    this.isLoaded = true;
    this.isShowCertificationForm = true;
    console.log("editCertificationForm: " + event.detail.row.Id);
    event.detail.row.Id
      ? this.getCertificationRecord(event.detail.row.Id)
      : this.showErrorToast("Error", "Please complete previous steps", "error");
    this.isLoaded = false;
  }

  async saveCertificationForm() {
    this.isLoaded = true;
    var declarationQes = this.ApplicationQuestion;
    this.template.querySelectorAll(".certificationqes").forEach((element) => {
      if (element.dataset && element.dataset.fieldApiName) {
        element.dataset.checkbox
          ? (declarationQes[element.dataset.fieldApiName] = element.checked)
          : (declarationQes[element.dataset.fieldApiName] = element.value);
      }
    });
    try {
      let response = await saveApplicantCertification({
        applicationCertification: JSON.stringify(declarationQes)
      });
      {
        if (!response.isSuccess) {
          this.showErrorToast("Error", response.error, "error");
          return;
        }
        var resultMap = response.data;
        console.log("saveCertificationForm:" + JSON.stringify(resultMap));
        this.currentTab = "6";
        this.isShowCertificationForm = false;
      }
    } catch (error) {
      console.error(error);
    }
    this.isLoaded = false;
  }

  hideCertificationForm() {
    this.isShowCertificationForm = false;
  }

  async getCertificationRecord(loanApplicantId) {
    this.isLoaded = true;
    try {
      let response = await getApplicantCertificationValues({
        loanApplicantId: loanApplicantId
      });
      {
        if (!response.isSuccess) {
          this.showErrorToast("Error", response.error, "error");
          return;
        }
        var resultMap = response.data;
        if (resultMap.declaration) {
          this.ApplicationQuestion = resultMap.declaration[0];
        }
      }
    } catch (error) {
      console.error(error);
    }

    this.isLoaded = false;
  }

  hideModalBox() {
    this.showFormTypeSelector = false;
    console.log("this.showModal:" + this.showFormTypeSelector);
    this.setMortgageType();
  }

  //set progress bar value depending upon the loan status;
  progressBarSetup(currentStatus) {
    this.currentStatus = currentStatus;
    this.statusOptions.push(
      {
        label: "Started",
        value: "Started"
      },
      {
        label: "Pre-App Completed",
        value: "Pre-App Completed"
      }
    );

    if (currentStatus === "Started" || currentStatus === "Pre-App Completed") {
      this.statusOptions.push({
        label: "Pending",
        value: "Pending"
      });
    } else if (currentStatus === "Pre-App Denied") {
      this.statusOptions.push({
        label: "Pre-App Denied",
        value: "Pre-App Denied"
      });
    } else if (
      currentStatus === "Pre-App Approved" ||
      currentStatus === "Full App Started" ||
      currentStatus === "Full App Completed"
    ) {
      this.statusOptions.push(
        {
          label: "Pre-App Approved",
          value: "Pre-App Approved"
        },
        {
          label: "Full App Started",
          value: "Full App Started"
        },
        {
          label: "Full App Completed",
          value: "Full App Completed"
        }
      );
      if (currentStatus === "Pre-App Approved") {
        var loanApp = this.ResidentialLoanApplication;
        loanApp.Status = "Full App Started";
        this.ResidentialLoanApplication = loanApp;
      }
      if (
        currentStatus !== "Pre-App Approved" &&
        currentStatus !== "Full App Started"
      ) {
        this.statusOptions.push("Loan Pending");
      }
    } else if (
      currentStatus === "Loan Pending" ||
      currentStatus === "Loan Approved" ||
      currentStatus === "Loan Denied"
    ) {
      this.statusOptions.push(
        {
          label: "Pre-App Approved",
          value: "Pre-App Approved"
        },
        {
          label: "Full App Started",
          value: "Full App Started"
        },
        {
          label: "Full App Completed",
          value: "Full App Completed"
        },
        {
          label: currentStatus,
          value: currentStatus
        }
      );
    }
  }

  showErrorToast(title, message, variant) {
    const evt = new ShowToastEvent({
      title: title,
      message: message,
      variant: variant,
      mode: "dismissable"
    });
    this.dispatchEvent(evt);
    this.isLoaded = false;
  }

  tabActive(event) {
    console.log("tabActive");
    var tab = event.currentTarget.dataset.action;
    console.log("tab ::", JSON.stringify(tab));
    // eslint-disable-next-line default-case
    switch (tab) {
      case "3":
        console.log("Current Tab :", tab);
        this.getPicklistValues("Asset");
        break;
      case "4":
        this.getPicklistValues("Liability");
        console.log("Current Tab :", tab);
        break;
    }
  }

  async getPicklistValues(tabName) {
    console.log("getPicklistValues");
    try {
      let response = await getPicklists({ type: tabName });
      if (!response.isSuccess) {
        this.showErrorToast("Error", response.error, "error");
        return;
      }
      console.log("response: getPicklistValues  " + JSON.stringify(response));
      var resultMap = response.data;

      resultMap.assetOrLiabilityClass.forEach((element) => {
        this.AssetOrLiabilityClasses.push({
          label: element,
          value: element
        });
      });

      resultMap.assetOrLiabilityType.forEach((element) => {
        this.AssetOrLiabilityTypes.push({
          label: element,
          value: element
        });
      });

      resultMap.accountType.forEach((element) => {
        this.AccountTypes.push({
          label: element,
          value: element
        });
      });
    } catch (error) {
      console.error(error);
    }
  }

  showNewAssetsForm() {
    this.getLoanApplicantMap();
    this.showAssetsForm = true;
  }

  showNewLiabilitiesForm() {
    this.getLoanApplicantMap();
    this.showLiabilitiesForm = true;
  }

  setCertificationTab() {
    this.currentTab = "6";
  }
}