(function () {
  console.log("✅ script.js from Netlify CDN!");
  const IS_PRODUCTION = window.location.hostname === "app.clayfulhealth.com";
  console.log(`✅ script.js from Netlify CDN! Environment: ${IS_PRODUCTION ? "production" : "staging"}`);

  document.addEventListener("DOMContentLoaded", function () {
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
  });

  document.addEventListener("DOMContentLoaded", function () {
    const button = document.getElementById("btn-confirm-start-session");
    const errorMsg = document.getElementById("msg-error-start-session");

    if (window.location.pathname.includes("/dashboard/launch-session")) {
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
      return;
    }

    // 👇 Normal click handler on start-session page
    if (!button) return;
    let isProcessing = false;
    button.addEventListener("click", async () => {
      if (isProcessing) return;
      isProcessing = true;

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
        isProcessing = false;
      } catch (err) {
        console.error("Failed to start session:", err);
        if (errorMsg) errorMsg.style.display = "block";
        button.disabled = false;
      }
    });
  });
})();
