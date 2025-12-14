const { app } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const { existsSync } = require('fs');
const http = require('http');
const log = require('electron-log');

class BackendManager {
  constructor() {
    this.process = null;
    this.isRunning = false;
    this.port = 8000;
    this.maxRetries = 30;
    this.healthCheckInterval = null;
  }

  /**
   * Determine Python executable path with fallbacks
   */
  getPythonPath(isDev, backendDir) {
    const candidates = [
      // Dev mode: try venv first
      isDev && path.join(backendDir, 'venv/bin/python'),
      isDev && path.join(backendDir, 'venv/Scripts/python.exe'),
      // System Python fallback
      'python3',
      'python',
      // Production: bundled Python
      !isDev && path.join(process.resourcesPath, 'backend/python'),
    ].filter(Boolean);

    for (const candidate of candidates) {
      // For absolute paths, check existence
      if (path.isAbsolute(candidate)) {
        // Validate path doesn't contain problematic characters
        if (this.isPathSafe(candidate) && existsSync(candidate)) {
          log.info(`Found Python at: ${candidate}`);
          return candidate;
        }
      } else {
        // For system commands (python3, python), return as-is
        log.info(`Using system Python: ${candidate}`);
        return candidate;
      }
    }

    throw new Error('No valid Python executable found. Please ensure Python 3 is installed.');
  }

  /**
   * Check if path contains non-ASCII characters that might cause issues
   */
  isPathSafe(filePath) {
    // Check for non-ASCII characters
    const hasNonASCII = /[^\x00-\x7F]/.test(filePath);
    if (hasNonASCII) {
      log.warn(`Path contains non-ASCII characters: ${filePath}`);
      // return false; // Allow it anyway
    }
    return true;
  }

  async start() {
    if (this.isRunning) {
      log.warn('Backend already running');
      return true;
    }

    const isDev = require('electron-is-dev');
    const backendDir = path.join(__dirname, '../../backend');
    
    log.info('Starting backend...');
    log.info('Backend directory:', backendDir);
    log.info('Port:', this.port);

    try {
      // Determine Python path with fallbacks
      const pythonPath = this.getPythonPath(isDev, backendDir);
      log.info('Python path:', pythonPath);

      // Spawn backend process
      this.process = spawn(pythonPath, [
        '-m', 'uvicorn',
        'backend.app.main:app',
        '--host', '0.0.0.0',
        '--port', this.port.toString(),
        '--log-level', isDev ? 'debug' : 'info'
      ], {
        cwd: backendDir,
        env: {
          ...process.env,
          PYTHONUNBUFFERED: '1',
          PORT: this.port.toString()
        }
      });

      // Handle stdout
      this.process.stdout.on('data', (data) => {
        const output = data.toString().trim();
        log.info('[Backend]', output);
      });

      // Handle stderr
      this.process.stderr.on('data', (data) => {
        const output = data.toString().trim();
        // Uvicorn logs to stderr even for info
        if (output.includes('ERROR') || output.includes('CRITICAL')) {
          log.error('[Backend Error]', output);
        } else {
          log.info('[Backend]', output);
        }
      });

      // Handle process exit
      this.process.on('close', (code, signal) => {
        log.info(`Backend process exited with code ${code} and signal ${signal}`);
        this.isRunning = false;
        this.process = null;
        
        if (this.healthCheckInterval) {
          clearInterval(this.healthCheckInterval);
          this.healthCheckInterval = null;
        }
      });

      // Handle process errors
      this.process.on('error', (error) => {
        log.error('Failed to start backend process:', error);
        log.error('Error details:', error.message);
        log.error('Please ensure Python 3 and uvicorn are installed');
        this.isRunning = false;
        throw error;
      });

      // Wait for backend to be healthy
      const healthy = await this.waitForHealthy();
      
      if (healthy) {
        this.isRunning = true;
        log.info('✅ Backend started successfully');
        
        // Start periodic health checks
        this.startHealthChecks();
        
        return true;
      } else {
        throw new Error('Backend failed to become healthy');
      }

    } catch (error) {
      log.error('Failed to start backend:', error);
      this.stop();
      throw error;
    }
  }

  async waitForHealthy() {
    log.info('Waiting for backend to be healthy...');
    
    for (let i = 0; i < this.maxRetries; i++) {
      const healthy = await this.checkHealth();
      
      if (healthy) {
        log.info(`Backend healthy after ${i + 1} attempts`);
        return true;
      }
      
      log.info(`Health check ${i + 1}/${this.maxRetries}...`);
      await this.sleep(1000);
    }
    
    log.error('Backend failed to become healthy after max retries');
    return false;
  }

  async checkHealth() {
    return new Promise((resolve) => {
      const req = http.get(`http://localhost:${this.port}/health`, (res) => {
        resolve(res.statusCode === 200);
      });
      
      req.on('error', () => {
        resolve(false);
      });
      
      req.setTimeout(2000, () => {
        req.destroy();
        resolve(false);
      });
    });
  }

  startHealthChecks() {
    // Check every 30 seconds
    this.healthCheckInterval = setInterval(async () => {
      const healthy = await this.checkHealth();
      
      if (!healthy && this.isRunning) {
        log.error('Backend health check failed, process may have crashed');
        this.isRunning = false;
        
        // Attempt restart
        log.info('Attempting to restart backend...');
        try {
          await this.start();
        } catch (error) {
          log.error('Failed to restart backend:', error);
        }
      }
    }, 30000);
  }

  stop() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }

    if (this.process) {
      log.info('Stopping backend...');
      
      // Try graceful shutdown first
      this.process.kill('SIGTERM');
      
      // Force kill after 5 seconds
      setTimeout(() => {
        if (this.process) {
          log.warn('Force killing backend process');
          this.process.kill('SIGKILL');
        }
      }, 5000);
      
      this.process = null;
      this.isRunning = false;
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getUrl() {
    return `http://localhost:${this.port}`;
  }
}

module.exports = BackendManager;
