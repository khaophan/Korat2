import { Component, OnInit, OnDestroy, inject, signal, effect, ElementRef, ViewChild, PLATFORM_ID, AfterViewInit } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouteService } from '../../services/route.service';
import { PlaceService } from '../../services/place.service';
import { Route, Place } from '../../models';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { animate, stagger } from 'motion';
import * as turf from '@turf/turf';
import { SplashOverlayComponent } from '../../components/splash-overlay/splash-overlay.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-map-page',
  standalone: true,
  imports: [CommonModule, MatIconModule, FormsModule, SplashOverlayComponent],
  template: `
    @if (isSplashShowing()) {
      <app-splash-overlay (completed)="splashCompleted()"></app-splash-overlay>
    }
    <style>
      .leaflet-default-icon-path { background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAApCAYAAADAk4MLAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTQyIDc5LjE2MDkyNCwgMjAxNy8wNy8xMy0wMTowNjozOSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQiIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0RXZ0PSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VFdmVudCMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTcgKE1hY2ludG9zaCkiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6NkY3MDc4ODg0RDg4MTFFN0I2MjdEQkI4OEU1MDgxNkEiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6NkY3MDc4ODk0RDg4MTFFN0I2MjdEQkI4OEU1MDgxNkEiPiA8eG1wTU06SGlzdG9yeT4gPHJkZjpTZXE+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJjcmVhdGVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjZGNzA3ODg0NEQ4ODExRTdCNjI3REJCODhFNTA4MTZBIiBzdEV2dDp3aGVuPSIyMDE3LTA5LTEzVDAxOjA2OjM5WiIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTcgKE1hY2ludG9zaCkiLz4gPC9yZGY6U2VxPiA8L3htcE1NOkhpc3Rvcnk+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+18yX4wAAALNJREFUeNrs1cERgCAAxNBWBgE24B10s2b4F45gWwZ36nAYsIquu1K3gWADACv2HkO2EIAhAAoAIAgAAgAAgAAgAAgAAgAAgAAgAAgAAgAAgAAgAAgAAgAAgAAgAAgAAgAAgAAgAAgAAgAAgAAgAAgAAgAAgAAgAAgAAwAAgAAgAAgAAgAAgAAgAAgAAgAAgAAgAAgAAgAAgAAgAAgAAwAAgAAgAAgAAgAAgAAgAAgAAgAAgAAwAAgAAgAAgAAgAAgAAgAAgAAgAAgAAgAAgAAgAAgAAgAAgAAgAAgAAgAAgAAgAAwAAgAAgAAgAAgAAgAAgAAgAAgAAgAAgAAgAAgAAgAAgAAgAAwAAgAAgAAgAAgAAgAAgAAgAAgAAgAAgAAwAAgAAgAAgAAgAAgAAgAAgAAgAAgAAgAAgAAgAAgAAgAAgAAgAAwAAgAAgAAgAAgAAgAAgAAgAAgAAgAAgAAwAAgAAgAAgAAgAAgAAgAAgAAgAAgAAgAAgAAgAAgAAgAAgAAwAAgAAgAAwAAgAAgAAwAAgD1wQAAIA==); }
      .leaflet-container { font-family: var(--font-sans); background: #fdfdfd !important; }
      .marker-label {
        font-size: 11px;
        font-weight: 600;
        color: #1a1a1a;
        text-shadow: 0 1px 2px rgba(255,255,255,0.8);
      }
      .glass-card {
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border: 1px solid rgba(255,255,255,0.6);
      }
      .dimensional-sheet {
        box-shadow: 0 -12px 40px rgba(0,0,0,0.12), 0 -4px 10px rgba(0,0,0,0.05);
        border-top: 1px solid rgba(255,255,255,0.8);
      }
      .inner-glow {
        box-shadow: inset 0 2px 5px rgba(255,255,255,1), 0 4px 15px rgba(0,0,0,0.08);
      }
      .stop-marker-container {
        filter: drop-shadow(0 6px 12px rgba(0,0,0,0.15));
      }
      .transit-pill {
        background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%);
        border: 1px solid rgba(255,255,255,0.2);
      }
    </style>
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    
    <div class="relative w-full h-[calc(100dvh-64px)] flex flex-col md:flex-row overflow-hidden bg-slate-50 font-sans">
      
      <!-- Map Section: Always 100% height, full transparency to UI -->
      <div class="absolute inset-0 z-0 h-full w-full">
        <div #mapContainer class="w-full h-full"></div>
      </div>

      <!-- Desktop Sidebar: Premium Specialist Tool Style -->
      <div class="hidden md:flex w-[400px] bg-white z-20 flex-col h-full border-r border-slate-200/60 shadow-2xl relative">
              <!-- Desktop Sidebar Header: Specialist Style -->
              <div class="p-8 flex-shrink-0 relative overflow-hidden group">
                <div class="absolute inset-0 bg-gradient-to-br from-indigo-50/20 to-transparent"></div>
                
                <div class="flex items-center gap-4 mb-8 relative">
                  <div class="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-2xl transform group-hover:rotate-12 transition-transform duration-500">
                    <mat-icon class="text-xl">navigation</mat-icon>
                  </div>
                  <div>
                    <h2 class="text-2xl font-black text-slate-900 leading-none tracking-tight">KORAT BUS</h2>
                    <p class="text-[10px] font-black text-slate-400 mt-2 uppercase tracking-[0.3em]">Smart Mobility Hub</p>
                  </div>
                </div>
                
                <div class="relative">
                  @if (!selectedRouteId()) {
                    <div class="relative group">
                      <input type="text" [(ngModel)]="searchQuery" (ngModelChange)="filterRoutes()" placeholder="ค้นหาสายรถหรือสถานที่..." class="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all shadow-inner">
                      <mat-icon class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl group-focus-within:text-indigo-600 transition-colors">search</mat-icon>
                    </div>
                  }
      
                  @if (selectedRouteId()) {
                    <button (click)="selectedRouteId.set(null); updateMapLayers(routeService.routes())" class="flex items-center gap-3 text-slate-400 hover:text-indigo-700 font-black text-[11px] uppercase tracking-widest transition-all hover:translate-x-1">
                       <mat-icon class="text-lg">west</mat-icon> 
                       BACK TO SELECTOR
                    </button>
                  }
                </div>
              </div>
      
              <div class="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-slate-50/50">
                <ng-container *ngTemplateOutlet="selectedRouteId() ? routeDetails : routeList"></ng-container>
              </div>
            </div>

      <!-- Mobile Search Overlay (Clean Material style) -->
      <div #searchBar class="md:hidden absolute top-4 left-4 right-4 z-[400] transition-all duration-300" [class.opacity-0]="selectedRouteId()">
        <div class="bg-white rounded-xl shadow-lg border border-slate-200 flex items-center px-4 h-12 ring-1 ring-black/5">
          <mat-icon class="text-indigo-700 mr-2 text-lg">search</mat-icon>
          <input type="text" [(ngModel)]="searchQuery" (ngModelChange)="filterRoutes()" placeholder="ค้นหาสายรถ..." class="flex-1 bg-transparent border-none focus:ring-0 text-sm font-medium outline-none text-slate-800 placeholder-slate-400">
          <button (click)="toggleBottomSheet()" class="text-slate-400 p-2 hover:text-indigo-700 transition-colors">
            <mat-icon class="text-xl">list</mat-icon>
          </button>
        </div>
      </div>

      <!-- Mobile Bottom Sheet: Integrated Docked Style with Targeted Gesture Support -->
      <div #bottomSheet 
           class="md:hidden absolute bottom-0 left-0 right-0 z-[500] bg-white rounded-t-[40px] shadow-2xl flex flex-col border-t border-slate-100 active:duration-0"
           [style.height.px]="sheetHeight">
        
        <!-- Targeted Drag Handle: Only this area responds to dragging -->
        <div class="pt-3 pb-4 flex justify-center cursor-grab active:cursor-grabbing shrink-0 touch-none"
             (touchstart)="onTouchStart($event)"
             (touchmove)="onTouchMove($event)"
             (touchend)="onTouchEnd()">
          <div class="w-16 h-1.5 bg-slate-200 rounded-full shadow-inner hover:bg-slate-300 transition-colors"></div>
        </div>
        
        <div class="px-8 pb-4 flex justify-between items-center shrink-0">
          <div class="flex items-center gap-4">
             @if(selectedRouteId(); as id) {
                <div class="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-xl transform -translate-y-4 inner-glow border-4 border-white" 
                     [style.backgroundColor]="getSelectedRoute()?.color">
                  {{ getSelectedRoute()?.number }}
                </div>
             }
             <div>
               <h2 class="font-black text-xl text-slate-800 tracking-tighter leading-none">{{ selectedRouteId() ? getSelectedRoute()?.name : 'ค้นหาสายรถ' }}</h2>
               <p class="text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em] mt-1.5">Korat Smart Mobility</p>
             </div>
          </div>
          <button (click)="handleBackAction()" class="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-indigo-700 transition-all active:scale-90 border border-slate-100">
            <mat-icon class="text-2xl">{{ selectedRouteId() ? 'close' : (isBottomSheetOpen() ? 'keyboard_arrow_down' : 'search') }}</mat-icon>
          </button>
        </div>
        
        <div class="overflow-y-auto px-6 pb-20 space-y-4 flex-1 custom-scrollbar pointer-events-auto select-none" 
             [class.hidden]="sheetHeight < 100">
          <ng-container *ngTemplateOutlet="selectedRouteId() ? routeDetails : routeList"></ng-container>
        </div>
      </div>

      <!-- Map Tools: Elegant Floating controls -->
      <div class="absolute right-6 top-6 z-[400] flex flex-col gap-3">
        <button (click)="toggleMapMode()" class="w-12 h-12 glass-card rounded-2xl shadow-xl flex items-center justify-center text-slate-700 hover:text-indigo-700 active:scale-90 transition-all group overflow-hidden relative">
          <div class="absolute inset-0 bg-white/20 group-hover:bg-white/40 transition-colors"></div>
          <mat-icon class="text-xl relative z-10">{{ isSatelliteMode ? 'map' : 'layers' }}</mat-icon>
        </button>
      </div>

      <!-- Route Details Template -->
      <ng-template #routeDetails>
        @if(getSelectedRoute(); as route) {
          <div class="animate-in fade-in slide-in-from-bottom-8 duration-700">
            <!-- Professional Hub Layout -->
            <div class="bg-slate-50 rounded-[32px] p-1 shadow-inner border border-slate-100 mb-6">
              <div class="bg-white rounded-[28px] p-6 shadow-sm border border-white">
                <div class="flex items-center justify-between mb-8">
                   <div class="flex items-center gap-5">
                      <div class="w-16 h-16 rounded-[22px] flex items-center justify-center text-white font-black text-3xl shadow-2xl transition-all duration-500 inner-glow" 
                           [style.backgroundColor]="route.color"
                           [style.boxShadow]="'2px 12px 30px -4px ' + route.color + '77'">
                        {{ route.number }}
                      </div>
                      <div>
                        <h3 class="font-black text-2xl text-slate-900 leading-none tracking-tighter">{{ route.name }}</h3>
                        <div class="flex items-center gap-2 mt-2.5">
                          <div class="px-2 py-0.5 rounded-md bg-slate-900 text-[9px] font-black text-white uppercase tracking-widest shadow-sm">Route {{ route.number }}</div>
                          <span class="text-[10px] font-black text-slate-300 uppercase tracking-widest">Digital Service</span>
                        </div>
                      </div>
                   </div>
                </div>

                <div class="grid grid-cols-[1fr_auto_1fr] items-center gap-4 px-2 py-6 border-y border-slate-100/80">
                  <div class="text-left">
                    <span class="block text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-1.5">Departure</span>
                    <p class="font-black text-slate-800 text-sm md:text-base tracking-tight">{{ route.origin }}</p>
                  </div>
                  <div class="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-300">
                    <mat-icon class="text-xl">double_arrow</mat-icon>
                  </div>
                  <div class="text-right">
                    <span class="block text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-1.5">Terminal</span>
                    <p class="font-black text-slate-800 text-sm md:text-base tracking-tight">{{ route.destination }}</p>
                  </div>
                </div>

                <!-- Features/Tags -->
                <div class="flex flex-wrap gap-2 mt-6">
                   <div class="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-100/50">
                      <mat-icon class="text-sm text-indigo-600">verified</mat-icon>
                      <span class="text-[9px] font-black text-indigo-700 uppercase tracking-widest">Official Route</span>
                   </div>
                   <div class="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-100/50">
                      <mat-icon class="text-sm text-emerald-600">bolt</mat-icon>
                      <span class="text-[9px] font-black text-emerald-700 uppercase tracking-widest">High Reliability</span>
                   </div>
                </div>
              </div>
            </div>

            <!-- List of Stops with Dimensional Design -->
            <div class="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 mb-20 relative overflow-hidden">
               <div class="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full blur-3xl -mr-16 -mt-16"></div>
               
               <h4 class="font-black text-lg text-slate-900 mb-8 flex items-center justify-between relative z-10">
                <span class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-lg">
                    <mat-icon class="text-xl">format_list_bulleted</mat-icon>
                  </div>
                  Station Timeline
                </span>
                <span class="text-[12px] font-black text-slate-400 bg-slate-50 px-3 py-1 rounded-full">{{ route.waypoints.length }} STOPS</span>
              </h4>
              
              <div class="relative space-y-4 pl-4 max-h-[40dvh] overflow-y-auto pr-2 custom-scrollbar relative z-10 font-sans">
                <!-- Main Vertical Line -->
                <div class="absolute left-[20px] top-6 bottom-6 w-[2px] bg-slate-100"></div>
                
                @for(wp of route.waypoints; track $index) {
                  <div class="relative flex items-center gap-6 py-4 group cursor-pointer" (click)="flyToWaypoint(wp)">
                    <div class="w-2.5 h-2.5 rounded-full bg-white border-2 border-slate-200 z-10 flex-shrink-0 group-hover:border-indigo-600 group-hover:scale-125 transition-all outline outline-4 outline-transparent group-hover:outline-indigo-50"></div>
                    <div class="flex-1 min-w-0">
                      <p class="font-black text-slate-800 text-base tracking-tight group-hover:text-indigo-700 transition-colors">{{ wp.name || 'Station' }}</p>
                      <p class="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5">Point #0{{ $index + 1 }}</p>
                    </div>
                  </div>
                }
              </div>
            </div>
          </div>
        }
      </ng-template>

      <!-- Network List Template -->
      <ng-template #routeList>
        <div #listContainer class="space-y-3 pb-10">
          @for (route of filteredRoutes(); track route.id) {
            <div class="bg-white p-4 rounded-2xl shadow-sm border border-slate-200/50 hover:border-indigo-500 hover:shadow-xl hover:-translate-y-0.5 cursor-pointer transition-all duration-300 group flex items-center gap-4 relative overflow-hidden" 
                 (click)="toggleRoute(route)"
                 (keydown.enter)="toggleRoute(route)"
                 tabindex="0"
                 role="listitem">
              <div class="absolute top-0 right-0 w-20 h-20 bg-slate-50 rounded-full -mr-10 -mt-10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              <div class="w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-lg relative shrink-0" 
                   [style.backgroundColor]="route.color"
                   [style.boxShadow]="'0 8px 15px -3px ' + route.color + '44'">
                {{ route.number }}
              </div>
              
              <div class="flex-1 min-w-0 relative">
                <h3 class="font-black text-base text-slate-800 truncate group-hover:text-indigo-900 transition-colors tracking-tight">{{ route.name }}</h3>
                <div class="flex items-center gap-2 mt-1">
                  <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ route.origin }}</span>
                  <div class="w-1 h-1 rounded-full bg-slate-200"></div>
                  <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ route.destination }}</span>
                </div>
              </div>

              <div class="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition-all relative">
                <mat-icon class="text-xl">chevron_right</mat-icon>
              </div>
            </div>
          }

          @if (filteredRoutes().length === 0) {
            <div class="py-20 flex flex-col items-center justify-center text-slate-300">
              <mat-icon class="text-4xl mb-3 opacity-20">search_off</mat-icon>
              <p class="text-[10px] font-bold uppercase tracking-widest opacity-40">ไม่พบเส้นทางเดินรถ</p>
            </div>
          }
        </div>
      </ng-template>

    </div>
  `,
  styles: [`
    .custom-scrollbar::-webkit-scrollbar { width: 5px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { 
      background-color: #cbd5e1; 
      border-radius: 20px; 
    }
  `]
})
export class MapPage implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef;
  @ViewChild('searchBar') searchBar?: ElementRef;
  @ViewChild('bottomSheet') bottomSheet?: ElementRef;
  @ViewChild('listContainer') listContainer?: ElementRef;
  
  routeService = inject(RouteService);
  placeService = inject(PlaceService);
  platformId = inject(PLATFORM_ID);
  
  // map!: maplibregl.Map; // REMOVED: use mapService.getMap()
  searchQuery = '';
  filteredRoutes = signal<Route[]>([]);
  // Used instead of visibleRouteIds
  selectedRouteId = signal<string | null>(null);
  
  isSplashShowing = signal(true); // Control splash screen visibility
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  routeLayers = new Map<string, any>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  placeLayers = new Map<string, any>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  routeStopMarkers = new Map<string, any[]>();
  
  isBottomSheetOpen = signal(false);
  isSatelliteMode = false;
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  map: any = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private L: any = null; 
  private router = inject(Router);
  
  // UI heights for sheet
  sheetHeight = 92;
  private startY = 0;
  private initialHeight = 92;
  private readonly MIN_HEIGHT = 92;
  private readonly MID_HEIGHT = 42; // percentage based calculated in px
  private readonly MAX_HEIGHT = 75;

  constructor() {
    // Check onboarding
    if (isPlatformBrowser(this.platformId)) {
       const boarded = localStorage.getItem('korat_boarded');
       if (!boarded) {
         this.router.navigate(['/onboarding']);
       }
    }

    effect(() => {
      this.filterRoutes();
      if (this.map) {
        this.updateMapLayers(this.routeService.routes());
        this.updatePlaceLayers(this.placeService.places());
      }
    });

    // Update sheet height when selection changes if user is NOT dragging
    effect(() => {
      const id = this.selectedRouteId();
      const open = this.isBottomSheetOpen();
      if (isPlatformBrowser(this.platformId)) {
        const vh = window.innerHeight;
        let target = this.MIN_HEIGHT;
        if (open) target = vh * (this.MAX_HEIGHT / 100);
        else if (id) target = vh * (this.MID_HEIGHT / 100);
        
        this.sheetHeight = target;
      }
    });
  }

  async ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
        // Wait for next tick so container is ready
        setTimeout(() => this.initMap(), 0);
    }
  }

  splashCompleted() {
    this.isSplashShowing.set(false);
  }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      // Entrance animations
      if (this.searchBar?.nativeElement) {
        animate(
          this.searchBar.nativeElement,
          { opacity: [0, 1], y: [-20, 0] },
          { duration: 0.6, ease: "backOut" }
        );
      }
      
      if (this.bottomSheet?.nativeElement) {
        animate(
          this.bottomSheet.nativeElement,
          { opacity: [0, 1], y: [50, 0] },
          { duration: 0.6, delay: 0.2, ease: "backOut" }
        );
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
            }).setView([14.9799, 102.0978], 13);
        }
        
        // Base Layers
        this.streetLayer = this.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');
        
        this.satelliteLayer = this.L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}');

        // Default to street layer
        if (this.map) {
          this.streetLayer.addTo(this.map);
          
          this.updateMapLayers(this.routeService.routes());
          this.updatePlaceLayers(this.placeService.places());
        }
    }
  }

  // Define layers for mode switching
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private streetLayer: any = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private satelliteLayer: any = null;

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
    
    console.log('Satellite mode toggled', this.isSatelliteMode);
  }

  filterRoutes() {
    const query = this.searchQuery.toLowerCase();
    const allRoutes = this.routeService.routes().filter(r => r.isActive);
    
    // If a route is selected, only show that route in the list (if we ever show list while selected)
    const selectedId = this.selectedRouteId();
    
    if (selectedId) {
      this.filteredRoutes.set(allRoutes.filter(r => r.id === selectedId));
      return;
    }

    if (!query) {
      this.filteredRoutes.set(allRoutes);
    } else {
      this.filteredRoutes.set(allRoutes.filter(r => 
        r.name.toLowerCase().includes(query) || 
        r.number.toLowerCase().includes(query) ||
        r.origin.toLowerCase().includes(query) ||
        r.destination.toLowerCase().includes(query) ||
        r.waypoints.some(wp => wp.name.toLowerCase().includes(query))
      ));
    }
  }

  updateMapLayers(routes: Route[]) {
    if (!this.map || !this.L) return;
    this.routeLayers.forEach(layer => this.map!.removeLayer(layer));
    this.routeLayers.clear();
    
    // Clear stop markers
    this.routeStopMarkers.forEach(markers => markers.forEach(m => m.remove()));
    this.routeStopMarkers.clear();

    const activeRoutes = routes.filter(r => r.isActive);
    const selectedId = this.selectedRouteId();

    activeRoutes.forEach((route, index) => {
      // IF a route is selected, HIDE ALL OTHER ROUTES (user request)
      if (selectedId && selectedId !== route.id) return;
      
      if (!route.geojson) return;
      try {
        const geojson = typeof route.geojson === 'string' ? JSON.parse(route.geojson) : route.geojson;
        
        if (!geojson || typeof geojson !== 'object' || !geojson.type) return;

        // Apply JITTER REMOVAL to smooth map paths
        if (geojson.geometry && geojson.geometry.coordinates) {
           geojson.geometry.coordinates = this.removeJitter(geojson.geometry.coordinates);
        } else if (geojson.coordinates) {
           geojson.coordinates = this.removeJitter(geojson.coordinates);
        }

        const isSelected = selectedId === route.id;
        const opacity = isSelected ? 0.95 : 0.75;
        // Make lines slightly thinner so they fit inside roads better
        const weight = isSelected ? 6 : 3.5;

        // Base lane offset keeps the routes roughly on the correct side of the street
        // For driving on left (Thailand), use negative relative offset.
        const baseLaneOffset = -4; // Turf offset in meters
        // Stagger multiplier
        const stagger = !selectedId ? (index - (activeRoutes.length / 2)) * 3 : 0;
        const totalOffset = baseLaneOffset + stagger;

        let processedGeojson = geojson;
        if (totalOffset !== 0) {
            try {
               processedGeojson = turf.lineOffset(geojson, totalOffset, { units: 'meters' });
            } catch(e) {
               console.warn('Turf offset failed, using unoffset geojson:', e);
            }
        }

        // Clean, dimensional paths
        const options = { 
          style: { 
            color: route.color || '#3b82f6', 
            weight: weight,
            opacity: opacity,
            // Changed lineJoin back to round because geographic turf offset resolves the artifact issues natively
            lineJoin: 'round',
            lineCap: 'round'
          } 
        };

        const layerGroup = this.L.geoJSON(processedGeojson, options).addTo(this.map!);
        this.routeLayers.set(route.id!, layerGroup);

        // Render station markers (waypoints)
        if (!selectedId || isSelected) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const markers: any[] = [];
          route.waypoints.forEach((wp, wpIndex) => {
             // Project the waypoint to the GEOMETRICALLY OFFSET routing path
             const projected = this.projectWaypointToRoute(wp, processedGeojson);
             // No more pixel-based CSS transform needed, we use the exact location
             const markerStyle = '';
             
             const stopIcon = this.L.divIcon({
                className: 'stop-marker-container',
                html: `
                  <div class="relative" style="${markerStyle}">
                    <div class="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                      <!-- Dimensional Ring -->
                      <div class="w-6 h-6 rounded-full bg-white shadow-xl flex items-center justify-center border border-slate-100 ring-4 ring-transparent hover:ring-white/50 transition-all">
                        <div class="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-black text-white shadow-inner" 
                             style="background-color: ${route.color}">
                          ${wpIndex + 1}
                        </div>
                      </div>
                    </div>
                  </div>
                `,
                iconSize: [0, 0],
                iconAnchor: [0, 0]
             });
             
             const marker = this.L.marker([projected.lat, projected.lng], { 
                icon: stopIcon,
                opacity: selectedId ? 1 : 0.95,
                zIndexOffset: isSelected ? 2000 : 1000
             }).addTo(this.map!);
             
             marker.bindPopup(`
               <div class="p-2 min-w-[150px]">
                 <div class="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] mb-1">จุดจอดที่ ${wpIndex + 1}</div>
                 <div class="text-sm font-black text-slate-800 mb-2">${wp.name}</div>
                 <div class="h-px bg-slate-100 mb-2"></div>
                 <div class="flex items-center gap-2">
                    <div class="w-3 h-3 rounded-full shadow-sm" style="background-color: ${route.color}"></div>
                    <div class="text-xs font-bold text-slate-600">สาย ${route.number}: ${route.name}</div>
                 </div>
               </div>
             `);
             markers.push(marker);
          });
          this.routeStopMarkers.set(route.id!, markers);
        }
      } catch (e) {
        console.error('Error processing GeoJSON:', e);
      }
    });
  }

  updatePlaceLayers(places: Place[]) {
    if (!this.map || !this.L) return;
    this.placeLayers.forEach(m => m.remove());
    this.placeLayers.clear();
    
    const selectedRoute = this.getSelectedRoute();
    const activePlaces = places.filter(p => p.isActive);

    activePlaces.forEach(place => {
       // LOGIC: If a route is selected, only show places within ~800m of the route
       if (selectedRoute && selectedRoute.geojson) {
          const isNear = this.isPlaceNearRoute(place, selectedRoute);
          if (!isNear) return; 
       }

       const icon = this.L.divIcon({
            className: 'custom-place-pin',
            html: `
              <div class="relative flex flex-col items-center -translate-x-1/2 -translate-y-[calc(100%-4px)] group">
                <!-- Label -->
                <div class="bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.15)] border border-white/40 flex items-center gap-2 whitespace-nowrap mb-[2px] transform transition-transform group-hover:-translate-y-1 ring-1 ring-black/5">
                  <div class="w-6 h-6 rounded-lg bg-blue-50 flex items-center justify-center">
                    <span class="material-icons text-[16px] text-blue-600">${place.icon || 'location_on'}</span>
                  </div>
                  <span class="font-bold text-[13px] text-slate-900 tracking-tight">${place.name}</span>
                </div>
                <!-- Precision Tail -->
                <div class="w-3 h-3 bg-white/95 rotate-45 border-r border-b border-black/5 -mt-[7px] shadow-[2px_2px_5px_rgba(0,0,0,0.05)]"></div>
                <!-- Base Dot for exact location -->
                <div class="absolute bottom-0 w-1.5 h-1.5 bg-blue-600 rounded-full border border-white shadow-sm translate-y-1/2"></div>
              </div>
            `,
            iconSize: [0, 0],
            iconAnchor: [0, 0]
       });
       
       const marker = this.L.marker([place.lat, place.lng], { 
         icon,
         zIndexOffset: 500
       }).addTo(this.map!);
       this.placeLayers.set(place.id!, marker);
    });
  }

  private isPlaceNearRoute(place: Place, route: Route): boolean {
    try {
      const geojson = typeof route.geojson === 'string' ? JSON.parse(route.geojson) : route.geojson;
      const coords = geojson.geometry?.coordinates || geojson.coordinates || [];
      if (!coords.length) return true;

      // Simple radial check for performance
      // ~0.008 degrees is roughly 800m-1km
      const threshold = 0.008; 
      return coords.some((c: number[]) => {
        const dist = Math.sqrt(Math.pow(c[0] - place.lng, 2) + Math.pow(c[1] - place.lat, 2));
        return dist < threshold;
      });
    } catch {
      return true;
    }
  }

  toggleRoute(route: Route) {
    if (!route.id || !this.L) return;
    
    if (this.selectedRouteId() === route.id) {
       this.selectedRouteId.set(null);
    } else {
       this.selectedRouteId.set(route.id);
       if (this.map && route.geojson) {
          try {
              const geojson = typeof route.geojson === 'string' ? JSON.parse(route.geojson) : route.geojson;
              const bounds = this.L.geoJSON(geojson).getBounds();
              
              const isMobile = window.innerWidth < 768;
              // On mobile, use a much higher padding to keep map clear of docked sheet
              const padding: [number, number] = isMobile ? [30, 30] : [100, 100];
              const bottomOffset = isMobile ? window.innerHeight * 0.60 : 0;
              
              this.map.fitBounds(bounds, { 
                paddingTopLeft: [padding[0], padding[1]], 
                paddingBottomRight: [padding[0], padding[1] + bottomOffset],
                maxZoom: 16,
                animate: true,
                duration: 1.2
              });
          } catch(e) {
              console.error('Error fitting bounds:', e);
          }
       }
    }
    this.updateMapLayers(this.routeService.routes());
  }


  isSelected(routeId: string): boolean {
    return this.selectedRouteId() === routeId;
  }

  getSelectedRoute(): Route | undefined {
     return this.routeService.routes().find(r => r.id === this.selectedRouteId());
  }

  flyToWaypoint(wp: {lat: number, lng: number}) {
    if (this.map && this.L) {
      const isMobile = window.innerWidth < 768;
      const bottomOffset = isMobile ? window.innerHeight * 0.40 : 0;
      
      this.map.setView([wp.lat, wp.lng], 16, {
        animate: true,
        duration: 1.0
      });
      
      if (isMobile) {
        // slightly pan down because bottom sheet covers bottom half
        this.map.panBy([0, bottomOffset / 2]);
      }
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private projectWaypointToRoute(wp: {lat: number, lng: number}, geojson: any): {lat: number, lng: number} {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const geometry = (geojson as any).geometry;
        const coords = geometry?.coordinates || [];
        if (coords.length < 2) return wp;

        let minDist = Infinity;
        let pResult = { lat: wp.lat, lng: wp.lng };

        for (let i = 0; i < coords.length - 1; i++) {
            const c1 = coords[i];
            const c2 = coords[i+1];
            
            const cosLat = Math.cos(c1[1] * Math.PI / 180);
            const dx = (c2[0] - c1[0]) * cosLat;
            const dy = c2[1] - c1[1];
            const lenSq = dx*dx + dy*dy;
            if (lenSq === 0) continue;
            
            const t = Math.max(0, Math.min(1, (((wp.lng - c1[0])*cosLat * dx) + ((wp.lat - c1[1]) * dy)) / lenSq));
            const projX = c1[0] + t * (c2[0] - c1[0]);
            const projY = c1[1] + t * (c2[1] - c1[1]);
            
            const d = Math.pow((projX - wp.lng)*cosLat, 2) + Math.pow(projY - wp.lat, 2);
            if (d < minDist) {
                minDist = d;
                pResult = { lat: projY, lng: projX };
            }
        }
        return pResult;
    } catch {
        return wp;
    }
  }

  // Very important algorithm to remove microscopic zig-zags from OSRM data 
  // which causes rendering artifacts on geo-spatial lines at larger scales.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private removeJitter(coords: any[]): any[] {
     if (!coords || coords.length < 3) return coords;
     
     // Handle MultiLineString recursively
     if (Array.isArray(coords[0]) && Array.isArray(coords[0][0])) {
         return coords.map(c => this.removeJitter(c));
     }

     const clean = [coords[0]];
     for (let i = 1; i < coords.length - 1; i++) {
        const prev = clean[clean.length - 1];
        const curr = coords[i];
        
        // Calculate squared geographical distance (approximate)
        const dLat = curr[1] - prev[1];
        const dLng = curr[0] - prev[0];
        const distSq = (dLat * dLat) + (dLng * dLng);
        
        // 0.00005 degrees is approx 5.5 meters.
        // We drop points that are closer than 5 meters to the previous kept point, 
        // to prevent microscopic zig-zags on straight roads.
        if (distSq > 0.0000000025) { 
           clean.push(curr);
        }
     }
     clean.push(coords[coords.length - 1]);
     return clean;
  }

  isMobileView(): boolean {
    if (!isPlatformBrowser(this.platformId)) return false;
    return window.innerWidth < 768;
  }

  // Gesture Handlers for Bottom Sheet
  onTouchStart(e: TouchEvent) {
    this.startY = e.touches[0].clientY;
    this.initialHeight = this.sheetHeight;
    if (this.bottomSheet?.nativeElement) {
      this.bottomSheet.nativeElement.style.transition = 'none';
    }
  }

  onTouchMove(e: TouchEvent) {
    const deltaY = this.startY - e.touches[0].clientY;
    const newHeight = this.initialHeight + deltaY;
    const maxHeight = window.innerHeight * (this.MAX_HEIGHT / 100);
    
    if (newHeight >= this.MIN_HEIGHT && newHeight <= maxHeight) {
      this.sheetHeight = newHeight;
    }
  }

  onTouchEnd() {
    if (this.bottomSheet?.nativeElement) {
       this.bottomSheet.nativeElement.style.transition = 'height 0.4s cubic-bezier(0.23, 1, 0.32, 1)';
    }

    const vh = window.innerHeight;
    const midPoint = vh * (this.MID_HEIGHT / 100);
    const maxPoint = vh * (this.MAX_HEIGHT / 100);

    // Snap to closest state
    if (this.sheetHeight > (midPoint + maxPoint) / 2) {
      this.sheetHeight = maxPoint;
      this.isBottomSheetOpen.set(true);
    } else if (this.sheetHeight > (this.MIN_HEIGHT + midPoint) / 2) {
      this.sheetHeight = midPoint;
      this.isBottomSheetOpen.set(false);
      // We don't want to close details if it was selected, but we minimize
    } else {
      this.sheetHeight = this.MIN_HEIGHT;
      this.isBottomSheetOpen.set(false);
      if (!this.selectedRouteId()) {
         // Full close only if nothing selected
      }
    }
  }

  handleBackAction() {
    if (this.selectedRouteId()) {
      this.selectedRouteId.set(null);
      this.updateMapLayers(this.routeService.routes());
    } else {
      this.toggleBottomSheet();
    }
  }

  toggleBottomSheet() {
    this.isBottomSheetOpen.update(v => !v);
    
    if (isPlatformBrowser(this.platformId) && this.bottomSheet?.nativeElement) {
      animate(
        this.bottomSheet.nativeElement,
        { height: this.isBottomSheetOpen() ? '70dvh' : '80px' },
        { duration: 0.5, ease: [0.32, 0.72, 0, 1] }
      );

      if (this.isBottomSheetOpen() && this.bottomSheet?.nativeElement) {
        const items = this.bottomSheet.nativeElement.querySelectorAll('.route-item');
        if (items && items.length > 0) {
          animate(
            items,
            { opacity: [0, 1], y: [20, 0] },
            { duration: 0.4, delay: stagger(0.05), ease: 'easeOut' }
          );
        }
      }
    }
  }

  ngOnDestroy() {
    this.map?.remove();
  }
}
