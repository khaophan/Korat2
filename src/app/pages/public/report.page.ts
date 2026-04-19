import { Component, inject, signal, OnInit, OnDestroy, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { RouteService } from '../../services/route.service';
import { ReportService } from '../../services/report.service';
import { storage } from '../../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

@Component({
  selector: 'app-report-page',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  template: `
    <div class="min-h-[100dvh] bg-slate-50 relative pb-20">
      <!-- Fixed Header -->
      <div class="sticky top-0 z-50 bg-slate-900 pt-safe px-6 py-4 flex items-center justify-between shadow-lg">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg">
            <mat-icon class="text-2xl">report_problem</mat-icon>
          </div>
          <div>
            <h1 class="text-xl font-black text-white tracking-tighter leading-none">รายงานปัญหา</h1>
            <span class="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Contact & Feedback</span>
          </div>
        </div>
        <button (click)="submitReport()" [disabled]="isSubmitting() || !reportData.type || !reportData.routeId || !reportData.description" class="px-5 py-2.5 bg-indigo-600 text-white font-black rounded-xl shadow-sm hover:bg-indigo-500 active:scale-95 transition-all disabled:opacity-50 text-xs">
          {{ isSubmitting() ? 'ส่งข้อมูล...' : 'ส่งรายงาน' }}
        </button>
      </div>

      <div class="max-w-2xl mx-auto p-6 space-y-6">
        @if (isSubmitted()) {
          <div class="bg-white rounded-[32px] p-12 shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-500 my-10">
            <div class="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-[28px] flex items-center justify-center mb-6">
              <mat-icon class="text-5xl">check_circle</mat-icon>
            </div>
            <h2 class="text-2xl font-black text-slate-900 mb-2 tracking-tight">ได้รับข้อมูลเรียบร้อย</h2>
            <p class="text-[13px] font-bold text-slate-400 mb-10 max-w-[280px]">ขอบคุณที่ช่วยแจ้งข้อมูล เราจะนำไปปรับปรุงระบบการให้บริการรถสองแถวให้ดียิ่งขึ้น</p>
            <button (click)="resetForm()" class="px-10 py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 transition-all flex items-center gap-2 group shadow-xl shadow-slate-200">
               กลับสู่หน้าก่อนหน้า
               <mat-icon class="group-hover:translate-x-1 transition-transform">arrow_forward</mat-icon>
            </button>
          </div>
        } @else {
          <div class="space-y-6">
             <div class="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                
                <!-- Section: Type & Route -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label for="reportType" class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">หัวข้อปัญหา <span class="text-rose-500">*</span></label>
                    <div class="relative">
                      <select id="reportType" [(ngModel)]="reportData.type" name="type" required class="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-slate-900 font-bold focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all appearance-none cursor-pointer">
                        <option value="">-- เลือกหัวข้อ --</option>
                        <option value="สายรถหยุดให้บริการแล้ว">สายรถไม่วิ่งแล้ว</option>
                        <option value="เส้นทางเปลี่ยนแปลง">เส้นทางมีการเปลี่ยนแปลง</option>
                        <option value="จุดจอดไม่ให้บริการแล้ว">จุดจอดใช้งานไม่ได้</option>
                        <option value="ข้อมูลสีหรือหมายเลขสายผิด">ข้อมูลสายรถ/สีรถผิด</option>
                        <option value="ข้อเสนอแนะอื่น ๆ">ข้อเสนอแนะอื่น ๆ</option>
                      </select>
                      <mat-icon class="absolute right-3 top-3.5 text-slate-400 pointer-events-none">expand_more</mat-icon>
                    </div>
                  </div>
                  <div>
                    <label for="reportRoute" class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">เลือกสายรถที่พบปัญหา <span class="text-rose-500">*</span></label>
                    <div class="relative">
                      <select id="reportRoute" [(ngModel)]="reportData.routeId" name="routeId" required class="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-slate-900 font-bold focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all appearance-none cursor-pointer">
                        <option value="">-- เลือกสายรถ --</option>
                        @for (route of routeService.routes(); track route.id) {
                          <option [value]="route.id">สาย {{ route.number }} - {{ route.name }}</option>
                        }
                      </select>
                      <mat-icon class="absolute right-3 top-3.5 text-slate-400 pointer-events-none">expand_more</mat-icon>
                    </div>
                  </div>
                </div>

                <!-- Section: Description -->
                <div>
                  <label for="reportDescription" class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">รายละเอียดสิ่งที่พบ <span class="text-rose-500">*</span></label>
                  <textarea id="reportDescription" [(ngModel)]="reportData.description" name="description" required rows="4" class="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-xl text-slate-700 font-medium focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all resize-none" placeholder="บอกรายละเอียดปัญหาให้เราทราบบ้าง..."></textarea>
                </div>

                <!-- Section: Waypoint Selection -->
                <div>
                  <label for="reportWaypoint" class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">จุดจอดที่พบปัญหา <span class="text-rose-500">*</span></label>
                  <div class="relative">
                    <select id="reportWaypoint" [(ngModel)]="reportData.waypoint" name="waypoint" required class="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-slate-900 font-bold focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all appearance-none cursor-pointer" [disabled]="!reportData.routeId">
                      <option value="">-- เลือกจุดจอด --</option>
                      @if (reportData.routeId) {
                        @for (route of routeService.routes(); track route.id) {
                          @if (route.id === reportData.routeId) {
                            @for (wp of route.waypoints; track wp.name) {
                              <option [value]="wp.name">{{ wp.name }}</option>
                            }
                          }
                        }
                      }
                    </select>
                    <mat-icon class="absolute right-3 top-3.5 text-slate-400 pointer-events-none">expand_more</mat-icon>
                  </div>
                </div>

                <!-- Section: Image -->
                <div>
                   <label for="reportFile" class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">แนบรูปภาพหลักฐาน (ถ้ามี)</label>
                   <div class="relative group">
                     <input id="reportFile" type="file" (change)="onFileSelected($event)" accept="image/*" class="sr-only">
                     <label for="reportFile" class="w-full flex items-center gap-4 px-6 py-4 bg-slate-50 border border-dashed border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100 hover:border-indigo-300 transition-all">
                        <div class="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-indigo-600 shadow-sm transition-colors">
                           <mat-icon>{{ selectedFile ? 'collections' : 'add_a_photo' }}</mat-icon>
                        </div>
                        <div>
                          <p class="text-[13px] font-bold text-slate-600">{{ selectedFile ? selectedFile.name : 'เลือกรูปภาพถาพถ่าย' }}</p>
                          <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{{ selectedFile ? 'เปลี่ยนรูปภาพ' : 'รองรับไฟล์ภาพทุกนามสกุล' }}</p>
                        </div>
                     </label>
                   </div>
                </div>

             </div>

             <div class="bg-indigo-50 p-6 rounded-[24px] border border-indigo-100 flex items-start gap-4">
               <div class="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                 <mat-icon>info</mat-icon>
               </div>
               <div class="flex-1">
                 <h4 class="text-sm font-black text-indigo-900 mb-1">ความสำคัญของการรายงาน</h4>
                 <p class="text-[11px] font-bold text-indigo-600/80 leading-relaxed uppercase tracking-tight">ข้อมูลของคุณจะถูกส่งตรงไปยังหน่วยงานบริหารจัดการ เพื่อทำการตรวจสอบและแก้ไขพิกัดให้เป็นปัจจุบันมากยิ่งขึ้น</p>
               </div>
             </div>
          </div>
        }
      </div></div>
  `
})
export class ReportPage implements OnInit, OnDestroy {
  
  routeService = inject(RouteService);
  reportService = inject(ReportService);
  platformId = inject(PLATFORM_ID);
  
  isSubmitting = signal(false);
  isSubmitted = signal(false);
  selectedFile: File | null = null;
  
  reportData = {
    type: '',
    routeId: '',
    waypoint: '',
    description: ''
  };

  ngOnInit() {}
  
  onFileSelected(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  async submitReport() {
    if (!this.reportData.type || !this.reportData.routeId || !this.reportData.description) return;
    
    this.isSubmitting.set(true);
    try {
      let imageURL = '';
      if (this.selectedFile) {
        const fileRef = ref(storage, `reports/${Date.now()}_${this.selectedFile.name}`);
        await uploadBytes(fileRef, this.selectedFile);
        imageURL = await getDownloadURL(fileRef);
      }

      await this.reportService.addReport({
        ...this.reportData,
        position: null,
        imageURL,
        status: 'pending'
      });
      
      this.isSubmitted.set(true);
    } catch (error) {
      console.error('Error submitting report:', error);
      alert('เกิดข้อผิดพลาดในการส่งรายงาน กรุณาลองใหม่อีกครั้ง');
    } finally {
      this.isSubmitting.set(false);
    }
  }

  resetForm() {
    this.reportData = { type: '', routeId: '', waypoint: '', description: '' };
    this.selectedFile = null;
    this.isSubmitted.set(false);
  }

  ngOnDestroy() {}
}
