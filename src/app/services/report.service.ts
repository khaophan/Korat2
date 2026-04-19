import { Injectable, signal, OnDestroy } from '@angular/core';
import { db } from '../firebase';
import { collection, doc, updateDoc, onSnapshot, query, addDoc } from 'firebase/firestore';
import { Report } from '../models';
import { handleFirestoreError, OperationType } from '../utils/error-handler';

@Injectable({
  providedIn: 'root'
})
export class ReportService implements OnDestroy {
  reports = signal<Report[]>([]);
  private unsubscribe: (() => void) | null = null;

  constructor() {
    this.listenToReports();
  }

  listenToReports() {
    const q = query(collection(db, 'reports'));
    this.unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Report));
      this.reports.set(data);
    }, (error) => {
      // Only admins can read reports, so this might fail for public users.
      // We should handle this gracefully or only listen if admin.
      // For now, we'll just log it.
      console.warn('Could not load reports (might not be admin)', error);
    });
  }

  async addReport(report: Omit<Report, 'id'>) {
    try {
      const docRef = await addDoc(collection(db, 'reports'), {
        ...report,
        createdAt: new Date().toISOString()
      });
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'reports');
      throw error;
    }
  }

  async updateReportStatus(id: string, status: 'confirmed' | 'rejected', resolveNote?: string) {
    try {
      await updateDoc(doc(db, 'reports', id), {
        status,
        resolveNote: resolveNote || '',
        resolvedAt: new Date().toISOString()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `reports/${id}`);
      throw error;
    }
  }

  ngOnDestroy() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }
}
