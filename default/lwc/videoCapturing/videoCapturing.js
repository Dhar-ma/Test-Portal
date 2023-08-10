import { track, LightningElement } from "lwc";

export default class VideoCapturing extends LightningElement {
  @track video;
  @track canvas;

  //   capture() {
  //     console.log("cam cliked");
  //     this.video = this.template.querySelector(".videoelement");
  //     navigator.mediaDevices
  //       .getUserMedia({ video: true, audio: false })
  //       .then((stream) => {
  //         var videoTracks = stream.getVideoTracks();
  //         console.log("Using video device:" + videoTracks[0].label);
  //         stream.onended = function () {
  //           console.log("Stream End:");
  //         };
  //         window.stream = stream;
  //         this.video.srcObject = stream;
  //         this.video.play();
  //       });
  //   }

  //offcapture
  capture() {
    const video = this.template.querySelector(".videoelement");
    if (navigator.mediaDevices) {
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: false })
        .then((stream) => {
          video.srcObject = stream;
          video.play();
        })
        .catch(function (error) {
          console.error("something went wrong: " + error);
        });
    }
  }

  stop() {
    const video = this.template.querySelector(".videoelement");
    video.srcObject.getTracks().forEach((trac) => trac.stop());
    video.srcObject = null;
  }
}