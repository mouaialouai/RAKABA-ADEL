/**
 * 🔄 DataSyncManager - Central client-server synchronization manager for real-time operations
 * Facilitates instant cross-device updates for important events (Attendance, Absences, Results, etc.)
 * Integrates directly with real-time Firebase Firestore database for absolute persistence and sub-second updates!
 */

import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously } from "firebase/auth";
import { 
  getFirestore, 
  doc, 
  collection, 
  getDoc, 
  setDoc, 
  onSnapshot, 
  writeBatch 
} from "firebase/firestore";
import firebaseConfig from "./firebaseConfig";

// 🛡️ Global Storage Interception & Timestamp Automation
if (typeof window !== 'undefined' && !(window as any).__storage_intercepted__) {
  (window as any).__storage_intercepted__ = true;
  (window as any).__is_syncing_data__ = false;

  const originalSetItem = localStorage.setItem;
  localStorage.setItem = function (key: string, value: string) {
    originalSetItem.call(localStorage, key, value);
    if (
      key.startsWith('rq_') &&
      key !== 'rq_active_role' &&
      !key.endsWith('_timestamp') &&
      !(window as any).__is_syncing_data__
    ) {
      const timestamp = (window as any).__is_initializing_default__ ? '1' : String(Date.now());
      originalSetItem.call(localStorage, `${key}_timestamp`, timestamp);
    }
  };

  const originalRemoveItem = localStorage.removeItem;
  localStorage.removeItem = function (key: string) {
    originalRemoveItem.call(localStorage, key);
    if (
      key.startsWith('rq_') &&
      key !== 'rq_active_role' &&
      !key.endsWith('_timestamp') &&
      !(window as any).__is_syncing_data__
    ) {
      originalRemoveItem.call(localStorage, `${key}_timestamp`);
    }
  };
}

// Global Firebase state trackers
let firebaseApp: any = null;
let db: any = null;
let auth: any = null;
let firebaseInitialized = false;

try {
  const isApiKeyValid = firebaseConfig.apiKey && 
                        firebaseConfig.apiKey.trim() !== '' && 
                        firebaseConfig.apiKey !== 'your_api_key_here';

  if (isApiKeyValid) {
    firebaseApp = initializeApp(firebaseConfig);
    const _dbId = (firebaseConfig as any).firestoreDatabaseId;
    db = (_dbId && _dbId !== '(default)' && _dbId !== '')
      ? getFirestore(firebaseApp, _dbId)
      : getFirestore(firebaseApp);
    auth = getAuth(firebaseApp);
    firebaseInitialized = true;
    console.log("[DataSyncManager] Standard Cloud Database client initialized successfully.");
  } else {
    console.warn("[DataSyncManager] Firebase configuration is absent or placeholder. Operating in Offline-Only Local Storage mode.");
  }
} catch (err) {
  console.error("[DataSyncManager] Failed to initialize Firebase SDK:", err);
}

export class DataSyncManager {
  private static isSyncing = false;
  private static syncIntervalId: any = null;
  private static eventSource: EventSource | null = null;
  private static listUnsub: (() => void) | null = null;
  private static listeners = new Set<() => void>();

  static {
    // Initiate anonymous sign in to ensure secure database security validation rules
    if (auth) {
      signInAnonymously(auth)
        .then(() => {
          console.log("[DataSyncManager] Secure cloud database link established.");
          this.startFirestoreRealtimeStream();
        })
        .catch((err) => {
          console.warn("[DataSyncManager] Cloud token login rejected or delayed:", err);
        });
    }
  }

  public static subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private static notifyListeners() {
    this.listeners.forEach(listener => {
      try {
        listener();
      } catch (err) {
        console.error("[Sync Manager] Error notifying listener:", err);
      }
    });
  }

