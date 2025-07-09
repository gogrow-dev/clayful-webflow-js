import { fetchActiveSession } from "https://luminous-yeot-e7ca42.netlify.app/dashboard/utils/active-session.js";

(function () {
  const IS_PRODUCTION = window.location.hostname === "app.clayfulhealth.com";
  // console.log(`educator/home.js Environment: ${IS_PRODUCTION ? "production" : "staging"}`);

  document.addEventListener("DOMContentLoaded", function () {
    const modalLoading = document.getElementById("modal-loading");
    const educatorStartSessionButton = document.getElementById("btn-confirm-start-session");
    const errorMsg = document.getElementById("msg-error-start-session");

    const token = localStorage.getItem("_ms-mid");

    if (!token) {
      console.error("Missing token");
      if (errorMsg) errorMsg.style.display = "block";
      return;
    }

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    };

    const getSessionUrl = "https://us-central1-clayful-app.cloudfunctions.net/educator-getSessionStaging";

    fetchActiveSession(getSessionUrl, headers);
    setInterval(() => fetchActiveSession(getSessionUrl, headers), 15000);

    if (!educatorStartSessionButton) {
      return;
    }

    let isProcessingStartSession = false;
    educatorStartSessionButton.addEventListener("click", async () => {
      if (isProcessingStartSession) return;
      isProcessingStartSession = true;

      if (modalLoading) modalLoading.style.display = "flex";
      try {
        if (!token) throw new Error("Missing token");
        const createSessionUrl = "https://us-central1-clayful-app.cloudfunctions.net/educator-createSessionStaging";

        const response = await fetch(createSessionUrl, {
          method: "POST",
          headers: headers,
          body: JSON.stringify({})
        });

        if (!response.ok) {
          if (modalLoading) modalLoading.style.display = "none";
          throw new Error("Server error");
        }

        window.location.href = "/dashboard/launch-session";
        isProcessingStartSession = false;
      } catch (err) {
        if (modalLoading) modalLoading.style.display = "none";
        console.error("Failed to start session:", err);
        if (errorMsg) errorMsg.style.display = "block";
        educatorStartSessionButton.disabled = false;
      }
    });
  });
})();
