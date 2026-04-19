import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  template: `
    <!-- Main Container -->
    <div class="min-h-[100dvh] flex flex-col items-center justify-center bg-slate-50 relative overflow-hidden w-full px-6">
      
      <!-- Top Graphic Simplified -->
      <div class="absolute top-0 left-0 w-full h-[50%] bg-slate-900 z-0" style="clip-path: polygon(0 0, 100% 0, 100% 80%, 0 100%);">
      </div>

      <div class="relative z-10 w-full max-w-sm flex flex-col items-center">
        <!-- Logo -->
        <div class="flex flex-col items-center mb-12 w-32 h-32 bg-white rounded-[32px] shadow-2xl justify-center border border-slate-100 overflow-hidden">
          <div class="text-indigo-600 mb-[-4px]">
             <mat-icon style="font-size: 56px; width: 56px; height: 56px;">airport_shuttle</mat-icon>
          </div>
          <h1 class="text-2xl font-black text-slate-900 tracking-tighter">KORAT</h1>
        </div>

        <div class="w-full bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
          <h2 class="text-xl font-black text-slate-900 mb-2 text-center">เข้าสู่ระบบจัดการ</h2>
          <p class="text-xs font-bold text-slate-400 text-center mb-8 uppercase tracking-widest">Admin Control Center</p>

          <form class="space-y-4" (ngSubmit)="login()">
            <div>
              <label for="email" class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">ชื่อผู้ใช้งาน</label>
              <input id="email" name="email" type="email" required [(ngModel)]="email" 
                class="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600/10 focus:bg-white transition-all font-bold" 
                placeholder="Username">
            </div>
            <div>
              <label for="password" class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">รหัสผ่าน</label>
              <input id="password" name="password" type="password" required [(ngModel)]="password" 
                class="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600/10 focus:bg-white transition-all font-bold" 
                placeholder="••••••••">
            </div>

            @if (errorMsg()) {
              <div class="text-rose-600 text-[11px] text-center bg-rose-50 p-3 rounded-xl border border-rose-100 font-bold animate-in fade-in slide-in-from-top-1">
                {{ errorMsg() }}
              </div>
            }

            <div class="pt-4">
              <button type="submit" [disabled]="isLoading()" 
                class="flex justify-center items-center w-full py-4 px-8 rounded-2xl shadow-xl shadow-indigo-600/10 text-lg font-black text-white bg-indigo-600 hover:bg-slate-900 focus:outline-none disabled:opacity-50 transition-all active:scale-[0.98]">
                 @if (isLoading()) {
                   <mat-icon class="animate-spin text-[28px] w-[28px] h-[28px]">refresh</mat-icon>
                 } @else {
                   ลงชื่อเข้าใช้งาน
                 }
              </button>
            </div>
          </form>
        </div>

        <p class="mt-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Digital Korat Transport Network</p>
      </div>
    </div>
  `
})
export class LoginPage {
  authService = inject(AuthService);
  router = inject(Router);
  
  email = '';
  password = '';
  isLoading = signal(false);
  errorMsg = signal('');

  async login() {
    if (!this.email || !this.password) return;
    
    this.isLoading.set(true);
    this.errorMsg.set('');
    
    try {
      await this.authService.login(this.email, this.password);
      this.router.navigate(['/admin/dashboard']);
    } catch (error: unknown) {
      this.errorMsg.set('ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง');
      console.error(error);
    } finally {
      this.isLoading.set(false);
    }
  }
}
