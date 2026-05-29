"""Nuclear option: wipe DB, restart backend, and seed fresh."""
import os
import subprocess
import time
import requests

DB_PATH = "/workspaces/chiripal/backend/squash_excellence.db"

print("💥 NUCLEAR OPTION: Fresh start")
print("=" * 50)

subprocess.run("pkill -f uvicorn || true", shell=True)
time.sleep(2)

if os.path.exists(DB_PATH):
    os.remove(DB_PATH)
    print(f"   ✅ Deleted {DB_PATH}")

proc = subprocess.Popen(
    ["python", "run.py"],
    cwd="/workspaces/chiripal/backend",
    stdout=subprocess.PIPE,
    stderr=subprocess.PIPE
)
time.sleep(5)

try:
    r = requests.get("http://localhost:8000/health", timeout=5)
    print(f"   Backend up: {r.status_code}")
except Exception as e:
    print(f"   ❌ Backend failed: {e}")
    proc.terminate()
    exit(1)

result = subprocess.run(
    ["python", "seed_data.py"],
    cwd="/workspaces/chiripal/backend",
    capture_output=True,
    text=True
)
print(result.stdout)
if result.returncode != 0:
    print("STDERR:", result.stderr)

print("\n🎉 Done!")
print(f"   Backend PID: {proc.pid}")
