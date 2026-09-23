#!/usr/bin/env bash
# ==============================================================================
# Voyant | Ministry of Steel — Freight Rate Forecasting & Procurement Platform
# ==============================================================================

# Determine directory of this script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR" || exit 1

export PYTHONPATH="$SCRIPT_DIR:$SCRIPT_DIR/backend:$PYTHONPATH"

# Detect Python Environment
if [ -d "$SCRIPT_DIR/.venv" ]; then
    PYTHON_EXEC="$SCRIPT_DIR/.venv/bin/python"
elif [ -d "$SCRIPT_DIR/venv" ]; then
    PYTHON_EXEC="$SCRIPT_DIR/venv/bin/python"
elif [ -f "/home/alyasaa/.freight-venv/bin/python" ]; then
    PYTHON_EXEC="/home/alyasaa/.freight-venv/bin/python"
elif command -v python3 &>/dev/null; then
    PYTHON_EXEC="python3"
else
    PYTHON_EXEC="python"
fi

echo "======================================================================"
echo "🚢 VOYANT — FREIGHT RATE FORECASTING & PROCUREMENT PLATFORM"
echo "======================================================================"
echo "✓ Project Directory: $SCRIPT_DIR"
echo "✓ Python Binary:     $PYTHON_EXEC"
echo "✓ Dashboard & API:   http://localhost:8000"
echo "✓ API Docs:          http://localhost:8000/docs"
echo "======================================================================"

# Free port 8000 if previously occupied
fuser -k 8000/tcp 2>/dev/null || true

"$PYTHON_EXEC" run_system.py
