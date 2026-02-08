const Database = require('better-sqlite3');
const path = require('path');
const { app } = require('electron');
const log = require('electron-log');

class LocalDatabase {
    constructor() {
        this.db = null;
        this.dbPath = path.join(app.getPath('userData'), 'iliski_analiz.db');
    }

    init() {
        try {
            log.info(`Initializing local database at ${this.dbPath}`);
            this.db = new Database(this.dbPath);
            this.initSchema();
            return true;
        } catch (error) {
            log.error('Failed to initialize local database:', error);
            return false;
        }
    }

    initSchema() {
        if (!this.db) return;

        // Analyses table
        this.db.exec(`
      CREATE TABLE IF NOT EXISTS analyses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        data TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        type TEXT DEFAULT 'relationship',
        synced BOOLEAN DEFAULT 0
      );
    `);

        // Settings table
        this.db.exec(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

        log.info('Database schema initialized');
    }

    saveAnalysis(data) {
        if (!this.db) return null;
        try {
            const stmt = this.db.prepare('INSERT INTO analyses (data, type) VALUES (?, ?)');
            const type = data.gottman_report ? 'gottman' : 'basic';
            const info = stmt.run(JSON.stringify(data), type);
            log.info(`Saved analysis with ID: ${info.lastInsertRowid}`);
            return { id: info.lastInsertRowid, success: true };
        } catch (error) {
            log.error('Failed to save analysis:', error);
            throw error;
        }
    }

    getHistory(limit = 20, offset = 0) {
        if (!this.db) return [];
        try {
            const stmt = this.db.prepare('SELECT * FROM analyses ORDER BY created_at DESC LIMIT ? OFFSET ?');
            const rows = stmt.all(limit, offset);
            return rows.map(row => ({
                ...row,
                data: JSON.parse(row.data)
            }));
        } catch (error) {
            log.error('Failed to get history:', error);
            return [];
        }
    }

    getAnalysis(id) {
        if (!this.db) return null;
        try {
            const stmt = this.db.prepare('SELECT * FROM analyses WHERE id = ?');
            const row = stmt.get(id);
            if (!row) return null;
            return {
                ...row,
                data: JSON.parse(row.data)
            };
        } catch (error) {
            log.error('Failed to get analysis:', error);
            return null;
        }
    }

    deleteAnalysis(id) {
        if (!this.db) return false;
        try {
            const stmt = this.db.prepare('DELETE FROM analyses WHERE id = ?');
            const info = stmt.run(id);
            return info.changes > 0;
        } catch (error) {
            log.error('Failed to delete analysis:', error);
            return false;
        }
    }

    close() {
        if (this.db) {
            this.db.close();
            this.db = null;
        }
    }
}

module.exports = new LocalDatabase();
