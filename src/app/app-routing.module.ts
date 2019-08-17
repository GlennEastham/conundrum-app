import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GameComponent } from './components/game/game.component';
import { TitleComponent } from './components/titleScreen/titleScreen.component';

const routes: Routes = [
  { path: '', component: TitleComponent },
  { path: 'game', component: GameComponent,  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

export class AppRoutingModule { }
export const RoutingComponents = [
  TitleComponent, GameComponent
]