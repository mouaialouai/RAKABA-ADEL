/**
 * 🔄 DataSyncManager - Central client-server synchronization manager for real-time operations
 * Facilitates instant cross-device updates for important events (Attendance, Absences, Results, etc.)
 */

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
   * Collects all 'rq_' variables and merges them with the server state.
   */
  public static async syncWithServer(onSuccessNotification?: () => void) {
    if (typeof window === 'undefined') return;
    if (this.isSyncing) return;

    this.isSyncing = true;
    try {
      // 1. Gather all local keys starting with 'rq_' (excluding target session configurations like active role)
      const clientData: Record<string, string> = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('rq_') && key !== 'rq_active_role') {
          clientData[key] = localStorage.getItem(key) || '';
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
        Object.keys(mergedData).forEach(key => {
          const oldVal = localStorage.getItem(key);
          const newVal = mergedData[key];
          if (oldVal !== newVal) {
            localStorage.setItem(key, newVal);
            hasChanges = true;
          }
        });

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
