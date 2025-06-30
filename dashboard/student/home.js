(function () {
  const IS_PRODUCTION = window.location.hostname === "app.clayfulhealth.com";
  console.log(`student/home.js Environment: ${IS_PRODUCTION ? "production" : "staging"}`);

  document.addEventListener("DOMContentLoaded", function () {
    const studentJoinSessionButton = document.getElementById("btn-confirm-join-session");
    const studentErrorMsg = document.getElementById("msg-error-join-session");

    const sessionBanner = document.getElementById("session-banner");
    const activeSessionMsg = document.getElementById("active-session-msg");
    const pausedSessionMsg = document.getElementById("paused-session-msg");
    const activeSessionTimeMsg = document.getElementById("active-session-time-msg");
    const pausedSessionTimeMsg = document.getElementById("paused-session-time-msg");
    const activeSessionTime = document.getElementById("active-session-time");
    const pausedSessionTime = document.getElementById("paused-session-time");
    const startingSoonSessionMsg = document.getElementById("starting-soon-session-msg");

    const token = localStorage.getItem("_ms-mid");

    if (!token) {
      console.error("Missing token");
      if (studentErrorMsg) studentErrorMsg.style.display = "block";
      return;
    }

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    };

    const getSessionUrl = "https://student-getactivesessionstaging-7w65flzt3q-uc.a.run.app";

    function fetchActiveSession() {
      fetch(getSessionUrl, { headers })
        .then(res => {
          if (!res.ok) {
            sessionBanner.style.display = "none";
            return;
          }
          return res.json();
        })
        .then(sessionData => {
          if (!sessionData) return;

          if (sessionBanner) {
            sessionBanner.style.display = "block";
            const totalTime = sessionData?.total_session_time_in_seconds
            if (sessionData?.status == "on_hold") {
              startingSoonSessionMsg.style.display = "block";
              activeSessionTime.style.display = "none";
              pausedSessionTime.style.display = "none";
              activeSessionTimeMsg.style.display = "none";
              pausedSessionTimeMsg.style.display = "none";
              activeSessionMsg.style.display = "none";
              pausedSessionMsg.style.display = "none";
            } else if (sessionData?.status == "paused") {
              startingSoonSessionMsg.style.display = "none";
              activeSessionTime.style.display = "none";
              pausedSessionTime.style.display = "block";
              activeSessionTimeMsg.style.display = "none";
              pausedSessionTimeMsg.style.display = "block";
              pausedSessionTimeMsg.style.display = "block";
              activeSessionMsg.style.display = "none";
              pausedSessionMsg.style.display = "block";
            } else if (sessionData?.status == "running") {
              startingSoonSessionMsg.style.display = "none";
              activeSessionTime.style.display = "block";
              activeSessionTime.textContent = totalTime;
              pausedSessionTime.style.display = "none";
              activeSessionTimeMsg.style.display = "block";
              pausedSessionTimeMsg.style.display = "none";
              activeSessionMsg.style.display = "block";
              pausedSessionMsg.style.display = "none";
            }
          }
        })
        .catch(err => console.error("Failed to get active session:", err));
    }

    fetchActiveSession();
    setInterval(fetchActiveSession, 15000);

    if (studentJoinSessionButton) {
      let isProcessingJoinSession = false;

      studentJoinSessionButton.addEventListener("click", async () => {
        if (isProcessingJoinSession) return;
        isProcessingJoinSession = true;

        const sessionCodeInput = document.getElementById("session-code");
        const emojiImg = document.getElementById("emoji-selected");
        const studentName = document.getElementById("student-name");

        const sessionNumber = sessionCodeInput?.value?.trim();
        const emojiUrl = emojiImg?.src || "";
        const studentNameValue = studentName?.value?.trim();

        if (!sessionNumber || !emojiUrl || !studentNameValue) {
          console.error("Missing input values");
          if (studentErrorMsg) studentErrorMsg.style.display = "block";
          isProcessingJoinSession = false;
          return;
        }


        const joinSessionUrl = "https://us-central1-clayful-app.cloudfunctions.net/student-joinSessionStaging";

        const response = await fetch(joinSessionUrl, {
          method: "POST",
          headers: headers,
          body: JSON.stringify({
            sessionNumber: Number(sessionNumber),
            emojiUrl: emojiUrl,
            studentName: studentNameValue
          })
        });

        if (!response.ok) {
          console.error("Failed to join session");
          if (studentErrorMsg) studentErrorMsg.style.display = "block";
          return;
        }

        console.log("Successfully joined session");
        window.location.href = "/kids/journals";
        isProcessingJoinSession = false;
      });
    }
  });
})();
