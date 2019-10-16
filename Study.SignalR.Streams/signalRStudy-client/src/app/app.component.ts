/// <reference types="@types/dom-mediacapture-record" />

import { Component, OnInit } from '@angular/core';
import { SignalRService } from './services/signal-r.service';
import { FileUploader, FileSelectDirective, FileItem } from 'ng2-file-upload';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'signalRStudy-client';
  files: FileList;

  sourceBuffer: SourceBuffer;
  queue = [];
  videoPlay: HTMLVideoElement;
  mediaSource: MediaSource;
  isReadyToPlayVideo = false;
  countOfReceivedChuncks = 0;

  constructor(public signalRService: SignalRService) { }

  ngOnInit() {
    // this.signalRService.startConnection();
    // //this.signalRService.sendMessage();   
    // this.signalRService.receveiveMessage();

    // this.playVideo();
    // this.recordVideo();
  }

  recordVideo() {
    const constraints = {
      video: true,
      audio: false
    };

    const video = document.getElementById('videoRecord') as HTMLVideoElement;

    navigator.mediaDevices.getUserMedia(constraints).
      then((stream) => {
        //var options = {mimeType: 'video/webm; codecs=vp9'};

        var options;
        if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
          options = { mimeType: 'video/webm; codecs=vp9' };
        } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8')) {
          options = { mimeType: 'video/webm; codecs=vp8' };
        } else {
          // ...
        }

        video.srcObject = stream;

        let recorder = new MediaRecorder(stream, options);

        recorder.ondataavailable = (e) => {

          new Response(e.data).arrayBuffer()
            .then((arrayBuffer) => {
              let buffer = new Uint8Array(arrayBuffer as ArrayBuffer);
              let array = Array.from(buffer);
              //console.log(arrayBuffer);
              this.signalRService.sendToStream(array);
              //this.onReceivingNewBytes(array);
            });
        };

        recorder.start(500);
        console.log(recorder.videoBitsPerSecond);
      });
  }

  playVideo() {
    this.videoPlay = document.getElementById('videoPlay') as HTMLVideoElement;

    this.videoPlay.load();
    this.mediaSource = new MediaSource();
    this.videoPlay.src = window.URL.createObjectURL(this.mediaSource);
    this.mediaSource.addEventListener('sourceopen', () => this.sourceOpen());

    console.log(this.videoPlay.readyState);
  }

  public sourceOpen() {
    console.log("source opened")
    URL.revokeObjectURL(this.videoPlay.src);
    console.log(`media source ${this.mediaSource.readyState}`)
    this.sourceBuffer = this.mediaSource.addSourceBuffer('video/webm; codecs=vp9');
    this.sourceBuffer.mode = 'sequence';
    //this.signalRService.receiveBytes((bytes) => this.onReceivingNewBytes(bytes));
    this.signalRService.readFromStream((bytes) => this.onReceivingNewBytes(bytes));
    
    this.sourceBuffer.addEventListener('update', () => {
      console.log("Updated buffer");
      if (this.queue.length > 0 && !this.sourceBuffer.updating) {
        this.sourceBuffer.appendBuffer(this.queue.shift());
      }
    }, false);

    this.sourceBuffer.addEventListener('error', function (ev) {
      console.error(ev);
    });

    this.sourceBuffer.addEventListener('updateend', (ev) => {
      console.error(ev);
      console.error(this.sourceBuffer);
      console.error(this.mediaSource.readyState);
    });
  }

  onSuccess(stream) {

  }

  handleFiles(event) {
    let reader = new FileReader();
    let file = event.target.files[0];
    console.log(file);

    let readed = reader.readAsArrayBuffer(file);

    reader.onload = () => {
      console.log(reader.result);
      let buffer = new Int8Array(reader.result as ArrayBuffer);
      this.signalRService.sendBytes(buffer);
    };

    console.log("handles");
    console.log(readed);
  }

  saveChunks(e) {
    console.log(e);
    console.log(e.data.size);
  }

  onReceivingNewBytes(bytes) {
    //let data = bytes;
    let data = new Uint8Array(bytes).buffer;
    console.log(bytes);

    console.log(`Video state is ${this.videoPlay.readyState}`);
    if (this.countOfReceivedChuncks !== 0 && (this.sourceBuffer.updating || this.mediaSource.readyState != "open" || !this.isReadyToPlayVideo || this.queue.length > 0)) {
      this.queue.push(data);
    } else {
      console.log("Addede to source buffer");
      this.sourceBuffer.appendBuffer(data);
    }

    if (this.countOfReceivedChuncks === 0) {
      this.countOfReceivedChuncks++;
      let promise = this.videoPlay.play();
      console.log(promise);
      if (promise !== undefined) {
        promise.then(_ => {
          console.error("is played");
          this.isReadyToPlayVideo = true;
        }).catch(error => {
          console.error("Error in promise");
          console.error(error);
        });
      }
    }
  }
}
