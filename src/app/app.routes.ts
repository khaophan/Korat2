import {Routes} from '@angular/router';
import { MapPage } from './pages/public/map.page';
import { ReportPage } from './pages/public/report.page';
import { LoginPage } from './pages/admin/login.page';
import { AdminLayoutComponent } from './components/admin-layout';
import { DashboardPage } from './pages/admin/dashboard.page';
import { RoutesPage } from './pages/admin/routes.page';
import { RouteEditorPage } from './pages/admin/route-editor.page';
import { PlacesPage } from './pages/admin/places.page';
import { PlaceEditorPage } from './pages/admin/place-editor.page';
import { ReportsPage } from './pages/admin/reports.page';
import { LogsPage } from './pages/admin/logs.page';
import { OnboardingPage } from './pages/public/onboarding.page';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'map', pathMatch: 'full' },
  { path: 'onboarding', component: OnboardingPage },
  { path: 'map', component: MapPage },
  { path: 'report', component: ReportPage },
  { path: 'admin/login', component: LoginPage },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [adminGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardPage },
      { path: 'routes', component: RoutesPage },
      { path: 'routes/edit/:id', component: RouteEditorPage },
      { path: 'places', component: PlacesPage },
      { path: 'places/edit/:id', component: PlaceEditorPage },
      { path: 'reports', component: ReportsPage },
      { path: 'logs', component: LogsPage }
    ]
  },
  { path: '**', redirectTo: 'splash' }
];
