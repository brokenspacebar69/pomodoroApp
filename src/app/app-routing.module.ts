import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomePage } from './home/home.page'; // import directly

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./home/home.page').then(m => m.HomePage)
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
