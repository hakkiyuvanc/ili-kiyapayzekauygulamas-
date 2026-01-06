#!/bin/bash
set -e

echo "🚀 Starting İlişki Analiz AI Backend..."

# Set working directory
cd /opt/render/project/src/backend

# Set Python path
export PYTHONPATH=/opt/render/project/src/backend

# Print debug info
echo "📁 Working directory: $(pwd)"
echo "🐍 PYTHONPATH: $PYTHONPATH"
echo "🐍 Python version: $(python --version)"

# Run database migrations (if needed)
if [ -f "alembic.ini" ]; then
    echo "📦 Running database migrations..."
    alembic upgrade head || echo "⚠️  Migration failed or not configured"
fi

# Start uvicorn
echo "✨ Starting uvicorn server..."
exec python -m uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
