(function () {
  const IS_PRODUCTION = window.location.hostname === "app.clayfulhealth.com";
  console.log(`educator/launch-session.js Environment: ${IS_PRODUCTION ? "production" : "staging"}`);

  document.addEventListener("DOMContentLoaded", function () {
      const studentList = document.getElementById("student-list");
      if (!studentList) return;

      const students = [
        { name: "Bruno", emojiUrl: "https://cdn.prod.website-files.com/62b25ea5deeeea5ef9f7688d/6853f710742b04e703b40b7f_sunglasses-emoji.png" },
        { name: "Filipillo", emojiUrl: "https://cdn.prod.website-files.com/62b25ea5deeeea5ef9f7688d/6853f6c7df2f9ce8f02ac68b_pensive-emoji.png" },
        { name: "Martin", emojiUrl: "https://cdn.prod.website-files.com/62b25ea5deeeea5ef9f7688d/6853f6b2626125731f067f3f_partying-face.png" },
        { name: "Franco", emojiUrl: "https://cdn.prod.website-files.com/62b25ea5deeeea5ef9f7688d/6853f606b94dc61ad0390c29_star-struck-emoji.png" },
        { name: "Maite", emojiUrl: "https://cdn.prod.website-files.com/62b25ea5deeeea5ef9f7688d/6853f6294240bdd0f581237b_confusion-emoji.png" },
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
    
  });
})();
