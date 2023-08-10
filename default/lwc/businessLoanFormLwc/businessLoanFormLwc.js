/* eslint-disable no-useless-concat */
/* eslint-disable no-unused-expressions */
/* eslint-disable no-redeclare */
/* eslint-disable vars-on-top */
/* eslint-disable guard-for-in */
/**
 * @description       :
 * @author            : 'Amol K'
 * @group             :
 * @last modified on  : 04-18-2023
 * @last modified by  :
 **/
import { LightningElement, wire } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { CurrentPageReference } from "lightning/navigation";
import { NavigationMixin } from "lightning/navigation";
import getInitialData from "@salesforce/apex/BusinessLoanFormController.getInitialData";
import getBusinessInfo from "@salesforce/apex/BusinessLoanFormController.getBusinessInfo";
import saveLoanApplication from "@salesforce/apex/BusinessLoanFormController.saveLoanApplication";
import getCollateralInformation from "@salesforce/apex/BusinessLoanFormController.getCollateralInformation";
import saveApplicationLoanInformation from "@salesforce/apex/BusinessLoanFormController.saveApplicationLoanInformation";
import getApplicationDeclaration from "@salesforce/apex/BusinessLoanFormController.getApplicationDeclaration";
import saveCollateralInformation from "@salesforce/apex/BusinessLoanFormController.saveCollateralInformation";
import saveLoanapplicantQuestions from "@salesforce/apex/BusinessLoanFormController.saveLoanapplicantQuestions";
import getLoanApplicantRecords from "@salesforce/apex/BusinessLoanFormController.getLoanApplicantRecords";
import saveLoanApplicant from "@salesforce/apex/BusinessLoanFormController.saveLoanApplicant";
import getApplicantAddress from "@salesforce/apex/BusinessLoanFormController.getApplicantAddress";
import saveLoanApplicantAddress from "@salesforce/apex/BusinessLoanFormController.saveLoanApplicantAddress";
import saveLoanApplicantIncome from "@salesforce/apex/BusinessLoanFormController.saveLoanApplicantIncome";
import saveApplicantCertification from "@salesforce/apex/BusinessLoanFormController.saveApplicantCertification";
import updateLoanApplicationStatus from "@salesforce/apex/BusinessLoanFormController.updateLoanApplicationStatus";
import getLoanApplicationAssetsAndLiabilities from "@salesforce/apex/BusinessLoanFormController.getLoanApplicationAssetsAndLiabilities";
import getApplicantCertificationValues from "@salesforce/apex/BusinessLoanFormController.getApplicantCertificationValues";

