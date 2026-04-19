import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { RouteService } from '../../services/route.service';
import { ActivityLogService } from '../../services/activity-log.service';
import { MatIconModule } from '@angular/material/icon';
import { Route } from '../../models';

@Component({
  selector: 'app-routes-page',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule],
  template: `
    <div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-8 rounded-[24px] border border-slate-100 shadow-sm relative overflow-hidden">
        <div class="relative z-10">
          <h2 class="text-2xl font-black text-slate-900 tracking-tight">ศูนย์รวมเส้นทางเดินรถ</h2>
          <p class="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">จัดการข้อมูลโครงข่ายรถโดยสาร</p>
        </div>
        <a routerLink="/admin/routes/edit/new" class="flex items-center gap-3 px-6 py-3.5 bg-slate-900 text-white font-black rounded-2xl hover:bg-blue-600 transition-all active:scale-[0.98] relative z-10 text-xs uppercase tracking-widest">
          <mat-icon class="text-lg">add_road</mat-icon>
          เพิ่มเส้นทางใหม่
        </a>
      </div>

      <div class="grid grid-cols-1 gap-4">
        @for (route of routeService.routes(); track route.id) {
          <div class="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row items-center gap-6 hover:border-blue-100 transition-all border-l-[6px]" [style.borderLeftColor]="route.color">
            <div class="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 font-black text-white text-2xl shadow-sm transition-transform" [style.backgroundColor]="route.color">
              {{ route.number }}
            </div>
            
            <div class="flex-1 min-w-0 text-center md:text-left">
              <div class="flex flex-col md:flex-row md:items-center gap-3 mb-2">
                <h3 class="font-black text-lg text-slate-900 truncate tracking-tight">{{ route.name }}</h3>
                <div class="flex justify-center md:justify-start">
                  <button (click)="toggleStatus(route)" class="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest shrink-0 transition-all border" [class]="route.isActive ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-200'">
                    {{ route.isActive ? 'เปิดให้บริการ' : 'ปิดชั่วคราว' }}
                  </button>
                </div>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
                 <div class="flex items-center justify-center md:justify-start gap-2">
                    <span class="text-[10px] font-black text-slate-400 uppercase tracking-wider">ต้นทาง:</span>
                    <span class="text-xs font-bold text-slate-600 truncate">{{ route.origin }}</span>
                 </div>
                 <div class="flex items-center justify-center md:justify-start gap-2">
                    <span class="text-[10px] font-black text-slate-400 uppercase tracking-wider">ปลายทาง:</span>
                    <span class="text-xs font-bold text-slate-600 truncate">{{ route.destination }}</span>
                 </div>
              </div>
            </div>

            <div class="flex items-center gap-2 shrink-0 pt-4 md:pt-0 border-t md:border-t-0 md:border-l border-slate-100 md:pl-6">
              <a [routerLink]="['/admin/routes/edit', route.id]" class="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all">
                <mat-icon class="text-lg">edit</mat-icon>
              </a>
              <button (click)="confirmDelete(route)" class="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all">
                <mat-icon class="text-lg">delete</mat-icon>
              </button>
            </div>
          </div>
        }
        
        @if (routeService.routes().length === 0) {
          <div class="bg-white rounded-[32px] p-20 border border-dashed border-slate-200 text-center flex flex-col items-center justify-center text-slate-400">
            <div class="w-20 h-20 bg-slate-50 flex items-center justify-center rounded-3xl text-slate-300 mb-6 font-bold">
               <mat-icon class="text-4xl">route</mat-icon>
            </div>
            <div class="font-black text-lg text-slate-900 mb-2 tracking-tight">ยังไม่มีเส้นทางเดินรถ</div>
            <p class="text-sm font-bold text-slate-400 mb-8 max-w-xs">เริ่มสร้างเครือข่ายรถโดยสารของคุณโดยการเพิ่มสายรถแรกในระบบ</p>
            <a routerLink="/admin/routes/edit/new" class="px-8 py-3.5 bg-blue-600 text-white font-black rounded-2xl shadow-sm hover:bg-blue-700 transition-all flex items-center gap-3">
              <mat-icon>add_circle</mat-icon>
              เริ่มต้นเพิ่มข้อมูล
            </a>
          </div>
        }
      </div>

      <!-- กล่องยืนยันการลบแบบมืออาชีพ -->
      @if (routeToDelete()) {
        <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[500] p-4">
          <div class="bg-white rounded-[32px] p-10 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <div class="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mb-6">
              <mat-icon class="text-3xl">warning_amber</mat-icon>
            </div>
            <h3 class="text-xl font-black text-slate-900 mb-2 tracking-tight">ยืนยันการลบข้อมูล?</h3>
            <p class="text-sm font-bold text-slate-500 mb-8 leading-relaxed">
              คุณแน่ใจหรือไม่ที่จะลบ <span class="text-slate-900">สายรถ {{ routeToDelete()?.number }}</span> ออกจากระบบ? การดำเนินการนี้ไม่สามารถย้อนคืนได้
            </p>
            <div class="flex flex-col sm:flex-row gap-3">
               <button (click)="executeDelete()" class="order-1 sm:order-2 flex-1 py-3.5 bg-rose-600 text-white font-black rounded-xl hover:bg-rose-700 transition-all active:scale-95 shadow-sm text-xs uppercase tracking-widest">ยืนยันการลบ</button>
               <button (click)="cancelDelete()" class="order-2 sm:order-1 flex-1 py-3.5 text-slate-600 font-black bg-slate-100 hover:bg-slate-200 rounded-xl transition-all active:scale-95 text-xs uppercase tracking-widest">ยกเลิก</button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class RoutesPage {
  routeService = inject(RouteService);
  logService = inject(ActivityLogService);
  
  routeToDelete = signal<Route | null>(null);

  async toggleStatus(route: Route) {
    if (!route.id) return;
    const newStatus = !route.isActive;
    await this.routeService.updateRoute(route.id, { isActive: newStatus });
    await this.logService.logAction('UPDATE_ROUTE_STATUS', `เปลี่ยนสถานะสาย ${route.number} เป็น ${newStatus ? 'เปิด' : 'ซ่อน'}`);
  }

  confirmDelete(route: Route) {
    this.routeToDelete.set(route);
  }

  cancelDelete() {
    this.routeToDelete.set(null);
  }

  async executeDelete() {
    const route = this.routeToDelete();
    if (!route || !route.id) return;
    
    await this.routeService.deleteRoute(route.id);
    await this.logService.logAction('DELETE_ROUTE', `ลบสาย ${route.number}`);
    this.routeToDelete.set(null);
  }
}
