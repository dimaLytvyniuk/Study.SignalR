import { Component, OnInit } from '@angular/core';
import * as signalR from "@microsoft/signalr";

@Component({
  selector: 'app-video-streamer',
  templateUrl: './video-streamer.component.html',
  styleUrls: ['./video-streamer.component.css']
})
export class VideoStreamerComponent implements OnInit {
  private hubConnection: signalR.HubConnection;
  private streamSubject = new signalR.Subject();

  sourceBuffer: SourceBuffer;
  queue = [];
  videoPlay: HTMLVideoElement;
  mediaSource: MediaSource;
  isReadyToPlayVideo = false;
  countOfReceivedChuncks = 0;

  constructor() { }

  ngOnInit() {
    this.startConnection()
  }

  public startConnection() {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('https://localhost:5001/chatHub')
      .build();

    this.hubConnection
      .start()
      .then(() => {
        console.log('Connection started');
        this.sendMessage();
        this.startStream();
        this.recordVideo();
      })
      .catch(err => console.log('Error while starting connection: ' + err))
  }

  public sendMessage() {
    this.hubConnection
      .invoke('SendMessage', "MyUser", "MyMessage")
      .then(() => console.log("Message Sended"))
      .catch(err => console.log('Error while send message: ' + err))
  }

  public startStream() {
    this.hubConnection.send("UploadVideo", "NewSession", this.streamSubject);
  }

  public sendToStream(bytes: any) {
    this.streamSubject.next(bytes);
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
              console.log(array);
              this.sendToStream(array);
              //this.onReceivingNewBytes(array);
            });
        };

        recorder.start(500);
        console.log(recorder.videoBitsPerSecond);
      });
  }
}
