import { fetchActiveSession } from "../utils/activeSession.js";

(function () {
  const IS_PRODUCTION = window.location.hostname === "app.clayfulhealth.com";
  console.log(`student/home.js Environment: ${IS_PRODUCTION ? "production" : "staging"}`);


  document.addEventListener("DOMContentLoaded", function () {
    const studentConfirmJoinSessionButton = document.getElementById("btn-confirm-join-session");
    const studentErrorMsg = document.getElementById("msg-error-join-session");

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

    fetchActiveSession(getSessionUrl);
    setInterval(fetchActiveSession, 15000);

    if (studentConfirmJoinSessionButton) {
      let isProcessingJoinSession = false;

      studentConfirmJoinSessionButton.addEventListener("click", async () => {
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
