import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SignalRService } from './services/signal-r.service';
import { VideoPlayerComponent } from './components/video-player/video-player.component';
import { VideoStreamerComponent } from './components/video-streamer/video-streamer.component';

@NgModule({
  declarations: [
    AppComponent,
    VideoPlayerComponent,
    VideoStreamerComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [SignalRService],
  bootstrap: [AppComponent]
})
export class AppModule { }
