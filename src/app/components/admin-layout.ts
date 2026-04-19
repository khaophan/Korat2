import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatIconModule, CommonModule],
  template: `
    <div class="fixed inset-0 flex bg-slate-50 font-sans overflow-hidden">
      <!-- Sidebar สำหรับ Desktop -->
      <aside class="hidden md:flex w-72 bg-slate-900 text-slate-300 flex-col z-50">
        <div class="p-8">
           <div class="flex items-center gap-3 mb-10">
              <div class="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg">
                 <mat-icon>admin_panel_settings</mat-icon>
              </div>
              <span class="text-xl font-black text-white tracking-tighter">ผู้ดูแลระบบ</span>
           </div>

           <nav class="space-y-1">
              <a routerLink="/admin/dashboard" routerLinkActive="bg-white/10 text-white" [routerLinkActiveOptions]="{exact: true}" class="flex items-center gap-4 px-5 py-4 rounded-2xl transition-all group hover:bg-white/5">
                <mat-icon [class.text-blue-500]="router.url === '/admin/dashboard'">grid_view</mat-icon>
                <span class="font-bold text-sm">แผงควบคุม</span>
              </a>
              <a routerLink="/admin/routes" routerLinkActive="bg-white/10 text-white" [routerLinkActiveOptions]="{exact: false}" class="flex items-center gap-4 px-5 py-4 rounded-2xl transition-all group hover:bg-white/5">
                <mat-icon [class.text-blue-500]="router.url.includes('/admin/routes')">alt_route</mat-icon>
                <span class="font-bold text-sm">เส้นทางเดินรถ</span>
              </a>
              <a routerLink="/admin/places" routerLinkActive="bg-white/10 text-white" [routerLinkActiveOptions]="{exact: false}" class="flex items-center gap-4 px-5 py-4 rounded-2xl transition-all group hover:bg-white/5">
                <mat-icon [class.text-blue-500]="router.url.includes('/admin/places')">explore</mat-icon>
                <span class="font-bold text-sm">จุดสำคัญ</span>
              </a>
              <a routerLink="/admin/reports" routerLinkActive="bg-white/10 text-white" [routerLinkActiveOptions]="{exact: true}" class="flex items-center gap-4 px-5 py-4 rounded-2xl transition-all group hover:bg-white/5">
                <mat-icon [class.text-blue-500]="router.url === '/admin/reports'">history</mat-icon>
                <span class="font-bold text-sm">บันทึกแจ้งปัญหา</span>
              </a>
              <a routerLink="/admin/logs" routerLinkActive="bg-white/10 text-white" [routerLinkActiveOptions]="{exact: true}" class="flex items-center gap-4 px-5 py-4 rounded-2xl transition-all group hover:bg-white/5">
                <mat-icon [class.text-blue-500]="router.url === '/admin/logs'">dvr</mat-icon>
                <span class="font-bold text-sm">ประวัติระบบ</span>
              </a>
           </nav>
        </div>

        <div class="mt-auto p-8">
           <div class="p-5 rounded-3xl bg-white/5 border border-white/5">
              <p class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">ผู้ใช้งาน</p>
              <p class="font-bold text-sm text-white truncate mb-4">ผู้ดูแลระบบสูงสุด</p>
              <button (click)="logout()" class="w-full py-3 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded-xl font-black text-xs transition-all uppercase tracking-widest">ออกจากระบบ</button>
           </div>
        </div>
      </aside>

      <!-- พื้นที่เนื้อหาหลัก -->
      <main class="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <!-- ส่วนหัว -->
        <header class="bg-white border-b border-slate-200/60 px-8 py-6 shrink-0 z-40">
          <div class="flex justify-between items-center max-w-7xl mx-auto w-full">
            <div class="md:hidden">
              <div class="text-[10px] text-slate-400 uppercase tracking-widest font-black flex items-center gap-1.5">
                 <div class="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div> ระบบส่วนกลาง
              </div>
              <h1 class="text-xl font-black text-slate-900 mt-1 tracking-tight">KORAT TRANSIT</h1>
            </div>
            
            <div class="hidden md:block">
               <h1 class="text-2xl font-black text-slate-900 tracking-tight">ระบบจัดการ <span class="text-blue-500">ประสิทธิภาพ</span></h1>
               <p class="text-xs text-slate-400 font-bold mt-1 uppercase tracking-widest">หน้าบัญชาการข้อมูลแบบเรียลไทม์</p>
            </div>

            <div class="flex items-center gap-3">
              <!-- Desktop Back to Public -->
              <a routerLink="/map" class="hidden md:flex h-11 px-6 rounded-xl bg-slate-50 text-slate-600 font-bold items-center gap-2 hover:bg-slate-900 hover:text-white transition-all border border-slate-200/50 group">
                <mat-icon class="group-hover:rotate-12 transition-transform">exit_to_app</mat-icon>
                <span class="text-sm">กลับหน้าแผนที่</span>
              </a>
              
              <!-- Mobile Back to Public -->
              <a routerLink="/map" class="flex md:hidden w-11 h-11 rounded-xl bg-slate-100 items-center justify-center text-slate-600 hover:bg-slate-900 hover:text-white transition-all">
                <mat-icon>exit_to_app</mat-icon>
              </a>

              <a routerLink="/admin/reports" class="w-11 h-11 rounded-xl bg-slate-100 hover:bg-blue-50 hover:text-blue-600 flex items-center justify-center text-slate-400 relative transition-colors cursor-pointer">
                 <mat-icon class="text-xl">notifications</mat-icon>
                 <div class="absolute top-0 right-0 w-2.5 h-2.5 bg-rose-500 border-2 border-white rounded-full"></div>
              </a>
            </div>
          </div>
        </header>

        <!-- พื้นที่เนื้อหาที่เลื่อนได้ -->
        <div class="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar bg-slate-50/50">
           <div class="max-w-7xl mx-auto w-full pb-24 md:pb-8">
              <router-outlet></router-outlet>
           </div>
        </div>
      </main>

      <!-- แถบนำทางด้านล่างสำหรับมือถือ -->
      <nav class="md:hidden absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-slate-200/50 h-[75px] flex justify-around items-center px-2 z-[999] shadow-[0_-8px_30px_rgba(0,0,0,0.08)] pb-safe">
        <a routerLink="/admin/dashboard" 
           routerLinkActive="text-blue-600 font-black" 
           [routerLinkActiveOptions]="{exact: true}" 
           class="flex flex-col items-center justify-center w-16 text-slate-400 transition-all duration-300">
          <mat-icon [class.text-blue-600]="router.url === '/admin/dashboard'">grid_view</mat-icon>
          <span class="text-[9px] font-black uppercase tracking-tight mt-1 opacity-60" [class.opacity-100]="router.url === '/admin/dashboard'">หน้าแรก</span>
        </a>
        <a routerLink="/admin/routes" 
           routerLinkActive="text-blue-600 font-black" 
           [routerLinkActiveOptions]="{exact: false}" 
           class="flex flex-col items-center justify-center w-16 text-slate-400 transition-all duration-300">
          <mat-icon [class.text-blue-600]="router.url.includes('/admin/routes')">alt_route</mat-icon>
          <span class="text-[9px] font-black uppercase tracking-tight mt-1 opacity-60" [class.opacity-100]="router.url.includes('/admin/routes')">เส้นทาง</span>
        </a>
        <a routerLink="/admin/places" 
           routerLinkActive="text-blue-600 font-black" 
           [routerLinkActiveOptions]="{exact: false}" 
           class="flex flex-col items-center justify-center w-16 text-slate-400 transition-all duration-300">
          <mat-icon [class.text-blue-600]="router.url.includes('/admin/places')">explore</mat-icon>
          <span class="text-[9px] font-black uppercase tracking-tight mt-1 opacity-60" [class.opacity-100]="router.url.includes('/admin/places')">จุดสำคัญ</span>
        </a>
        <a routerLink="/admin/reports" 
           routerLinkActive="text-blue-600 font-black" 
           [routerLinkActiveOptions]="{exact: true}" 
           class="flex flex-col items-center justify-center w-16 text-slate-400 transition-all duration-300">
          <mat-icon [class.text-blue-600]="router.url === '/admin/reports'">history</mat-icon>
          <span class="text-[9px] font-black uppercase tracking-tight mt-1 opacity-60" [class.opacity-100]="router.url === '/admin/reports'">แจ้งปัญหา</span>
        </a>
        <a routerLink="/map" 
           class="flex flex-col items-center justify-center w-16 text-rose-500 transition-all duration-300">
          <mat-icon>exit_to_app</mat-icon>
          <span class="text-[9px] font-black uppercase tracking-tight mt-1">ออก</span>
        </a>
      </nav>
    </div>
  `
})
export class AdminLayoutComponent {
  authService = inject(AuthService);
  router = inject(Router);

  async logout() {
    await this.authService.logout();
    this.router.navigate(['/']);
  }
}
