(function () {
  console.log("✅ script.js from Netlify CDN!");
  const IS_PRODUCTION = window.location.hostname === "app.clayfulhealth.com";
  console.log(`✅ script.js from Netlify CDN! Environment: ${IS_PRODUCTION ? "production" : "staging"}`);

  document.addEventListener("DOMContentLoaded", function () {
    if (window.location.pathname.includes("/dashboard/launch-session")) {
      const studentList = document.getElementById("student-list");
      if (!studentList) return;

      const students = [
        { name: "bruno@gogrow.dev", emojiUrl: "https://cdn.prod.website-files.com/62b25ea5deeeea5ef9f7688d/6853f710742b04e703b40b7f_sunglasses-emoji.png" },
        { name: "filipillo@gogrow.dev", emojiUrl: "https://cdn.prod.website-files.com/62b25ea5deeeea5ef9f7688d/6853f6c7df2f9ce8f02ac68b_pensive-emoji.png" },
        { name: "martin@gogrow.dev", emojiUrl: "https://cdn.prod.website-files.com/62b25ea5deeeea5ef9f7688d/6853f6b2626125731f067f3f_partying-face.png" },
        { name: "franco@gogrow.dev", emojiUrl: "https://cdn.prod.website-files.com/62b25ea5deeeea5ef9f7688d/6853f606b94dc61ad0390c29_star-struck-emoji.png" },
        { name: "maite@gogrow.dev", emojiUrl: "https://cdn.prod.website-files.com/62b25ea5deeeea5ef9f7688d/6853f6294240bdd0f581237b_confusion-emoji.png" },
      ];

      const firstChip = studentList.querySelector(".student-chip");
      if (firstChip) {
        studentList.removeChild(firstChip);
      }

      const sessionStudentCount = document.getElementById("session-student-count");
      if (sessionStudentCount) {
        sessionStudentCount.textContent = students.length;
      }

      students.forEach((student) => {
        const card = document.createElement("div");
        card.className = "student-chip";

        const emojiDiv = document.createElement("div");
        emojiDiv.className = "student_emoji";

        const emojiImg = document.createElement("img");
        emojiImg.src = student.emojiUrl;
        emojiImg.alt = "emoji";
        emojiImg.loading = "lazy";

        emojiDiv.appendChild(emojiImg);

        const nameP = document.createElement("p");
        nameP.className = "text_l_dashboard";
        nameP.textContent = student.name;

        card.appendChild(emojiDiv);
        card.appendChild(nameP);

        studentList.appendChild(card);
      });

      const interval = setInterval(() => {
        const sessionCodeElement = document.getElementById("session-code");
        if (sessionCodeElement) {
          const randomSixDigit = Math.floor(100000 + Math.random() * 900000);
          sessionCodeElement.textContent = randomSixDigit;
          clearInterval(interval);
        }
      }, 200); // Check every 200ms

      // Optional: Stop trying after 5 seconds
      setTimeout(() => clearInterval(interval), 5000);
    }
  });

  document.addEventListener("DOMContentLoaded", function () {
    const educatorStartSessionButton = document.getElementById("btn-confirm-start-session");
    const errorMsg = document.getElementById("msg-error-start-session");

    // Normal click handler on start-session page
    if (educatorStartSessionButton) {
      let isProcessingStartSession = false;
      educatorStartSessionButton.addEventListener("click", async () => {
        if (isProcessingStartSession) return;
        isProcessingStartSession = true;

        try {
          const token = localStorage.getItem("_ms-mid");

          if (!token) throw new Error("Missing token");
          const createSessionUrl = "https://us-central1-clayful-app.cloudfunctions.net/createSessionStaging";

          const response = await fetch(createSessionUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({})
          });

          if (!response.ok) throw new Error("Server error");

          console.log("response:", response);

          window.location.href = "/dashboard/launch-session";
          isProcessingStartSession = false;
        } catch (err) {
          console.error("Failed to start session:", err);
          if (errorMsg) errorMsg.style.display = "block";
          educatorStartSessionButton.disabled = false;
        }
      });
    }

    const studentJoinSessionButton = document.getElementById("btn-confirm-join-session");
    const studentErrorMsg = document.getElementById("msg-error-join-session");

    if (studentJoinSessionButton) {
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

        const sessionNumber = sessionCodeInput?.value?.trim();
        const emojiUrl = emojiImg?.src || "";

        if (!sessionNumber || !emojiUrl) {
          console.error("Missing input values");
          if (studentErrorMsg) studentErrorMsg.style.display = "block";
          isProcessingJoinSession = false;
          return;
        }


        const joinSessionUrl = "https://us-central1-clayful-app.cloudfunctions.net/joinSessionStaging";

        const response = await fetch(joinSessionUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            sessionNumber: Number(sessionNumber),
            emojiUrl: emojiUrl
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
