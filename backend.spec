# -*- mode: python ; coding: utf-8 -*-


a = Analysis(
    ['/Users/hakkiyuvanc/GİTHUB/relationship-ai/ili-kiyapayzekauygulamas-/backend/app/main.py'],
    pathex=['/Users/hakkiyuvanc/GİTHUB/relationship-ai/ili-kiyapayzekauygulamas-/backend'],
    binaries=[],
    datas=[],
    hiddenimports=['uvicorn.logging', 'uvicorn.loops', 'uvicorn.loops.auto', 'uvicorn.protocols', 'uvicorn.protocols.http', 'uvicorn.protocols.http.auto', 'uvicorn.lifespan.on', 'uvicorn.lifespan.off', 'app.api.feedback', 'email_validator'],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=['tkinter', 'matplotlib', 'pytest'],
    noarchive=False,
    optimize=0,
)
pyz = PYZ(a.pure)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.datas,
    [],
    name='backend',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=True,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
)
