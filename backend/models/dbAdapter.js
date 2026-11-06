const fs = require('fs');
const path = require('path');
const { getInitialSeedData } = require('../database/seedData');

const DB_FILE_PATH = path.join(__dirname, '../database/data.json');

// Concurrency lock for critical state transactions (e.g. inventory assignment)
class AsyncLock {
  constructor() {
    this.queue = Promise.resolve();
  }

  acquire(fn) {
    let result;
    this.queue = this.queue.then(async () => {
      result = await fn();
    }).catch(err => {
      console.error('Lock execution error:', err);
      throw err;
    });
    return this.queue.then(() => result);
  }
}

const dbLock = new AsyncLock();

let memoryDb = null;

async function initDatabase() {
  if (memoryDb) return memoryDb;

  // Check if persisted database file exists
  if (fs.existsSync(DB_FILE_PATH)) {
    try {
      const raw = fs.readFileSync(DB_FILE_PATH, 'utf8');
      memoryDb = JSON.parse(raw);
      console.log('✓ Loaded existing BloodBridge local database store.');
      return memoryDb;
    } catch (err) {
      console.warn('! Could not parse existing DB file, generating fresh initial seed data.');
    }
  }

  // Generate seed data
  console.log('Initializing fresh BloodBridge database with seed data...');
  memoryDb = await getInitialSeedData();
  saveDatabaseSync();
  console.log('✓ Initialized and persisted BloodBridge database.');
  return memoryDb;
}

function saveDatabaseSync() {
  if (!memoryDb) return;
  const dir = path.dirname(DB_FILE_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(DB_FILE_PATH, JSON.stringify(memoryDb, null, 2), 'utf8');
}

const db = {
  async getDb() {
    return await initDatabase();
  },

  async runTransaction(transactionFn) {
    return await dbLock.acquire(async () => {
      const database = await initDatabase();
      const result = await transactionFn(database);
      saveDatabaseSync();
      return result;
    });
  },

  // Generic collection accessors
  async find(collectionName, predicate = () => true) {
    const database = await initDatabase();
    const items = database[collectionName] || [];
    return items.filter(predicate);
  },

  async findOne(collectionName, predicate) {
    const database = await initDatabase();
    const items = database[collectionName] || [];
    return items.find(predicate) || null;
  },

  async insert(collectionName, item) {
    return await dbLock.acquire(async () => {
      const database = await initDatabase();
      if (!database[collectionName]) {
        database[collectionName] = [];
      }
      database[collectionName].push(item);
      saveDatabaseSync();
      return item;
    });
  },

  async update(collectionName, predicate, updateFn) {
    return await dbLock.acquire(async () => {
      const database = await initDatabase();
      const items = database[collectionName] || [];
      let updatedCount = 0;
      for (let i = 0; i < items.length; i++) {
        if (predicate(items[i])) {
          updateFn(items[i]);
          updatedCount++;
        }
      }
      if (updatedCount > 0) {
        saveDatabaseSync();
      }
      return updatedCount;
    });
  },

  async delete(collectionName, predicate) {
    return await dbLock.acquire(async () => {
      const database = await initDatabase();
      const initialLength = (database[collectionName] || []).length;
      database[collectionName] = (database[collectionName] || []).filter(item => !predicate(item));
      const deletedCount = initialLength - database[collectionName].length;
      if (deletedCount > 0) {
        saveDatabaseSync();
      }
      return deletedCount;
    });
  },

  // Audit logging utility
  async logAudit({ userId, userEmail, action, entityName, entityId, ipAddress, details }) {
    return await dbLock.acquire(async () => {
      const database = await initDatabase();
      const newLog = {
        log_id: (database.auditLogs.length > 0 ? Math.max(...database.auditLogs.map(l => l.log_id || 0)) : 0) + 1,
        user_id: userId || null,
        user_email: userEmail || 'SYSTEM/ANONYMOUS',
        action,
        entity_name: entityName || null,
        entity_id: entityId ? String(entityId) : null,
        ip_address: ipAddress || '127.0.0.1',
        details: details || '',
        created_at: new Date().toISOString()
      };
      database.auditLogs.push(newLog);
      saveDatabaseSync();
      return newLog;
    });
  },

  // In-app notification dispatcher
  async createNotification({ userId, title, message, type = 'INFORMATION' }) {
    return await dbLock.acquire(async () => {
      const database = await initDatabase();
      const newNotif = {
        notification_id: (database.notifications.length > 0 ? Math.max(...database.notifications.map(n => n.notification_id || 0)) : 0) + 1,
        user_id: userId,
        title,
        message,
        notification_type: type,
        is_read: 0,
        created_at: new Date().toISOString()
      };
      database.notifications.push(newNotif);
      saveDatabaseSync();
      return newNotif;
    });
  }
};

module.exports = { db, initDatabase };
