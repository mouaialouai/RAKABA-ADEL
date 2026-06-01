/**
 * 🔄 DataSyncManager — Real-time cross-device sync using Supabase
 * Replaces Firebase Firestore with Supabase Realtime + PostgreSQL
 */

import { supabase } from './supabaseConfig';

// 🛡️ Global Storage Interception & Timestamp Automation
if (typeof window !== 'undefined' && !(window as any).__storage_intercepted__) {
  (window as any).__storage_intercepted__ = true;
  (window as any).__is_syncing_data__ = false;

  const originalSetItem = localStorage.setItem.bind(localStorage);
  localStorage.setItem = function (key: string, value: string) {
    originalSetItem(key, value);
    if (
      key.startsWith('rq_') &&
      key !== 'rq_active_role' &&
      !key.endsWith('_timestamp') &&
      !(window as any).__is_syncing_data__
    ) {
      const timestamp = (window as any).__is_initializing_default__ ? '1' : String(Date.now());
      originalSetItem(`${key}_timestamp`, timestamp);
    }
  };

  const originalRemoveItem = localStorage.removeItem.bind(localStorage);
  localStorage.removeItem = function (key: string) {
    originalRemoveItem(key);
    if (
      key.startsWith('rq_') &&
      key !== 'rq_active_role' &&
      !key.endsWith('_timestamp') &&
      !(window as any).__is_syncing_data__
    ) {
      originalRemoveItem(`${key}_timestamp`);
    }
  };
}

export class DataSyncManager {
  private static isSyncing = false;
  private static syncIntervalId: any = null;
  private static realtimeChannel: any = null;
  private static listeners = new Set<() => void>();
  private static supabaseReady = false;

  static {
    DataSyncManager.checkSupabaseReady();
  }

  private static async checkSupabaseReady() {
    try {
      const { error } = await supabase.from('global_state').select('key').limit(1);
      if (!error) {
        DataSyncManager.supabaseReady = true;
        console.log('[DataSyncManager] Supabase connection established ✅');
        DataSyncManager.startRealtimeSubscription();
      } else {
        console.warn('[DataSyncManager] Supabase not ready:', error.message);
      }
    } catch (e) {
      console.warn('[DataSyncManager] Supabase check failed:', e);
    }
  }

