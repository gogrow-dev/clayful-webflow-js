import { fetchActiveSession } from "https://luminous-yeot-e7ca42.netlify.app/dashboard/utils/active-session.js";

(function () {
  const IS_PRODUCTION = window.location.hostname === "app.clayfulhealth.com";
  console.log(`student/home.js Environment: ${IS_PRODUCTION ? "production" : "staging"}`);


  document.addEventListener("DOMContentLoaded", function () {
    const studentConfirmJoinSessionButton = document.getElementById("btn-confirm-join-session");
    const studentErrorMsg = document.getElementById("msg-error-join-session");
    const studentContinueJoinSessionButton = document.getElementById("btn-continue-join-session");
    const continueErrorMsg = document.getElementById("msg-error-name-validation");
    const studentJoinSessionButton = document.getElementById("btn-nav-join-session");
    const modalPart1 = document.getElementById("join-class-modal-p1");
    const modalPart2 = document.getElementById("join-class-modal-p2");
    const modalHeader = document.getElementById("join-class-modal-header");

    const sessionCodeInput = document.getElementById("session-code");
    const emojiImg = document.getElementById("emoji-selected");
    const studentName = document.getElementById("student-name");

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

    const getSessionUrl = "https://us-central1-clayful-app.cloudfunctions.net/student-getActiveSessionStaging";

    fetchActiveSession(getSessionUrl, headers);
    setInterval(() => fetchActiveSession(getSessionUrl, headers), 15000);

    if (studentJoinSessionButton) {
      studentJoinSessionButton.addEventListener("click", () => {
        if (studentErrorMsg) studentErrorMsg.style.display = "none";
        if (continueErrorMsg) continueErrorMsg.style.display = "none";
      });
    }

    if (studentConfirmJoinSessionButton) {
      let isProcessingJoinSession = false;

      studentConfirmJoinSessionButton.addEventListener("click", async () => {
        if (isProcessingJoinSession) return;
        isProcessingJoinSession = true;


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

    if (studentContinueJoinSessionButton) {
      const validateFields = () => {
        const sessionNumber = sessionCodeInput?.value?.trim();
        const studentNameValue = studentName?.value?.trim();
        const disabled = !sessionNumber || !studentNameValue;

        if (disabled) {
          studentContinueJoinSessionButton.classList.add("disabled");
          studentContinueJoinSessionButton.setAttribute("aria-disabled", "true");
        } else {
          studentContinueJoinSessionButton.classList.remove("disabled");
          studentContinueJoinSessionButton.setAttribute("aria-disabled", "false");
        }
        if (continueErrorMsg) continueErrorMsg.style.display = "none";
      };

      sessionCodeInput?.addEventListener("input", validateFields);
      studentName?.addEventListener("input", validateFields);
      validateFields();

      studentContinueJoinSessionButton.addEventListener("click", () => {
        const sessionNumber = sessionCodeInput?.value?.trim();
        const studentNameValue = studentName?.value?.trim();

        if (!sessionNumber || !studentNameValue) {
          if (continueErrorMsg) continueErrorMsg.style.display = "block";
        } else {
          if (modalHeader) modalHeader.style.display = "none";
          if (modalPart1) part1.style.display = "none";
          if (modalPart2) part2.style.display = "flex";
          if (continueErrorMsg) continueErrorMsg.style.display = "none";
        }
      });
    }
  });
})();
