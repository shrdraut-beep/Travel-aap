import { db } from '../firebase';
import { doc, getDoc, setDoc, updateDoc, deleteDoc, collection, getDocs, query, where, QueryConstraint } from 'firebase/firestore';

export abstract class BaseService {
  protected db = db;

  protected async getDocument(collectionName: string, id: string) {
    const docRef = doc(this.db, collectionName, id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
  }

  protected async createDocument(collectionName: string, id: string, data: any) {
    const docRef = doc(this.db, collectionName, id);
    await setDoc(docRef, data);
  }

  protected async updateDocument(collectionName: string, id: string, data: any) {
    const docRef = doc(this.db, collectionName, id);
    await updateDoc(docRef, data);
  }

  protected async deleteDocument(collectionName: string, id: string) {
    const docRef = doc(this.db, collectionName, id);
    await deleteDoc(docRef);
  }

  protected async listDocuments(collectionName: string, constraints: QueryConstraint[] = []) {
    const collectionRef = collection(this.db, collectionName);
    const q = query(collectionRef, ...constraints);
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
}
