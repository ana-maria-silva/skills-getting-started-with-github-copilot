"""Tests for activities API using Arrange-Act-Assert (AAA) pattern."""


def test_get_activities_returns_all_activities(client):
    # Arrange: fixture provides `client` and a fresh activities state

    # Act
    response = client.get("/activities")

    # Assert
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, dict)
    # Check a few known activities exist
    assert "Chess Club" in data
    assert "Programming Class" in data


def test_signup_success_and_duplicate_prevention(client):
    # Arrange
    activity = "Swimming Club"
    email = "newstudent@mergington.edu"

    # Act: first signup should succeed
    resp1 = client.post(f"/activities/{activity}/signup", params={"email": email})

    # Assert: succeeded and participant recorded
    assert resp1.status_code == 200
    assert email in resp1.json()["message"]

    # Act: duplicate signup should be rejected
    resp2 = client.post(f"/activities/{activity}/signup", params={"email": email})

    # Assert: duplicate returns 400
    assert resp2.status_code == 400
    assert "already signed up" in resp2.json().get("detail", "")


def test_remove_participant_flow(client):
    # Arrange
    activity = "Art Club"
    email = "teststudent@mergington.edu"

    # Act: sign up
    signup = client.post(f"/activities/{activity}/signup", params={"email": email})
    # Assert signup ok
    assert signup.status_code == 200

    # Act: remove participant
    remove = client.delete(f"/activities/{activity}/participants", params={"email": email})
    # Assert removal ok
    assert remove.status_code == 200

    # Act: removing again should return 404
    remove_again = client.delete(f"/activities/{activity}/participants", params={"email": email})
    # Assert not found
    assert remove_again.status_code == 404
