const { app } = require("electron");
const path = require("path");
const { spawn } = require("child_process");
const { existsSync } = require("fs");
const http = require("http");
const log = require("electron-log");
const treeKill = require("tree-kill");

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
   *
   * Production layout (extraResources):
   *   Contents/Resources/python/bin/python   ← portable venv
   *   Contents/Resources/backend/            ← backend source
   *
   * Dev layout:
   *   ../../backend/venv/bin/python
   */
  getPythonPath(isDev, backendDir) {
    if (!isDev) {
      // ── Production: use bundled portable Python ──────────────────────────
      const resourcesPath = process.resourcesPath;

      // Mac/Linux: python/bin/python  |  Windows: python/Scripts/python.exe
      const portablePythonCandidates = [
        path.join(resourcesPath, "python", "bin", "python"),
        path.join(resourcesPath, "python", "bin", "python3"),
        path.join(resourcesPath, "python", "Scripts", "python.exe"),
      ];

      for (const candidate of portablePythonCandidates) {
        if (this.isPathSafe(candidate) && existsSync(candidate)) {
          log.info(`[BackendManager] Portable Python found: ${candidate}`);
          return candidate;
        }
      }

      // Fallback: legacy PyInstaller binary (backward compat)
      const legacyBinary = path.join(resourcesPath, "backend", "backend");
      const legacyBinaryWin = path.join(
        resourcesPath,
        "backend",
        "backend.exe",
      );
      if (existsSync(legacyBinary)) {
        log.warn("[BackendManager] Falling back to legacy PyInstaller binary");
        return legacyBinary;
      }
      if (existsSync(legacyBinaryWin)) {
        log.warn(
          "[BackendManager] Falling back to legacy PyInstaller binary (Windows)",
        );
        return legacyBinaryWin;
      }

      throw new Error(
        "Portable Python not found in app resources.\n" +
          'Run "bash scripts/setup_portable_python.sh" before building.',
      );
    }

    // ── Development: use local venv ─────────────────────────────────────────
    const devCandidates = [
      path.join(backendDir, "venv", "bin", "python"),
      path.join(backendDir, "venv", "bin", "python3"),
      path.join(backendDir, "venv", "Scripts", "python.exe"),
      "python3",
      "python",
    ].filter(Boolean);

    for (const candidate of devCandidates) {
      if (path.isAbsolute(candidate)) {
        if (this.isPathSafe(candidate) && existsSync(candidate)) {
          log.info(`[BackendManager] Dev Python found: ${candidate}`);
          return candidate;
        }
      } else {
        log.info(`[BackendManager] Using system Python: ${candidate}`);
        return candidate;
      }
    }

    throw new Error(
      "No valid Python executable found. Please ensure Python 3 is installed.",
    );
  }

  /**
   * Check if path is safe to use (logs warning for non-ASCII but allows it)
   */
  isPathSafe(filePath) {
    const hasNonASCII = /[^\x00-\x7F]/.test(filePath);
    if (hasNonASCII) {
      log.warn(
        `[BackendManager] Path contains non-ASCII characters: ${filePath}`,
      );
    }
    return true;
  }

  /**
   * Resolve the backend working directory and uvicorn module path.
   *
   * Production: resources/backend/  → module = app.main:app
   * Dev:        ../../backend/      → module = app.main:app  (run from backend dir)
   */
  getBackendConfig(isDev, backendDir) {
    if (!isDev) {
      const resourcesPath = process.resourcesPath;
      const portableBackendDir = path.join(resourcesPath, "backend");
      if (existsSync(portableBackendDir)) {
        return { cwd: portableBackendDir, module: "app.main:app" };
      }
      // Legacy fallback: binary is self-contained, no module needed
      return { cwd: resourcesPath, module: null };
    }
    // Dev: run from backend directory
    return { cwd: backendDir, module: "app.main:app" };
  }

  async start() {
    if (this.isRunning) {
      log.warn("Backend already running");
      return true;
    }

    const isDev = require("electron-is-dev");
    const backendDir = path.join(__dirname, "../../backend");

    log.info("Starting backend...");
    log.info("Backend directory:", backendDir);
    log.info("Port:", this.port);

    try {
      const pythonPath = this.getPythonPath(isDev, backendDir);
      const { cwd, module } = this.getBackendConfig(isDev, backendDir);

      log.info("[BackendManager] Python path:", pythonPath);
      log.info("[BackendManager] CWD:", cwd);
      log.info("[BackendManager] Module:", module);

      // Build spawn args
      // - Portable Python / Dev: spawn python -m uvicorn app.main:app ...
      // - Legacy binary: spawn binary directly (no args needed)
      const isLegacyBinary = !module;
      const spawnArgs = isLegacyBinary
        ? []
        : [
            "-m",
            "uvicorn",
            module,
            "--host",
            "0.0.0.0",
            "--port",
            this.port.toString(),
            "--log-level",
            isDev ? "debug" : "info",
          ];

      // Spawn backend process
      this.process = spawn(pythonPath, spawnArgs, {
        cwd,
        env: {
          ...process.env,
          PYTHONUNBUFFERED: "1",
          PORT: this.port.toString(),
        },
      });

      // Handle stdout
      this.process.stdout.on("data", (data) => {
        const output = data.toString().trim();
        log.info("[Backend]", output);
      });

      // Handle stderr
      this.process.stderr.on("data", (data) => {
        const output = data.toString().trim();
        // Uvicorn logs to stderr even for info
        if (output.includes("ERROR") || output.includes("CRITICAL")) {
          log.error("[Backend Error]", output);
        } else {
          log.info("[Backend]", output);
        }
      });

      // Handle process exit
      this.process.on("close", (code, signal) => {
        log.info(
          `Backend process exited with code ${code} and signal ${signal}`,
        );
        this.isRunning = false;
        this.process = null;

        if (this.healthCheckInterval) {
          clearInterval(this.healthCheckInterval);
          this.healthCheckInterval = null;
        }
      });

      // Handle process errors
      this.process.on("error", (error) => {
        log.error("Failed to start backend process:", error);
        log.error("Error details:", error.message);
        log.error("Please ensure Python 3 and uvicorn are installed");
        this.isRunning = false;
        throw error;
      });

      // Wait for backend to be healthy
      const healthy = await this.waitForHealthy();

      if (healthy) {
        this.isRunning = true;
        log.info("✅ Backend started successfully");

        // Start periodic health checks
        this.startHealthChecks();

        return true;
      } else {
        throw new Error("Backend failed to become healthy");
      }
    } catch (error) {
      log.error("Failed to start backend:", error);
      this.stop();
      throw error;
    }
  }

  async waitForHealthy() {
    log.info("Waiting for backend to be healthy...");

    for (let i = 0; i < this.maxRetries; i++) {
      const healthy = await this.checkHealth();

      if (healthy) {
        log.info(`Backend healthy after ${i + 1} attempts`);
        return true;
      }

      log.info(`Health check ${i + 1}/${this.maxRetries}...`);
      await this.sleep(1000);
    }

    log.error("Backend failed to become healthy after max retries");
    return false;
  }

  async checkHealth() {
    return new Promise((resolve) => {
      const req = http.get(`http://localhost:${this.port}/health`, (res) => {
        resolve(res.statusCode === 200);
      });

      req.on("error", () => {
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
        log.error("Backend health check failed, process may have crashed");
        this.isRunning = false;

        // Attempt restart
        log.info("Attempting to restart backend...");
        try {
          await this.start();
        } catch (error) {
          log.error("Failed to restart backend:", error);
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
      const pid = this.process.pid;
      log.info(`Stopping backend process tree (PID: ${pid})...`);

      // Use tree-kill to terminate the entire process tree (Python + uvicorn workers)
      // This prevents zombie processes after the Electron app closes
      treeKill(pid, "SIGTERM", (err) => {
        if (err) {
          log.warn(
            `SIGTERM failed for PID ${pid}, forcing SIGKILL:`,
            err.message,
          );
          treeKill(pid, "SIGKILL", (killErr) => {
            if (killErr) {
              log.error(`SIGKILL also failed for PID ${pid}:`, killErr.message);
            } else {
              log.info(`Backend process tree force-killed (PID: ${pid})`);
            }
          });
        } else {
          log.info(`Backend process tree terminated gracefully (PID: ${pid})`);
        }
      });

      this.process = null;
      this.isRunning = false;
    }
  }

  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  getUrl() {
    return `http://localhost:${this.port}`;
  }
}

module.exports = BackendManager;
