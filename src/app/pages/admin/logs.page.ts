import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivityLogService } from '../../services/activity-log.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-logs-page',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div class="bg-white p-8 rounded-[24px] border border-slate-100 shadow-sm relative overflow-hidden">
        <h2 class="text-2xl font-black text-slate-900 tracking-tight">ประวัติการใช้งานระบบ</h2>
        <p class="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">บันทึกกิจกรรมทั้งหมดที่เกิดขึ้นโดยผู้ดูแลระบบ</p>
      </div>

      <div class="bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm">
            <thead class="bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
              <tr>
                <th class="px-8 py-4 font-black">วันเวลา</th>
                <th class="px-8 py-4 font-black">การดำเนินการ</th>
                <th class="px-8 py-4 font-black">รายละเอียด</th>
                <th class="px-8 py-4 font-black text-right">รหัสผู้ดูแล</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50">
              @for (log of logService.logs(); track log.id) {
                <tr class="hover:bg-slate-50 transition-colors">
                  <td class="px-8 py-5 whitespace-nowrap text-slate-500 font-medium font-mono text-xs">
                    {{ log.timestamp | date:'dd/MM/yyyy HH:mm:ss' }}
                  </td>
                  <td class="px-8 py-5 whitespace-nowrap">
                    <span class="text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-md bg-indigo-50 text-indigo-600 border border-indigo-100">
                      {{ translateAction(log.action) }}
                    </span>
                  </td>
                  <td class="px-8 py-5 text-slate-700 font-medium">{{ log.detail }}</td>
                  <td class="px-8 py-5 whitespace-nowrap text-right text-[10px] text-slate-400 font-mono">{{ log.adminId }}</td>
                </tr>
              }
              @if (logService.logs().length === 0) {
                <tr>
                  <td colspan="4" class="px-8 py-20 text-center">
                    <div class="flex flex-col items-center justify-center text-slate-300">
                       <mat-icon class="text-6xl mb-4">history_toggle_off</mat-icon>
                       <p class="font-bold text-slate-400">ไม่มีประวัติการใช้งานในระบบ</p>
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
export class LogsPage {
  logService = inject(ActivityLogService);

  translateAction(action: string): string {
    const actions: Record<string, string> = {
      'LOGIN': 'เข้าสู่ระบบ',
      'LOGOUT': 'ออกจากระบบ',
      'CREATE_ROUTE': 'สร้างเส้นทาง',
      'UPDATE_ROUTE': 'แก้ไขเส้นทาง',
      'DELETE_ROUTE': 'ลบเส้นทาง',
      'CREATE_PLACE': 'สร้างสถานที่',
      'UPDATE_PLACE': 'แก้ไขสถานที่',
      'DELETE_PLACE': 'ลบสถานที่',
      'UPDATE_REPORT': 'อัปเดตรายงาน'
    };
    return actions[action] || action;
  }
}
