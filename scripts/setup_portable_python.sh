#!/usr/bin/env bash
# =============================================================================
# setup_portable_python.sh
# =============================================================================
# Bu script, Electron uygulaması için "Portable Python" ortamı hazırlar.
# PyInstaller yerine, Python interpreter + bağımlılıklar bir klasör olarak
# paketlenir ve electron-builder "extraResources" ile uygulamaya dahil edilir.
#
# Kullanım:
#   cd /path/to/project
#   bash scripts/setup_portable_python.sh
#
# Çıktı:
#   frontend/resources/python/   → Portable Python interpreter (venv)
#   frontend/resources/backend/  → Backend kaynak kodu
# =============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
BACKEND_DIR="$PROJECT_ROOT/backend"
RESOURCES_DIR="$PROJECT_ROOT/frontend/resources"
PYTHON_ENV_DIR="$RESOURCES_DIR/python"
BACKEND_DEST_DIR="$RESOURCES_DIR/backend"

echo "🐍 Portable Python Ortamı Hazırlanıyor..."
echo "   Proje kökü : $PROJECT_ROOT"
echo "   Çıktı      : $RESOURCES_DIR"
echo ""

# ── 1. Temizlik ──────────────────────────────────────────────────────────────
echo "🧹 Eski ortam temizleniyor..."
rm -rf "$PYTHON_ENV_DIR" "$BACKEND_DEST_DIR"
mkdir -p "$RESOURCES_DIR"

# ── 2. Python sürümünü kontrol et ────────────────────────────────────────────
PYTHON_BIN="${PYTHON_BIN:-python3}"

if ! command -v "$PYTHON_BIN" &>/dev/null; then
    echo "❌ '$PYTHON_BIN' bulunamadı. Python 3.10+ kurulu olduğundan emin olun."
    exit 1
fi

PYTHON_VERSION=$("$PYTHON_BIN" --version 2>&1)
echo "✅ Python bulundu: $PYTHON_VERSION"

# ── 3. Portable venv oluştur ─────────────────────────────────────────────────
echo ""
echo "📦 Portable venv oluşturuluyor: $PYTHON_ENV_DIR"
"$PYTHON_BIN" -m venv "$PYTHON_ENV_DIR"

# venv içindeki python
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    VENV_PYTHON="$PYTHON_ENV_DIR/Scripts/python.exe"
    VENV_PIP="$PYTHON_ENV_DIR/Scripts/pip.exe"
else
    VENV_PYTHON="$PYTHON_ENV_DIR/bin/python"
    VENV_PIP="$PYTHON_ENV_DIR/bin/pip"
fi

# ── 4. Bağımlılıkları yükle ──────────────────────────────────────────────────
echo ""
echo "📥 Bağımlılıklar yükleniyor (requirements.txt)..."
"$VENV_PIP" install --upgrade pip --quiet
"$VENV_PIP" install -r "$BACKEND_DIR/requirements.txt" --quiet

echo "✅ Bağımlılıklar yüklendi."

# ── 5. spaCy modelini indir ──────────────────────────────────────────────────
echo ""
echo "🧠 spaCy modeli indiriliyor (tr_core_news_md)..."
"$VENV_PYTHON" -m spacy download tr_core_news_md --quiet || {
    echo "⚠️  tr_core_news_md indirilemedi, sm modeli deneniyor..."
    "$VENV_PYTHON" -m spacy download tr_core_news_sm --quiet || echo "⚠️  spaCy modeli atlandı."
}

# ── 6. Backend kaynak kodunu kopyala ─────────────────────────────────────────
echo ""
echo "📂 Backend kaynak kodu kopyalanıyor: $BACKEND_DEST_DIR"
mkdir -p "$BACKEND_DEST_DIR"

# Sadece gerekli dosyaları kopyala (venv, build, dist, __pycache__ hariç)
rsync -av --quiet \
    --exclude='venv/' \
    --exclude='build/' \
    --exclude='dist/' \
    --exclude='__pycache__/' \
    --exclude='*.pyc' \
    --exclude='.env' \
    --exclude='*.db' \
    --exclude='backend.log' \
    --exclude='logs/' \
    --exclude='tests/' \
    --exclude='ml/' \
    "$BACKEND_DIR/" "$BACKEND_DEST_DIR/"

echo "✅ Backend kopyalandı."

# ── 7. .env.example'ı kopyala (template olarak) ──────────────────────────────
if [[ -f "$BACKEND_DIR/.env.example" ]]; then
    cp "$BACKEND_DIR/.env.example" "$BACKEND_DEST_DIR/.env.example"
fi

# ── 8. Özet ──────────────────────────────────────────────────────────────────
echo ""
echo "════════════════════════════════════════════════════════════"
echo "✅ Portable Python ortamı hazır!"
echo ""
echo "   Python  : $PYTHON_ENV_DIR"
echo "   Backend : $BACKEND_DEST_DIR"
echo ""
echo "Sonraki adım:"
echo "   cd frontend && npm run electron:build"
echo "════════════════════════════════════════════════════════════"
