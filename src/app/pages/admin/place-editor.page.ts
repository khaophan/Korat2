import { Component, inject, signal, OnInit, OnDestroy, ElementRef, ViewChild, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PlaceService } from '../../services/place.service';
import { Place } from '../../models';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-place-editor-page',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  template: `
    <div class="h-[100dvh] flex flex-col bg-slate-50 relative overflow-hidden">
      <!-- Fixed Header -->
      <div class="flex-none bg-slate-900 z-30 pt-safe px-4 py-3 flex justify-between items-center shrink-0">
        <div class="flex items-center gap-3">
          <button (click)="cancel()" class="p-2 -ml-2 rounded-full text-slate-400 hover:bg-slate-800 transition-colors">
            <mat-icon>arrow_back</mat-icon>
          </button>
          <h1 class="text-xl font-black text-white tracking-tight">{{ isNew ? 'เพิ่มจุดสำคัญ' : 'แก้ไขจุดสำคัญ' }}</h1>
        </div>
        <button (click)="save()" [disabled]="isSaving()" class="px-6 py-2 bg-indigo-600 text-white font-black rounded-xl shadow-sm hover:bg-indigo-500 active:scale-95 transition-all disabled:opacity-50 text-sm">
          {{ isSaving() ? 'กำลังบันทึก...' : 'บันทึกข้อมูล' }}
        </button>
      </div>

      <!-- Map Area for Pinning Location -->
      <div class="flex-shrink-0 h-[35dvh] relative z-0 border-b border-slate-200">
        <div #mapContainer class="w-full h-full"></div>
        <div class="absolute bottom-4 left-0 right-0 z-[400] flex justify-center pointer-events-none">
          <div class="bg-indigo-600/90 backdrop-blur text-white text-[10px] uppercase tracking-widest px-4 py-2 rounded-lg shadow-lg font-black pointer-events-auto border border-white/20">
            แตะแผนที่เพื่อปักหมุดพิกัดจริง
          </div>
        </div>
      </div>

      <!-- Scrollable Form Content -->
      <div class="flex-1 overflow-y-auto min-h-0 p-6 custom-scrollbar pb-40 bg-slate-50">
        <div class="bg-white p-8 rounded-[24px] border border-slate-100 shadow-sm space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300 max-w-2xl mx-auto">
          
          <div>
            <label for="placeName" class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">ชื่อสถานที่</label>
            <input id="placeName" type="text" [(ngModel)]="placeData.name" placeholder="เช่น เซ็นทรัลโคราช" class="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-slate-900 font-bold focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all">
          </div>

          <div>
             <label for="placeDescription" class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">คำอธิบายเพิ่มเติม</label>
             <textarea id="placeDescription" [(ngModel)]="placeData.description" rows="3" placeholder="ระบุรายละเอียดที่เป็นประโยชน์ต่อผู้โดยสาร" class="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-slate-700 font-medium focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all resize-none"></textarea>
          </div>

          <div class="grid grid-cols-2 gap-6">
             <div>
               <label for="placeIcon" class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">ไอคอน (Material Symbol)</label>
               <input id="placeIcon" type="text" [(ngModel)]="placeData.icon" placeholder="เช่น school, store" class="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-slate-900 font-bold focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all">
             </div>
             <div>
               <label for="placeType" class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">หมวดหมู่</label>
               <div class="relative">
                 <select id="placeType" [(ngModel)]="placeData.type" class="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-slate-900 font-bold focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all appearance-none cursor-pointer">
                   <option value="landmark">แลนด์มาร์ค</option>
                   <option value="transit">จุดเชื่อมต่อการเดินทาง</option>
                   <option value="mall">ห้างสรรพสินค้า</option>
                   <option value="hospital">โรงพยาบาล</option>
                   <option value="school">สถานศึกษา</option>
                 </select>
                 <mat-icon class="absolute right-3 top-3.5 text-slate-400 pointer-events-none">expand_more</mat-icon>
               </div>
             </div>
          </div>
          
          <div class="pt-4 flex items-center justify-between border-t border-slate-50">
            <div>
               <span class="text-sm font-black text-slate-900 block">สถานะการแสดงผล</span>
               <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Visibility on Map</span>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" [(ngModel)]="placeData.isActive" class="sr-only peer">
              <div class="w-12 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          <div class="pt-4 border-t border-slate-50 flex flex-col md:flex-row md:justify-between items-start md:items-center gap-2">
             <div class="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
               <span class="text-indigo-600">LAT:</span> {{ placeData.lat | number:'1.6-6' }}
             </div>
             <div class="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
               <span class="text-indigo-600">LNG:</span> {{ placeData.lng | number:'1.6-6' }}
             </div>
          </div>

        </div>
      </div>
    </div>
  `
})
export class PlaceEditorPage implements OnInit, OnDestroy {
  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef;
  
  placeService = inject(PlaceService);
  router = inject(Router);
  activatedRoute = inject(ActivatedRoute);
  platformId = inject(PLATFORM_ID);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  L: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  map!: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  markerLayer: any;
  
  isNew = true;
  placeId: string | null = null;
  isSaving = signal(false);

  placeData: Place = {
    name: '',
    description: '',
    lat: 14.9799,
    lng: 102.0978,
    icon: 'place',
    type: 'landmark',
    isActive: true
  };

  async ngOnInit() {
    this.placeId = this.activatedRoute.snapshot.paramMap.get('id');
    this.isNew = !this.placeId || this.placeId === 'new';
    
    if (isPlatformBrowser(this.platformId)) {
      const Leaflet = await import('leaflet');
      this.L = Leaflet.default || Leaflet;
      await this.initMap();
    }
  }

  async initMap() {
    if (!this.L) return;
    
    if (!this.isNew && this.placeId) {
      await this.loadPlaceData();
    }
    
    const center = [this.placeData.lat, this.placeData.lng];
    
    if (this.mapContainer?.nativeElement) {
      this.map = this.L.map(this.mapContainer.nativeElement, {
          maxZoom: 22,
          zoomControl: false,
          attributionControl: false 
      }).setView(center, 15);
    }

    if (this.map) {
      this.L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxNativeZoom: 19,
        maxZoom: 22
      }).addTo(this.map);

      this.updateMarker();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.map.on('click', (e: any) => {
        this.placeData.lat = e.latlng.lat;
        this.placeData.lng = e.latlng.lng;
        this.updateMarker();
      });
    }
  }

  updateMarker() {
     if (this.markerLayer) {
        this.map.removeLayer(this.markerLayer);
     }
     
     const markerSvg = `<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 0C11.163 0 4 7.163 4 16C4 28 20 40 20 40C20 40 36 28 36 16C36 7.163 28.837 0 20 0Z" fill="#4F46E5" filter="drop-shadow(0px 4px 6px rgba(0,0,0,0.2))"/>
        <circle cx="20" cy="16" r="8" fill="#FFFFFF"/>
     </svg>`;
     const iconUrl = 'data:image/svg+xml;base64,' + btoa(markerSvg);
     const icon = this.L.icon({ iconUrl, iconSize: [40, 40], iconAnchor: [20, 40] });

     this.markerLayer = this.L.marker([this.placeData.lat, this.placeData.lng], { icon, draggable: true })
        .addTo(this.map);
        
     // eslint-disable-next-line @typescript-eslint/no-explicit-any
     this.markerLayer.on('dragend', (e: any) => {
        const pos = e.target.getLatLng();
        this.placeData.lat = pos.lat;
        this.placeData.lng = pos.lng;
     });
     
     this.map.panTo([this.placeData.lat, this.placeData.lng]);
  }

  async loadPlaceData() {
    const place = this.placeService.places().find(p => p.id === this.placeId);
    if (place) {
      this.placeData = { ...place };
    } else {
       // if not found in cache immediately, wait a bit or it might have failed
       // Typically in a full app we'd fetch directly if not in signal.
    }
  }

  async save() {
    if (!this.placeData.name || !this.placeData.lat || !this.placeData.lng) {
        alert('กรุณากรอกและปักหมุดข้อมูลให้ครบถ้วน');
        return;
    }

    this.isSaving.set(true);
    
    try {
      if (this.isNew) {
        await this.placeService.addPlace(this.placeData);
      } else if (this.placeId) {
        await this.placeService.updatePlace(this.placeId, this.placeData);
      }
      this.router.navigate(['/admin/places']);
    } catch (error) {
      console.error(error);
      alert('เกิดข้อผิดพลาดในการบันทึก');
    } finally {
      this.isSaving.set(false);
    }
  }

  cancel() {
    this.router.navigate(['/admin/places']);
  }

  ngOnDestroy() {
    if (this.map) {
      this.map.remove();
    }
  }
}