  public static subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => { this.listeners.delete(listener); };
  }

  private static notifyListeners() {
    this.listeners.forEach(listener => {
      try { listener(); } catch (e) { console.error('[DataSyncManager] Listener error:', e); }
    });
  }

  private static startRealtimeSubscription() {
    if (this.realtimeChannel) return;

    this.realtimeChannel = supabase
      .channel('global_state_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'global_state',
      }, (payload: any) => {
        const row = payload.new || payload.old;
        if (!row || !row.key) return;

        const key = row.key;
        if (key === 'rq_active_role') return;

        const remoteVal = row.value || '';
        const remoteTime = parseInt(String(row.timestamp || '0')) || 0;
        const localVal = localStorage.getItem(key);
        const localTime = parseInt(localStorage.getItem(`${key}_timestamp`) || '0') || 0;

        if (remoteTime > localTime) {
          const merged = DataSyncManager.mergeStates(remoteVal, localVal || '', remoteTime, localTime);
          (window as any).__is_syncing_data__ = true;
          localStorage.setItem(key, merged);
          localStorage.setItem(`${key}_timestamp`, String(remoteTime));
          (window as any).__is_syncing_data__ = false;
          console.log('[DataSyncManager] ⚡ Realtime update:', key);
          DataSyncManager.notifyListeners();
        }
      })
      .subscribe();
  }

  public static async syncWithServer(onSuccessNotification?: () => void) {
    if (typeof window === 'undefined') return;
    if (this.isSyncing) return;
    if (!this.supabaseReady) {
      await this.checkSupabaseReady();
      if (!this.supabaseReady) return;
    }

    this.isSyncing = true;
    try {
      // جمع كل مفاتيح rq_ المحلية
      const localData: Record<string, { value: string; timestamp: number }> = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('rq_') && key !== 'rq_active_role' && !key.endsWith('_timestamp')) {
          const val = localStorage.getItem(key) || '';
          const tVal = parseInt(localStorage.getItem(`${key}_timestamp`) || '1') || 1;
          localData[key] = { value: val, timestamp: tVal };
        }
      }

      // جلب كل السجلات من Supabase دفعة واحدة
      const { data: remoteRows, error } = await supabase
        .from('global_state')
        .select('key, value, timestamp');

      if (error) {
        console.warn('[DataSyncManager] Supabase fetch error:', error.message);
        return;
      }

      const remoteMap: Record<string, { value: string; timestamp: number }> = {};
      (remoteRows || []).forEach((row: any) => {
        remoteMap[row.key] = {
          value: row.value || '',
          timestamp: parseInt(String(row.timestamp || '0')) || 0
        };
      });

      const upserts: { key: string; value: string; timestamp: number }[] = [];
      let localHasChanges = false;

      for (const key of Object.keys(localData)) {
        const local = localData[key];
        const remote = remoteMap[key];

        if (!remote) {
          upserts.push({ key, value: local.value, timestamp: local.timestamp });
        } else if (remote.timestamp > local.timestamp) {
          const merged = this.mergeStates(remote.value, local.value, remote.timestamp, local.timestamp);
          (window as any).__is_syncing_data__ = true;
          localStorage.setItem(key, merged);
          localStorage.setItem(`${key}_timestamp`, String(remote.timestamp));
          (window as any).__is_syncing_data__ = false;
          localHasChanges = true;
        } else if (local.timestamp > remote.timestamp) {
          upserts.push({ key, value: local.value, timestamp: local.timestamp });
        } else if (local.value !== remote.value) {
          const merged = this.mergeStates(remote.value, local.value, remote.timestamp, local.timestamp);
          (window as any).__is_syncing_data__ = true;
          localStorage.setItem(key, merged);
          (window as any).__is_syncing_data__ = false;
          localHasChanges = true;
          upserts.push({ key, value: merged, timestamp: local.timestamp });
        }
      }

      if (upserts.length > 0) {
        const { error: upsertError } = await supabase
          .from('global_state')
          .upsert(upserts, { onConflict: 'key' });
        if (upsertError) {
          console.warn('[DataSyncManager] Upsert error:', upsertError.message);
        } else {
          console.log('[DataSyncManager] ☁️ Pushed', upserts.length, 'keys to Supabase.');
        }
      }

      if (localHasChanges || upserts.length > 0) {
        if (onSuccessNotification) onSuccessNotification();
        this.notifyListeners();
      }
    } catch (err) {
      console.warn('[DataSyncManager] Sync error (working locally):', err);
    } finally {
      this.isSyncing = false;
    }
  }

  public static triggerImmediateSync(onSuccessNotification?: () => void) {
    this.syncWithServer(onSuccessNotification);
  }

  public static startAutoSync(onSuccessNotification: () => void, intervalMs = 10000) {
    if (typeof window === 'undefined') return;
    if (this.syncIntervalId) return;
    setTimeout(() => this.syncWithServer(onSuccessNotification), 500);
    this.syncIntervalId = setInterval(() => this.syncWithServer(onSuccessNotification), intervalMs);
  }

  public static stopAutoSync() {
    if (this.syncIntervalId) {
      clearInterval(this.syncIntervalId);
      this.syncIntervalId = null;
    }
  }

  // stub للتوافق مع store.ts
  public static startRealtimeStream(onSuccessNotification: () => void) {
    this.subscribe(onSuccessNotification);
  }

  private static mergeStates(
    serverValue: string | undefined,
    clientValue: string,
    serverTime: number,
    clientTime: number
  ): string {
    if (!serverValue) return clientValue;
    if (!clientValue) return serverValue;

    const trimmedServer = serverValue.trim();
    const trimmedClient = clientValue.trim();

    const isServerJson =
      (trimmedServer.startsWith('{') && trimmedServer.endsWith('}')) ||
      (trimmedServer.startsWith('[') && trimmedServer.endsWith(']'));
    const isClientJson =
      (trimmedClient.startsWith('{') && trimmedClient.endsWith('}')) ||
      (trimmedClient.startsWith('[') && trimmedClient.endsWith(']'));

    if (!isServerJson || !isClientJson) return clientValue;

    try {
      const serverObj = JSON.parse(trimmedServer);
      const clientObj = JSON.parse(trimmedClient);

      if (Array.isArray(serverObj) && Array.isArray(clientObj)) {
        const sample = serverObj[0] || clientObj[0];
        if (sample && typeof sample === 'object') {
          const idKey =
            ['id', 'code', 'learnerId', 'studentName', 'teacherName', 'key'].find(
              k => k in sample
            ) || 'id';
          const mergedMap = new Map();

          serverObj.forEach((item: any) => {
            const k = String(item?.[idKey] || '');
            if (k) mergedMap.set(k, item);
          });

          clientObj.forEach((item: any) => {
            const k = String(item?.[idKey] || '');
            if (!k) return;
            const existing = mergedMap.get(k);
            if (existing) {
              const tS =
                parseInt(existing.updatedAt || existing.submittedAt || '0') || serverTime;
              const tC =
                parseInt(item.updatedAt || item.submittedAt || '0') || clientTime;
              mergedMap.set(k, tS > tC ? { ...item, ...existing } : { ...existing, ...item });
            } else {
              mergedMap.set(k, item);
            }
          });

          return JSON.stringify(Array.from(mergedMap.values()));
        }
        return JSON.stringify(Array.from(new Set([...serverObj, ...clientObj])));
      }

      if (
        typeof serverObj === 'object' &&
        typeof clientObj === 'object' &&
        serverObj !== null &&
        clientObj !== null
      ) {
        return JSON.stringify({ ...serverObj, ...clientObj });
      }
    } catch (e) {
      // تجاهل أخطاء JSON
    }

    return clientValue;
  }
}
