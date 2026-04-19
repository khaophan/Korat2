import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouteService } from '../../services/route.service';
import { ReportService } from '../../services/report.service';
import { PlaceService } from '../../services/place.service';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CommonModule, MatIconModule, RouterLink],
  template: `
    <div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      <!-- ตัวเลขสถิติที่สำคัญ -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="bg-white p-8 rounded-[24px] border border-slate-100 shadow-sm relative overflow-hidden">
          <div class="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6">
            <mat-icon class="text-2xl">directions_bus</mat-icon>
          </div>
          <div>
            <div class="text-4xl font-black text-slate-900 tracking-tighter">{{ totalRoutes() }}</div>
            <div class="text-[11px] font-black text-slate-400 uppercase tracking-widest mt-2">สายรถที่ให้บริการ</div>
          </div>
        </div>

        <div class="bg-white p-8 rounded-[24px] border border-slate-100 shadow-sm relative overflow-hidden">
          <div class="w-12 h-12 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center mb-6">
            <mat-icon class="text-2xl">pending_actions</mat-icon>
          </div>
          <div>
            <div class="text-4xl font-black tracking-tighter" [class.text-amber-500]="pendingReports() > 0" [class.text-slate-900]="pendingReports() === 0">
              {{ pendingReports() }}
            </div>
            <div class="text-[11px] font-black text-slate-400 uppercase tracking-widest mt-2">รายงานที่รอตรวจสอบ</div>
          </div>
        </div>

        <div class="bg-white p-8 rounded-[24px] border border-slate-100 shadow-sm relative overflow-hidden">
          <div class="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-6">
            <mat-icon class="text-2xl">share_location</mat-icon>
          </div>
          <div>
            <div class="text-4xl font-black text-slate-900 tracking-tighter">{{ totalPlaces() }}</div>
            <div class="text-[11px] font-black text-slate-400 uppercase tracking-widest mt-2">จุดสำคัญบนแผนที่</div>
          </div>
        </div>

        <div class="bg-slate-900 p-8 rounded-[24px] shadow-sm flex flex-col justify-end text-white">
          <div class="flex items-center gap-2 mb-4">
             <div class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
             <span class="text-[10px] font-black uppercase tracking-widest text-emerald-400">ระบบสถานะปกติ</span>
          </div>
          <div class="text-2xl font-black tracking-tighter">ออนไลน์</div>
          <div class="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">เชื่อมต่อฐานข้อมูลเรียลไทม์</div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <!-- จัดการข้อมูลด่วน -->
        <div class="lg:col-span-2 space-y-8">
          <div class="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100">
            <div class="mb-6">
               <h3 class="text-lg font-black text-slate-900 tracking-tight">จัดการข้อมูล</h3>
               <p class="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">เพิ่มข้อมูลใหม่เข้าระบบ</p>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <a routerLink="/admin/routes/edit/new" class="flex items-center gap-4 p-5 bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 rounded-2xl transition-all font-bold border border-transparent hover:border-blue-100 active:scale-[0.98]">
                <div class="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-blue-600">
                  <mat-icon>add_road</mat-icon>
                </div>
                <span>เพิ่มสายรถใหม่</span>
              </a>
              <a routerLink="/admin/places/edit/new" class="flex items-center gap-4 p-5 bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 rounded-2xl transition-all font-bold border border-transparent hover:border-indigo-100 active:scale-[0.98]">
                <div class="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-indigo-600">
                  <mat-icon>add_location_alt</mat-icon>
                </div>
                <span>เพิ่มจุดสำคัญใหม่</span>
              </a>
            </div>
          </div>

          <!-- รายการสายรถล่าสุด -->
          <div class="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100">
             <div class="flex justify-between items-start mb-6">
                <div>
                   <h3 class="text-lg font-black text-slate-900 tracking-tight">สายรถล่าสุด</h3>
                   <p class="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">สถานะการให้บริการปัจจุบัน</p>
                </div>
                <a routerLink="/admin/routes" class="text-xs font-bold text-blue-600 hover:underline">ดูทั้งหมด</a>
             </div>
             <div class="grid gap-3">
                @for (route of routeService.routes().slice(0, 4); track route.id) {
                   <div class="flex items-center gap-4 p-4 rounded-2xl bg-slate-50/50 hover:bg-white border border-transparent hover:border-slate-100 transition-all">
                      <div class="w-12 h-12 rounded-xl flex items-center justify-center font-black text-white shadow-sm" [style.backgroundColor]="route.color">
                         {{ route.number }}
                      </div>
                      <div class="flex-1 min-w-0">
                         <div class="text-sm font-black text-slate-900 truncate">{{ route.name }}</div>
                         <div class="flex items-center gap-2 mt-1">
                            <div class="w-1.5 h-1.5 rounded-full" [class.bg-emerald-500]="route.isActive" [class.bg-slate-300]="!route.isActive"></div>
                            <span class="text-[10px] font-black uppercase tracking-widest text-slate-400">{{ route.isActive ? 'เปิดไห้บริการ' : 'ปิดชั่วคราว' }}</span>
                         </div>
                      </div>
                      <a [routerLink]="['/admin/routes/edit', route.id]" class="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-blue-600">
                         <mat-icon class="text-lg">edit</mat-icon>
                      </a>
                   </div>
                }
             </div>
          </div>
        </div>

        <!-- กล่องแจ้งเตือน/ข้อมูลระบบ -->
        <div class="space-y-6">
           <div class="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm">
              <h4 class="text-xs font-black text-slate-900 uppercase tracking-widest mb-6">ความเคลื่อนไหวระบบ</h4>
              <div class="space-y-4">
                 <div class="p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                    <p class="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">การตรวจสุขภาพ</p>
                    <p class="text-xs font-bold text-slate-700 leading-relaxed">สถาปัตยกรรมข้อมูลทำงานได้ดีเยี่ยม พร้อมรองรับผู้ใช้งานจำนวนมาก</p>
                 </div>
                 <div class="p-4 bg-amber-50/50 rounded-2xl border border-amber-100">
                    <p class="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">สิ่งสำคัญ</p>
                    <p class="text-xs font-bold text-slate-700 leading-relaxed">มีจำนวน {{ pendingReports() }} รายการที่รอการตรวจสอบความถูกต้อง</p>
                 </div>
              </div>
              <button routerLink="/admin/reports" class="w-full mt-6 py-3.5 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-600 transition-all">จัดการปัญหา</button>
           </div>
        </div>
      </div>
    </div>
  `
})
export class DashboardPage {
  routeService = inject(RouteService);
  reportService = inject(ReportService);
  placeService = inject(PlaceService);

  totalRoutes = computed(() => this.routeService.routes().length);
  totalReports = computed(() => this.reportService.reports().length);
  totalPlaces = computed(() => this.placeService.places().length);
  pendingReports = computed(() => this.reportService.reports().filter(r => r.status === 'pending').length);
}
