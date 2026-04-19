import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportService } from '../../services/report.service';
import { RouteService } from '../../services/route.service';
import { ActivityLogService } from '../../services/activity-log.service';
import { MatIconModule } from '@angular/material/icon';
import { Report } from '../../models';

@Component({
  selector: 'app-reports-page',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div class="bg-white p-8 rounded-[24px] border border-slate-100 shadow-sm relative overflow-hidden">
        <h2 class="text-2xl font-black text-slate-900 tracking-tight">รายงานปัญหาและข้อเสนอแนะ</h2>
        <p class="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">รับฟังเสียงจากผู้ใช้งานโครงข่ายรถโดยสาร</p>
      </div>

      <div class="bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm">
            <thead class="bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
              <tr>
                <th class="px-8 py-4 font-black">วันที่แจ้ง</th>
                <th class="px-8 py-4 font-black">สายรถ</th>
                <th class="px-8 py-4 font-black">ประเภท</th>
                <th class="px-8 py-4 font-black">รายละเอียด</th>
                <th class="px-8 py-4 font-black">สถานะ</th>
                <th class="px-8 py-4 font-black text-right">ดำเนินการ</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50">
              @for (report of reportService.reports(); track report.id) {
                <tr class="hover:bg-slate-50 transition-colors">
                  <td class="px-8 py-5 whitespace-nowrap text-slate-500 font-medium">
                    {{ report.createdAt | date:'dd/MM/yyyy HH:mm' }}
                  </td>
                  <td class="px-8 py-5 whitespace-nowrap">
                    <div class="flex items-center gap-2">
                       <div class="w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-xs" [style.backgroundColor]="getRouteColor(report.routeId)">
                          {{ getRouteNumber(report.routeId) }}
                       </div>
                       <span class="font-bold text-slate-900">สาย {{ getRouteNumber(report.routeId) }}</span>
                    </div>
                  </td>
                  <td class="px-8 py-5 whitespace-nowrap">
                    <span class="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-md">{{ translateType(report.type) }}</span>
                  </td>
                  <td class="px-8 py-5">
                    <p class="text-slate-600 line-clamp-1 max-w-xs font-medium" [title]="report.description">{{ report.description }}</p>
                    @if (report.imageURL) {
                      <a [href]="report.imageURL" target="_blank" class="text-blue-600 text-[10px] font-bold flex items-center gap-1 mt-1 hover:underline">
                        <mat-icon class="text-[14px] w-[14px] h-[14px]">image</mat-icon> ดูรูปภาพหลักฐาน
                      </a>
                    }
                  </td>
                  <td class="px-8 py-5 whitespace-nowrap">
                    <div class="flex items-center gap-2">
                      <div class="w-2 h-2 rounded-full"
                           [ngClass]="{
                             'bg-amber-500': report.status === 'pending',
                             'bg-emerald-500': report.status === 'confirmed',
                             'bg-slate-300': report.status === 'rejected'
                           }"></div>
                      <span class="text-[11px] font-black uppercase tracking-widest"
                            [ngClass]="{
                              'text-amber-600': report.status === 'pending',
                              'text-emerald-600': report.status === 'confirmed',
                              'text-slate-400': report.status === 'rejected'
                            }">
                        {{ report.status === 'pending' ? 'รอตรวจสอบ' : (report.status === 'confirmed' ? 'รับเรื่องแล้ว' : 'ปฏิเสธ') }}
                      </span>
                    </div>
                  </td>
                  <td class="px-8 py-5 whitespace-nowrap text-right">
                    @if (report.status === 'pending') {
                      <div class="flex justify-end gap-2">
                        <button (click)="updateStatus(report, 'confirmed')" class="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all">
                          <mat-icon class="text-lg">check</mat-icon>
                        </button>
                        <button (click)="updateStatus(report, 'rejected')" class="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition-all">
                          <mat-icon class="text-lg">close</mat-icon>
                        </button>
                      </div>
                    } @else {
                      <span class="text-[10px] font-bold text-slate-400 italic">ดำเนินการแล้ว</span>
                    }
                  </td>
                </tr>
              }
              @if (reportService.reports().length === 0) {
                <tr>
                  <td colspan="6" class="px-8 py-20 text-center">
                    <div class="flex flex-col items-center justify-center text-slate-300">
                       <mat-icon class="text-6xl mb-4">inbox</mat-icon>
                       <p class="font-bold text-slate-400">ยังไม่มีรายการแจ้งปัญหาในขณะนี้</p>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class ReportsPage {
  reportService = inject(ReportService);
  routeService = inject(RouteService);
  logService = inject(ActivityLogService);

  getRouteNumber(routeId: string): string {
    const route = this.routeService.routes().find(r => r.id === routeId);
    return route ? route.number : '-';
  }

  getRouteColor(routeId: string): string {
    const route = this.routeService.routes().find(r => r.id === routeId);
    return route ? route.color : '#cbd5e1';
  }

  translateType(type: string): string {
    const types: Record<string, string> = {
      'delay': 'ดีเลย์ / มาช้า',
      'damage': 'รถชำรุด',
      'driver': 'มารยาทพนักงาน',
      'other': 'อื่นๆ'
    };
    return types[type] || type;
  }

  async updateStatus(report: Report, status: 'confirmed' | 'rejected') {
    if (!report.id) return;
    
    let note = '';
    if (status === 'rejected') {
      note = prompt('ระบุเหตุผลที่ปฏิเสธ (ถ้ามี):') || '';
    }

    await this.reportService.updateReportStatus(report.id, status, note);
    await this.logService.logAction('UPDATE_REPORT', `อัปเดตสถานะรายงาน ${report.id} เป็น ${status}`);
  }
}
