import os
import sys

import PyInstaller.__main__

# Get absolute path to backend directory
backend_dir = os.path.dirname(os.path.abspath(__file__))

print(f"Building backend executable in: {backend_dir}")

# PyInstaller arguments
args = [
    os.path.join(backend_dir, "app/main.py"),  # Entry point (Absolute path)
    "--name=backend",  # Name of the executable
    "--onefile",  # Single file executable
    "--console",  # Show console (useful for debugging, can be misleading for GUI apps but good for server)
    "--clean",  # Clean cache
    f"--paths={backend_dir}",  # Add backend dir to path
    # Hidden imports for Uvicorn & FastAPI & Dependencies
    "--hidden-import=uvicorn.logging",
    "--hidden-import=uvicorn.loops",
    "--hidden-import=uvicorn.loops.auto",
    "--hidden-import=uvicorn.protocols",
    "--hidden-import=uvicorn.protocols.http",
    "--hidden-import=uvicorn.protocols.http.auto",
    "--hidden-import=uvicorn.lifespan.on",
    "--hidden-import=uvicorn.lifespan.off",
    "--hidden-import=app.api.feedback",
    "--hidden-import=email_validator",
    # Exclude unnecessary modules
    "--exclude-module=tkinter",
    "--exclude-module=matplotlib",
    "--exclude-module=pytest",
    # Output directory
    f'--distpath={os.path.join(backend_dir, "dist")}',
    f'--workpath={os.path.join(backend_dir, "build")}',
]

# Run PyInstaller
try:
    PyInstaller.__main__.run(args)
    print("✅ Backend build successful!")
except Exception as e:
    print(f"❌ Backend build failed: {e}")
    sys.exit(1)
