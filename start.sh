#!/bin/bash
set -e

echo "🚀 Starting İlişki Analiz AI Backend..."

# Set Python path to project root and backend directory
export PYTHONPATH=$PYTHONPATH:$(pwd):$(pwd)/backend

# Print debug info
echo "📁 Working directory: $(pwd)"
echo "🐍 PYTHONPATH: $PYTHONPATH"
echo "🐍 Python version: $(python --version)"

# Run database migrations
echo "📦 Running database migrations..."
if [ -d "backend/alembic" ] || [ -d "alembic" ]; then
    if [ -d "backend/alembic" ]; then
        cd backend && python -m alembic upgrade head && cd .. || echo "⚠️  Migration failed"
    else
        python -m alembic upgrade head || echo "⚠️  Migration failed"
    fi
else
    echo "ℹ️  Alembic directory not found, skipping migrations (this is normal for fresh deployments)"
fi

# Start uvicorn from project root
echo "✨ Starting uvicorn server..."
exec python -m uvicorn backend.app.main:app --host 0.0.0.0 --port ${PORT:-8000}
