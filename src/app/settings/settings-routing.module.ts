import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SettingsComponent } from './settings.component';

const routes: Routes = [{ path: '', component: SettingsComponent, data: { titlePrefixSnippet: 'settings' } }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SettingsRoutingModule { }
