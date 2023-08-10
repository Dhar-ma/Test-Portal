/* eslint-disable vars-on-top */
/* eslint-disable no-unused-vars */
import { api, LightningElement, wire } from "lwc";
import getTestQuestions from "@salesforce/apex/CandiateTestControler.getTestQuestions";
import calculateCandidateTestResult from "@salesforce/apex/CandiateTestControler.calculateCandidateTestResult";
import tabDetection from "@salesforce/apex/CandiateTestControler.tabDetection";

export default class TestQuetions extends LightningElement {
  @api questionSetId;
  @api candidateTestId;
  @api questionCount;
  @api email;
  @api passcode;
  @api duration;
  @api isWebCamOn;
  timetCount;
  qesTobeAttempt = [];
  optionAndQesIdsMap = {};
  issubmit = false;
  @api qyeryValue;
  isTabChange;
  isOptionSelect = false;
  questionNumber = 1;
  isLoaded;

  currentIndex = 0;

  get currentQuestion() {
    return this.qesTobeAttempt.length
      ? this.qesTobeAttempt[this.currentIndex]
      : null;
  }

  get isLastQuestion() {
    return this.qesTobeAttempt.length === this.currentIndex + 1;
  }

  handelradiobutton(event) {
    this.isOptionSelect = event.target.checked;
    let optionId = event.target.dataset.optionid;
    let questionId = event.target.dataset.questoinid;
    this.optionAndQesIdsMap[questionId] = [optionId];
  }

  handelCheckBox(event) {
    let optionId = event.target.dataset.optionid;
    let questionId = event.target.dataset.questoinid;
    let isSelected = event.target.checked;
    if (!this.optionAndQesIdsMap[questionId]) {
      this.optionAndQesIdsMap[questionId] = [];
    }
    if (isSelected) {
      this.isOptionSelect = true;
      this.optionAndQesIdsMap[questionId].push(optionId);
    } else {
      this.optionAndQesIdsMap[questionId].splice(
        this.optionAndQesIdsMap[questionId].indexOf(optionId),
        1
      );
    }
  }

  stopWebCam() {
    const video = this.qyeryValue;
    video.srcObject.getTracks().forEach((trac) => trac.stop());
    video.srcObject = null;
  }

  renderedCallback() {
    if (this.timetCount === "EXPIRED") {
      this.issubmit = true;
      this.stopWebCam();
      calculateCandidateTestResult({
        optionAndQesIdsJson: JSON.stringify(this.optionAndQesIdsMap),
        questionSetId: this.questionSetId,
        candiatetestid: this.candidateTestId,
        questionCount: this.questionCount
      });
    }
  }
  connectedCallback() {
    document.addEventListener("visibilitychange", () => {
      if (!this.issubmit) {
        if (document.visibilityState === "hidden") {
          let tabValue = "hidden";
          tabDetection({
            Email: this.email,
            Passcode: this.passcode,
            tabValue: tabValue
          })
            .then((result) => {
              this.isTabChange = result;
            })
            .catch((error) => {
              console.error(error);
            });
        }
      }
      window.location.reload();
      this.stopWebCam();
    });
    this.startCount();
  }
  async submitTest() {
    this.isLoaded = true;
    this.stopWebCam();
    await calculateCandidateTestResult({
      optionAndQesIdsJson: JSON.stringify(this.optionAndQesIdsMap),
      questionSetId: this.questionSetId,
      candiatetestid: this.candidateTestId,
      questionCount: this.questionCount
    });
    this.issubmit = true;
    this.isLoaded = false;
  }

  @wire(getTestQuestions, {
    question_setId: "$questionSetId",
    questionCount: "$questionCount"
  })
  questionAndOption({ data, error }) {
    this.isLoaded = true;
    if (data) {
      this.qesTobeAttempt = data;
    }
    if (error) {
      console.log(error);
    }
    this.isLoaded = false;
  }
  nextQuestion() {
    if (this.isOptionSelect) {
      this.currentIndex += 1;
      this.questionNumber = this.questionNumber + 1;
    }
    this.isOptionSelect = false;
    //   this.qesTobeAttempt = this.qesTobeAttempt.filter(
    //     (x) => x.Id !== this.currentQuestion.Id
    //   );
  }
  previousQuestion() {
    if (this.questionNumber > 1) {
      this.currentIndex -= 1;
      this.questionNumber = this.questionNumber - 1;
    }
  }
  startCount() {
    var countDownDate = new Date().getTime() + this.duration * 60000;
    // eslint-disable-next-line @lwc/lwc/no-async-operation, vars-on-top
    var x = setInterval(() => {
      var now = new Date().getTime();
      var distance = countDownDate - now;
      var days = Math.floor(distance / (1000 * 60 * 60 * 24));
      var hours = Math.floor(
        (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      var seconds = Math.floor((distance % (1000 * 60)) / 1000);
      this.timetCount = minutes + ":" + seconds;
      if (distance < 0) {
        clearInterval(x);
        this.timetCount = "EXPIRED";
      }
    }, 1000);
  }
}
