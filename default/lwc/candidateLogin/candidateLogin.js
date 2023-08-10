/* eslint-disable no-alert */
/* eslint-disable no-unused-vars */
import { LightningElement, wire } from "lwc";
import validateCandidate from "@salesforce/apex/CandiateTestControler.validateCandidate";
import assignRandomQuestionSet from "@salesforce/apex/CandiateTestControler.assignRandomQuestionSet";
import createCandidateTest from "@salesforce/apex/CandiateTestControler.createCandidateTest";
import updateStartTest from "@salesforce/apex/CandiateTestControler.updateStartTest";

export default class CandidateLogin extends LightningElement {
  email;
  passcode;
  validate;
  isTestStart = false;
  candidateTestId;
  info = [];
  isValidStudent = false;
  isLoaded;
  qyeryValue;
  tabValue;
  isTabChange;
  validateErrorMessage =
    "You test is Submited please contact our HR team(contact@drizzleit.org)";
  loginErrorMessage;
  isLogin = false;
  isCandidateAlreadyExist = false;
  duration;
  isTermsAndCondition;
  checkBoxmessage;
  timetCount;
  isWebCamOn;
  iswebCam = false;
  webCamError = "Allow the camera and audio";

  emailInput(event) {
    this.email = event.target.value;
  }

  passcodeInput(event) {
    this.passcode = event.target.value;
  }

  async verifyCandidate() {
    this.isLoaded = true;
    let result = await validateCandidate({
      Email: this.email,
      Passcode: this.passcode
    });
    if (result.Pass_Code__c !== this.passcode) {
      this.loginErrorMessage = "Incorrect Password";
    }
    if (result.Email__c !== this.email) {
      this.loginErrorMessage = "Incorrect Email";
    }
    if (
      result.Email__c === this.email &&
      result.Pass_Code__c === this.passcode
    ) {
      this.validate = true;
    }
    if (this.validate) {
      if (!result.Sart_Test__c) {
        this.isTestStart = true;
      } else {
        this.isCandidateAlreadyExist = true;
      }
    } else {
      this.isLogin = true;
    }
    this.isLoaded = false;
  }

  @wire(assignRandomQuestionSet) testInformation({ data, error }) {
    this.isLoaded = true;
    if (data) {
      this.info = data;
      this.setId = this.info.Id;
      this.questionCount = this.info.Number_of_Questions__c;
      this.duration = this.info.Duration__c;
    }
    if (error) {
      console.error(error);
    }
    this.isLoaded = false;
  }

  async startTest() {
    this.isLoaded = true;
    if (this.isTermsAndCondition) {
      this.iswebCam = true;
      if (this.isWebCamOn) {
        await updateStartTest({
          Email: this.email,
          Passcode: this.passcode
        });

        console.log(this.email);
        console.log(this.passcode);
        console.log(this.setId);
        let result = await createCandidateTest({
          email: this.email,
          passcode: this.passcode,
          testid: this.setId
        });
        this.isValidStudent = true;
        this.candidateTestId = result;
      }
    } else {
      this.checkBoxmessage = "Accept terms and condition";
    }

    this.isLoaded = false;
  }
  renderedCallback() {
    if (this.isValidStudent) {
      this.capture();
    }
    if (this.isTermsAndCondition) {
      navigator.getMedia =
        navigator.getUserMedia ||
        navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia ||
        navigator.msGetUserMedia;

      navigator.getMedia(
        { video: true },
        () => {
          this.isWebCamOn = true;
          console.log("this.isWebCamOn;" + this.isWebCamOn);
        },
        () => {
          this.isWebCamOn = false;
          console.log("this.isWebCamOn:" + this.isWebCamOn);
          // eslint-disable-next-line no-alert
          alert("Please allow access to camera and audio.");
          this.isValidStudent = false;
          this.validate = false;
        }
      );
    }
  }

  capture() {
    this.qyeryValue = this.template.querySelector(".videoelement");
    const video = this.qyeryValue;
    if (navigator.mediaDevices) {
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: false })
        .then((stream) => {
          video.srcObject = stream;
          video.play();
          this.isWebCamOn = true;
        })
        .catch((error) => {
          console.error("something went wrong: " + error);
          this.isValidStudent = false;
          this.validate = false;
          window.location.reload();
        });
    }
  }

  handleEnter(event) {
    this.isLoaded = true;
    if (event.keyCode === 13) {
      this.confirmClick();
    }
    this.isLoaded = false;
  }
  refreshComp() {
    window.location.reload();
  }
  termAndCondition(event) {
    this.isTermsAndCondition = event.target.value;
  }

  stopWebCam() {
    const video = this.qyeryValue;
    video.srcObject.getTracks().forEach((trac) => trac.stop());
    video.srcObject = null;
  }
}
