import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, MatIconModule],
  template: `
    <!-- Top Navbar for Desktop -->
    <nav class="hidden md:block bg-blue-600 text-white shadow-sm border-b border-blue-700">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <a routerLink="/map" class="flex-shrink-0 flex items-center gap-2 hover:opacity-90 transition-opacity">
              <mat-icon class="text-[24px] w-[24px] h-[24px]">directions_bus</mat-icon>
              <span class="font-bold text-xl tracking-tight">Korat</span>
            </a>
            <div class="ml-8 flex space-x-6">
              <a routerLink="/map" routerLinkActive="border-b-2 border-white text-white" [routerLinkActiveOptions]="{exact: true}" class="inline-flex items-center px-1 pt-1 text-sm font-medium text-blue-100 hover:text-white transition-colors border-b-2 border-transparent">
                แผนที่
              </a>
              <a routerLink="/report" routerLinkActive="border-b-2 border-white text-white" class="inline-flex items-center px-1 pt-1 text-sm font-medium text-blue-100 hover:text-white transition-colors border-b-2 border-transparent">
                รายงานปัญหา
              </a>
            </div>
          </div>
          <div class="flex items-center space-x-4">
            @if (authService.currentUser()) {
              <a routerLink="/admin/dashboard" class="text-sm font-medium text-blue-100 hover:text-white transition-colors">
                Admin Dashboard
              </a>
              <button (click)="logout()" class="text-sm font-medium text-blue-100 hover:text-white transition-colors">
                ออกจากระบบ
              </button>
            } @else {
              <a routerLink="/admin/login" class="text-sm font-medium text-blue-100 hover:text-white transition-colors">
                Admin Login
              </a>
            }
          </div>
        </div>
      </div>
    </nav>

    <!-- Bottom Navigation for Mobile -->
    <nav class="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe z-[9999]">
      <div class="flex justify-around items-center h-16">
        <a routerLink="/map" routerLinkActive="text-blue-600" [routerLinkActiveOptions]="{exact: true}" class="flex flex-col items-center justify-center w-full h-full text-gray-500 hover:text-blue-600 transition-colors">
          <mat-icon class="text-[24px] w-[24px] h-[24px] mb-1">map</mat-icon>
          <span class="text-[10px] font-medium">แผนที่</span>
        </a>
        <a routerLink="/report" routerLinkActive="text-blue-600" class="flex flex-col items-center justify-center w-full h-full text-gray-500 hover:text-blue-600 transition-colors">
          <mat-icon class="text-[24px] w-[24px] h-[24px] mb-1">report_problem</mat-icon>
          <span class="text-[10px] font-medium">แจ้งปัญหา</span>
        </a>
        @if (authService.currentUser()) {
          <a routerLink="/admin/dashboard" routerLinkActive="text-blue-600" class="flex flex-col items-center justify-center w-full h-full text-gray-500 hover:text-blue-600 transition-colors">
            <mat-icon class="text-[24px] w-[24px] h-[24px] mb-1">admin_panel_settings</mat-icon>
            <span class="text-[10px] font-medium">Admin</span>
          </a>
        } @else {
          <a routerLink="/admin/login" routerLinkActive="text-blue-600" class="flex flex-col items-center justify-center w-full h-full text-gray-500 hover:text-blue-600 transition-colors">
            <mat-icon class="text-[24px] w-[24px] h-[24px] mb-1">login</mat-icon>
            <span class="text-[10px] font-medium">เข้าสู่ระบบ</span>
          </a>
        }
      </div>
    </nav>
  `
})
export class NavbarComponent {
  authService = inject(AuthService);

  logout() {
    this.authService.logout();
  }
}