  /**
   * Main synchronization routine
   * Collects all 'rq_' variables and merges them with the cloud state based on highest timestamp (Last-Write-Wins),
   * falling back gracefully to the REST server API if the cloud connection is not ready.
   */
  public static async syncWithServer(onSuccessNotification?: () => void) {
    if (typeof window === 'undefined') return;
    if (this.isSyncing) return;

    this.isSyncing = true;
    try {
      // 🟢 Part 1: Primary Sync - Real-time Serverless-Safe Firestore Database Sync
      if (firebaseInitialized && db && auth?.currentUser) {
        const localChangesToUpload: Record<string, { value: string; timestamp: string }> = {};
        
        // Gather all local 'rq_' keys
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('rq_') && key !== 'rq_active_role' && !key.endsWith('_timestamp')) {
            const val = localStorage.getItem(key) || '';
            const tKey = `${key}_timestamp`;
            let tVal = localStorage.getItem(tKey);
            if (!tVal) {
              tVal = '1';
              (window as any).__is_syncing_data__ = true;
              localStorage.setItem(tKey, tVal);
              (window as any).__is_syncing_data__ = false;
            }
            localChangesToUpload[key] = { value: val, timestamp: tVal };
          }
        }

        const batch = writeBatch(db);
        let batchHasOperations = false;
        let localHasChanges = false;

        // Sync individual keys to prevent single-document bottlenecks
        for (const key of Object.keys(localChangesToUpload)) {
          const docRef = doc(db, "global_state", key);
          const docSnap = await getDoc(docRef);
          
          const localItem = localChangesToUpload[key];
          let finalVal = localItem.value;
          let finalTime = localItem.timestamp;

          if (docSnap.exists()) {
            const remoteData = docSnap.data();
            const remoteVal = remoteData.value || '';
            const remoteTimestampStr = String(remoteData.timestamp || '0');

            const localTime = parseInt(localItem.timestamp) || 0;
            const remoteTime = parseInt(remoteTimestampStr) || 0;

            if (remoteTime > localTime) {
              // Remote is strictly newer
              const merged = this.mergeStates(remoteVal, localItem.value, remoteTime, localTime);
              finalVal = merged;
              finalTime = String(remoteTime);

              (window as any).__is_syncing_data__ = true;
              localStorage.setItem(key, merged);
              localStorage.setItem(`${key}_timestamp`, String(remoteTime));
              (window as any).__is_syncing_data__ = false;
              localHasChanges = true;
            } else if (localTime > remoteTime) {
              // Local is newer, schedules direct write to database
              batch.set(docRef, { value: finalVal, timestamp: finalTime });
              batchHasOperations = true;
            } else if (localItem.value !== remoteVal) {
              // Same timestamp but different content, merge and write
              const merged = this.mergeStates(remoteVal, localItem.value, remoteTime, localTime);
              finalVal = merged;
              finalTime = String(localTime);

              (window as any).__is_syncing_data__ = true;
              localStorage.setItem(key, merged);
              (window as any).__is_syncing_data__ = false;
              localHasChanges = true;

              batch.set(docRef, { value: finalVal, timestamp: finalTime });
              batchHasOperations = true;
            }
          } else {
            // Document doesn't exist yet on the server, upload
            batch.set(docRef, { value: finalVal, timestamp: finalTime });
            batchHasOperations = true;
          }
        }

        if (batchHasOperations) {
          await batch.commit();
          console.log("[DataSyncManager] Pushed local changes to Cloud Database successfully.");
        }

        if (localHasChanges || batchHasOperations) {
          if (onSuccessNotification) {
            onSuccessNotification();
          }
          this.notifyListeners();
        }
        
        this.isSyncing = false;
        return;
      }

