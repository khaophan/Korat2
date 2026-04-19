import { Component, inject, signal, OnInit, OnDestroy, ElementRef, ViewChild, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RouteService } from '../../services/route.service';
import { ActivityLogService } from '../../services/activity-log.service';
import { Route } from '../../models';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-route-editor-page',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  template: `
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <div class="fixed inset-0 flex flex-col bg-slate-50 z-[1000] overflow-hidden">
      <!-- Fixed Header -->
      <div class="flex-none bg-slate-900 z-30 pt-safe px-4 py-3 flex justify-between items-center shrink-0">
        <div class="flex items-center gap-3">
          <button (click)="cancel()" class="p-2 -ml-2 rounded-full text-slate-400 hover:bg-slate-800 transition-colors">
            <mat-icon>arrow_back</mat-icon>
          </button>
          <h1 class="text-xl font-black text-white tracking-tight">{{ isNew ? 'สร้างเส้นทางใหม่' : 'แก้ไขเส้นทาง' }}</h1>
        </div>
        <button (click)="save()" [disabled]="isSaving()" class="px-6 py-2 bg-indigo-600 text-white font-black rounded-xl shadow-sm hover:bg-indigo-500 active:scale-95 transition-all disabled:opacity-50 text-sm">
          {{ isSaving() ? 'กำลังบันทึก...' : 'บันทึกข้อมูล' }}
        </button>
      </div>

      <!-- Map Area (Top Half) -->
      <div class="flex-shrink-0 h-[40dvh] relative z-0 border-b border-slate-200">
        <div #mapContainer class="w-full h-full"></div>
        
        <!-- Floating Tools over Map -->
        <div class="absolute bottom-4 right-4 z-[400] flex flex-col gap-2">
          <button (click)="toggleMapMode()" class="w-10 h-10 bg-white rounded-xl shadow-xl text-slate-700 flex items-center justify-center hover:bg-slate-50 transition-colors border border-slate-100">
            <mat-icon class="text-lg">{{ isSatelliteMode ? 'map' : 'satellite' }}</mat-icon>
          </button>
          
          @if (routeSegments.length > 0 && drawMode() === 'path') {
            <button (click)="undoLastSegment()" class="w-10 h-10 bg-white rounded-xl shadow-xl text-slate-700 flex items-center justify-center hover:bg-slate-50 transition-colors border border-slate-100">
              <mat-icon class="text-lg">undo</mat-icon>
            </button>
          }
        </div>
      </div>

      <!-- Bottom Sheet Panel (Bottom Half) -->
      <div class="flex-1 flex flex-col bg-slate-50 z-20 relative min-h-0">
        <!-- Tabs -->
        <div class="flex items-center p-2 bg-white border-b border-slate-200 shrink-0 shadow-sm gap-2">
          <button (click)="drawMode.set('info')" [class]="drawMode() === 'info' ? 'bg-indigo-50 text-indigo-600 font-black shadow-sm' : 'text-slate-400 font-bold hover:bg-slate-50'" class="flex-1 py-3 px-2 rounded-xl transition-all flex justify-center items-center gap-2 text-xs uppercase tracking-widest">
            <mat-icon class="text-[18px] w-[18px] h-[18px]">info</mat-icon> ข้อมูลพื้นฐาน
          </button>
          <button (click)="drawMode.set('path')" [class]="drawMode() === 'path' ? 'bg-indigo-50 text-indigo-600 font-black shadow-sm' : 'text-slate-400 font-bold hover:bg-slate-50'" class="flex-1 py-3 px-2 rounded-xl transition-all flex justify-center items-center gap-2 text-xs uppercase tracking-widest">
            <mat-icon class="text-[18px] w-[18px] h-[18px]">timeline</mat-icon> รูปแบบเส้นทาง
          </button>
          <button (click)="drawMode.set('stop')" [class]="drawMode() === 'stop' ? 'bg-indigo-50 text-indigo-600 font-black shadow-sm' : 'text-slate-400 font-bold hover:bg-slate-50'" class="flex-1 py-3 px-2 rounded-xl transition-all flex justify-center items-center gap-2 text-xs uppercase tracking-widest">
            <mat-icon class="text-[18px] w-[18px] h-[18px]">room</mat-icon> จุดจอดรับส่ง
          </button>
        </div>

        <!-- Scrollable Forms Content -->
        <div class="flex-1 overflow-y-auto min-h-0 p-5 custom-scrollbar pb-40">
          
          <!-- Mode: INFO -->
          @if (drawMode() === 'info') {
            <div class="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300 max-w-2xl mx-auto">
              <div class="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm space-y-6">
                <div class="grid grid-cols-2 gap-6">
                  <div>
                    <label for="routeNumber" class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">หมายเลขสาย</label>
                    <input id="routeNumber" type="text" [(ngModel)]="routeData.number" placeholder="เช่น 1" class="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-slate-900 font-black focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all text-center text-lg">
                  </div>
                  <div>
                     <label for="routeColor" class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">สีเส้นทางในแผนที่</label>
                     <input id="routeColor" type="color" [(ngModel)]="routeData.color" (change)="updateMapStyle()" class="w-full h-12 p-1 border border-slate-100 rounded-xl cursor-pointer bg-slate-50 hover:bg-white transition-all">
                  </div>
                </div>
                
                <div class="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div class="flex items-center justify-between mb-3 px-1">
                    <span class="block text-[10px] font-black text-slate-400 uppercase tracking-widest">สีตัวรถที่สังเกตได้</span>
                    <button type="button" (click)="addVehicleColor()" class="text-[10px] font-black text-indigo-600 bg-white border border-indigo-100 px-3 py-1.5 rounded-lg transition-all hover:bg-indigo-600 hover:text-white flex items-center gap-1">
                      <mat-icon class="text-[14px] w-[14px] h-[14px]">add</mat-icon> เพิ่มสีรถ
                    </button>
                  </div>
                  
                  @if (routeData.vehicleColors && routeData.vehicleColors.length > 0) {
                    <div class="flex flex-wrap gap-3">
                      @for(color of routeData.vehicleColors; track $index) {
                        <div class="relative flex items-center group">
                          <input type="color" [ngModel]="color" (ngModelChange)="updateVehicleColor($index, $event)" class="h-10 w-12 p-1 border border-slate-200 rounded-lg cursor-pointer bg-white shadow-sm">
                          <button type="button" (click)="removeVehicleColor($index)" class="absolute -top-2 -right-2 w-5 h-5 bg-rose-500 text-white shadow-md rounded-full flex items-center justify-center scale-0 group-hover:scale-100 transition-transform">
                             <mat-icon class="text-[12px] w-[12px] h-[12px]">close</mat-icon>
                          </button>
                        </div>
                      }
                    </div>
                  } @else {
                    <p class="text-[11px] text-slate-400 px-1 font-bold">ยังไม่ได้กำหนดสีตัวรถ (ใช้ระบุสีรถสองแถวที่วิ่งจริง)</p>
                  }
                </div>
                
                <div>
                  <label for="routeName" class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">ชื่อเรียกเส้นทาง</label>
                  <input id="routeName" type="text" [(ngModel)]="routeData.name" placeholder="เช่น มทส. - บขส. ใหม่" class="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-slate-900 font-bold focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all">
                </div>
  
                <div class="grid grid-cols-2 gap-6">
                  <div>
                    <label for="routeOrigin" class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">จุดต้นทาง</label>
                    <input id="routeOrigin" type="text" [(ngModel)]="routeData.origin" class="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-slate-900 font-semibold focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all">
                  </div>
                  <div>
                    <label for="routeDestination" class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">จุดปลายทาง</label>
                    <input id="routeDestination" type="text" [(ngModel)]="routeData.destination" class="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-slate-900 font-semibold focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all">
                  </div>
                </div>
                
                <div class="pt-4 flex items-center justify-between border-t border-slate-50">
                  <div class="flex flex-col">
                    <span class="text-sm font-black text-slate-900">สถานะการเปิดใช้</span>
                    <span class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Active Status</span>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" [(ngModel)]="routeData.isActive" class="sr-only peer">
                    <div class="w-12 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
              </div>
            </div>
          }

          <!-- Mode: PATH -->
          @if (drawMode() === 'path') {
            <div class="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300 flex flex-col items-center justify-center text-center py-4 max-w-2xl mx-auto">
              
              <!-- Toggle Routing Mode -->
              <div class="w-full bg-slate-200 p-1 rounded-xl flex items-center mb-2">
                 <button (click)="setPathMode('smart')" [class]="pathMode() === 'smart' ? 'bg-white shadow-sm text-indigo-600 font-black' : 'text-slate-500 font-bold hover:bg-slate-300'" class="flex-1 py-3 rounded-lg text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-1.5">
                   <mat-icon class="text-[18px] w-[18px] h-[18px]">alt_route</mat-icon> ระบบอัตโนมัติ
                 </button>
                 <button (click)="setPathMode('freehand')" [class]="pathMode() === 'freehand' ? 'bg-white shadow-sm text-indigo-600 font-black' : 'text-slate-500 font-bold hover:bg-slate-300'" class="flex-1 py-3 rounded-lg text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-1.5">
                   <mat-icon class="text-[18px] w-[18px] h-[18px]">gesture</mat-icon> ลากเส้นอิสระ
                 </button>
              </div>

              <!-- Curve Control -->
              <div class="w-full bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm mb-4">
                 <div class="flex items-center justify-between mb-4">
                   <span class="text-xs font-black text-slate-900 flex items-center gap-2 uppercase tracking-widest">
                     <mat-icon class="text-indigo-600 text-lg">auto_fix_high</mat-icon>
                     ความโค้งมนของพิกัด
                   </span>
                   <span class="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">{{ curveIntensity() === 0 ? 'เหลี่ยม' : 'เลเวล ' + curveIntensity() }}</span>
                 </div>
                 <input type="range" min="0" max="5" step="1" [(ngModel)]="localCurveIntensity" (ngModelChange)="onCurveChange($event)" class="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600">
                 <div class="flex justify-between mt-3 text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">
                   <span>ธรรมชาติ</span>
                   <span>โค้งมนพิเศษ</span>
                 </div>
              </div>

              @if(pathMode() === 'smart') {
                <div class="w-16 h-16 bg-indigo-50 rounded-[20px] flex items-center justify-center text-indigo-600 mb-2 relative">
                  <mat-icon class="text-3xl" [class.animate-pulse]="isCalculating()">touch_app</mat-icon>
                  @if (isCalculating()) {
                     <div class="absolute inset-x-[-4px] inset-y-[-4px] border-2 border-indigo-600 border-t-transparent rounded-[24px] animate-spin"></div>
                  }
                </div>
                <h3 class="text-slate-900 font-black text-lg">ปักหมุดเพื่อสร้างเส้นทาง</h3>
                <p class="text-slate-400 text-xs font-bold max-w-[280px]">แตะบนแผนที่เพื่อระบุจุดผ่าน ระบบจะเลือกถนนที่เหมาะสมที่สุดให้ทันที</p>
              } @else {
                <div class="w-16 h-16 bg-indigo-900 rounded-[20px] flex items-center justify-center text-white mb-2">
                  <mat-icon class="text-3xl">draw</mat-icon>
                </div>
                <h3 class="text-slate-900 font-black text-lg">ลากเส้นด้วยนิ้ว</h3>
                <p class="text-slate-400 text-xs font-bold max-w-[280px]">ใช้นิ้วเดียวลากเพื่อวาดเส้นทาง หากต้องการขยับแผนที่ให้ใช้ 2 นิ้วพร้อมกัน</p>
              }
              
              <button (click)="clearPath()" class="mt-8 px-6 py-3 border border-rose-100 text-rose-500 bg-rose-50 font-black rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-sm flex items-center gap-2 text-[10px] uppercase tracking-widest">
                <mat-icon class="text-lg">delete_sweep</mat-icon> ล้างข้อมูลเส้นทาง
              </button>
            </div>
          }

          <!-- Mode: STOP -->
          @if (drawMode() === 'stop') {
            <div class="animate-in fade-in slide-in-from-bottom-2 duration-300 max-w-2xl mx-auto">
               <div class="flex justify-between items-end mb-6 px-1">
                  <div>
                     <h3 class="text-slate-900 font-black text-lg">จุดจอดรับส่ง</h3>
                     <p class="text-[11px] font-bold text-slate-400 uppercase tracking-widest">แตะบนแผนที่เพื่อสร้างจุดรับส่งในพิกัดจริง</p>
                  </div>
                  <button type="button" (click)="clearWaypoints()" class="px-4 py-2 bg-rose-50 text-rose-600 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all border border-rose-100 shadow-sm">ล้างทั้งหมด</button>
               </div>
               
               <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                  @for (wp of routeData.waypoints; track $index) {
                    <div class="flex items-center gap-3 bg-white p-4 rounded-xl border border-slate-100 shadow-sm transition-all hover:border-indigo-100">
                      <div class="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-black text-xs shrink-0">
                        {{ $index + 1 }}
                      </div>
                      <input type="text" [(ngModel)]="wp.name" class="flex-1 bg-transparent border-0 border-b border-slate-200 focus:border-indigo-500 px-1 py-1 text-slate-900 font-bold focus:ring-0 outline-none text-sm transition-all">
                      <button type="button" (click)="removeWaypoint($index)" class="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all shrink-0">
                        <mat-icon class="text-lg">close</mat-icon>
                      </button>
                    </div>
                  }
                  @if (routeData.waypoints.length === 0) {
                    <div class="md:col-span-2 text-center py-20 text-slate-300 bg-white rounded-[24px] border border-dashed border-slate-100">
                      <mat-icon class="text-5xl mb-3">not_listed_location</mat-icon>
                      <p class="font-black text-slate-400 uppercase tracking-widest text-[11px]">ยังไม่มีจุดจอดในเส้นทางนี้</p>
                    </div>
                  }
               </div>
            </div>
          }

        </div>
      </div>
    </div>
  `
})
export class RouteEditorPage implements OnInit, OnDestroy {
  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef;
  
  routeService = inject(RouteService);
  logService = inject(ActivityLogService);
  router = inject(Router);
  activatedRoute = inject(ActivatedRoute);
  platformId = inject(PLATFORM_ID);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private L: any = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  map: any = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private pathLayerGroup: any = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private markerLayerGroup: any = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private anchorLayerGroup: any = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private streetLayer: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private satelliteLayer: any;
  
  isNew = true;
  routeId: string | null = null;
  isSaving = signal(false);
  isCalculating = signal(false);
  drawMode = signal<'info' | 'path' | 'stop'>('info');
  pathMode = signal<'smart' | 'freehand'>('smart');
  curveIntensity = signal<number>(2); // Default to a natural 2 depth smoothing
  localCurveIntensity = 2;
  isSatelliteMode = false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  baseLayers: any = {};

  routeSegments: { lat: number, lng: number }[][] = [];
  smartAnchors: { lat: number, lng: number }[] = [];
  
  // Freehand drawing states
  isFreehandDrawing = false;
  currentFreehandSegment: { lat: number, lng: number }[] = [];

  routeData: Route = {
    number: '',
    name: '',
    color: '#007AFF', // iOS bright blue default
    origin: '',
    destination: '',
    waypoints: [],
    geojson: '',
    isActive: true
  };

  async ngOnInit() {
    this.routeId = this.activatedRoute.snapshot.paramMap.get('id');
    this.isNew = !this.routeId || this.routeId === 'new';
    
    if (isPlatformBrowser(this.platformId)) {
      this.initMap();

      if (!this.isNew && this.routeId) {
        this.loadRouteData();
      }
    }
  }

  async initMap() {
    if (isPlatformBrowser(this.platformId)) {
        const Leaflet = (await import('leaflet'));
        this.L = Leaflet.default || Leaflet;

        if (this.mapContainer?.nativeElement) {
          this.map = this.L.map(this.mapContainer.nativeElement, {
              attributionControl: false
          }).setView([14.9799, 102.0978], 14);
        }
        
        this.streetLayer = this.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');
        
        this.satelliteLayer = this.L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}');

        if (this.map) {
          this.streetLayer.addTo(this.map);

          this.pathLayerGroup = this.L.featureGroup().addTo(this.map);
          this.markerLayerGroup = this.L.featureGroup().addTo(this.map);
          this.anchorLayerGroup = this.L.featureGroup().addTo(this.map);

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          this.map.on('click', (e: any) => {
              this.handleMapClick(e.latlng.lat, e.latlng.lng);
          });
        }

        if (!this.isNew && this.routeId) {
            this.loadRouteData();
        }
    }
  }

  toggleMapMode() {
    if (!this.map || !this.L) return;
    this.isSatelliteMode = !this.isSatelliteMode;
    
    if (this.isSatelliteMode) {
      if (this.streetLayer) this.map.removeLayer(this.streetLayer);
      if (this.satelliteLayer) this.satelliteLayer.addTo(this.map);
    } else {
      if (this.satelliteLayer) this.map.removeLayer(this.satelliteLayer);
      if (this.streetLayer) this.streetLayer.addTo(this.map);
    }
  }

  setPathMode(mode: 'smart' | 'freehand') {
    this.pathMode.set(mode);
  }

  onCurveChange(val: number) {
    this.curveIntensity.set(Number(val));
    this.renderPolylines();
  }

  addVehicleColor() {
    if (!this.routeData.vehicleColors) {
       this.routeData.vehicleColors = [];
    }
    this.routeData.vehicleColors.push('#ffffff');
  }

  updateVehicleColor(index: number, color: string) {
    if (this.routeData.vehicleColors) {
       this.routeData.vehicleColors[index] = color;
    }
  }

  removeVehicleColor(index: number) {
    if (this.routeData.vehicleColors) {
       this.routeData.vehicleColors.splice(index, 1);
    }
  }

  async handleMapClick(lat: number, lng: number) {
    if (this.drawMode() === 'stop') {
        this.addWaypoint(lat, lng);
    } else if (this.drawMode() === 'path') {
        await this.addPathNode(lat, lng);
    }
  }

  async addPathNode(lat: number, lng: number) {
    if (this.isCalculating()) return;
    this.isCalculating.set(true);

    if (this.routeSegments.length === 0) {
        this.routeSegments.push([{ lat, lng }]);
        this.smartAnchors.push({ lat, lng });
        this.renderPolylines();
        this.isCalculating.set(false);
        return;
    }

    const lastSeg = this.routeSegments[this.routeSegments.length - 1];
    const prevPoint = lastSeg[lastSeg.length - 1];
    
    // Add visual anchor immediately
    this.smartAnchors.push({ lat, lng });
    this.renderPolylines();

    try {
       const curSegCoords = await this.fetchOSRMRoute(prevPoint, {lat, lng});
       this.routeSegments.push(curSegCoords);
    } catch {
       // fallback straight line
       this.routeSegments.push([{lat: prevPoint.lat, lng: prevPoint.lng}, {lat, lng}]);
    }
    this.renderPolylines();
    this.isCalculating.set(false);
  }

  async fetchOSRMRoute(start: { lat: number, lng: number }, end: { lat: number, lng: number }): Promise<{ lat: number, lng: number }[]> {
    const url = `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?geometries=geojson&overview=full`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('OSRM API Error');
    const data = await res.json();
    if (data && data.routes && data.routes.length > 0) {
      const coords = data.routes[0].geometry.coordinates;
      return coords.map((c: number[]) => ({ lat: c[1], lng: c[0] }));
    }
    throw new Error('No route found');
  }

  undoLastSegment() {
      if (this.routeSegments.length > 0) {
          this.routeSegments.pop();
          if (this.pathMode() === 'smart' && this.smartAnchors.length > 0) {
             this.smartAnchors.pop();
          }
          this.renderPolylines();
      }
  }

  clearPath() {
      if(confirm('คุณแน่ใจว่าต้องการลบเส้นทางที่วาดไว้ทั้งหมด?')) {
          this.routeSegments = [];
          this.smartAnchors = [];
          this.renderPolylines();
      }
  }

  renderPolylines() {
    if (!this.map || !this.L) return;

    this.pathLayerGroup.clearLayers();
    this.anchorLayerGroup.clearLayers();

    let allCoords = this.routeSegments.flat();
    
    // Apply smoothing if intensity > 0
    if (this.curveIntensity() > 0 && allCoords.length > 2) {
      allCoords = this.smoothPath(allCoords, this.curveIntensity());
    }

    if (allCoords.length > 1) {
      const latLngs = allCoords.map(c => [c.lat, c.lng]);
      
      this.L.polyline(latLngs, {
        color: this.routeData.color || '#3b82f6',
        weight: 4.5,
        opacity: 0.85,
        lineJoin: 'round',
        lineCap: 'round'
      }).addTo(this.pathLayerGroup);

      // Export to GeoJSON
      const geometry = {
        type: 'LineString',
        coordinates: allCoords.map(c => [c.lng, c.lat])
      };
      this.routeData.geojson = JSON.stringify({
        type: 'Feature',
        properties: {},
        geometry: geometry
      });
    }

    // Render anchors
    this.smartAnchors.forEach((anchor, i) => {
      const isFirst = i === 0;
      const isLast = i === this.smartAnchors.length - 1;
      
      // Only show first and last nodes to keep the line clean
      if (isFirst || isLast) {
        this.L.circleMarker([anchor.lat, anchor.lng], {
          radius: 6,
          fillColor: isFirst ? '#10b981' : '#ef4444',
          fillOpacity: 1,
          color: '#fff',
          weight: 2
        }).addTo(this.anchorLayerGroup);
      }
    });

    // Snapping waypoints to the updated line
    this.updateMarkerLayers();
  }

  addWaypoint(lat: number, lng: number) {
    if (!this.L) return;
    this.routeData.waypoints.push({
      lat,
      lng,
      name: `จุดจอดที่ ${this.routeData.waypoints.length + 1}`
    });
    this.updateMarkerLayers();
  }

  removeWaypoint(index: number) {
    this.routeData.waypoints.splice(index, 1);
    this.updateMarkerLayers();
  }

  clearWaypoints() {
    if(confirm('ล้างจุดจอดทั้งหมด?')) {
        this.routeData.waypoints = [];
        this.updateMarkerLayers();
    }
  }

  updateMarkerLayers() {
     if (!this.map || !this.L) return;
     this.markerLayerGroup.clearLayers();
     
     // eslint-disable-next-line @typescript-eslint/no-explicit-any
     let geojson: any = null;
     if (this.routeData.geojson) {
        try { geojson = JSON.parse(this.routeData.geojson); } catch { /* ignore */ }
     }

     this.routeData.waypoints.forEach((wp, i) => {
         const projected = geojson ? this.projectWaypointToRoute(wp, geojson) : wp;
         const markerStyle = '';

         const marker = this.L.marker([projected.lat, projected.lng], {
             icon: this.L.divIcon({
                 className: 'stop-marker-display',
                 html: `
                    <div class="relative" style="${markerStyle}">
                      <div class="absolute -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full border-2 border-white shadow-md flex items-center justify-center font-bold text-[11px] text-white" 
                           style="background-color: ${this.routeData.color || '#3b82f6'}">
                        ${i + 1}
                      </div>
                    </div>
                 `,
                 iconSize: [0, 0],
                 iconAnchor: [0, 0]
             }),
             zIndexOffset: 1000
         }).addTo(this.markerLayerGroup);
         
         marker.bindPopup(`จุดจอด: ${wp.name}`);
     });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private projectWaypointToRoute(wp: {lat: number, lng: number}, geojson: any): {lat: number, lng: number} {
    try {
        const coords = geojson.geometry?.coordinates || geojson.coordinates || [];
        if (coords.length < 2) return wp;

        let minDist = Infinity;
        let pResult = { lat: wp.lat, lng: wp.lng };

        // Precise screen-space projection
        const pt = this.map.latLngToLayerPoint([wp.lat, wp.lng]);

        for (let i = 0; i < coords.length - 1; i++) {
            const c1 = coords[i];
            const c2 = coords[i+1];
            
            const p1 = this.map.latLngToLayerPoint([c1[1], c1[0]]);
            const p2 = this.map.latLngToLayerPoint([c2[1], c2[0]]);
            
            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y;
            const lenSq = dx*dx + dy*dy;
            if (lenSq === 0) continue;
            
            const t = Math.max(0, Math.min(1, (((pt.x - p1.x) * dx) + ((pt.y - p1.y) * dy)) / lenSq));
            const projX_L = p1.x + t * dx;
            const projY_L = p1.y + t * dy;
            
            const d = Math.pow(projX_L - pt.x, 2) + Math.pow(projY_L - pt.y, 2);
            if (d < minDist) {
                minDist = d;
                const projectedLatLng = this.map.layerPointToLatLng([projX_L, projY_L]);
                pResult = { lat: projectedLatLng.lat, lng: projectedLatLng.lng };
            }
        }
        return pResult;
    } catch {
        return wp;
    }
  }

  /**
   * Refined smoothing algorithm
   * Ensures curves are fluid while maintaining intent
   */
  private smoothPath(points: { lat: number, lng: number }[], iterations: number): { lat: number, lng: number }[] {
    if (points.length < 3) return points;
    
    // Preliminary step: Remove duplicate/near points to prevent "jitters"
    const source = [points[0]];
    for (let k = 1; k < points.length; k++) {
      const p1 = points[k-1];
      const p2 = points[k];
      const dist = Math.sqrt(Math.pow(p1.lat - p2.lat, 2) + Math.pow(p1.lng - p2.lng, 2));
      if (dist > 0.00001) source.push(p2);
    }

    let result = [...source];
    
    for (let i = 0; i < iterations; i++) {
        const next: { lat: number, lng: number }[] = [];
        next.push(result[0]);
        
        for (let j = 0; j < result.length - 1; j++) {
            const p0 = result[j];
            const p1 = result[j+1];
            
            const q = {
                lat: 0.75 * p0.lat + 0.25 * p1.lat,
                lng: 0.75 * p0.lng + 0.25 * p1.lng
            };
            const r = {
                lat: 0.25 * p0.lat + 0.75 * p1.lat,
                lng: 0.25 * p0.lng + 0.75 * p1.lng
            };
            
            next.push(q);
            next.push(r);
        }
        
        next.push(result[result.length - 1]);
        result = next;
    }
    
    return result;
  }

  loadRouteData() {
    const route = this.routeService.routes().find(r => r.id === this.routeId);
    if (route) {
      this.routeData = { ...route, waypoints: [...route.waypoints] };
      
      if (this.routeData.geojson) {
          try {
              if (typeof this.routeData.geojson !== 'string' || !this.routeData.geojson.trim()) {
                return;
              }
              const feat = JSON.parse(this.routeData.geojson);
              if (feat && feat.geometry && feat.geometry.coordinates) {
                 const coords = feat.geometry.coordinates;
                 const converted: {lat:number, lng:number}[] = coords.map((c:number[]) => ({ lat: c[1], lng: c[0] }));
                 
                 this.routeSegments = [converted];
                 if (converted.length > 0) {
                     this.smartAnchors = [converted[0], converted[converted.length - 1]];
                 }
                 this.renderPolylines();
                 this.updateMarkerLayers();
                 
                 if (this.L) {
                   const latLngs = converted.map(c => [c.lat, c.lng]);
                   const bounds = this.L.latLngBounds(latLngs);
                   this.map.fitBounds(bounds, { padding: [50, 50] });
                 }
              }
          } catch(e) { console.error('Error parsing geojson', e); }
      }
    }
  }

  updateMapStyle() {
    this.renderPolylines();
    this.updateMarkerLayers();
  }

  async save() {
    if (!this.routeData.number || !this.routeData.name || !this.routeData.origin) {
        alert('กรุณากรอกข้อมูลพื้นฐานให้ครบถ้วน');
        this.drawMode.set('info');
        return;
    }

    this.isSaving.set(true);
    
    try {
      if (this.isNew) {
        await this.routeService.addRoute(this.routeData);
        await this.logService.logAction('CREATE_ROUTE', `เพิ่มสาย ${this.routeData.number}`);
      } else if (this.routeId) {
        await this.routeService.updateRoute(this.routeId, this.routeData);
        await this.logService.logAction('UPDATE_ROUTE', `แก้ไขสาย ${this.routeData.number}`);
      }
      this.router.navigate(['/admin/routes']);
    } catch (error) {
      console.error(error);
      alert('เกิดข้อผิดพลาดในการบันทึก');
    } finally {
      this.isSaving.set(false);
    }
  }

  cancel() {
    this.router.navigate(['/admin/routes']);
  }

  ngOnDestroy() {
    if (this.map) {
      this.map.remove();
    }
  }
}
