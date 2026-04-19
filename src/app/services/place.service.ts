import { Injectable, signal, OnDestroy } from '@angular/core';
import { db } from '../firebase';
import { collection, doc, updateDoc, deleteDoc, onSnapshot, query, addDoc } from 'firebase/firestore';
import { Place } from '../models';
import { handleFirestoreError, OperationType } from '../utils/error-handler';

@Injectable({
  providedIn: 'root'
})
export class PlaceService implements OnDestroy {
  places = signal<Place[]>([]);
  isLoaded = signal<boolean>(false);
  private unsubscribe: (() => void) | null = null;

  constructor() {
    this.listenToPlaces();
  }

  listenToPlaces() {
    const q = query(collection(db, 'places'));
    this.unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Place));
      this.places.set(data);
      this.isLoaded.set(true);
    }, (error) => {
      this.isLoaded.set(true);
      handleFirestoreError(error, OperationType.LIST, 'places');
    });
  }

  async addPlace(place: Omit<Place, 'id'>) {
    try {
      const docRef = await addDoc(collection(db, 'places'), {
        ...place,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'places');
      throw error;
    }
  }

  async updatePlace(id: string, place: Partial<Place>) {
    try {
      await updateDoc(doc(db, 'places', id), {
        ...place,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `places/${id}`);
      throw error;
    }
  }

  async deletePlace(id: string) {
    try {
      await deleteDoc(doc(db, 'places', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `places/${id}`);
      throw error;
    }
  }

  ngOnDestroy() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }
}
