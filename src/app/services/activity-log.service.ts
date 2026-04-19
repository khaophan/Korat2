import { Injectable, signal, OnDestroy } from '@angular/core';
import { db, auth } from '../firebase';
import { collection, onSnapshot, query, addDoc, orderBy } from 'firebase/firestore';
import { ActivityLog } from '../models';
import { handleFirestoreError, OperationType } from '../utils/error-handler';

@Injectable({
  providedIn: 'root'
})
export class ActivityLogService implements OnDestroy {
  logs = signal<ActivityLog[]>([]);
  private unsubscribe: (() => void) | null = null;

  constructor() {
    this.listenToLogs();
  }

  listenToLogs() {
    const q = query(collection(db, 'activity_logs'), orderBy('timestamp', 'desc'));
    this.unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ActivityLog));
      this.logs.set(data);
    }, (error) => {
      console.warn('Could not load activity logs (might not be admin)', error);
    });
  }

  async logAction(action: string, detail: string) {
    if (!auth.currentUser) return;
    try {
      await addDoc(collection(db, 'activity_logs'), {
        adminId: auth.currentUser.uid,
        action,
        detail,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'activity_logs');
      throw error;
    }
  }

  ngOnDestroy() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }
}
