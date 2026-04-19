import { Component, inject, ElementRef, ViewChild, AfterViewInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { animate, stagger } from 'motion';

@Component({
  selector: 'app-onboarding-page',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="h-[100dvh] w-full flex flex-col relative overflow-hidden bg-slate-50">
      
      <!-- Modern Transit Header Graphic -->
      <div class="absolute top-0 left-0 w-full h-[55%] bg-blue-600 z-0 shadow-lg" style="clip-path: polygon(0 0, 100% 0, 100% 85%, 0 100%);">
        <div class="absolute inset-0 opacity-20 pointer-events-none" style="background-image: radial-gradient(circle at top left, rgba(255,255,255,0.4) 0%, transparent 60%), radial-gradient(circle at bottom right, rgba(0,0,0,0.2) 0%, transparent 50%); mix-blend-mode: overlay;"></div>
      </div>

      <div class="flex-1 flex flex-col items-center justify-center px-6 sm:px-8 text-center pt-8 z-10">
        <!-- Logo / Icon -->
        <div #heroIcon class="w-40 h-40 bg-white rounded-[2.5rem] shadow-[0_20px_40px_rgba(37,99,235,0.25)] flex flex-col items-center justify-center mb-10 relative border border-slate-100 overflow-hidden">
          <div class="absolute inset-0 bg-blue-50"></div>
          <mat-icon class="text-blue-600 drop-shadow-sm mb-[-5px] relative z-10" style="font-size: 64px; width: 64px; height: 64px;">directions_bus</mat-icon>
          <h2 class="text-4xl font-black text-blue-900 tracking-tight mt-1 relative z-10">KORAT</h2>
        </div>
        
        <div #textContent>
          <h1 class="text-3xl font-black text-slate-900 mb-3 tracking-tight">เดินทางสะดวก ไม่หลงทาง</h1>
          <p class="text-slate-500 text-base mb-8 leading-relaxed max-w-sm mx-auto font-medium">
            ค้นหาเส้นทาง แวะจุดจอด และดูข้อมูลสายรถสองแถวในโคราชได้อย่างแม่นยำ
          </p>
        </div>

        <div #featuresList class="w-full space-y-4 text-left max-w-sm mx-auto z-10 relative">
          <div class="feature-item flex items-center p-4 bg-white rounded-[1.5rem] shadow-sm border border-slate-100">
            <div class="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mr-4 shrink-0">
              <mat-icon>map</mat-icon>
            </div>
            <div>
              <h3 class="font-bold text-slate-800 text-[17px]">แผนที่แม่นยำ 100%</h3>
              <p class="text-sm text-slate-500 font-medium mt-0.5">อิงถนนจริง คำนวณโค้งตามเส้นทาง</p>
            </div>
          </div>
          <div class="feature-item flex items-center p-4 bg-white rounded-[1.5rem] shadow-sm border border-slate-100">
            <div class="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mr-4 shrink-0">
              <mat-icon>near_me</mat-icon>
            </div>
            <div>
              <h3 class="font-bold text-slate-800 text-[17px]">ค้นหาสายรถรวดเร็ว</h3>
              <p class="text-sm text-slate-500 font-medium mt-0.5">ใช้งานบนมือถือได้ลื่นไหล</p>
            </div>
          </div>
        </div>
      </div>

      <div #actionBtn class="p-6 pb-12 z-10 w-full max-w-md mx-auto pt-6">
        <button (click)="start()" class="group relative w-full flex justify-center py-4 px-4 rounded-full shadow-[0_10px_20px_rgba(37,99,235,0.25)] text-lg font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all hover:scale-[1.02] active:scale-[0.98]">
          เริ่มใช้งาน
        </button>
      </div>
    </div>
  `
})
export class OnboardingPage implements AfterViewInit {
  router = inject(Router);
  platformId = inject(PLATFORM_ID);

  @ViewChild('heroIcon') heroIcon!: ElementRef;
  @ViewChild('textContent') textContent!: ElementRef;
  @ViewChild('featuresList') featuresList!: ElementRef;
  @ViewChild('actionBtn') actionBtn!: ElementRef;

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      if (this.heroIcon?.nativeElement) {
        animate(
          this.heroIcon.nativeElement,
          { opacity: [0, 1], scale: [0.8, 1], y: [30, 0] },
          { duration: 0.8, ease: "backOut" }
        );
      }

      if (this.textContent?.nativeElement) {
        animate(
          this.textContent.nativeElement,
          { opacity: [0, 1], y: [20, 0] },
          { duration: 0.6, delay: 0.2, ease: 'easeOut' }
        );
      }

      if (this.featuresList?.nativeElement) {
        const featureItems = this.featuresList.nativeElement.querySelectorAll('.feature-item');
        if (featureItems && featureItems.length > 0) {
          animate(
            featureItems,
            { opacity: [0, 1], x: [-20, 0] },
            { duration: 0.5, delay: stagger(0.15, { startDelay: 0.4 }), ease: 'easeOut' }
          );
        }
      }

      if (this.actionBtn?.nativeElement) {
        animate(
          this.actionBtn.nativeElement,
          { opacity: [0, 1], y: [20, 0] },
          { duration: 0.6, delay: 0.8, ease: "backOut" }
        );
      }
    }
  }

  start() {
    localStorage.setItem('korat_boarded', 'true');
    this.router.navigate(['/map']);
  }
}