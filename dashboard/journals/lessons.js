(function () {
  // Optional: fallback value if used before assignment
  window.typeformId = window.typeformId || "";

  // This will run when the Typeform screen changes
  window.handleTypeformScreenChange = function () {
    if (!window._typeformScreenChangeHandled) {
        window._typeformScreenChangeHandled = true;

        console.log("🚀 [CDN] Typeform screen changed (started)");
        console.log("TypeformID:", window.typeformId);

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
    }


    // Example: Track with fetch
    // fetch("https://your-api.com/typeform-started", {
    //   method: "POST",
    //   body: JSON.stringify({ url: window.typeformId }),
    //   headers: { "Content-Type": "application/json" }
    // });
  };

  // This will run when the Typeform is submitted
  window.handleTypeformSubmit = function () {
    console.log("🎯 [CDN] Typeform submitted");
    console.log("TypeformID:", window.typeformId);

    // Example: Track with fetch
    // fetch("https://your-api.com/typeform-submitted", {
    //   method: "POST",
    //   body: JSON.stringify({ url: window.typeformId }),
    //   headers: { "Content-Type": "application/json" }
    // });
  };
})();
