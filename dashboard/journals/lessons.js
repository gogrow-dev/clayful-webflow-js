(function () {
  const startJournalUrl = "https://us-central1-clayful-app.cloudfunctions.net/student-startJournalStaging";
  const finishJournalUrl = "https://us-central1-clayful-app.cloudfunctions.net/student-finishJournalStaging";

  function decodeHtmlEntities(str) {
    const txt = document.createElement('textarea');
    txt.innerHTML = str;
    return txt.value;
  }

  // This will run when the Typeform screen changes
  window.handleTypeformScreenChange = function () {
    if (!window._typeformScreenChangeHandled) {
      window._typeformScreenChangeHandled = true;

      // console.log("🚀 [CDN] Typeform screen changed (started)");
      // console.log("TypeformID:", window.typeformId);
      // console.log("Description:", window.description);
      // console.log("Journal Name:", window.journalName);
      // console.log("Featured Image:", window.featuredImage);
      // console.log("URL:", window.location.href);

      const token = localStorage.getItem("_ms-mid");

      if (!token) {
        // console.error("Missing token");
        if (studentErrorMsg) studentErrorMsg.style.display = "block";
        return;
      }

      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      };

      fetch(startJournalUrl, {
        method: "POST",
        headers,
        body: JSON.stringify({
          journal: {
            typeformId: window.typeformId,
            description: decodeHtmlEntities(window.description),
            name: decodeHtmlEntities(window.journalName),
            featuredImage: window.featuredImage,
            url: window.location.href
          }
        })
      })
        .then(res => {
          if (!res.ok) throw new Error("Failed to update session status");
          return res.json();
        })
        .then(() => {
          // console.log("Journal started successfully");
        })
        .catch(err => {
          // console.error("Failed to start journal:", err);
        });
    }
  };

  // This will run when the Typeform is submitted
  window.handleTypeformSubmit = function () {
    console.log("🚀 [CDN] Typeform submitted (finished)");
    const token = localStorage.getItem("_ms-mid");

    if (!token) {
      if (studentErrorMsg) studentErrorMsg.style.display = "block";
      return;
    }

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    };

    fetch(finishJournalUrl, {
      method: "POST",
      headers,
      body: JSON.stringify({
        journal: {
          typeformId: window.typeformId,
          description: decodeHtmlEntities(window.description),
          name: decodeHtmlEntities(window.journalName),
          featuredImage: window.featuredImage,
          url: window.location.href
        }
      })
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed to update session status");
        return res.json();
      })
      .then(() => {
        // console.log("Journal started successfully");
      })
      .catch(err => {
        // console.error("Failed to start journal:", err);
      });
  };
})();
