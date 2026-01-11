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
if [ -f "backend/alembic.ini" ]; then
    echo "📦 Running database migrations..."
    cd backend && python -m alembic upgrade head && cd .. || echo "⚠️  Migration failed or not configured"
fi

# Start uvicorn from project root
echo "✨ Starting uvicorn server..."
exec python -m uvicorn backend.app.main:app --host 0.0.0.0 --port ${PORT:-8000}
