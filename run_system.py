"""
One-Click Launcher for Freight Forecasting System
Starts the FastAPI Backend Server and opens the Web Dashboard
"""

import sys
import os
import time
import socket
import webbrowser
import subprocess
from threading import Thread

# Ensure working directory and sys.path are always anchored to the project root
PROJECT_DIR = os.path.dirname(os.path.abspath(__file__))
os.chdir(PROJECT_DIR)
if PROJECT_DIR not in sys.path:
    sys.path.insert(0, PROJECT_DIR)
backend_path = os.path.join(PROJECT_DIR, 'backend')
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

def is_port_in_use(port: int) -> bool:
    """Check if a port is already in use."""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.settimeout(0.5)
        return s.connect_ex(('127.0.0.1', port)) == 0

def kill_existing_port_process(port: int):
    """Attempt to terminate any process using the specified port on Linux."""
    try:
        subprocess.run(["fuser", "-k", f"{port}/tcp"], stderr=subprocess.DEVNULL, stdout=subprocess.DEVNULL)
        time.sleep(1)
    except Exception:
        pass

def start_backend():
    """Start the FastAPI backend with uvicorn, freeing port if needed."""
    if is_port_in_use(8000):
        print("⚠️  Port 8000 is currently occupied. Freeing port for fresh restart...")
        kill_existing_port_process(8000)
        time.sleep(0.5)

    print("🚀 Starting FastAPI Backend Server on http://127.0.0.1:8000 ...")
    try:
        import uvicorn
        uvicorn.run("backend.api.main:app", host="127.0.0.1", port=8000, log_level="info", app_dir=PROJECT_DIR)
    except ImportError:
        # Fallback to subprocess if uvicorn package import fails
        cmd = [sys.executable, "-m", "uvicorn", "backend.api.main:app", "--host", "127.0.0.1", "--port", "8000"]
        env = os.environ.copy()
        env["PYTHONPATH"] = f"{PROJECT_DIR}:{env.get('PYTHONPATH', '')}"
        subprocess.run(cmd, cwd=PROJECT_DIR, env=env)

def start_frontend_and_browser():
    """Wait for backend port to be active and launch web UI."""
    print("⏳ Waiting for backend to initialize...")
    for _ in range(15):
        time.sleep(0.5)
        if is_port_in_use(8000):
            break

    url = "http://127.0.0.1:8000"
    print(f"🌐 Opening Freight Forecasting Dashboard in browser: {url}")
    try:
        webbrowser.open(url)
    except Exception:
        pass

if __name__ == "__main__":
    print("\n" + "="*70)
    print("🚢 MINISTRY OF STEEL — FREIGHT RATE FORECASTING SYSTEM")
    print("="*70)
    print("✓ Dashboard & Backend URL: http://127.0.0.1:8000")
    print("✓ API Documentation:       http://127.0.0.1:8000/docs")
    print("✓ Machine Learning Engine: XGBoost Regressor (MAE: $0.67/MT, R²: 91.7%)")
    print("✓ AI Intelligence Layer:   Google Gemini AI & Black Swan Risk Monitor")
    print("="*70 + "\n")

    # Start browser opener in background
    browser_thread = Thread(target=start_frontend_and_browser, daemon=True)
    browser_thread.start()

    # Start backend
    start_backend()

