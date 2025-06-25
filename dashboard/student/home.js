(function () {
  const IS_PRODUCTION = window.location.hostname === "app.clayfulhealth.com";
  console.log(`student/home.js Environment: ${IS_PRODUCTION ? "production" : "staging"}`);

  document.addEventListener("DOMContentLoaded", function () {
    const studentJoinSessionButton = document.getElementById("btn-confirm-join-session");
    const studentErrorMsg = document.getElementById("msg-error-join-session");

    if (!studentJoinSessionButton) {
      return;
    }

    let isProcessingJoinSession = false;

    studentJoinSessionButton.addEventListener("click", async () => {
      if (isProcessingJoinSession) return;
      isProcessingJoinSession = true;

      const token = localStorage.getItem("_ms-mid");

      if (!token) {
        console.error("Missing token");
        if (studentErrorMsg) studentErrorMsg.style.display = "block";
        return;
      }

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
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
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
    
  });
})();
