(function () {
  const IS_PRODUCTION = window.location.hostname === "app.clayfulhealth.com";
  console.log(`educator/session-dashboard.js Environment: ${IS_PRODUCTION ? "production" : "staging"}`);

  document.addEventListener("DOMContentLoaded", function () {
    const currentSessionUrl = "https://educator-getactivesessionstaging-7w65flzt3q-uc.a.run.app";
    const studentsUrl = "https://us-central1-clayful-app.cloudfunctions.net/educator-getActiveSessionStudentsStaging?full=true";
    const updateSessionUrl = "https://us-central1-clayful-app.cloudfunctions.net/educator-updateSessionStatusStaging";

    const countStudentsInSession = document.getElementById("count-students-in-session");
  
    const waitingText = document.getElementById("text-waiting-status");
    const studentList = document.getElementById("students-list");
    const studentViewTable = document.getElementById("student-view-table");

    const activeSessionTime = document.getElementById("active-session-time");
    const wrapperActiveSessionTime = document.getElementById("wrapper-active-session-time");
    const pausedSessionTime = document.getElementById("paused-session-time");
    const wrapperPausedSessionTime = document.getElementById("wrapper-paused-session-time");

    const pauseBtn = document.getElementById("btn-pause-session");
    const pauseBtnConfirm = document.getElementById("btn-confirm-pause-session");
    const pauseModal = document.getElementById("pause-modal");
    const resumeBtn = document.getElementById("btn-resume-session");

    if (!studentList || !waitingText || !studentViewTable || !pausedSessionTime || !wrapperPausedSessionTime ||
        !activeSessionTime || !wrapperActiveSessionTime || !countStudentsInSession || !pauseBtn || !pauseBtnConfirm || !resumeBtn || !pauseModal
    ) return;

    studentViewTable.style.display = "none";
    wrapperActiveSessionTime.style.display = "none";
    wrapperPausedSessionTime.style.display = "none";

    const token = localStorage.getItem("_ms-mid");
    if (!token) return;

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    };

    // === HANDLE ONCLICK EVENTS ===

    // === Handle pause session ===
    if (pauseBtnConfirm) {
      pauseBtnConfirm.addEventListener("click", function () {
        fetch(updateSessionUrl, {
          method: "PATCH",
          headers,
          body: JSON.stringify({ status: "paused" })
        })
          .then(res => {
            if (!res.ok) throw new Error("Failed to update session status");
            return res.json();
          })
          .then(() => {
            pauseBtn.style.display = "none";
            pauseModal.style.display = "none";
            resumeBtn.style.display = "flex";

            activeSessionTime.style.display = "none";
            wrapperActiveSessionTime.style.display = "none";

            clearInterval(window._sessionTimerInterval);
            window._sessionTimerInterval = null;
            startSessionTimer(0);

            pausedSessionTime.style.display = "flex";
            wrapperPausedSessionTime.style.display = "flex";
          })
          .catch(err => {
            console.error("Failed to pause session:", err);
            alert("There was a problem pausing the session. Please try again.");
          });
      });
    }

    // === Handle resume session ===
    if (resumeBtn) {
      resumeBtn.addEventListener("click", function () {
        fetch(updateSessionUrl, {
          method: "PATCH",
          headers,
          body: JSON.stringify({ status: "running" })
        })
          .then(res => {
            if (!res.ok) throw new Error("Failed to update session status");
            return res.json();
          })
          .then(() => {
            resumeBtn.style.display = "none";
            pauseBtn.style.display = "flex";

            pausedSessionTime.style.display = "none";
            wrapperPausedSessionTime.style.display = "none";

            fetch(currentSessionUrl, { headers })
              .then(res => res.json())
              .then(session => {
                let totalTimeInSeconds = session?.status_time_in_seconds ?? 0;

                if (session?.status == "running") {
                  totalTimeInSeconds += session?.total_session_time_in_seconds ?? 0;
                }

                startSessionTimer(totalTimeInSeconds);
                
                activeSessionTime.style.display = "flex";
                wrapperActiveSessionTime.style.display = "flex";
              });
          })
          .catch(err => {
            console.error("Failed to resume session:", err);
            alert("There was a problem resuming the session. Please try again.");
          });
      });
    }

    // === Handle finish session ===

    // function startSessionTimer(initialSeconds) {
    //   if (typeof window === "undefined") return;

    //   clearInterval(window._sessionTimerInterval);
    //   window._sessionTimerInterval = null;

    //   let totalTimeInSeconds = initialSeconds;

    //   window._sessionTimerInterval = setInterval(() => {
    //     totalTimeInSeconds++;
    //     const minutes = Math.floor(totalTimeInSeconds / 60).toString().padStart(2, '0');
    //     const seconds = (totalTimeInSeconds % 60).toString().padStart(2, '0');
    //     const formattedTime = `${minutes}:${seconds}`;

    //     pausedSessionTime.textContent = formattedTime;
    //     activeSessionTime.textContent = formattedTime;
    //   }, 1000);
    // }
    function startSessionTimer(initialSeconds) {
      if (typeof window === "undefined") return;

      clearInterval(window._sessionTimerInterval);
      window._sessionTimerInterval = null;

      let totalTimeInSeconds = initialSeconds;

      function updateDisplay() {
        const minutes = Math.floor(totalTimeInSeconds / 60).toString().padStart(2, '0');
        const seconds = (totalTimeInSeconds % 60).toString().padStart(2, '0');
        const formattedTime = `${minutes}:${seconds}`;

        pausedSessionTime.textContent = formattedTime;
        activeSessionTime.textContent = formattedTime;
      }

      updateDisplay();

      // 🔁 then start ticking every second
      window._sessionTimerInterval = setInterval(() => {
        totalTimeInSeconds++;
        updateDisplay();
      }, 1000);
    }

    // === Fetch session info and start timer
    fetch(currentSessionUrl, { headers })
      .then(res => res.json())
      .then(sessionData => {
        const sessionCodeElement = document.getElementById("session-code");
        const sessionStartTimeElement = document.getElementById("session-started");

        if (sessionCodeElement && sessionData?.session_number) {
          sessionCodeElement.textContent = sessionData.session_number;
        }
        if (sessionStartTimeElement && sessionData?.launched_at) {
          const startTime = new Date(sessionData.launched_at._seconds * 1000);
          sessionStartTimeElement.textContent = startTime.toLocaleString();
        }

        const status = sessionData?.status;
        let totalSeconds = sessionData?.status_time_in_seconds ?? 0;

        if (status === "paused") {
          pauseBtn.style.display = "none";
          resumeBtn.style.display = "flex";

          activeSessionTime.style.display = "none";
          wrapperActiveSessionTime.style.display = "none";

          clearInterval(window._sessionTimerInterval);
          startSessionTimer(totalSeconds);

          pausedSessionTime.style.display = "flex";
          wrapperPausedSessionTime.style.display = "flex";
        } else if (status === "running") {
          totalSeconds += sessionData?.total_session_time_in_seconds ?? 0;

          pauseBtn.style.display = "flex";
          resumeBtn.style.display = "none";

          pausedSessionTime.style.display = "none";
          wrapperPausedSessionTime.style.display = "none";

          startSessionTimer(totalSeconds);

          activeSessionTime.style.display = "flex";
          wrapperActiveSessionTime.style.display = "flex";
        }
        
      })
      .catch(err => console.error("Failed to load session:", err));

    // === Function to fetch and render students ===
    function fetchAndRenderStudents() {
      fetch(studentsUrl, { headers })
        .then(res => res.json())
        .then(data => {
          const students = data?.students || [];

          // if no students, show waiting text and hide student view table
          if (!students || students.length === 0) {
            waitingText.style.display = "flex";
            studentViewTable.style.removeProperty("display");
            countStudentsInSession.textContent = "0";
            return;
          }

          countStudentsInSession.textContent = students.length;
          studentList.innerHTML = "";

          students.forEach(student => {
            const row = createStudentRow(student);
            studentList.appendChild(row);
          });

          waitingText.style.display = "none";
          studentViewTable.style.removeProperty("display");
        })
        .catch(err => {
          console.error("Failed to fetch students", err);
        });
    }

    function createStudentRow(student) {
      const row = document.createElement("div");
      row.className = "students-item";
      row.id = "student-row";
      row.setAttribute("fs-list-element", "item");

      row.innerHTML = `
        <div class="student-information width-200">
          <div class="info-wrapper">
            <div class="div-profile-pic">
              <div class="student-status-dot" id="student-status-dot"></div>
              <div class="student-profile-picture">
                <img class="student-emoji" id="student-emoji" loading="lazy" alt="" src="${student.emoji || 'https://cdn.prod.website-files.com/plugins/Basic/assets/placeholder.60f9b1840c.svg'}">
              </div>
            </div>
            <div class="student-name-id">
              <p class="text_m_dashboard" id="student-name" fs-list-field="studentName">${student.studentName}</p>
              <p class="text_m_dashboard opacity_60" id="student-email" fs-list-field="email">${student.email || '[Unknown Email]'}</p>
            </div>
          </div>
        </div>

        <div class="student-information width-140">
          <div class="info-wrapper" id="student-consent">
            <div class="sudent-consent-status">
              <p class="text_xl_dashboard">${student.hasConsent ? "✅" : "❌"}</p>
            </div>
          </div>
        </div>

        <div class="student-information width-200">
          <div class="info-wrapper">
            <div class="sudent-journal">
              <p class="text_m_dashboard" id="student-journal-name" fs-list-field="journalName">${student.journalName || "—"}</p>
              <p class="text_m_dashboard opacity_60" id="student-journal-desc" fs-list-field="journalDescription">${student.journalDescription || ""}</p>
            </div>
          </div>
        </div>

        <div class="student-information width-140 status">
          <div class="status-journal">
            <div class="student-journal-status-dot" id="student-journal-status-dot"></div>
            <div class="sudent-status">
              <p class="text_m_dashboard" id="student-journal-status" fs-list-field="status">${student.status || "Not started"}</p>
            </div>
          </div>
        </div>

        <div class="student-information width-140">
          <div class="info-wrapper">
            <div class="sudent-time">
              <p class="text_m_dashboard" id="student-time-spent" fs-list-field="timeSpent">${student.timeSpent || "—"}</p>
            </div>
          </div>
        </div>

        <div class="student-information width-80">
          <a id="open-student-details" data-w-id="2e2b3a62-0b5c-d9aa-2de3-824e45cce71c" href="#" class="see-student-detials w-inline-block">
            <img loading="lazy" src="https://cdn.prod.website-files.com/62b25ea5deeeeae5c2f76889/68559845ddece1092eba8cca_tabler-icon-arrow-left.svg" alt="arrow pointing left">
          </a>
        </div>
      `;

      return row;
    }

    // Initial fetch
    fetchAndRenderStudents();

    // Refresh every 60 seconds
    setInterval(fetchAndRenderStudents, 60000);
  });
})();
