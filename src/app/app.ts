import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {RouterOutlet, Router, NavigationEnd} from '@angular/router';
import { NavbarComponent } from './components/navbar';
import { FooterComponent } from './components/footer';
import { filter } from 'rxjs/operators';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, FooterComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  router = inject(Router);
  currentUrl = '';

  constructor() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event) => {
      const navEnd = event as NavigationEnd;
      this.currentUrl = navEnd.urlAfterRedirects;
    });
  }

  hasNavigation(): boolean {
    const isOnboarding = this.currentUrl.startsWith('/onboarding');
    const isAdminArea = this.currentUrl.startsWith('/admin') && this.currentUrl !== '/admin/login';
    
    return !isOnboarding && !isAdminArea;
  }
}