      // 🔵 Part 2: Fallback Sync - Native Express REST Router Link
      const clientData: Record<string, string> = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('rq_') && key !== 'rq_active_role') {
          const val = localStorage.getItem(key) || '';
          clientData[key] = val;

          if (!key.endsWith('_timestamp')) {
            const timestampKey = `${key}_timestamp`;
            if (!localStorage.getItem(timestampKey)) {
              const defaultTime = '1';
              localStorage.setItem(timestampKey, defaultTime);
              clientData[timestampKey] = defaultTime;
            }
          }
        }
      }

      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ clientData })
      });

      if (res.ok) {
        const json = await res.json();
        const mergedData = json.mergedData || {};
        let hasChanges = false;

        (window as any).__is_syncing_data__ = true;
        try {
          Object.keys(mergedData).forEach(key => {
            if (key === 'rq_active_role') return;
            
            const oldVal = localStorage.getItem(key);
            const newVal = mergedData[key];
            if (oldVal !== newVal) {
              localStorage.setItem(key, newVal);
              hasChanges = true;
            }
          });
        } finally {
          (window as any).__is_syncing_data__ = false;
        }

        if (hasChanges) {
          if (onSuccessNotification) {
            onSuccessNotification();
          }
          this.notifyListeners();
        }
      }
    } catch (err) {
      console.warn("[DataSyncManager] Primary Cloud server sync unavailable (Operating locally).", err);
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Instantly forces synchronization to propagate changes to other devices immediately.
   */
  public static triggerImmediateSync(onSuccessNotification?: () => void) {
    this.syncWithServer(onSuccessNotification);
  }

  /**
   * Starts a background interval synchronization routine.
   */
  public static startAutoSync(onSuccessNotification: () => void, intervalMs: number = 3000) {
    if (typeof window === 'undefined') return;
    if (this.syncIntervalId) return;

    this.syncIntervalId = setInterval(() => {
      this.syncWithServer(onSuccessNotification);
    }, intervalMs);

    // Initial trigger
    setTimeout(() => {
      this.syncWithServer(onSuccessNotification);
    }, 300);
  }

  /**
   * Clean up resources
   */
  public static stopAutoSync() {
    if (this.syncIntervalId) {
      clearInterval(this.syncIntervalId);
      this.syncIntervalId = null;
    }
  }

  /**
   * Realtime Event Streaming connection using serverless-friendly Firestore snapshots
   */
  public static startFirestoreRealtimeStream() {
    if (!firebaseInitialized || !db) return;
    if (this.listUnsub) return;

    try {
      const colRef = collection(db, "global_state");
      this.listUnsub = onSnapshot(colRef, (snapshot) => {
        let hasChanges = false;

        (window as any).__is_syncing_data__ = true;
        try {
          snapshot.forEach((docSnap) => {
            const key = docSnap.id;
            const data = docSnap.data();
            if (!key || !data) return;

            const remoteVal = data.value || '';
            const remoteTimestampStr = String(data.timestamp || '0');

            const localVal = localStorage.getItem(key);
            const localTimestampStr = localStorage.getItem(`${key}_timestamp`) || '0';

            const localTime = parseInt(localTimestampStr) || 0;
            const remoteTime = parseInt(remoteTimestampStr) || 0;

            if (remoteTime > localTime) {
              // Remote is strictly newer
              localStorage.setItem(key, remoteVal);
              localStorage.setItem(`${key}_timestamp`, remoteTimestampStr);
              hasChanges = true;
            } else if (remoteTime === localTime && remoteVal !== localVal) {
              // Same timestamp but different content: Merge safely
              const merged = this.mergeStates(remoteVal, localVal || '', remoteTime, localTime);
              if (merged !== localVal) {
                localStorage.setItem(key, merged);
                hasChanges = true;
              }
            }
          });
        } finally {
          (window as any).__is_syncing_data__ = false;
        }

        if (hasChanges) {
          console.log("[DataSyncManager] Instant Cloud Database push update triggered!");
          this.notifyListeners();
        }
      }, (err) => {
        console.warn("[DataSyncManager] Firestore stream disconnected, retrying standard polling...", err);
      });
    } catch (e) {
      console.error("[DataSyncManager] Error establishing Firestore listener stream:", e);
    }
  }

  public static stopFirestoreRealtimeStream() {
    if (this.listUnsub) {
      this.listUnsub();
      this.listUnsub = null;
    }
  }

  /**
   * Realtime Event Streaming connection using standard Server-Sent Events (SSE) (Fallback for non-Firestore deployments)
   */
  public static startRealtimeStream(onSuccessNotification: () => void) {
    if (typeof window === 'undefined') return;
    if (this.eventSource) return;

    const establishSSE = () => {
      const es = new EventSource('/api/sync-stream');
      this.eventSource = es;

      es.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          const mergedData = parsed.mergedData || {};
          let hasChanges = false;

          (window as any).__is_syncing_data__ = true;
          try {
            Object.keys(mergedData).forEach(key => {
              if (key === 'rq_active_role') return;

              const oldVal = localStorage.getItem(key);
              const newVal = mergedData[key];
              if (oldVal !== newVal) {
                localStorage.setItem(key, newVal);
                hasChanges = true;
              }
            });
          } finally {
            (window as any).__is_syncing_data__ = false;
          }

          if (hasChanges) {
            if (onSuccessNotification) {
              onSuccessNotification();
            }
            this.notifyListeners();
          }
        } catch (e) {
          console.error("[DataSyncManager] Error parsing realtime update payload:", e);
        }
      };

      es.onerror = (err) => {
        es.close();
        if (this.eventSource === es) {
          this.eventSource = null;
        }
        setTimeout(() => {
          if (!this.eventSource) establishSSE();
        }, 5000);
      };
    };

    establishSSE();
  }

  public static stopRealtimeStream() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }

  // --- Utility State Merging Algorithms ---

  private static getObjectTimestamp(obj: any): number {
    if (!obj || typeof obj !== 'object') return 0;
    const fields = ['submittedAt', 'timestamp', 'updatedAt', 'createdAt'];
    for (const f of fields) {
      if (obj[f]) {
        const t = new Date(obj[f]).getTime();
        if (!isNaN(t)) return t;
      }
    }
    return 0;
  }

  private static mergeArraysPrimitiveOrObj(arrA: any[], arrB: any[]): any[] {
    const sample = arrA[0] || arrB[0];
    if (!sample || typeof sample !== 'object') {
      return Array.from(new Set([...arrA, ...arrB]));
    }
    const idKey = ['id', 'code', 'learnerId', 'studentName', 'teacherName', 'key'].find(k => k in sample) || 'id';
    const map = new Map();
    arrA.forEach(x => {
      const k = String(x[idKey] || '');
      if (k) map.set(k, x);
    });
    arrB.forEach(x => {
      const k = String(x[idKey] || '');
      if (k) {
        const existing = map.get(k);
        map.set(k, existing ? { ...existing, ...x } : x);
      }
    });
    return Array.from(map.values());
  }

  private static mergeStates(serverValue: string | undefined, clientValue: string, serverTime: number, clientTime: number): string {
    if (!serverValue) return clientValue;
    if (!clientValue) return serverValue;

    const trimmedServer = serverValue.trim();
    const trimmedClient = clientValue.trim();

    const isServerJson = (trimmedServer.startsWith("{") && trimmedServer.endsWith("}")) || 
                         (trimmedServer.startsWith("[") && trimmedServer.endsWith("]"));
    const isClientJson = (trimmedClient.startsWith("{") && trimmedClient.endsWith("}")) || 
                         (trimmedClient.startsWith("[") && trimmedClient.endsWith("]"));

    if (!isServerJson || !isClientJson) {
      return clientValue;
    }

    try {
      const serverObj = JSON.parse(trimmedServer);
      const clientObj = JSON.parse(trimmedClient);

      if (Array.isArray(serverObj) && Array.isArray(clientObj)) {
        const sample = serverObj[0] || clientObj[0];
        if (sample && typeof sample === 'object') {
          const idKey = ['id', 'code', 'learnerId', 'studentName', 'teacherName', 'key'].find(k => k in sample) || 'id';
          const mergedMap = new Map();

          serverObj.forEach((item: any) => {
            if (item && typeof item === 'object') {
              const key = String(item[idKey] || '');
              if (key) mergedMap.set(key, item);
            }
          });

          clientObj.forEach((item: any) => {
            if (item && typeof item === 'object') {
              const key = String(item[idKey] || '');
              if (key) {
                const existingItem = mergedMap.get(key);
                if (existingItem) {
                  const tServer = this.getObjectTimestamp(existingItem) || serverTime;
                  const tClient = this.getObjectTimestamp(item) || clientTime;

                  let mergedItem;
                  if (tServer > tClient) {
                    mergedItem = { ...item, ...existingItem };
                  } else {
                    mergedItem = { ...existingItem, ...item };
                  }
                  
                  Object.keys(item).forEach(prop => {
                    if (Array.isArray(item[prop]) && Array.isArray(existingItem[prop])) {
                      mergedItem[prop] = this.mergeArraysPrimitiveOrObj(existingItem[prop], item[prop]);
                    }
                  });

                  mergedMap.set(key, mergedItem);
                } else {
                  mergedMap.set(key, item);
                }
              }
            }
          });

          return JSON.stringify(Array.from(mergedMap.values()));
        }

        return JSON.stringify(Array.from(new Set([...serverObj, ...clientObj])));
      }

      if (typeof serverObj === 'object' && typeof clientObj === 'object' && serverObj !== null && clientObj !== null) {
        return JSON.stringify({ ...serverObj, ...clientObj });
      }
    } catch (e) {
      // Bypasses JSON syntax differences
    }

    return clientValue;
  }
}
