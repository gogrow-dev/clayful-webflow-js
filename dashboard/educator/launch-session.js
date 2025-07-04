(function () {
  const IS_PRODUCTION = window.location.hostname === "app.clayfulhealth.com";
  console.log(`educator/launch-session.js Environment: ${IS_PRODUCTION ? "production" : "staging"}`);
  HOME_PAGE_URL = "/educators-home"
  DASHBOARD_URL = "/dashboard/clayful-session-dashboard";
  

  document.addEventListener("DOMContentLoaded", function () {
    const currentSessionUrl = "https://us-central1-clayful-app.cloudfunctions.net/educator-getSessionStaging";
    const studentsUrl = "https://us-central1-clayful-app.cloudfunctions.net/educator-getSessionStudentsStaging";
    const updateSessionUrl = "https://us-central1-clayful-app.cloudfunctions.net/educator-updateSessionStatusStaging";

    const studentList = document.getElementById("student-list");
    if (!studentList) return;

    const token = localStorage.getItem("_ms-mid");
    if (!token) return;

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    };

    // === Fetch session code ===
    fetch(currentSessionUrl, { headers })
      .then(res => res.json())
      .then(sessionData => {
        if (!sessionData) {
          console.error("No active session found");
          window.location.href = HOME_PAGE_URL;
          return;
        }

        const sessionCodeElement = document.getElementById("session-code");
        if (sessionCodeElement && sessionData?.session_number) {
          sessionCodeElement.textContent = sessionData.session_number;
        }
        const sessionStatus = sessionData?.status;

        if (sessionStatus === "paused" || sessionStatus === "running") {
          window.location.href = DASHBOARD_URL;
        } else if (sessionStatus === "finished") {
          window.location.href = HOME_PAGE_URL;
        }
      })
      .catch(err => console.error("Failed to load session:", err));

    // === Function to fetch and render students ===
    function fetchAndRenderStudents() {
      fetch(studentsUrl, { headers })
        .then(res => res.json())
        .then(studentsHash => {
          const students = studentsHash?.students || [];

          const waitingText = document.getElementById("text-waiting-status");
          const studentJoined = document.getElementById("session-student-joined");  

          // if no students, show waiting text and hide student joined message
          if (!students || students.length === 0) {
            if (waitingText) waitingText.style.display = "flex";
            if (studentJoined) studentJoined.style.display = "none";
            return;
          }

          // Clear all current student chips
          studentList.innerHTML = "";

            // Update count
          const sessionStudentCount = document.getElementById("session-student-count");
          if (sessionStudentCount) {
            sessionStudentCount.textContent = students.length;
          }

          // Render students
          students.forEach((student) => {
            const card = document.createElement("div");
            card.className = "student-chip";

            const emojiDiv = document.createElement("div");
            emojiDiv.className = "student_emoji";

            const emojiImg = document.createElement("img");
            emojiImg.src = student.emoji;
            emojiImg.alt = "emoji";
            emojiImg.loading = "lazy";

            emojiDiv.appendChild(emojiImg);

            const nameP = document.createElement("p");
            nameP.className = "text_l_dashboard";
            nameP.textContent = student.studentName;

            card.appendChild(emojiDiv);
            card.appendChild(nameP);

            studentList.appendChild(card);
          });

          if (waitingText) waitingText.style.display = "none";
          if (studentJoined) studentJoined.style.display = "flex";
        })
        .catch(err => console.error("Failed to load students:", err));
    }

    // Initial fetch
    fetchAndRenderStudents();

    // Refresh every 15 seconds
    setInterval(fetchAndRenderStudents, 15000);

    // === Handle dashboard launch ===
    const launchBtn = document.getElementById("btn-launch-dashboard");
    if (launchBtn) {
      launchBtn.addEventListener("click", function () {
        fetch(updateSessionUrl, {
          method: "PATCH",
          headers,
          body: JSON.stringify({ status: "running" })
        })
          .then(res => {
            if (!res.ok) throw new Error("Failed to update session status");
            return res.json();
          })
          .then(() => {
            window.location.href = DASHBOARD_URL;
          })
          .catch(err => {
            console.error("Failed to launch dashboard:", err);
            alert("There was a problem launching the session. Please try again.");
          });
      });
    }
  });
})();
