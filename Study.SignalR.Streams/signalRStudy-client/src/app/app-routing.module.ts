import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { VideoPlayerComponent } from './components/video-player/video-player.component';
import { VideoStreamerComponent } from './components/video-streamer/video-streamer.component';

const routes: Routes = [
  { path: 'player', component: VideoPlayerComponent },
  { path: 'streamer', component: VideoStreamerComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
