import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlaceService } from '../../services/place.service';
import { ActivityLogService } from '../../services/activity-log.service';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { Place } from '../../models';

@Component({
  selector: 'app-places-page',
  standalone: true,
  imports: [CommonModule, MatIconModule, RouterLink],
  template: `
    <div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-8 rounded-[24px] border border-slate-100 shadow-sm relative overflow-hidden">
        <div class="relative z-10">
          <h2 class="text-2xl font-black text-slate-900 tracking-tight">จุดสำคัญบนแผนที่</h2>
          <p class="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">จัดการตำแหน่งสถานที่ที่น่าสนใจ</p>
        </div>
        <a routerLink="/admin/places/edit/new" class="flex items-center gap-3 px-6 py-3.5 bg-indigo-600 text-white font-black rounded-2xl hover:bg-slate-900 transition-all active:scale-[0.98] relative z-10 text-xs uppercase tracking-widest">
          <mat-icon class="text-lg">add_location_alt</mat-icon>
          เพิ่มจุดใหม่
        </a>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        @for (place of placeService.places(); track place.id) {
          <div class="bg-white rounded-[24px] p-8 shadow-sm border border-slate-100 flex flex-col hover:border-indigo-100 transition-all group">
            
            <div class="flex justify-between items-start mb-6">
              <div class="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <mat-icon class="text-2xl">{{ place.icon || 'place' }}</mat-icon>
              </div>
              <div class="px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all border shadow-sm" [class]="place.isActive ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-100 text-slate-400 border-transparent'">
                {{ place.isActive ? 'แสดงผล' : 'ซ่อนอยู่' }}
              </div>
            </div>

            <div class="flex-1 min-w-0">
              <h3 class="font-black text-lg text-slate-900 truncate tracking-tight mb-2">{{ place.name }}</h3>
              <p class="text-[11px] text-slate-400 font-bold leading-relaxed line-clamp-2 min-h-[3em]">{{ place.description || 'ไม่มีคำอธิบายสำหรับสถานที่นี้' }}</p>
            </div>
            
            <div class="flex items-center gap-2 mt-8 pt-6 border-t border-slate-50">
              <a [routerLink]="['/admin/places/edit', place.id]" class="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-50 text-slate-600 font-bold rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-all text-[10px] uppercase tracking-widest">
                <mat-icon class="text-lg">edit</mat-icon>
                แก้ไข
              </a>
              <button (click)="confirmDelete(place)" class="w-11 h-11 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all active:scale-95">
                <mat-icon class="text-lg" [class.text-rose-500]="placeToDelete()?.id === place.id">delete</mat-icon>
              </button>
            </div>
          </div>
        }
        
        @if (placeService.places().length === 0) {
          <div class="sm:col-span-2 lg:col-span-3 bg-white rounded-[32px] p-20 border border-dashed border-slate-200 text-center flex flex-col items-center justify-center text-slate-400">
            <div class="w-20 h-20 bg-slate-50 flex items-center justify-center rounded-3xl text-slate-300 mb-6">
              <mat-icon class="text-4xl">location_off</mat-icon>
            </div>
            <div class="font-black text-lg text-slate-900 mb-2 tracking-tight">ยังไม่มีข้อมูลจุดสำคัญ</div>
            <p class="text-sm font-bold text-slate-400 mb-8 max-w-xs">เพิ่มจุดที่น่าสนใจเพื่อให้ผู้ใช้งานระบุตำแหน่งได้ง่ายขึ้น</p>
            <a routerLink="/admin/places/edit/new" class="px-8 py-3.5 bg-indigo-600 text-white font-black rounded-2xl shadow-sm hover:bg-slate-900 transition-all flex items-center gap-3">
              <mat-icon>add_location_alt</mat-icon>
              เริ่มบันทึกจุดแรก
            </a>
          </div>
        }
      </div>

      <!-- กล่องยืนยันการลบแบบมืออาชีพ -->
      @if (placeToDelete()) {
        <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[500] p-4">
          <div class="bg-white rounded-[32px] p-10 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <div class="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mb-6 border border-rose-100">
              <mat-icon class="text-3xl">warning_amber</mat-icon>
            </div>
            <h3 class="text-xl font-black text-slate-900 mb-2 tracking-tight">ยืนยันการลบสถานที่?</h3>
            <p class="text-sm font-bold text-slate-500 mb-8 leading-relaxed">
              คุณแน่ใจหรือไม่ที่จะลบจุดสำคัญ <span class="text-slate-900">"{{ placeToDelete()?.name }}"</span> ใช่ไหม? ข้อมูลพิกัดนี้จะถูกลบออกถาวร
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
export class PlacesPage {
  placeService = inject(PlaceService);
  logService = inject(ActivityLogService);

  placeToDelete = signal<Place | null>(null);

  confirmDelete(place: Place) {
    this.placeToDelete.set(place);
  }

  cancelDelete() {
    this.placeToDelete.set(null);
  }

  async executeDelete() {
    const place = this.placeToDelete();
    if (!place || !place.id) return;
    
    try {
      await this.placeService.deletePlace(place.id);
      await this.logService.logAction('DELETE_PLACE', `ลบจุดสำคัญ ${place.name} (${place.id})`);
      this.placeToDelete.set(null);
    } catch (e) {
      console.error('Failed to delete place:', e);
      alert('ไม่สามารถลบข้อมูลได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง');
      this.placeToDelete.set(null);
    }
  }
}
