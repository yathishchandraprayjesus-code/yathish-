import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  getDocs,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { ChatSession, MemoryFile } from '../types';

// Standardized error handler matching Firebase skill specification
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

let dbInstance;
try {
  const customDbId = firebaseConfig.firestoreDatabaseId;
  dbInstance = initializeFirestore(
    app,
    {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager(),
      }),
    },
    customDbId && customDbId !== '(default)' ? customDbId : undefined
  );
} catch {
  dbInstance = firebaseConfig.firestoreDatabaseId
    ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
    : getFirestore(app);
}

export const db = dbInstance;

// Authentication helpers
export async function signInWithGoogle(): Promise<User> {
  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;

  // Persist user profile to Firestore
  const userPath = `users/${user.uid}`;
  try {
    const userRef = doc(db, 'users', user.uid);
    await setDoc(
      userRef,
      {
        displayName: user.displayName || 'User',
        email: user.email,
        photoURL: user.photoURL || '',
        createdAt: new Date().toISOString(),
        lastLoginAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    if (errMsg.includes('permission') || errMsg.includes('PERMISSION_DENIED')) {
      handleFirestoreError(err, OperationType.WRITE, userPath);
    } else {
      console.warn('Failed to sync user profile:', err);
    }
  }

  return user;
}

export async function logOut(): Promise<void> {
  await signOut(auth);
}

// Firestore Session Persistence
export async function syncSessionToFirestore(userId: string, session: ChatSession): Promise<void> {
  if (!userId || !session.id) return;
  const path = `users/${userId}/sessions/${session.id}`;
  try {
    const sessionRef = doc(db, 'users', userId, 'sessions', session.id);
    await setDoc(sessionRef, {
      id: session.id,
      userId,
      title: session.title,
      createdAt: session.createdAt,
      messages: session.messages,
      updatedAt: Date.now(),
    });
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    if (errMsg.includes('permission') || errMsg.includes('PERMISSION_DENIED')) {
      handleFirestoreError(err, OperationType.WRITE, path);
    } else {
      console.warn('Failed to sync session to Firestore:', err);
    }
  }
}

export async function loadSessionsFromFirestore(userId: string): Promise<ChatSession[]> {
  if (!userId) return [];
  const path = `users/${userId}/sessions`;
  try {
    const sessionsCol = collection(db, 'users', userId, 'sessions');
    const snapshot = await getDocs(sessionsCol);
    const sessions: ChatSession[] = [];
    snapshot.forEach((d) => {
      const data = d.data();
      sessions.push({
        id: data.id || d.id,
        title: data.title || 'Conversation',
        createdAt: data.createdAt || Date.now(),
        messages: data.messages || [],
      });
    });
    return sessions.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    if (errMsg.includes('permission') || errMsg.includes('PERMISSION_DENIED')) {
      handleFirestoreError(err, OperationType.LIST, path);
    } else {
      console.warn('Failed to load sessions from Firestore:', err);
      return [];
    }
  }
}

export async function deleteSessionFromFirestore(userId: string, sessionId: string): Promise<void> {
  if (!userId || !sessionId) return;
  const path = `users/${userId}/sessions/${sessionId}`;
  try {
    const sessionRef = doc(db, 'users', userId, 'sessions', sessionId);
    await deleteDoc(sessionRef);
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    if (errMsg.includes('permission') || errMsg.includes('PERMISSION_DENIED')) {
      handleFirestoreError(err, OperationType.DELETE, path);
    } else {
      console.warn('Failed to delete session from Firestore:', err);
    }
  }
}

// Firestore Memory File Persistence
export async function syncMemoryFilesToFirestore(userId: string, files: MemoryFile[]): Promise<void> {
  if (!userId || !files.length) return;
  for (const file of files) {
    const encodedPath = encodeURIComponent(file.path);
    const docPath = `users/${userId}/memoryFiles/${encodedPath}`;
    try {
      const fileRef = doc(db, 'users', userId, 'memoryFiles', encodedPath);
      await setDoc(fileRef, {
        userId,
        path: file.path,
        name: file.name || file.path.split('/').pop() || file.path,
        description: file.description || '',
        sources: file.sources || [],
        aliases: file.aliases || [],
        content: file.content || [],
        version: String(file.version || '1.0'),
        updatedAt: file.updatedAt || new Date().toISOString(),
      });
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      if (errMsg.includes('permission') || errMsg.includes('PERMISSION_DENIED')) {
        handleFirestoreError(err, OperationType.WRITE, docPath);
      } else {
        console.warn('Failed to sync memory file:', err);
      }
    }
  }
}

export async function loadMemoryFilesFromFirestore(userId: string): Promise<MemoryFile[]> {
  if (!userId) return [];
  const path = `users/${userId}/memoryFiles`;
  try {
    const col = collection(db, 'users', userId, 'memoryFiles');
    const snapshot = await getDocs(col);
    const files: MemoryFile[] = [];
    snapshot.forEach((d) => {
      const data = d.data();
      files.push({
        path: data.path,
        name: data.name || data.path.split('/').pop() || data.path,
        description: data.description || '',
        sources: Array.isArray(data.sources) ? data.sources : [],
        aliases: Array.isArray(data.aliases) ? data.aliases : [],
        content: Array.isArray(data.content) ? data.content : [],
        version: String(data.version || '1.0'),
        updatedAt: data.updatedAt || new Date().toISOString(),
      });
    });
    return files;
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    if (errMsg.includes('permission') || errMsg.includes('PERMISSION_DENIED')) {
      handleFirestoreError(err, OperationType.LIST, path);
    } else {
      console.warn('Failed to load memory files from Firestore:', err);
      return [];
    }
  }
}

// Firestore Media Creation Persistence
export interface MediaRecord {
  id: string;
  type: 'image' | 'video' | 'music' | 'transcription';
  prompt: string;
  mediaUrl?: string;
  audioUrl?: string;
  text?: string;
  aspectRatio?: string;
  model: string;
  createdAt: number;
}

export async function saveMediaCreation(userId: string, media: MediaRecord): Promise<void> {
  if (!userId || !media.id) return;
  const path = `users/${userId}/mediaCreations/${media.id}`;
  try {
    const mediaRef = doc(db, 'users', userId, 'mediaCreations', media.id);
    await setDoc(mediaRef, {
      ...media,
      userId,
    });
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    if (errMsg.includes('permission') || errMsg.includes('PERMISSION_DENIED')) {
      handleFirestoreError(err, OperationType.WRITE, path);
    } else {
      console.warn('Failed to save media creation to Firestore:', err);
    }
  }
}

export async function loadMediaCreations(userId: string): Promise<MediaRecord[]> {
  if (!userId) return [];
  const path = `users/${userId}/mediaCreations`;
  try {
    const mediaCol = collection(db, 'users', userId, 'mediaCreations');
    const snapshot = await getDocs(mediaCol);
    const records: MediaRecord[] = [];
    snapshot.forEach((d) => {
      records.push(d.data() as MediaRecord);
    });
    return records.sort((a, b) => b.createdAt - a.createdAt);
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    if (errMsg.includes('permission') || errMsg.includes('PERMISSION_DENIED')) {
      handleFirestoreError(err, OperationType.LIST, path);
    } else {
      console.warn('Failed to load media creations:', err);
      return [];
    }
  }
}

export { onAuthStateChanged };
export type { User };