export default class BusinessLoanFormLwc extends NavigationMixin(
  LightningElement
) {
  LoanApplicantColumns = [
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
    { label: "Home Phone", fieldName: "Mobile__c" },
    { label: "Mobile", fieldName: "Mobile__c" },
    { label: "Email", fieldName: "Email__c" }
  ];

  CollateralColumns = [
    {
      label: "Action",
      type: "button-icon",
      typeAttributes: {
        iconName: "utility:edit",
        name: "edit"
      }
    },
    { label: "Collateral Type", fieldName: "Collateral_Type__c" },
    { label: "Collateral Value", fieldName: "Collateral_Value__c" },
    { label: "Collateral Description", fieldName: "Collateral_Description__c" }
  ];

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

  urlId = null;
  financialDetails = {};
  ApplicationQuestion = {};
  ResidentialLoanApplication = {};
  LoanApplicant = [];
  showFormTypeSelector = true;
  NewLoanApplicant = {};
  LoanApplicantAddress = {};
  LoanApplicantMalingAddress = {};
  LoanApplicantEmployment = {};
  currentUserContact = {};
  PersonalInfoCurrentTab = 0;
  currentUser = {};
  showCollateralInfoForm = false;
  LoanApplicantIncomes = {};
  BusinessLoanProgram = {};
  purposeOfLoan = [];
  showCertificationForm = false;
  selectedBusinessType;
  BusinessType;
  BusinessOptions = [];
  BusinessLoanProgramMap = {};
  isLoaded = false;
  statusOptions = [];
  loantype;
  currentTab = "0";
  ischecked = false;
  collateralTypes = [];
  collateralInfoList = [];
  selectedBusinessInfoAccountId;
  DeclarationQuestions = [];
  NewCollateralInfo = {};
  showBorrowerForm = false;
  IsSelfEmployed = false;

  @wire(CurrentPageReference)
  getStateParameters(currentPageReference) {
    console.log("wire::");
    if (currentPageReference) {
      this.urlId = currentPageReference.state?.id;
    }
    console.log("urlId:" + this.urlId);
  }
  get getNewCollateralInfo() {
    let NewCollateralInfo = JSON.parse(JSON.stringify(this.NewCollateralInfo));
    return NewCollateralInfo;
  }
  get getcollateralInfoList() {
    let collateralInfoList = JSON.parse(
      JSON.stringify(this.collateralInfoList)
    );
    return collateralInfoList;
  }

  get LegalStatus() {
    let LegalStatus = [];
    LegalStatus.push(
      {
        label: "--None--",
        value: "--None--"
      },
      {
        label: "Partnership",
        value: "Partnership"
      },
      {
        label: "Corporation",
        value: "Corporation"
      },
      {
        label: "LLC",
        value: "LLC"
      },
      {
        label: "Sole Proprietorship",
        value: "Sole Proprietorship"
      },
      {
        label: "Trust",
        value: "Trust"
      },
      {
        label: "Non Profit",
        value: "Non Profit"
      }
    );
    return LegalStatus;
  }

  get BusinessClassification() {
    let BusinessClassification = [];
    BusinessClassification.push(
      {
        label: "--None--",
        value: "--None--"
      },
      {
        label: "Sole Proprietor",
        value: "Sole Proprietor"
      },
      {
        label: "Partnership",
        value: "Partnership"
      },
      {
        label: "C-Corp",
        value: "C-Corp"
      },
      {
        label: "S-Corp",
        value: "S-Corp"
      },
      {
        label: "LLC",
        value: "LLC"
      },
      {
        label: "Indepedent Contractor",
        value: "Indepedent Contractor"
      },
      {
        label: "Eligible self-employed individual",
        value: "Eligible self-employed individual"
      },
      {
        label: "501(c)(3) nonprofit",
        value: "501(c)(3) nonprofit"
      },
      {
        label: "Tribal business (sec. 31(b)(2)(C) of Small Business Act)",
        value: "Tribal business (sec. 31(b)(2)(C) of Small Business Act)"
      },
      {
        label: "Other",
        value: "Other"
      }
    );
    return BusinessClassification;
  }

  get isBusinessClassification() {
    return this.ResidentialLoanApplication.Business_Classification__c ===
      "Other"
      ? true
      : false;
  }

  get whereClause() {
    return (
      "(CreatedById='" +
      this.currentUser.Id +
      "'" +
      " OR Id = '" +
      this.currentUserContact.AccountId +
      "')"
    );
  }

  get Yes_No_options() {
    let Yes_No_options = [
      { label: "Yes", value: true },
      { label: "No", value: false }
    ];

    return Yes_No_options;
  }

  get MaritalStatus() {
    let MaritalStatus = [
      { label: "Married", value: "Married" },
      { label: "Separated", value: "Separated" },
      { label: "Unmarried", value: "Unmarried" }
    ];

    return MaritalStatus;
  }

  get Borrower() {
    let Borrower = this.NewLoanApplicant.BorrowerType !== "Borrower";
    return Borrower;
  }

  onCancelSelection() {
    console.log("onCancelSelection");
    this.selectedBusinessInfoAccountId = "";
  }

  handleValueSelectedOnAccount(event) {
    let selectedBusinessInfoAccountId = event.detail.id;
    this.selectedBusinessInfoAccountId = selectedBusinessInfoAccountId;
    console.log(
      "parentAccountSelectedRecord:" +
        JSON.stringify(this.selectedBusinessInfoAccountId)
    );
    if (this.selectedBusinessInfoAccountId) {
      this.getBusinessInfoAccount(this.selectedBusinessInfoAccountId);
    }
  }

  connectedCallback() {
    this.onCancelSelection();
    console.log("connected Callback");
    this.loadInitialData(this.urlId);
  }

  async loadInitialData(recordId) {
    this.isLoaded = true;
    console.log("loadInitialData");
    try {
      this.isLoaded = true;
      console.log("try");
      let response = await getInitialData({ loanApplicationId: recordId });
      if (!response.isSuccess) {
        this.showErrorToast(response.error);
        this.isLoaded = false;
        return;
      }
      console.log("getInitialData : ", JSON.stringify(response));
      var resultMap = JSON.parse(JSON.stringify(response.data));
      this.BusinessLoanProgram = resultMap.loanProgram;
      this.currentUserContact = resultMap.currentUserContact;
      this.currentUser = resultMap.currentUser;

      //Set Purpose of Loan Option values
      var LoanPurposeMap = [];
      for (var key in resultMap.loanPurpose) {
        LoanPurposeMap.push({
          label: resultMap.loanPurpose[key],
          value: resultMap.loanPurpose[key]
        });
      }
      this.purposeOfLoan = LoanPurposeMap;

      //Set Default Loan Applicant record if loan application Id not available
      if (Object.keys(resultMap.loanApplication).length === 0) {
        if (Object.keys(resultMap.currentUserContact).length !== 0) {
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
        }
      } else {
        //Set Existing loan application values
        this.LoanApplicant = resultMap.loanApplication.LoanApplicants;
        this.selectedBusinessType = resultMap.loanApplication.Loan_Program__c;
        this.showFormTypeSelector = false;
        this.ischecked = true;
        // this.component.find("read-me").set("v.checked =  true;
        this.NewLoanApplicant = resultMap.loanApplication.LoanApplicants[0];
      }

      //Set Existing Purpose_of_Loan Values
      if (resultMap.loanApplication.Purpose_of_Loan__c) {
        resultMap.loanApplication.Purpose_of_Loan =
          resultMap.loanApplication.Purpose_of_Loan__c.split(";");
      } else {
        resultMap.loanApplication.Purpose_of_Loan = "";
      }
      this.ResidentialLoanApplication = resultMap.loanApplication;

      //Map to Select Loan Program For Business Loan
      var BusinessOptionsMap = [];
      for (var key in resultMap.loanProgram) {
        BusinessOptionsMap.push({
          label: resultMap.loanProgram[key].Name,
          value: resultMap.loanProgram[key].Id
        });
      }
      this.BusinessOptions = BusinessOptionsMap;
      this.BusinessType = this.BusinessOptions[0].value;
      console.log("BusinessType: " + JSON.stringify(this.BusinessType));
      console.log("BusinessOptions: " + JSON.stringify(this.BusinessOptions));

      //Map to get selected loan program record details
      var selectedBusinessType = this.BusinessType;
      var businessLoanProgramMap = {};
      for (var key in resultMap.loanProgram) {
        //Set Selected Loan program for existing laon application
        if (selectedBusinessType) {
          if (selectedBusinessType === resultMap.loanProgram[key].Id) {
            this.BusinessLoanProgram = resultMap.loanProgram[key];
          }
        }
        businessLoanProgramMap[resultMap.loanProgram[key].Id] =
          resultMap.loanProgram[key];
      }
      this.BusinessLoanProgramMap = businessLoanProgramMap;
      console.log(
        "BusinessLoanProgram:" + JSON.stringify(this.BusinessLoanProgram)
      );
      //Set Loan Application progress bar according current status
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

      //Set Required documents
      this.requiredDocumentIds = resultMap.requiredDocumentIds;
      this.isLoaded = false;
    } catch (error) {
      console.log("catch:");
      console.error(error);
      this.isLoaded = false;
    }
  }

  setCertificationTab() {
    this.currentTab = "10";
  }

  showCertificationFormm() {
    this.showCertificationForm = true;
  }

  hideCertificationForm() {
    this.showCertificationForm = false;
  }

  editCertificationForm(event) {
    var selectedItem = event.detail.row.Id;
    console.log("selectedItem : ", selectedItem);
    if (selectedItem) {
      this.getCertificationRecord(selectedItem.Id);
      this.showCertificationForm = true;
    } else {
      this.showErrorToast(
        "Error",
        "Please complete loan applicant form first",
        "error"
      );
    }
  }

  async getCertificationRecord(loanApplicantId) {
    this.isLoaded = true;
    try {
      let response = await getApplicantCertificationValues({
        loanApplicantId: loanApplicantId
      });
      if (!response.isSuccess) {
        this.showErrorToast(response.error);
        this.isLoaded = false;
        return;
      }
      var resultMap = response.data;
      this.isLoaded = false;
      if (resultMap.declaration) {
        this.ApplicationQuestion = resultMap.declaration[0];
      }
    } catch (error) {
      this.isLoaded = false;
      this.showErrorToast("Error", error, "error");
    }
  }

  submitFullApp() {
    var loanApplication = this.ResidentialLoanApplication;
    if (
      loanApplication.Status === "Pre-App Approved" ||
      loanApplication.Status === "Full App Started"
    ) {
      this.updateLoanApplicationStatus("Full App Completed");
      this.progressBarSetup("Full App Completed");
    }
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

  saveCertificationForm() {
    this.saveCertificationRecords("6");
  }

  async saveCertificationRecords(tabToSet) {
    this.isLoaded = true;
    console.log("this.ApplicationQuestion:" + this.ApplicationQuestion);
    var declaration = JSON.parse(JSON.stringify(this.ApplicationQuestion));
    // var loanApplication = this.ResidentialLoanApplication;
    this.template.querySelectorAll(".certificationqes").forEach((element) => {
      if (element.dataset && element.dataset.fieldApiName) {
        element.dataset.ischekbox
          ? (declaration[element.dataset.fieldApiName] = element.checked)
          : (declaration[element.dataset.fieldApiName] = element.value);
      }
    });
    console.log("declaration:" + JSON.stringify(declaration));
    try {
      let response = await saveApplicantCertification({
        applicationCertification: JSON.stringify(declaration)
      });
      if (!response.isSuccess) {
        this.showErrorToast("Error", response.error, "error");
        this.isLoaded = false;
        return;
      }
      // var resultMap = response.data;
      this.isLoaded = false;
      this.currentTab = tabToSet;
      this.showCertificationForm = false;
    } catch (error) {
      console.error(error);
      this.isLoaded = false;
      this.showErrorToast("Error", error, "error");
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
  }

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
        this.statusOptions.push({
          label: "Loan Pending",
          value: "Loan Pending"
        });
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

  handleBusinessOptions(event) {
    this.loantype = event.target.value;
  }

  setBusinessType() {
    var loantype = this.loantype;
    var BusinessOptions = this.BusinessOptions;
    console.log("loantype :", loantype);
    console.log("BusinessOptions :", BusinessOptions);
    var loanProgramMap = this.BusinessLoanProgramMap;
    this.showFormTypeSelector = false;
    if (loantype) {
      //var cosumerType = loanProgramMap.get(loantype).Name;
      this.selectedBusinessType = loantype;
      this.BusinessLoanProgram = loanProgramMap.get(loantype);
    } else {
      this.selectedBusinessType = BusinessOptions[0].value;
      this.BusinessLoanProgram = loanProgramMap.get(BusinessOptions[0].value);
    }
  }
  closeSelectApplicationType() {
    this.showFormTypeSelector = false;
  }

  cancelForm() {
    const config = {
      type: "standard__webPage",
      attributes: {
        url: "/my-applications"
      }
    };
    this[NavigationMixin.Navigate](config);
  }

  handelTermsAndCondition(event) {
    this.ischecked = "";
    this.ischecked = event.detail.checked;
  }
  showBusinessInfoTab() {
    this.isLoaded = true;
    this.ischecked
      ? (this.currentTab = "1")
      : this.showErrorToast(
          "Error",
          "Please read instruction and mark the checkbox",
          "error"
        );
    this.isLoaded = false;
  }

  async getBusinessInfoAccount(selectedBusinessInfoAccountId) {
    try {
      let response = await getBusinessInfo({
        accountId: selectedBusinessInfoAccountId
      });
      if (!response.isSuccess) {
        this.showErrorToast("Error", response.error, "error");
        this.isLoaded = false;
        return;
      }
      this.isLoaded = true;
      console.log("getBusinessInfoAccount:" + JSON.stringify(response));
      var resultMap = response.data;
      //Set Loan Application Detilas According Selected Business Account
      if (selectedBusinessInfoAccountId === resultMap.account.Id) {
        let ResidentialLoanApplication = JSON.parse(
          JSON.stringify(this.ResidentialLoanApplication)
        );
        ResidentialLoanApplication.Name = resultMap.account.Name;
        ResidentialLoanApplication.Business_TIN__c =
          resultMap.account.Business_TIN__c;
        ResidentialLoanApplication.DBA_or_Tradename__c =
          resultMap.account.DBA_or_Tradename__c;
        ResidentialLoanApplication.Number_of_Employees__c =
          resultMap.account.Number_of_Employees__c;
        ResidentialLoanApplication.Business_Classification__c =
          resultMap.account.Business_Classification__c;
        ResidentialLoanApplication.Street__c = resultMap.account.BillingStreet;
        ResidentialLoanApplication.City__c = resultMap.account.BillingCity;
        ResidentialLoanApplication.State__c = resultMap.account.BillingState;
        ResidentialLoanApplication.Country__c =
          resultMap.account.BillingCountry;
        ResidentialLoanApplication.PostalCode__c =
          resultMap.account.BillingPostalCode;
        this.ResidentialLoanApplication = ResidentialLoanApplication;
      }
      this.isLoaded = false;
    } catch (error) {
      this.showErrorToast("Error", error, "error");
      this.isLoaded = false;
      console.error(error);
    }
  }

  validateForm(className) {
    this.isLoaded = true;
    let isValid = true;
    let inputFields = this.template.querySelectorAll(className);
    inputFields.forEach((inputField) => {
      if (!inputField.checkValidity()) {
        inputField.reportValidity();
        isValid = false;
      }
    });
    this.isLoaded = false;
    return isValid;
  }

  saveLoanInformation() {
    this.isLoaded = true;
    console.log("saveLoanInformation");
    var valid = this.validateForm("businessInfo");
    if (!valid) {
      this.showErrorToast("Error", "Please enter all required fields", "error");
      this.isLoaded = false;
    } else {
      this.saveLoanApplication("2");
      this.isLoaded = false;
    }
  }

  handelBusinessInfo(event) {
    let ResidentialLoanApplication = JSON.parse(
      JSON.stringify(this.ResidentialLoanApplication)
    );
    let value = event.target.value;
    let fieldApiName = event.currentTarget.dataset.fieldApiName;
    ResidentialLoanApplication[fieldApiName] = value;
    console.log(
      "ResidentialLoanApplication:" + JSON.stringify(ResidentialLoanApplication)
    );
    this.ResidentialLoanApplication = ResidentialLoanApplication;
  }

  async saveLoanApplication(tabToSet) {
    this.onCancelSelection();
    var loanApplicationObject = JSON.parse(
      JSON.stringify(this.ResidentialLoanApplication)
    );
    console.log(
      "loanApplicationObject:" + JSON.stringify(loanApplicationObject)
    );
    console.log("selectedBusinessType:" + this.selectedBusinessType);
    loanApplicationObject.Loan_Program__c = this.selectedBusinessType;

    //Set Status if loan application Id is not available
    if (!loanApplicationObject.Status) {
      loanApplicationObject.Status = "Started";
    }

    if (loanApplicationObject.Purpose_of_Loan) {
      delete loanApplicationObject.Purpose_of_Loan;
    }
    delete loanApplicationObject.LoanApplicants;

    try {
      let response = await saveLoanApplication({
        loanApplication: JSON.stringify(loanApplicationObject),
        loanApplicant: JSON.stringify(this.NewLoanApplicant)
      });

      if (!response.isSuccess) {
        this.showErrorToast("Error", response.error, "error");
        console.error("response.error:" + JSON.stringify(response));
        this.isLoaded = false;
        return;
      }
      var resultMap = response.data;
      console.log("saveLoanApplication:" + JSON.stringify(resultMap));
      //Set Purpose of Loan Values
      if (resultMap.loanApplication.Purpose_of_Loan__c) {
        resultMap.loanApplication.Purpose_of_Loan =
          resultMap.loanApplication.Purpose_of_Loan__c.split(";");
      } else {
        resultMap.loanApplication.Purpose_of_Loan = "";
      }
      //Set Loan Application, Loan Applicants, Required Documents Data
      this.ResidentialLoanApplication = resultMap.loanApplication;
      this.LoanApplicant = resultMap.loanApplicantList;
      this.NewLoanApplicant = resultMap.loanApplicant;
      this.requiredDocumentIds = resultMap.requiredDocumentIds;
      this.currentTab = tabToSet;
      this.isLoaded = false;
    } catch (error) {
      this.isLoaded = false;
      console.error(error);
    }
  }

  setCollateralInfo(event) {
    this.ResidentialLoanApplication.hasCollateralInfo__c = event.target.checked;
    this.ResidentialLoanApplication = JSON.parse(
      JSON.stringify(this.ResidentialLoanApplication)
    );
  }

  getCollateralInfo() {
    console.log(
      "getCollateralInfo : " + JSON.stringify(this.ResidentialLoanApplication)
    );
    var loanApplication = JSON.parse(
      JSON.stringify(this.ResidentialLoanApplication)
    );
    if (loanApplication.Id) {
      this.isLoaded = true;
      this.getCollateralInfos(loanApplication.Id);
      this.isLoaded = false;
    } else {
      this.isLoaded = false;
      this.showErrorToast(
        "Error",
        "Please complete Business Information form",
        "error"
      );
    }
  }

  async getCollateralInfos(loanApplicationId) {
    try {
      let response = await getCollateralInformation({
        loanApplicationId: loanApplicationId
      });
      if (!response.isSuccess) {
        this.showErrorToast("Error", response.error, "error");
        this.isLoaded = false;
        return;
      }
      var resultMap = response.data;
      console.log("getCollateralInfos:" + JSON.stringify(resultMap));
      resultMap.collateralTypes.forEach((element) => {
        this.collateralTypes.push({
          label: element,
          value: element
        });
      });

      this.collateralInfoList = resultMap.collateralInfoList
        ? resultMap.collateralInfoList
        : "";

      this.isLoaded = false;
    } catch (error) {
      this.isLoaded = false;
      console.error(error);
    }
  }

  saveApplicationLoanInfo() {
    console.log("saveApplicationLoanInfo");
    var loanApplication = JSON.parse(
      JSON.stringify(this.ResidentialLoanApplication)
    );
    var valid = this.validateForm("loanApp-form");
    if (valid && loanApplication.Id) {
      this.isLoaded = true;
      this.saveLoanInformations("3");
      this.isLoaded = false;
    } else {
      this.showErrorToast("Error", "Please enter all required fields", "error");
      this.isLoaded = false;
    }
  }

  async saveLoanInformations(tabToSet) {
    var loanApplicationObject = JSON.parse(
      JSON.stringify(this.ResidentialLoanApplication)
    );
    delete loanApplicationObject.LoanApplicants;

    if (loanApplicationObject.Purpose_of_Loan) {
      loanApplicationObject.Purpose_of_Loan__c =
        loanApplicationObject.Purpose_of_Loan.join(";");
      delete loanApplicationObject.Purpose_of_Loan;
    }

    try {
      let response = await saveApplicationLoanInformation({
        loanApplication: JSON.stringify(loanApplicationObject)
      });

      console.log(
        "saveApplicationLoanInformation : " + JSON.stringify(response)
      );
      if (!response.isSuccess) {
        this.isLoaded = false;
        this.showErrorToast("Error", response.error, "error");
        console.log("response.error:" + response.error);

        return;
      }
      var resultMap = JSON.parse(JSON.stringify(response.data));
      if (resultMap.loanApplication.Purpose_of_Loan__c) {
        resultMap.loanApplication.Purpose_of_Loan =
          resultMap.loanApplication.Purpose_of_Loan__c.split(";");
      } else {
        resultMap.loanApplication.Purpose_of_Loan = "";
      }
      this.ResidentialLoanApplication = resultMap.loanApplication;
      this.currentTab = tabToSet;
      this.isLoaded = false;
    } catch (error) {
      console.error(error);
      console.error("error :@@ : " + error);
      this.isLoaded = false;
    }
  }

  getLoanapplicationQuestion() {
    var loanApplicants = this.LoanApplicant;
    var loanAppliant;
    for (var key in loanApplicants) {
      console.log("loanAppliant :", loanApplicants[key]);
      if (loanApplicants[key].BorrowerType === "Borrower") {
        loanAppliant = loanApplicants[key];
      }
    }
    if (loanAppliant.Id) {
      this.getLoanapplicationQuestions(loanAppliant.Id);
    } else {
      this.setDeclarationQuestions(null, "Declaration");
      this.showErrorToast("Error", "Please complete previous steps", "error");
    }
  }

  async getLoanapplicationQuestions(loanApplicantId) {
    try {
      let response = await getApplicationDeclaration({
        loanApplicantId: loanApplicantId
      });
      this.isLoaded = true;
      console.log("getLoanapplicationQuestions:" + JSON.stringify(response));
      if (!response.isSuccess) {
        this.isLoaded = false;
        this.showErrorToast("Error", response.error, "error");
        return;
      }
      var resultMap = response.data;
      var applicationDeclarations;

      if (resultMap.declaration) {
        this.ApplicationQuestion = resultMap.declaration[0];
        applicationDeclarations = resultMap.declaration[0];
      }
      if (applicationDeclarations) {
        //Declaration Question with answer
        this.setDeclarationQuestions(applicationDeclarations, "Declaration");
      } else {
        //Declaration Question
        this.ApplicationQuestion = {};
        this.setDeclarationQuestions(null, "Declaration");
      }
      this.isLoaded = false;
    } catch (error) {
      this.isLoaded = false;
      console.error(error);
    }
  }

  setDeclarationQuestions(declarationRec, questionType) {
    var loanProgram = this.BusinessLoanProgram;
    var questions = loanProgram.Application_Questions__r;
    var ApplicationQuestions = [];
    var LoanApplicationDeclaration = [];

    if (questionType === "Declaration") {
      for (var key in questions) {
        if (questions[key].Question_Type__c === "Declaration") {
          ApplicationQuestions.push(questions[key]);
        }
      }
    } else {
      for (var key in questions) {
        if (questions[key].Question_Type__c === "Application Question") {
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
    LoanApplicationDeclaration.forEach((element) => {
      element.Declaration =
        element.QuestionType && element.QuestionType === "Declaration"
          ? true
          : false;
    });

    this.DeclarationQuestions = JSON.parse(
      JSON.stringify(LoanApplicationDeclaration)
    );
    console.log(
      "LoanApplicationDeclaration : ",
      JSON.stringify(LoanApplicationDeclaration)
    );
    this.isLoaded = false;
  }

  editCollateralInfo(event) {
    var selectedItem = event.detail.row;
    console.log("selectedItem:" + JSON.stringify(selectedItem));
    var collateralInfo = selectedItem;
    console.log("collateralInfo:" + JSON.stringify(collateralInfo));
    if (collateralInfo) {
      this.NewCollateralInfo = collateralInfo;
      this.showCollateralInfoForm = true;
    } else {
      this.NewCollateralInfo = {};
      this.showErrorToast("Error", "Please complete previous steps", "error");
    }
  }

  addNewCollateralInfo() {
    this.NewCollateralInfo = {};
    this.showCollateralInfoForm = true;
  }

  hideCollateralInfoForm() {
    this.currentTab = "2";
    this.showCollateralInfoForm = false;
  }

  handelCollateralInfo(event) {
    let NewCollateralInfo = JSON.parse(JSON.stringify(this.NewCollateralInfo));
    let value = event.target.value;
    let fieldApiName = event.currentTarget.dataset.fieldApiName;
    NewCollateralInfo[fieldApiName] = value;
    this.NewCollateralInfo = NewCollateralInfo;
    console.log("NewCollateralInfo:" + JSON.stringify(NewCollateralInfo));
  }

  saveCollateralInfo() {
    this.isLoaded = true;
    var loanApplication = this.ResidentialLoanApplication;
    if (loanApplication.Id) {
      this.saveCollateralInfos(loanApplication.Id);
    } else {
      this.showErrorToast(
        "Error",
        "Please complete Business Information form",
        "error"
      );
    }
  }

  async saveCollateralInfos(loanApplicationId) {
    var collateralInfo = this.NewCollateralInfo;

    try {
      console.log("collateralInfo:" + JSON.stringify(collateralInfo));
      let response = await saveCollateralInformation({
        collateralInfo: JSON.stringify(collateralInfo),
        loanApplicationId: loanApplicationId
      });
      if (!response.isSuccess) {
        this.showErrorToast("Error", response.error, "error");
        this.isLoaded = false;
        return;
      }

      console.log("saveCollateralInfos: " + JSON.stringify(response));
      var resultMap = response.data;
      this.NewCollateralInfo = JSON.parse(
        JSON.stringify(resultMap.collateralInfo)
      );
      this.collateralInfoList = JSON.parse(
        JSON.stringify(resultMap.collateralInfoList)
      );
      this.showCollateralInfoForm = false;
      this.isLoaded = false;
      this.currentTab = "2";
    } catch (error) {
      this.isLoaded = false;
      this.showErrorToast("Error", error, "error");
    }
  }

  saveApplicationDeclaration() {
    this.isLoaded = true;
    console.log("saveLoanapplicantQuestions");
    var loanApplicant = this.NewLoanApplicant;
    console.log("loanApplicant Id : ", loanApplicant);
    var loanApplication = this.ResidentialLoanApplication;

    if (loanApplicant.Id) {
      var applicationQuestions = JSON.parse(
        JSON.stringify(this.ApplicationQuestion)
      );
      if (!applicationQuestions.Id) {
        applicationQuestions.Name = loanApplication.Name + " Declaration";
        applicationQuestions.Loan_Program__c = this.selectedMortgageType;
        applicationQuestions.LoanApplicationId = loanApplication.Id;
        applicationQuestions.Question_Type__c = "Declaration";
        applicationQuestions.LoanApplicantId = loanApplicant.Id;
      }
      console.log(
        "applicationQuestions:" + JSON.stringify(applicationQuestions)
      );

      this.saveLoanapplicantQuestion("4", applicationQuestions, "Declaration");
      this.isLoaded = false;
    } else {
      this.isLoaded = false;
      this.showErrorToast(
        "Error",
        "Please Complete Loan Applicant Form",
        "error"
      );
    }
  }

  async saveLoanapplicantQuestion(
    tabToSet,
    applicationQuestions,
    QuestionType
  ) {
    this.template
      .querySelectorAll(".applicantDeclaration")
      .forEach((element) => {
        console.log("element:" + JSON.stringify(element.checked));
        console.log("element.dataset" + JSON.stringify(element.dataset));
        if (element.dataset && element.dataset.fieldApiName) {
          applicationQuestions[element.dataset.fieldApiName] = element.checked;
        }
      });

    console.log("applicationQuestions:" + JSON.stringify(applicationQuestions));
    try {
      let response = await saveLoanapplicantQuestions({
        applicationQuestions: JSON.stringify(applicationQuestions)
      });

      console.log("response:" + JSON.stringify(response));
      if (!response.isSuccess) {
        this.showErrorToast("Error", response.error, "error");
        this.isLoaded = false;
        return;
      }
      var resultMap = response.data;
      this.ApplicationQuestion = resultMap.applicationQuestion;
      this.isLoaded = false;
      if (QuestionType === "Declaration") {
        this.currentTab = tabToSet;
      }
      if (QuestionType === "Application Question") {
        this.PersonalInfoCurrentTab = tabToSet;
      }
    } catch (error) {
      this.isLoaded = false;
      console.error(error);
    }
  }

  editBorrowerForm(event) {
    this.isLoaded = true;
    console.log("LoanApplicant:" + JSON.stringify(this.LoanApplicant));
    var selectedItem = event.detail.row.Id;
    console.log("selectedItem:" + selectedItem);
    if (selectedItem) {
      this.DeclarationQuestions = [];

      this.getLoanApplicantRecord(selectedItem);
      this.isLoaded = false;
    } else {
      console.log("editBorrowerForm else");
      this.isLoaded = false;
      this.showErrorToast("Error", "Please complete previous steps", "error");
    }
  }

  showNewBorrowerForm() {
    console.log("In showNewBorrowerForm");
    this.isLoaded = true;
    this.NewLoanApplicant = {};
    this.ApplicationQuestion = {};
    this.LoanApplicantAddress = {};
    this.LoanApplicantMalingAddress = {};
    this.LoanApplicantEmployment = {};
    this.LoanApplicantIncomes = {};
    this.NewLoanApplicant.BorrowerType = "CoBorrower";
    console.log("NewLoanApplicant : ", JSON.stringify(this.NewLoanApplicant));
    this.showBorrowerForm = true;
    this.setDeclarationQuestions();
    this.isLoaded = false;
  }

  async getLoanApplicantRecord(loanApplicantId) {
    console.log("loanApplicantId:" + loanApplicantId);
    this.showBorrowerForm = true;
    try {
      let response = await getLoanApplicantRecords({
        loanApplicantRecId: loanApplicantId
      });
      console.log("response:" + JSON.stringify(response));
      if (!response.isSuccess) {
        console.log("errror:@@");
        let error = response && response.error ? response.error : "";
        this.showErrorToast("Error", error, "error");
        this.isLoaded = false;
        return;
      }
      var resultMap = response.data;
      console.log("data from server = ", JSON.stringify(resultMap));

      this.NewLoanApplicant = resultMap.loanApplicant;
      this.LoanApplicantAddress = resultMap.presentAddress;
      this.LoanApplicantMalingAddress = resultMap.mailingAddress;
      this.LoanApplicantEmployment = resultMap.applicantEmployment;
      this.IsSelfEmployed = resultMap.applicantEmployment.IsSelfEmployed;
      this.LoanApplicantIncomes = resultMap.applicantIncome;

      //Set loan applicant declarations for selected loan applicant
      if (resultMap.loanApplicant.LoanApplicantDeclarations) {
        this.ApplicationQuestion =
          resultMap.loanApplicant.LoanApplicantDeclarations[0];
        this.setDeclarationQuestions(
          resultMap.loanApplicant.LoanApplicantDeclarations[0],
          "Application Question"
        );
        this.isLoaded = false;
      } else {
        this.ApplicationQuestion = {};
        this.setDeclarationQuestions(null, "Application Question");
        this.isLoaded = false;
      }
    } catch (error) {
      this.isLoaded = false;
      console.Error("error@@@@@@@@@@@2 " + error);
    }
  }

  hideBorrowerForm() {
    this.showBorrowerForm = false;
  }

  handelNewLoanApplicant(event) {
    console.log("handelNewLoanApplicant : " + JSON.stringify(event.target));
    let NewLoanApplicant = JSON.parse(JSON.stringify(this.NewLoanApplicant));

    NewLoanApplicant[event.target.dataset.fieldApiName] = event.target.dataset
      .ischekbox
      ? event.target.checked
      : event.target.value;

    this.NewLoanApplicant = NewLoanApplicant;
    console.log(JSON.stringify(this.NewLoanApplicant));
  }

  saveLoanApplicantInfo(event) {
    var actionName = event.target.dataset.action;
    var loanApplicationId = this.ResidentialLoanApplication.Id;
    if (loanApplicationId) {
      console.log(
        "saveLoanApplicantInfo loanApplicationId:",
        loanApplicationId
      );
      if (actionName === "CreditApproval") {
        this.saveLoanApplicant("2", loanApplicationId);
      } else {
        this.saveLoanApplicant("1", loanApplicationId);
      }
    } else {
      this.showErrorToast(
        "Error",
        "Please Create Loan Application First",
        "error"
      );
    }
  }

  async saveLoanApplicant(tabToSet, loanApplicationId) {
    this.isLoaded = true;
    var loanApplicant = JSON.parse(JSON.stringify(this.NewLoanApplicant));
    if (!loanApplicant.Id) {
      loanApplicant.Name =
        loanApplicant.First_Name__c + " " + loanApplicant.Last_Name__c;
      loanApplicant.LoanApplicationId = loanApplicationId;
    }
    //delete relatet LoanApplicantDeclarations records
    if (loanApplicant.LoanApplicantDeclarations) {
      delete loanApplicant.LoanApplicantDeclarations;
    }

    try {
      let response = await saveLoanApplicant({
        loanApplicant: JSON.stringify(loanApplicant)
      });
      console.log("response:" + JSON.stringify(response));
      if (!response.isSuccess) {
        this.showErrorToast(response.error);
        this.isLoaded = false;
        return;
      }
      var resultMap = response.data;

      this.NewLoanApplicant = resultMap.loanApplicantRecord;
      this.LoanApplicant = resultMap.loanApplicantList;
      this.ResidentialLoanApplication.Total_Ownership__c =
        resultMap.loanApplication.Total_Ownership__c;
      this.isLoaded = false;
      this.PersonalInfoCurrentTab = tabToSet;
    } catch (error) {
      this.isLoaded = false;
    }
  }

  saveApplicantQuestions() {
    console.log("saveLoanapplicantQuestions");

    var loanApplicant = this.NewLoanApplicant;
    console.log("loanApplicant Id : " + loanApplicant);
    if (loanApplicant.Id) {
      var applicationQuestions = JSON.parse(
        JSON.stringify(this.ApplicationQuestion)
      );

      if (!applicationQuestions.Id) {
        applicationQuestions.Name = loanApplicant.Name + " Declaration";
        applicationQuestions.Loan_Program__c = this.selectedMortgageType;
        applicationQuestions.LoanApplicationId =
          loanApplicant.LoanApplicationId;
        applicationQuestions.LoanApplicantId = loanApplicant.Id;
        applicationQuestions.Question_Type__c = "Application Question";
      }
      this.saveLoanapplicantQuestion(
        "3",
        applicationQuestions,
        "Application Question"
      );
    } else {
      this.showErrorToast(
        "Error",
        "Please Complete Loan Applicant Form",
        "error"
      );
    }
  }

  handelPresentAddress(event) {
    let LoanApplicantAddress = JSON.parse(
      JSON.stringify(this.LoanApplicantAddress)
    );
    LoanApplicantAddress.ResidenceStreet = event.detail.street;
    LoanApplicantAddress.ResidenceCity = event.detail.city;
    LoanApplicantAddress.ResidenceCountry = event.detail.country;
    LoanApplicantAddress.ResidenceState = event.detail.province;
    LoanApplicantAddress.ResidencePostalCode = event.detail.postalCode;
    this.LoanApplicantAddress = LoanApplicantAddress;
  }

  handelMailingAddress(event) {
    let LoanApplicantMalingAddress = {};
    LoanApplicantMalingAddress.ResidenceStreet = event.detail.street;
    LoanApplicantMalingAddress.ResidenceCity = event.detail.city;
    LoanApplicantMalingAddress.ResidenceCountry = event.detail.country;
    LoanApplicantMalingAddress.ResidenceState = event.detail.province;
    LoanApplicantMalingAddress.ResidencePostalCode = event.detail.postalCode;
    this.LoanApplicantMalingAddress = LoanApplicantMalingAddress;
  }

  getBorrowerAddress(event) {
    var response = event.target.checked;
    console.log("checkBoxState :", response);
    if (response) {
      var loanApplicant = this.LoanApplicant;
      for (var key in loanApplicant) {
        console.log("Loan Applicant : ", loanApplicant[key]);
        if (loanApplicant[key].BorrowerType === "Borrower") {
          console.log("Borrower Id :", loanApplicant[key].Id);
          this.getBorrowerAddresss(loanApplicant[key].Id);
          break;
        }
      }
    }
  }

  async getBorrowerAddresss(loanApplicantId) {
    this.isLoaded = true;
    try {
      let response = await getApplicantAddress({
        loanApplicantId: loanApplicantId
      });
      if (!response.isSuccess) {
        this.showErrorToast("Error", response.error, "error");
        this.isLoaded = false;
        return;
      }

      var resultMap = response.data;
      var applicantPresentAddress = JSON.parse(
        JSON.stringify(this.LoanApplicantAddress)
      );
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
      this.LoanApplicantAddress = applicantPresentAddress;

      //Set Co-Borrower Present Address Like Borrower Present Address
      var applicantMalingAddress = JSON.parse(
        JSON.stringify(this.LoanApplicantMalingAddress)
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
      this.LoanApplicantMalingAddress = applicantMalingAddress;
      this.isLoaded = false;
    } catch (error) {
      console.error(error);
      this.isLoaded = false;
      this.showErrorToast("Error", error, "error");
    }
  }

  copyAddress(event) {
    //this.isLoaded = true;
    let LoanApplicantMalingAddress = {};
    console.log("event.detail.checked:" + event.target.checked);
    if (event.target.checked) {
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
      console.log(
        "LoanApplicantMalingAddress:" +
          JSON.stringify(this.LoanApplicantMalingAddress)
      );
      //this.isLoaded = false;
    }
    //this.isLoaded = false;
  }
  get getLoanApplicantMalingAddress() {
    let LoanApplicantMalingAddress = this.LoanApplicantMalingAddress;
    return LoanApplicantMalingAddress;
  }

  handelAddressInfo(event) {
    let LoanApplicantAddress = JSON.parse(
      JSON.stringify(this.LoanApplicantAddress)
    );
    LoanApplicantAddress[event.target.dataset.fieldApiName] =
      event.target.value;
    this.LoanApplicantAddress = LoanApplicantAddress;
    console.log(
      "LoanApplicantAddress:" + JSON.stringify(this.LoanApplicantAddress)
    );
  }

  saveApplicantAddress() {
    var loanApplicant = this.NewLoanApplicant;
    if (loanApplicant.Id) {
      var loanApplicantAddress = this.LoanApplicantAddress;
      if (!loanApplicantAddress.Id) {
        loanApplicantAddress.Name = loanApplicant.Name + " Present Address";
        loanApplicantAddress.ResidencyType = "Present Address";
        loanApplicantAddress.LoanApplicationId =
          loanApplicant.LoanApplicationId;
        loanApplicantAddress.LoanApplicantId = loanApplicant.Id;
      }
      console.log(
        "loanApplicantAddress  : ",
        JSON.stringify(loanApplicantAddress)
      );
      var loanApplicantMailingAddress = this.LoanApplicantMalingAddress;
      if (!loanApplicantMailingAddress.Id) {
        loanApplicantMailingAddress.Name =
          loanApplicant.Name + " Mailing Address";
        loanApplicantMailingAddress.ResidencyType = "Mailing Address";
        loanApplicantMailingAddress.LoanApplicationId =
          loanApplicant.LoanApplicationId;
        loanApplicantMailingAddress.LoanApplicantId = loanApplicant.Id;
      }
      console.log(
        "loanApplicantMailingAddress  : ",
        JSON.stringify(loanApplicantMailingAddress)
      );
      this.saveAddress("4", loanApplicantAddress, loanApplicantMailingAddress);
    } else {
      this.showErrorToast(
        "Error",
        "Please Complete Loan Applicant Form",
        "error"
      );
    }
  }

  async saveAddress(
    tabToSet,
    loanApplicantAddress,
    loanApplicantMailingAddress
  ) {
    try {
      let response = await saveLoanApplicantAddress({
        loanApplicantAddress: JSON.stringify(loanApplicantAddress),
        loanApplicantMailingAddress: JSON.stringify(loanApplicantMailingAddress)
      });
      if (!response.isSuccess) {
        this.showErrorToast("Error", response.error, "error");
        this.isLoaded = false;
        return;
      }
      // eslint-disable-next-line no-unused-vars
      var resultMap = response.data;
      this.isLoaded = false;
      this.PersonalInfoCurrentTab = tabToSet;
    } catch (error) {
      this.isLoaded = false;
      this.showErrorToast("Error", error, "error");
      console.Error(error);
    }
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
    console.log(
      "LoanApplicantIncomes:" + JSON.stringify(this.LoanApplicantIncomes)
    );
    this.isLoaded = false;
  }

  saveApplicantIncomes(event) {
    var actionName = event.target.dataset.action;
    var loanApplicant = this.NewLoanApplicant;
    if (loanApplicant.Id) {
      this.saveIncomes("0", actionName);
    } else {
      this.showErrorToast(
        "Error",
        "Please Complete Loan Applicant Form",
        "error"
      );
    }
  }

  async saveIncomes(tabToSet, actionName) {
    var loanApplicant = this.NewLoanApplicant;
    var loanApplicantIncomes = this.LoanApplicantIncomes;

    //Set loan applicationId and Loan ApplicantId if loanApplicantIncomeId is not available
    if (!loanApplicantIncomes.Id) {
      loanApplicantIncomes.Name = loanApplicant.Name + " Income";
      loanApplicantIncomes.LoanApplicationId = loanApplicant.LoanApplicationId;
      loanApplicantIncomes.LoanApplicantId = loanApplicant.Id;
    }
    try {
      let response = await saveLoanApplicantIncome({
        loanApplicantIncomes: JSON.stringify(loanApplicantIncomes)
      });
      console.log("JSON.stringify(response):" + JSON.stringify(response));
      if (!response.isSuccess) {
        this.showErrorToast("Error", response.error, "error");
        this.isLoaded = false;
        return;
      }

      this.isLoaded = false;
      this.PersonalInfoCurrentTab = tabToSet;
      this.showBorrowerForm = false;

      //Open New Loan Applicant Form
      if (actionName === "AddCoBorrower") {
        this.showNewBorrowerForm();
      }
    } catch (error) {
      console.Error(error);
      this.isLoaded = false;
    }
  }

  submitPreApp() {
    var loanApplication = this.ResidentialLoanApplication;

    console.log("loanApplication : ", loanApplication.Total_Ownership__c);
    if (loanApplication.Total_Ownership__c >= 90 && loanApplication.Id) {
      this.updateLoanApplicationStatus("Pre-App Completed");
    } else {
      console.log(
        "All business owners in total must equal 90% or higher of the total ownership of the business."
      );
      var message =
        "All business owners in total must equal 90% or higher of the total ownership of the business.";
      this.showErrorToast("Error", message, "error");
    }
  }

  async updateLoanApplicationStatus(applicationStatus) {
    var loanApplicationObject = this.ResidentialLoanApplication;
    loanApplicationObject.Status = applicationStatus;

    if (loanApplicationObject.LoanApplicants) {
      delete loanApplicationObject.LoanApplicants;
    }
    try {
      let response = await updateLoanApplicationStatus({
        loanApplication: JSON.stringify(loanApplicationObject)
      });
      if (!response.isSuccess) {
        this.showErrorToast(response.error);
        this.isLoaded = false;
        return;
      }
      var loanApplicationObj = this.ResidentialLoanApplication;
      loanApplicationObj.Status = applicationStatus;
      this.ResidentialLoanApplication = loanApplicationObj;
    } catch (error) {
      console.Error(error);
      this.isLoaded = false;
      this.showErrorToast("Error", error, "error");
    }
  }

  getFinancialDetails() {
    //this.isLoaded = true;
    var loanApplication = this.ResidentialLoanApplication;
    if (loanApplication.Id) {
      this.setFinancialDetails(loanApplication.Id);
    } else {
      this.showErrorToast(
        "Error",
        "Please complete Business Information form",
        "error"
      );
    }
  }

  async setFinancialDetails(loanApplicationId) {
    console.log("setFinancialDetails");

    var financialDetails = this.financialDetails;

    try {
      let response = await getLoanApplicationAssetsAndLiabilities({
        loanApplicationId: loanApplicationId
      });
      console.log("response:" + JSON.stringify(response));
      if (!response.isSuccess) {
        this.showErrorToast("Error", response.error, "error");
        this.isLoaded = false;
        return;
      }
      var resultMap = response.data;
      var assets = resultMap.assets;
      var liabilities = resultMap.liabilities;

      //Calculate Asset's Financial Details
      if (assets) {
        for (var key in assets) {
          if (assets[key].Schedule_Form_Type__c === "ScheduleAForm") {
            financialDetails.AssetScheduleAFinancialValue =
              financialDetails.AssetScheduleAFinancialValue +
              assets[key].Cost__c;
          }
          if (assets[key].Schedule_Form_Type__c === "ScheduleBForm") {
            financialDetails.AssetScheduleBFinancialValue =
              financialDetails.AssetScheduleBFinancialValue +
              assets[key].PresentMarketValue;
          }
          if (assets[key].Schedule_Form_Type__c === "ScheduleCForm") {
            financialDetails.AssetScheduleCFinancialValue =
              financialDetails.AssetScheduleCFinancialValue +
              assets[key].Payment__c;
          }
          if (assets[key].Schedule_Form_Type__c === "ScheduleDForm") {
            financialDetails.AssetScheduleDFinancialValue =
              financialDetails.AssetScheduleDFinancialValue +
              assets[key].Payment__c;
          }
          if (assets[key].Schedule_Form_Type__c === "ScheduleFForm") {
            financialDetails.AssetScheduleFFinancialValue =
              financialDetails.AssetScheduleFFinancialValue +
              assets[key].Cash_Value__c;
          }
        }
      }

      //Calculate Asset's liabilities Details
      if (liabilities) {
        for (var key in liabilities) {
          if (liabilities[key].Schedule_Form_Type__c === "ScheduleAForm") {
            financialDetails.LiabilityScheduleAFinancialValue =
              financialDetails.LiabilityScheduleAFinancialValue +
              liabilities[key].Cost__c;
          }
          if (liabilities[key].Schedule_Form_Type__c === "ScheduleBForm") {
            financialDetails.LiabilityScheduleBFinancialValue =
              financialDetails.LiabilityScheduleBFinancialValue +
              liabilities[key].PresentMarketValue__c;
          }
          if (liabilities[key].Schedule_Form_Type__c === "ScheduleCForm") {
            financialDetails.LiabilityScheduleCFinancialValue =
              financialDetails.LiabilityScheduleCFinancialValue +
              liabilities[key].Payment__c;
          }
          if (liabilities[key].Schedule_Form_Type__c === "ScheduleDForm") {
            financialDetails.LiabilityScheduleDFinancialValue =
              financialDetails.LiabilityScheduleDFinancialValue +
              liabilities[key].Payment__c;
          }
          if (liabilities[key].Schedule_Form_Type__c === "ScheduleFForm") {
            financialDetails.LiabilityScheduleFFinancialValue =
              financialDetails.LiabilityScheduleFFinancialValue +
              liabilities[key].Cash_Value__c;
          }
        }
      }
      this.financialDetails = financialDetails;
      this.isLoaded = false;
    } catch (error) {
      console.error(error);
      this.isLoaded = false;
      this.showErrorToast("Error", error, "error");
    }
  }

  saveFinancialStatement() {
    console.log("saveLoanInformation");
    var loanApplication = this.ResidentialLoanApplication;
    var valid = this.validateForm("financialStatement");
    if (valid && loanApplication.Id) {
      this.saveLoanInformations("7");
    } else {
      this.showErrorToast("Error", "Please enter all required fields", "error");
    }
  }

  handelfinancialStatement(event) {
    let ResidentialLoanApplication = JSON.parse(
      JSON.stringify(this.ResidentialLoanApplication)
    );
    ResidentialLoanApplication[event.target.dataset.fieldApiName] =
      event.target.value;
    this.ResidentialLoanApplication = ResidentialLoanApplication;
    console.log(
      "ResidentialLoanApplication:" + JSON.stringify(ResidentialLoanApplication)
    );
  }
}