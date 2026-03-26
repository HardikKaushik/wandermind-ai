import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env BEFORE importing base settings so os.environ has the values
_base_dir = Path(__file__).resolve().parent.parent.parent
load_dotenv(_base_dir / '.env', override=True)

from .base import *  # noqa: E402

DEBUG = True

ALLOWED_HOSTS = ['localhost', '127.0.0.1']

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

CORS_ALLOWED_ORIGINS = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
]
CORS_ALLOW_CREDENTIALS = True
