(function () {
  console.log("✅ script.js from Netlify CDN!");

  document.addEventListener("DOMContentLoaded", function () {
    const button = document.getElementById("btn-confirm-start-session");
    const errorMsg = document.getElementById("msg-error-start-session");

    if (!button) return;

    button.addEventListener("click", async () => {
      button.disabled = true;

      try {
        const token = JSON.parse(localStorage.getItem("_ms-mid"));

        if (!token) throw new Error("Missing token");

        // const response = await fetch("https://your-cloud-function-url", {
        //   method: "POST",
        //   headers: {
        //     "Content-Type": "application/json",
        //     Authorization: `Bearer ${token}`
        //   },
        //   body: JSON.stringify({})
        // });

        // if (!response.ok) throw new Error("Server error");
        console.log("Session started successfully");

        window.location.href = "/dashboard/launch-session";
      } catch (err) {
        console.error("Failed to start session:", err);
        if (errorMsg) errorMsg.style.display = "block";
        button.disabled = false;
      }
    });
  });
})();
