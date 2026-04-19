export interface Route {
  id?: string;
  number: string;
  name: string;
  color: string;
  vehicleColors?: string[];
  origin: string;
  destination: string;
  waypoints: { lat: number; lng: number; name: string }[];
  geojson: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Place {
  id?: string;
  name: string;
  description: string;
  lat: number;
  lng: number;
  icon: string;
  type: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Report {
  id?: string;
  type: string;
  routeId: string;
  position: { lat: number; lng: number } | null;
  description: string;
  imageURL?: string;
  status: 'pending' | 'confirmed' | 'rejected';
  createdAt?: string;
  resolvedAt?: string;
  resolveNote?: string;
}

export interface ActivityLog {
  id?: string;
  adminId: string;
  action: string;
  detail: string;
  timestamp: string;
}
