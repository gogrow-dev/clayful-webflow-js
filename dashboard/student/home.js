import { fetchActiveSession } from "https://luminous-yeot-e7ca42.netlify.app/dashboard/utils/active-session.js";

(function () {
  const IS_PRODUCTION = window.location.hostname === "app.clayfulhealth.com";
  // console.log(`student/home.js Environment: ${IS_PRODUCTION ? "production" : "staging"}`);

  window.chatOpened = window.chatOpened || false;
  window.chatStarted = window.chatStarted || false;
  window.chatUnreadMessages = window.chatUnreadMessages || false;

  // Define Zendesk chat tracking logic
  window.handleZendeskChatOpen = function () {
    window.chatOpened = true;

    if (window.chatUnreadMessages) {
      console.log("[Zendesk] Chat started (on open with unread messages)");
      window.chatStarted = true;
      window.chatUnreadMessages = false;
      // hit endpoint to mark as chatting
    }
  };

  window.handleZendeskUnreadMessage = function (count) {
    console.log(`[Zendesk] Unread messages: ${count} from cdn`);

    if (count > 0) {
      if (!window.chatOpened) {
        window.chatUnreadMessages = true;
      } else if (!window.chatStarted) {
        window.chatStarted = true;
        console.log("[Zendesk] Chat started (on unread message and open)");
        window.chatUnreadMessages = false;
        // hit endpoint to mark as chatting
      }
      
    }
  };

  window.handleZendeskChatClose = function () {
    console.log("[Zendesk] Chat widget closed from cdn");

    if (window.chatStarted) {
      console.log("[Zendesk] Chat ended (on close)");
      window.chatStarted = false;
      // hit endpoint to mark as not chatting anymore
    }
    window.chatOpened = false;
  };

  document.addEventListener("DOMContentLoaded", function () {
    const modalLoading = document.getElementById("modal-loading");
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
        if (modalLoading) modalLoading.style.display = "none";
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
        if (modalLoading) modalLoading.style.display = "flex";
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
          if (modalLoading) modalLoading.style.display = "none";
          if (studentErrorMsg) studentErrorMsg.style.display = "block";
          return;
        }
        console.log("Successfully joined session");
        window.location.href = "/kids/journals";
        isProcessingJoinSession = false;
      });
    }

    if (studentContinueJoinSessionButton) {
      studentContinueJoinSessionButton.addEventListener("click", () => {
        const sessionNumber = sessionCodeInput?.value?.trim();
        const studentNameValue = studentName?.value?.trim();

        if (!sessionNumber || !studentNameValue) {
          if (continueErrorMsg) continueErrorMsg.style.display = "flex";
        } else {
          if (modalHeader) modalHeader.style.display = "none";
          if (modalPart1) modalPart1.style.display = "none";
          if (modalPart2) modalPart2.style.display = "flex";
          if (continueErrorMsg) continueErrorMsg.style.display = "none";
        }
      });
    }
  });
})();
