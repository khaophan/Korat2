import { Injectable, signal, OnDestroy } from '@angular/core';
import { db } from '../firebase';
import { collection, doc, updateDoc, deleteDoc, onSnapshot, query, addDoc } from 'firebase/firestore';
import { Route } from '../models';
import { handleFirestoreError, OperationType } from '../utils/error-handler';

@Injectable({
  providedIn: 'root'
})
export class RouteService implements OnDestroy {
  routes = signal<Route[]>([]);
  isLoaded = signal<boolean>(false);
  private unsubscribe: (() => void) | null = null;

  constructor() {
    this.listenToRoutes();
  }

  listenToRoutes() {
    const q = query(collection(db, 'routes'));
    this.unsubscribe = onSnapshot(q, (snapshot) => {
      const routesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Route));
      this.routes.set(routesData);
      this.isLoaded.set(true);
    }, (error) => {
      this.isLoaded.set(true); // Proceed even on error so app doesn't hang
      handleFirestoreError(error, OperationType.LIST, 'routes');
    });
  }

  async addRoute(route: Omit<Route, 'id'>) {
    try {
      const docRef = await addDoc(collection(db, 'routes'), {
        ...route,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'routes');
      throw error;
    }
  }

  async updateRoute(id: string, route: Partial<Route>) {
    try {
      await updateDoc(doc(db, 'routes', id), {
        ...route,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `routes/${id}`);
      throw error;
    }
  }

  async deleteRoute(id: string) {
    try {
      await deleteDoc(doc(db, 'routes', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `routes/${id}`);
      throw error;
    }
  }

  ngOnDestroy() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }
}
