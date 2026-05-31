/**
 * 🔄 DataSyncManager - Central client-server synchronization manager for real-time operations
 * Facilitates instant cross-device updates for important events (Attendance, Absences, Results, etc.)
 */

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
      originalSetItem.call(localStorage, `${key}_timestamp`, String(Date.now()));
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

export class DataSyncManager {
  private static isSyncing = false;
  private static syncIntervalId: any = null;
  private static listeners = new Set<() => void>();

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
   * Collects all 'rq_' variables and merges them with the server state based on highest timestamp (Last-Write-Wins).
   */
  public static async syncWithServer(onSuccessNotification?: () => void) {
    if (typeof window === 'undefined') return;
    if (this.isSyncing) return;

    this.isSyncing = true;
    try {
      // 1. Gather all local keys starting with 'rq_' (excluding active role)
      const clientData: Record<string, string> = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('rq_') && key !== 'rq_active_role') {
          const val = localStorage.getItem(key) || '';
          clientData[key] = val;

          // Self-repair: Ensure every data key has a valid timestamp if modified/present
          if (!key.endsWith('_timestamp')) {
            const timestampKey = `${key}_timestamp`;
            if (!localStorage.getItem(timestampKey)) {
              const defaultTime = String(Date.now());
              // Call original to avoid infinite loop / re-triggering interceptor
              localStorage.setItem(timestampKey, defaultTime);
              clientData[timestampKey] = defaultTime;
            }
          }
        }
      }

      // 2. Perform POST request to sync API endpoint
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

        // Use global syncing flag to tell the interceptor NOT to overwrite the incoming server timestamps
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

        // 3. If live server states override local variables, trigger store notifications
        if (hasChanges) {
          if (onSuccessNotification) {
            onSuccessNotification();
          }
          this.notifyListeners();
        }
      }
    } catch (err) {
      console.warn("[DataSyncManager] Server DB sync unreachable (Operating locally).", err);
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
}
