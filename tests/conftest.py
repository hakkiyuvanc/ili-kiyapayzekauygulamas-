import sys
from pathlib import Path
import pytest

# Add project root to python path to allow importing modules from backend and ml
# This resolves "ModuleNotFoundError" when running pytest
root_dir = Path(__file__).parent.parent
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

@pytest.fixture(scope="session")
def project_root():
    return root_dir
