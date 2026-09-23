import sys
import os

# Add root directory and backend directory to sys.path so backend modules resolve on serverless
ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from backend.api.main import app
