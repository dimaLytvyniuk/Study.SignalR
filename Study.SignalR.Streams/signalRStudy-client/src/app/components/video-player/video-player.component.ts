import { Component, OnInit } from '@angular/core';
import * as signalR from "@microsoft/signalr";

@Component({
  selector: 'app-video-player',
  templateUrl: './video-player.component.html',
  styleUrls: ['./video-player.component.css']
})
export class VideoPlayerComponent implements OnInit {
  private hubConnection: signalR.HubConnection;
  
  sourceBuffer: SourceBuffer;
  queue = [];
  videoPlay: HTMLVideoElement;
  mediaSource: MediaSource;
  isReadyToPlayVideo = false;
  countOfReceivedChuncks = 0;

  constructor() { }

  ngOnInit() {
    //this.startConnection()
    this.playVideo()
  }

  public startConnection() {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('https://localhost:5001/chatHub')
      .build();

    this.hubConnection
      .start()
      .then(() => {
        console.log('Connection started in player hub');
        this.readFromStream((bytes) => this.onReceivingNewBytes(bytes));
      })
      .catch(err => console.log('Error while starting connection: ' + err))
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
    this.startConnection();

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

  public readFromStream(callback) {
    this.hubConnection.stream("StreamVideo", "NewSession")
      .subscribe(
      {
        next: (bytes) => callback(bytes),
        complete: () => { console.error("Stream completed") },
        error: (err) => { console.error(err) }
      });
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
