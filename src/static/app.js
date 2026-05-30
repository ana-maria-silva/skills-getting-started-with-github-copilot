document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";
      // Reset activity select to avoid duplicate options on re-render
      activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        // Participants HTML (bulleted list with remove buttons)
        const participants = details.participants || [];
        const participantsHtml = participants.length > 0
          ? `<div class="participants"><strong>Participants</strong><ul class="participants-list">${participants.map(p => `<li class="participant-item"><span class="participant-email">${p}</span><button class="participant-remove" data-activity="${encodeURIComponent(name)}" data-email="${encodeURIComponent(p)}" aria-label="Remove ${p}">✕</button></li>`).join('')}</ul></div>`
          : `<div class="participants participants-empty"><em>No participants yet</em></div>`;

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p class="activity-desc">${details.description}</p>
          <p class="activity-schedule"><strong>Schedule:</strong> ${details.schedule}</p>
          <p class="activity-availability"><strong>Availability:</strong> ${spotsLeft} spots left</p>
          ${participantsHtml}
        `;

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);

        // Attach remove handlers for participant buttons
        activityCard.querySelectorAll('.participant-remove').forEach(btn => {
          btn.addEventListener('click', async (e) => {
            const encodedActivity = btn.dataset.activity;
            const encodedEmail = btn.dataset.email;
            const activityName = decodeURIComponent(encodedActivity);
            const email = decodeURIComponent(encodedEmail);

            try {
              const resp = await fetch(`/activities/${encodeURIComponent(activityName)}/participants?email=${encodeURIComponent(email)}`, { method: 'DELETE' });
              if (resp.ok) {
                // Update local details and DOM
                const idx = details.participants ? details.participants.indexOf(email) : -1;
                if (idx > -1) details.participants.splice(idx, 1);

                // Remove list item
                const li = btn.closest('li');
                if (li) li.remove();

                // If no participants left, show empty state
                const participantsContainer = activityCard.querySelector('.participants');
                if (!details.participants || details.participants.length === 0) {
                  participantsContainer.innerHTML = `<div class="participants-empty"><em>No participants yet</em></div>`;
                }

                // Update availability text
                const availabilityEl = activityCard.querySelector('.activity-availability');
                if (availabilityEl) {
                  const spots = details.max_participants - (details.participants ? details.participants.length : 0);
                  availabilityEl.innerHTML = `<strong>Availability:</strong> ${spots} spots left`;
                }
              } else {
                const err = await resp.json().catch(() => ({}));
                alert(err.detail || 'Failed to remove participant');
              }
            } catch (err) {
              console.error('Error removing participant:', err);
              alert('Failed to remove participant');
            }
          });
        });
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

      // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
            // Refresh activities to show new participant and updated availability
            fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
