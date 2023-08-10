/* eslint-disable no-redeclare */
/* eslint-disable guard-for-in */
/* eslint-disable no-unused-vars */
/* eslint-disable vars-on-top */
/* eslint-disable no-unused-expressions */

/**
 * @description       :
 * @author            : 'Amol K'
 * @group             :
 * @last modified on  : 03-14-2023
 * @last modified by  :
 **/
import { LightningElement, wire } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { CurrentPageReference } from "lightning/navigation";
import { NavigationMixin } from "lightning/navigation";
import saveLoanApplication from "@salesforce/apex/ConsumerLoanController.saveLoanApplication";
import saveLoanapplicantQuestions from "@salesforce/apex/ConsumerLoanController.saveLoanapplicantQuestions";
import getInitialData from "@salesforce/apex/ConsumerLoanController.getInitialData";
import getLoanApplicantRecords from "@salesforce/apex/ConsumerLoanController.getLoanApplicantRecords";
import saveLoanApplicantAddress from "@salesforce/apex/ConsumerLoanController.saveLoanApplicantAddress";
import getApplicantAddress from "@salesforce/apex/ConsumerLoanController.getApplicantAddress";
import saveLoanApplicantEmployment from "@salesforce/apex/ConsumerLoanController.saveLoanApplicantEmployment";
import saveLoanApplicantIncome from "@salesforce/apex/ConsumerLoanController.saveLoanApplicantIncome";
import updateLoanApplicationStatus from "@salesforce/apex/ConsumerLoanController.updateLoanApplicationStatus";
import saveApplicantCertification from "@salesforce/apex/ConsumerLoanController.saveApplicantCertification";
import getApplicantCertificationValues from "@salesforce/apex/ConsumerLoanController.getApplicantCertificationValues";
import saveLoanApplicant from "@salesforce/apex/ConsumerLoanController.saveLoanApplicant";
export default class AutoLoanProgramLwc extends NavigationMixin(
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
  isLoaded = false;
  recordId;
  isCounsumerLoan = false;
  isCounsumerLoanOption = [];
  isModal = true;
  value;
  consumerLoanType;
  loanProgram;
  currentStatus = [];
  VehicleTypes = [];
  statusOptions = [];
  ConsumerLoanProgramMap = {};
  ConsumerLoanProgram = {};
  currentTab = "0";
  purposeOfLoan = [];
  newOrUsedVehicle;
  vehicleTypeMakeMap = [];
  ResidentialLoanApplication = {};
  LoanApplicant = [];
  selectedConsumerType = [];
  vehicleMakeList = [];
  ConsumerOptions = [];
  NewLoanApplicant = {};
  ApplicationQuestion = {};
  LoanApplicantAddress = {};
  LoanApplicantMalingAddress = {};
  LoanApplicantEmployment = {};
  ischecked = false;
  totalIncome = 0;
  isTradeInfo = false;
  currentUserContact = {};
  requiredDocumentIds;
  LoanApplicantIncomes = {};
  isShowBorrowerForm = false;
  PersonalInfoCurrentTab = "1";
  maritalStatusvalue;
  isShowCertificationForm = false;
  IsSelfEmployed;
  DeclarationQuestions = [];
  urlId = null;

  connectedCallback() {
    console.log("connectedCallback::");
    this.ApplicationQuestion = {};
    this.ResidentialLoanApplication = {};
    this.LoanApplicantAddress = {};
    this.LoanApplicantMalingAddress = {};
    this.LoanApplicantEmployment = {};
    this.currentUserContact = {};
    this.LoanApplicantIncomes = {};
    // load the initial data
    this.loadInitialData(this.urlId);
  }

  //fetch record id from url using page reference library;
  @wire(CurrentPageReference)
  getStateParameters(currentPageReference) {
    console.log("wire::");
    if (currentPageReference) {
      this.urlId = currentPageReference.state?.id;
    }
    console.log("urlId:" + this.urlId);
  }

  //set vehicle info combobox;
  get newOrUsedVehicles() {
    let newOrUsedVehicles = [
      { label: "New", value: "New" },
      { label: "Used", value: "Used" }
    ];
    return newOrUsedVehicles;
  }

  //set maritalStatus combobox
  get maritalStatus() {
    let maritalStatus = [
      { label: "Married", value: "Married" },
      { label: "Separated", value: "Separated" },
      { label: "Unmarried", value: "Unmarried" }
    ];
    return maritalStatus;
  }

  //set loan terms combobox;
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

  //this methos is used to fetch initial data in both condition form view state and form creation state.
  async loadInitialData(recordId) {
    this.isLoaded = true;
    try {
      let result = await getInitialData({
        loanApplicationId: recordId
      });
      {
        this.loanProgram = result.data.loanProgram;
        console.log("loanProgram Appl", JSON.stringify(this.loanProgram));
        result.data.loanProgram.forEach((element) => {
          this.isCounsumerLoanOption.push({
            label: element.Name,
            value: element.Id
          });
        });
        console.log(
          "this.isCounsumerLoanOption:" +
            JSON.stringify(this.isCounsumerLoanOption)
        );
        this.isCounsumerLoan = true;
        this.VehicleTypes.push({
          label: "---None---",
          value: "---None---"
        });

        result.data.vehicleType.forEach((element) => {
          this.VehicleTypes.push({ label: element, value: element });
        });

        this.purposeOfLoan.push({
          label: "---None---",
          value: "---None---"
        });

        this.vehicleTypeMakeMap =
          result.data.vehicleTypeMakeMap.data.vehicleTypeMakeMap;

        result.data.loanPurpose.forEach((loanPurpose) => {
          this.purposeOfLoan.push({
            label: loanPurpose,
            value: loanPurpose
          });
        });

        this.currentUserContact = result.data.currentUserContact;

        if (Object.keys(result.data.loanApplication).length === 0) {
          if (Object.keys(result.data.currentUserContact).length !== 0) {
            //set new record using loged in user info;
            this.NewLoanApplicant = {
              Name: result.data.currentUserContact.Name,
              First_Name__c: result.data.currentUserContact.FirstName,
              Last_Name__c: result.data.currentUserContact.LastName,
              Email__c: result.data.currentUserContact.Email,
              Account__c: result.data.currentUserContact.AccountId,
              Phone__c: result.data.currentUserContact.Phone,
              SSN__c: result.data.currentUserContact.Social_Security_Number__c,
              Mobile__c: result.data.currentUserContact.MobilePhone,
              BorrowerType: "Borrower"
            };
            this.LoanApplicant.push(this.NewLoanApplicant);
          }
        } else {
          //set existing LoanApplication record
          this.ResidentialLoanApplication = result.data.loanApplication;
          this.LoanApplicant = result.data.loanApplication.LoanApplicants;
          this.selectedConsumerType =
            result.data.loanApplication.Loan_Program__c;
          this.isModal = false;
          this.ischecked = true;
          this.consumerLoanType = true;
          this.NewLoanApplicant = result.data.loanApplication.LoanApplicants[0];
          this.vehicleMakeList.push({
            label:
              this.vehicleTypeMakeMap[
                result.data.loanApplication.Consumer_Types__c
              ],
            value:
              this.vehicleTypeMakeMap[
                result.data.loanApplication.Consumer_Types__c
              ]
          });
        }

        for (var key in result.data.loanProgram) {
          this.ConsumerOptions.push({
            key: result.data.loanProgram[key].Name,
            value: result.data.loanProgram[key].Id
          });
        }

        let loanProgram = result.data.loanProgram;

        for (var key in loanProgram) {
          if (this.selectedConsumerType) {
            if (this.selectedConsumerType === loanProgram[key].Id) {
              this.ConsumerLoanProgram = loanProgram[key];
            }
          }

          //this.ConsumerLoanProgramMap.set(loanProgram[key].Id, loanProgram[key]);
          this.ConsumerLoanProgramMap[loanProgram[key].Id] = loanProgram[key];
        }

        // this.ConsumerLoanProgramMap = consumerLoanProgramMap;
        if (result.data.loanApplication.Status) {
          this.progressBarSetup(result.data.loanApplication.Status);
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
        this.requiredDocumentIds = result.data.requiredDocumentIds;

        this.value = this.isCounsumerLoanOption[0].value;
      }
    } catch (error) {
      console.error(error);
    }
    this.isLoaded = false;
  }

  //  handel cosumer loan type when change
  handleCounsumerLoanType(event) {
    this.value = event.target.value;
    console.log("loantypevalue : " + this.value);
  }

  // close the model
  closeModalBox() {
    this.isModal = false;
    this.consumerLoanType = this.value;
    this.setMortgageType();
  }

  // functions to set set MortgageType on click the modal;
  setMortgageType() {
    this.isLoaded = true;
    var loantype = this.value;
    this.isModal = false;
    this.consumerLoanType = loantype;
    var consumerOptions = this.ConsumerOptions;
    var loanProgramMap = this.ConsumerLoanProgramMap;
    var vehicleTypeMakeMap = this.vehicleTypeMakeMap;

    if (loantype) {
      var cosumerType = loanProgramMap[loantype.Name];
      this.selectedConsumerType = loantype;
      this.ConsumerLoanProgram = loanProgramMap[loantype];
      this.vehicleMakeList = [];
      this.vehicleMakeList.push({
        label: vehicleTypeMakeMap[cosumerType],
        value: vehicleTypeMakeMap[cosumerType]
      });
    } else {
      this.selectedConsumerType = consumerOptions[0].value;
      this.ConsumerLoanProgram = loanProgramMap[consumerOptions[0].value];
      this.vehicleMakeList = [];
      this.vehicleMakeList.push({
        label: vehicleTypeMakeMap[consumerOptions[0].key],
        value: vehicleTypeMakeMap[consumerOptions[0].key]
      });
    }

    this.ResidentialLoanApplication.Consumer_Types__c =
      this.ConsumerLoanProgram.Name;
    this.isLoaded = false;
  }

  showTradeInFrom(event) {
    this.isTradeInfo = event.detail.checked;
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

  //saveLoanInformation
  saveLoanInformation() {
    this.isLoaded = true;
    var valid = this.validateForm();
    valid
      ? this.saveLoanApplication()
      : this.showErrorToast(
          "Error",
          "Please enter all required fields",
          "error"
        );
    this.isLoaded = false;
  }

  async saveLoanApplication() {
    this.isLoaded = true;
    var consumerType = this.ConsumerLoanProgram.Name;
    var loanApplicationObject = JSON.parse(
      JSON.stringify(this.ResidentialLoanApplication)
    );
    this.template.querySelectorAll(".vehicleLoanInfo").forEach((element) => {
      if (element.dataset && element.dataset.fieldApiName) {
        element.value === "---None---"
          ? (loanApplicationObject[element.dataset.fieldApiName] = "")
          : (loanApplicationObject[element.dataset.fieldApiName] =
              element.value);
      }
    });

    loanApplicationObject.Loan_Program__c = this.selectedConsumerType;
    loanApplicationObject.AccountId = this.currentUserContact.AccountId;
    loanApplicationObject.Name =
      this.currentUserContact.Name + " " + consumerType;
    if (!loanApplicationObject.Status) {
      loanApplicationObject.Status = "Started";
    }
    delete loanApplicationObject.LoanApplicants;
    console.log(
      "loanApplicationObject : " + JSON.stringify(loanApplicationObject)
    );
    console.log("NewLoanApplicant : " + JSON.stringify(this.NewLoanApplicant));
    let result = await saveLoanApplication({
      loanApplication: JSON.stringify(loanApplicationObject),
      loanApplicant: JSON.stringify(this.NewLoanApplicant)
    });
    {
      console.log("saveLoanApplication : " + JSON.stringify(result));
      if (!result.isSuccess) {
        this.showErrorToast("Error", result.error, "error");
        return;
      }
      this.ResidentialLoanApplication = result.data.loanApplication;
      this.NewLoanApplicant = result.data.loanApplicant;
      this.LoanApplicant = result.data.loanApplicantList;
      this.requiredDocumentIds = result.data.requiredDocumentIds;
    }
    this.currentTab = "2";
    this.isLoaded = false;
  }

  validateForm() {
    this.isLoaded = true;
    let isValid = true;
    let inputFields = this.template.querySelectorAll(".vehicleLoanInfo");
    inputFields.forEach((inputField) => {
      if (!inputField.checkValidity()) {
        inputField.reportValidity();
        isValid = false;
      }
    });
    this.isLoaded = false;
    return isValid;
  }

  //edit editCertificationForm
  handelTermsAndCondition(event) {
    this.ischecked = "";
    this.ischecked = event.detail.checked;
  }

  showApplicationQuestionTab() {
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

  cancelForm() {
    const config = {
      type: "standard__webPage",
      attributes: {
        url: "/my-applications"
      }
    };
    this[NavigationMixin.Navigate](config);
  }

  editCertificationForm(event) {
    this.isLoaded = true;
    this.isShowCertificationForm = true;
    console.log("editCertificationForm: " + event.detail.row.Id);
    event.detail.row.Id
      ? this.getCertificationRecord(event.detail.row.Id)
      : this.showErrorToast("Error", "Please complete previous steps", "error");
    this.isLoaded = false;
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

  editBorrowerForm(event) {
    this.isLoaded = true;
    // this.isShowBorrowerForm = true;
    console.log("event.detail.row.Id:" + event.detail.row.Id);
    event.detail.row.Id
      ? this.getLoanApplicantRecord(event.detail.row.Id)
      : this.showErrorToast("Error", "Please complete previous steps", "error");
    this.isLoaded = false;
  }

  hideBorrowerForm() {
    this.isShowBorrowerForm = false;
  }

  async getLoanApplicantRecord(loanApplicantId) {
    this.isLoaded = true;
    try {
      let response = await getLoanApplicantRecords({
        loanApplicantRecId: loanApplicantId
      });
      {
        console.log("getLoanApplicantRecord:" + JSON.stringify(response));
        if (!response.isSuccess) {
          this.showErrorToast("Error", response.error, "error");
          return;
        }
        var resultMap = response.data;
        this.NewLoanApplicant = resultMap.loanApplicant;
        this.LoanApplicantAddress = resultMap.presentAddress;
        this.LoanApplicantMalingAddress = resultMap.mailingAddress;
        this.LoanApplicantEmployment = resultMap.applicantEmployment;
        this.IsSelfEmployed = resultMap.applicantEmployment.IsSelfEmployed;
        this.LoanApplicantIncomes = resultMap.applicantIncome;
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
      }
    } catch (error) {
      console.error(error);
    }

    this.isShowBorrowerForm = true;
    this.isLoaded = false;
  }

  //Function to set Loan Applicant Questions
  setDeclarationQuestions(loanApplicantDeclaration) {
    this.isLoaded = true;
    var questions = this.ConsumerLoanProgram;
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
      declaration.ApplicationQuestion =
        questions.Application_Questions__r[key].Question_Type__c ===
        "Application Question"
          ? true
          : false;
      if (loanApplicantDeclaration) {
        declaration.Answer =
          loanApplicantDeclaration[
            questions.Application_Questions__r[key].Loan_Declaration_Field__c
          ];
      }
      LoanApplicationDeclaration.push(declaration);
    }
    this.DeclarationQuestions = LoanApplicationDeclaration;
    console.log(
      "this.DeclarationQuestions:" + JSON.stringify(this.DeclarationQuestions)
    );
    this.isLoaded = false;
  }

  saveLoanApplicantInfo(event) {
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
      {
        this.NewLoanApplicant = result.data.loanApplicantRecord;
        this.LoanApplicant = result.data.loanApplicantList;
      }
    } catch (error) {
      console.error(error);
    }

    this.isLoaded = false;
  }

  saveApplicantQuestions() {
    this.isLoaded = true;
    this.NewLoanApplicant.Id
      ? this.saveLoanapplicantQuestion("4")
      : this.showErrorToast(
          "Error",
          "Please Complete Loan Applicant Form",
          "error"
        );
    this.isLoaded = false;
  }

  async saveLoanapplicantQuestion(tabToSet) {
    this.isLoaded = true;
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
      {
        console.log("response:" + JSON.stringify(response));
        if (!response.isSuccess) {
          this.showErrorToast("Error", response.error, "error");
          return;
        }
        var resultMap = response.data;
        this.ApplicationQuestion = resultMap.applicationQuestion;
      }
    } catch (error) {
      console.error(error);
    }

    this.PersonalInfoCurrentTab = tabToSet;
    this.isLoaded = false;
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
      this.saveAddress("5", LoanApplicantAddress, LoanApplicantMalingAddress);
    } else {
      this.showErrorToast(
        "Error",
        "Please Complete Loan Applicant Form",
        "error"
      );
    }
    this.isLoaded = false;
  }

  handelPresentAddress(event) {
    let LoanApplicantAddress = {};
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
      var loanApplicant = this.LoanApplicant;
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
      {
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
      }
    } catch (error) {
      console.error(error);
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
      {
        if (!response.isSuccess) {
          this.showErrorToast("Error", response.error, "error");
          return;
        }
        var resultMap = response.data;
        console.log("saveLoanApplicantAddress data from server", resultMap);
      }
    } catch (error) {
      console.error(error);
    }

    this.isLoaded = false;
  }

  handelmaritalStatus(event) {
    this.maritalStatusvalue = event.target.value;
  }

  setSelfEmployment(event) {
    this.LoanApplicantEmployment.IsSelfEmployed = event.detail.checked;
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
      ? this.saveEmployment("6")
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
      {
        if (!response.isSuccess) {
          this.showErrorToast("Error", response.error, "error");
          return;
        }
        var resultMap = response.data;
      }
    } catch (error) {
      console.error(error);
    }

    this.isLoaded = false;
  }

  calculateTotalIncome(event) {
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
      ? this.saveIncomes("7")
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
      {
        if (!response.isSuccess) {
          this.showErrorToast("Error", response.error, "error");
          return;
        }

        var resultMap = response.data;
        //Set TotalMonthlyIncome, TotalMonthlyExpense, Debt_To_Income_Ratio__c values
        this.ResidentialLoanApplication.TotalMonthlyIncome__c =
          resultMap.loanApplication.TotalMonthlyIncome__c;
        this.ResidentialLoanApplication.TotalMonthlyExpense__c =
          resultMap.loanApplication.TotalMonthlyExpense__c;
        this.ResidentialLoanApplication.Debt_To_Income_Ratio__c =
          resultMap.loanApplication.Debt_To_Income_Ratio__c;
      }
    } catch (error) {
      console.error(error);
    }

    this.isLoaded = false;
  }

  calculateTotalExpenses(event) {
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

  saveApplicantExpense() {
    this.NewLoanApplicant.Id
      ? this.saveApplicantExpenses("8")
      : this.showErrorToast(
          "Error",
          "Please Complete Loan Applicant Form",
          "error"
        );
  }

  async saveApplicantExpenses(tabToSet) {
    this.isLoaded = true;
    this.PersonalInfoCurrentTab = tabToSet;
    var loanApplicant = this.NewLoanApplicant;
    if (loanApplicant.LoanApplicantDeclarations) {
      delete loanApplicant.LoanApplicantDeclarations;
    }
    try {
      let response = await saveLoanApplicant({
        loanApplicant: JSON.stringify(loanApplicant)
      });
      {
        if (!response.isSuccess) {
          this.showErrorToast("Error", response.error, "error");
          return;
        }
        var resultMap = response.data;
        this.ResidentialLoanApplication.TotalMonthlyIncome__c =
          resultMap.loanApplication.TotalMonthlyIncome__c;
        this.ResidentialLoanApplication.TotalMonthlyExpense__c =
          resultMap.loanApplication.TotalMonthlyExpense__c;
        this.ResidentialLoanApplication.Debt_To_Income_Ratio__c =
          resultMap.loanApplication.Debt_To_Income_Ratio__c;
      }
    } catch (error) {
      console.error(error);
    }

    this.isLoaded = false;
  }

  saveApplicantConsent(event) {
    var actionName = event.currentTarget.dataset.action;
    this.NewLoanApplicant.Id
      ? this.saveLoanapplicantConsent("0", actionName)
      : this.showErrorToast(
          "Error",
          "Please Complete Loan Applicant Form",
          "error"
        );
  }

  async saveLoanapplicantConsent(tabToSet, actionName) {
    this.isLoaded = true;
    var loanApplication = JSON.parse(
      JSON.stringify(this.ResidentialLoanApplication)
    );
    var loanApplicant = JSON.parse(JSON.stringify(this.NewLoanApplicant));
    var applicationQuestions = JSON.parse(
      JSON.stringify(this.ApplicationQuestion)
    );
    if (!applicationQuestions.Id) {
      applicationQuestions.Name = loanApplicant.Name + " Consent Declaration";
      applicationQuestions.Loan_Program__c = this.consumerLoanType;
      applicationQuestions.LoanApplicationId = loanApplicant.LoanApplicationId;
      applicationQuestions.LoanApplicantId = loanApplicant.Id;
    }
    this.template
      .querySelectorAll(".applicantDeclaration")
      .forEach((element) => {
        if (element.dataset && element.dataset.fieldApiName) {
          applicationQuestions[element.dataset.fieldApiName] = element.checked;
        }
      });
    try {
      let response = await saveLoanapplicantQuestions({
        applicationQuestions: JSON.stringify(applicationQuestions)
      });
      {
        if (!response.isSuccess) {
          this.showErrorToast("Error", response.error, "error");
          return;
        }
        var resultMap = response.data;
        this.ApplicationQuestion = resultMap.applicationQuestion;
        this.PersonalInfoCurrentTab = tabToSet;
        this.isShowBorrowerForm = false;
        //Update Loan Application Status If Application is Submited

        if (
          actionName === "PreAppSubmit" &&
          loanApplication.Status === "Started"
        ) {
          this.updateLoanApplicationStatus("Pre-App Completed");
        }
        if (actionName === "AddCoBorrower") {
          this.showNewBorrowerForm();
        }
      }
    } catch (error) {
      console.error(error);
    }
    this.isLoaded = false;
  }

  async updateLoanApplicationStatus(applicationStatus) {
    this.isLoaded = true;
    var loanApplicationObject = JSON.parse(
      JSON.stringify(this.ResidentialLoanApplication)
    );

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
      {
        if (!response.isSuccess) {
          this.showErrorToast("Error", response.error, "error");
          return;
        }
        var loanApplicationObj = JSON.parse(
          JSON.stringify(this.ResidentialLoanApplication)
        );
        loanApplicationObj.Status = applicationStatus;
        this.ResidentialLoanApplication = loanApplicationObj;
      }
    } catch (error) {
      console.error(error);
    }
    this.isLoaded = false;
  }

  showNewBorrowerForm() {
    this.NewLoanApplicant = {};
    this.ApplicationQuestion = {};
    this.LoanApplicantAddress = {};
    this.LoanApplicantMalingAddress = {};
    this.LoanApplicantEmployment = {};
    this.LoanApplicantIncomes = {};
    this.NewLoanApplicant.BorrowerType = "CoBorrower";
    this.isShowBorrowerForm = true;
    this.setDeclarationQuestions(null);
  }

  hideCertificationForm() {
    this.isShowCertificationForm = false;
  }

  showCertificationForm() {
    this.isShowCertificationForm = true;
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
        this.currentTab = "5";
        this.isShowCertificationForm = false;
      }
    } catch (error) {
      console.error(error);
    }
    this.isLoaded = false;
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

  showErrorToast(title, message, variant) {
    const evt = new ShowToastEvent({
      title: title,
      message: message,
      variant: variant,
      mode: "dismissable"
    });
    this.dispatchEvent(evt);
  }
}