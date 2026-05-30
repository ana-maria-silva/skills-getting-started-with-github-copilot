import pytest
from fastapi.testclient import TestClient
from copy import deepcopy
from src.app import app, activities

# Preserve original activities state so tests can reset to it
ORIGINAL_ACTIVITIES = deepcopy(activities)


@pytest.fixture(autouse=True)
def reset_activities():
    """Reset in-memory activities before each test to keep tests isolated."""
    activities.clear()
    activities.update(deepcopy(ORIGINAL_ACTIVITIES))
    yield


@pytest.fixture
def client():
    """Provide a TestClient instance for tests."""
    return TestClient(app)
