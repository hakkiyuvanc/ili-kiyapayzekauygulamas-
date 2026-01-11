#!/bin/bash
set -e

echo "🚀 Starting İlişki Analiz AI Backend..."

# Set Python path to project root
export PYTHONPATH=$(pwd)

# Print debug info
echo "📁 Working directory: $(pwd)"
echo "🐍 PYTHONPATH: $PYTHONPATH"
echo "🐍 Python version: $(python --version)"

# Run database migrations
echo "📦 Running database migrations..."
if [ -d "backend/alembic" ]; then
    cd backend && python -m alembic upgrade head && cd .. || echo "⚠️  Migration failed"
else
    echo "⚠️  Alembic not found, skipping migrations"
fi

# Start uvicorn from project root
echo "✨ Starting uvicorn server..."
exec python -m uvicorn backend.app.main:app --host 0.0.0.0 --port ${PORT:-8000}
