import { Injectable } from '@angular/core';
import * as signalR from "@microsoft/signalr";

@Injectable({
  providedIn: 'root'
})
export class SignalRService {
  private hubConnection: signalR.HubConnection;
  count = 0;
  readyVideo = false;
  streamSubject = new signalR.Subject();

  constructor() { }

  public startConnection() {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('https://localhost:5001/chatHub')
      .build();

    this.hubConnection
      .start()
      .then(() => {
        console.log('Connection started');
        this.sendMessage();
        this.startStream()
      })
      .catch(err => console.log('Error while starting connection: ' + err))
  }

  public receveiveMessage() {
    this.hubConnection.on('ReceiveMessage', (user, message) => {
      console.log(`received message: ${user}`);
      console.log(message);
    });
  }

  public sendMessage() {
    this.hubConnection
      .invoke('SendMessage', "MyUser", "MyMessage")
      .then(() => console.log("Message Sended"))
      .catch(err => console.log('Error while send message: ' + err))
  }

  public sendBytes(bytes: any) {
    this.hubConnection
      .send('SendBytes', "MyUser", bytes)
      .then(() => console.log("Message Sended"))
      .catch(err => console.log('Error while send message: ' + err))
  }

  public receiveBytes(callback) {
    this.hubConnection.on('ReceiveBytes', (bytes) => callback(bytes))
  }

  public startStream() {
    this.hubConnection.send("UploadVideo", "NewSession", this.streamSubject);
  }

  public sendToStream(bytes: any) {
    this.streamSubject.next(bytes);
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
}
