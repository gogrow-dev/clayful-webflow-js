import { fetchActiveSession } from "https://luminous-yeot-e7ca42.netlify.app/dashboard/utils/active-session.js";

(function () {
  const IS_PRODUCTION = window.location.hostname === "app.clayfulhealth.com";
  console.log(`educator/home.js Environment: ${IS_PRODUCTION ? "production" : "staging"}`);

  document.addEventListener("DOMContentLoaded", function () {
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

      try {
        if (!token) throw new Error("Missing token");
        const createSessionUrl = "https://us-central1-clayful-app.cloudfunctions.net/educator-createSessionStaging";

        const response = await fetch(createSessionUrl, {
          method: "POST",
          headers: headers,
          body: JSON.stringify({})
        });

        console.log("response:", response);
        if (!response.ok) throw new Error("Server error");


        window.location.href = "/dashboard/launch-session";
        isProcessingStartSession = false;
      } catch (err) {
        console.error("Failed to start session:", err);
        if (errorMsg) errorMsg.style.display = "block";
        educatorStartSessionButton.disabled = false;
      }
    });
  });
})();
