(function () {
  const IS_PRODUCTION = window.location.hostname === "app.clayfulhealth.com";
  console.log(`educator/session-dashboard.js Environment: ${IS_PRODUCTION ? "production" : "staging"}`);
  HOME_PAGE_URL = "/educators-home"

  document.addEventListener("DOMContentLoaded", function () {
    const currentSessionUrl = "https://us-central1-clayful-app.cloudfunctions.net/educator-getSessionStaging";
    const studentsUrl = "https://us-central1-clayful-app.cloudfunctions.net/educator-getSessionStudentsStaging?full=true";
    const studentsJournalsUrl = "https://us-central1-clayful-app.cloudfunctions.net/educator-getSessionStudentJournalsStaging";
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
    const endBtn = document.getElementById("btn-end-session");

    const sidebar = document.getElementById("sidebar-student");
    const sidebarCloseBtn = document.getElementById("sidebar-close-btn");
    const studentSidebarBg = document.getElementById("student-sidebar-bg");

    const sidebarContent = document.querySelector(".sidebar-content");

    const oldJournalBlock = sidebarContent.querySelector(".sidebar-student-journal");
    if (oldJournalBlock) {
      oldJournalBlock.remove();
    }

    const journalContainer = document.createElement("div");
    journalContainer.id = "sidebar-journals-container";
    journalContainer.classList.add("sidebar-journals-container");

    sidebarContent.appendChild(journalContainer);

    if (!studentList || !waitingText || !studentViewTable || !pausedSessionTime || !wrapperPausedSessionTime ||
        !activeSessionTime || !wrapperActiveSessionTime || !countStudentsInSession || !pauseBtn || !pauseBtnConfirm || !resumeBtn || !pauseModal
    ) return;

    studentList.innerHTML = "";
    studentViewTable.style.display = "none";
    wrapperActiveSessionTime.style.display = "none";
    wrapperPausedSessionTime.style.display = "none";

    const token = localStorage.getItem("_ms-mid");
    if (!token) return;

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    };

    // === Fetch session info and start timer
    fetch(currentSessionUrl, { headers })
      .then(res => {
        if (!res.ok) {
          console.error("Failed to fetch current session");
          window.location.href = HOME_PAGE_URL;
          return;
        }
        return res.json();
      })
      .then(sessionData => {
        const sessionCodeElement = document.getElementById("session-code");
        const sessionStartTimeElement = document.getElementById("session-started");

        if (sessionCodeElement && sessionData?.session_number) {
          sessionCodeElement.textContent = sessionData.session_number;
        }
        if (sessionStartTimeElement && sessionData?.launched_at) {
          const startTime = new Date(sessionData.launched_at._seconds * 1000);
          const formattedStartTime = startTime.toLocaleString("en-US", {
            month: "short",       // "Jun"
            day: "numeric",       // "3"
            year: "numeric",      // "2025"
            hour: "numeric",      // "2"
            minute: "2-digit",    // "51"
            hour12: true          // "PM"
          });
          sessionStartTimeElement.textContent = formattedStartTime;
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
          });
      });
    }

    // === Handle finish session ===
    if (endBtn) {
      endBtn.addEventListener("click", function () {
        fetch(updateSessionUrl, {
          method: "PATCH",
          headers,
          body: JSON.stringify({ status: "finished" })
        })
          .then(res => {
            if (!res.ok) throw new Error("Failed to update session status");
            return res.json();
          })
          .then(() => {
            window.location.href = "/educators-home";
          })
          .catch(err => {
            console.error("Failed to finish session:", err);
          });
      });
    }

    // === Handle sidebar close on background ===
    if (studentSidebarBg) {
      studentSidebarBg.addEventListener("click", function () {
        const sidebar = document.getElementById("sidebar-student");
        if (sidebar) {
          sidebar.style.display = "none";
        }
      });
    }

    // === Handle sidebar close on x button ===
    if (sidebarCloseBtn) {
      sidebarCloseBtn.addEventListener("click", function () {
        const sidebar = document.getElementById("sidebar-student");
        if (sidebar) {
          sidebar.style.display = "none";
        }
      });
    }

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

      window._sessionTimerInterval = setInterval(() => {
        totalTimeInSeconds++;
        updateDisplay();
      }, 1000);
    }

    // === Function to fetch and render students ===
    function fetchAndRenderStudents() {
      fetch(studentsUrl, { headers })
        .then(res => res.json())
        .then(data => {
          const students = data?.students || [];

          console.log("Fetched students:", students);
          if (!students || students.length === 0) {
            waitingText.style.display = "flex";
            studentViewTable.style.display = "none";
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
          studentList.style.removeProperty("display");
        })
        .catch(err => {
          console.error("Failed to fetch students", err);
        });
    }

    // == fetch and render sidebar student journals
    function fetchAndRenderSidebarStudentJournals(studentUserId) {
      fetch(`${studentsJournalsUrl}?studentUserId=${studentUserId}`, { headers })
        .then(res => res.json())
        .then(data => {
          const journals = data?.journals || [];
          console.log("Fetched student journals:", journals);
        })
        .catch(err => {
          console.error("Failed to fetch student journals", err);
        });
    }


    function createStudentRow(student) {
      const row = document.createElement("div");
      row.className = "students-item";
      row.id = "student-row";
      row.setAttribute("fs-list-element", "item");

      let formattedTime = "—";
      const activeJournal = student.activeJournal || {};
      if (activeJournal.timeSpentInSeconds) {
        const seconds = (activeJournal.timeSpentInSeconds % 60).toString().padStart(2, '0');
        const minutes = Math.floor(activeJournal.timeSpentInSeconds / 60).toString().padStart(2, '0');
        formattedTime = `${minutes}:${seconds}`;
      }

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
              <p class="text_xl_dashboard">${student.consentStatus?.trim().charAt(0) || "❌"}</p>
            </div>
          </div>
        </div>

        <div class="student-information width-200">
          <div class="info-wrapper">
            <div class="sudent-journal">
              <p class="text_m_dashboard" id="student-journal-name" fs-list-field="journalName">${activeJournal.name || "—"}</p>
              <p class="text_m_dashboard opacity_60" id="student-journal-desc" fs-list-field="journalDescription">${activeJournal?.description || ""}</p>
            </div>
          </div>
        </div>

        <div class="student-information width-140 status">
          <div class="status-journal">
            ${activeJournal.started_at ? '<div class="student-journal-status-dot-started" id="student-journal-status-dot"></div>' : ''}
            <div class="sudent-status">
              <p class="text_m_dashboard" id="student-journal-status" fs-list-field="status">
                ${activeJournal.started_at ? "Started" : ""}
              </p>
            </div>
          </div>
        </div>


        <div class="student-information width-140">
          <div class="info-wrapper">
            <div class="sudent-time">
              <p class="text_m_dashboard" id="student-time-spent" fs-list-field="timeSpent">${formattedTime}</p>
            </div>
          </div>
        </div>

        <div class="student-information width-80">
          <a id="open-student-details" href="${activeJournal.url || "#"}" class="see-student-detials w-inline-block">
            <img loading="lazy" src="https://cdn.prod.website-files.com/62b25ea5deeeeae5c2f76889/68559845ddece1092eba8cca_tabler-icon-arrow-left.svg" alt="arrow pointing left">
          </a>
        </div>
      `;

      row.querySelector("#open-student-details").addEventListener("click", async function (e) {
        e.preventDefault();

        const sidebar = document.querySelector(".sidebar-content");
        if (!sidebar) {
          console.error("Sidebar element not found");
          return;
        }

        sidebar.style.display = "flex";

        const sidebarName = sidebar.querySelector("#sidebar-student-name");
        const sidebarEmail = sidebar.querySelector("#sidebar-student-email");
        const sidebarEmoji = sidebar.querySelector("#sidebar-student-emoji");

        if (sidebarName) sidebarName.textContent = student.studentName;
        if (sidebarEmail) sidebarEmail.textContent = student.email || "-";
        if (sidebarEmoji && student.emoji) sidebarEmoji.src = student.emoji;

        const sidebarConsentTrue = sidebar.querySelector("#sidebar-student-consent-true");
        const sidebarConsentFalse = sidebar.querySelector("#sidebar-student-consent-false");
        if (student.consentStatus && student.consentStatus.trim().startsWith("✅")) {
          if (sidebarConsentTrue) sidebarConsentTrue.style.display = "block";
          if (sidebarConsentFalse) sidebarConsentFalse.style.display = "none";
        } else {
          if (sidebarConsentTrue) sidebarConsentTrue.style.display = "none";
          if (sidebarConsentFalse) sidebarConsentFalse.style.display = "block";
        }

        // 👉 Fetch and render journal list
        const { journals } = await fetchAndRenderSidebarStudentJournals(student.id);

        const container = sidebar.querySelector("#sidebar-journals-container");
        if (container) {
          container.innerHTML = ""; // 🔄 clear previous journals

          journals.forEach((journal) => {
            const el = createSidebarJournalElement(journal);
            container.appendChild(el);
          });
        }
      });


      return row;
    }

    function createSidebarJournalElement(journal) {
      const wrapper = document.createElement("div");
      wrapper.className = "sidebar-student-journal";

      const formatTime = (secs) => {
        const mins = Math.floor(secs / 60);
        const sec = secs % 60;
        return `${String(mins).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
      };

      const status = journal.ended_at ? "Completed" : "Started";
      const statusClass = journal.ended_at ? "student-journal-status-dot-completed" : "student-journal-status-dot-started";

      wrapper.innerHTML = `
        <div class="sidebar-student-row">
          <div class="sidebar-left-column"><p class="text_l_dashboard white opacity-60">Journal name</p></div>
          <div class="sidebar-rigth-column">
            <div class="sidebar-journal-info">
              <p class="text_l_dashboard white">${journal.name}</p>
              <p class="text_m_dashboard opacity_60">${journal.description}</p>
            </div>
            <a href="${journal.url}" target="_blank" class="button-square-outlined width150px w-inline-block">
              <p class="text_m_dashboard width100">View journal</p>
              <img src="https://cdn.prod.website-files.com/62b25ea5deeeeae5c2f76889/68559845ddece1092eba8cca_tabler-icon-arrow-left.svg" loading="lazy" alt="arrow">
            </a>
          </div>
        </div>
        <div class="sidebar-student-row">
          <div class="sidebar-left-column"><p class="text_l_dashboard white opacity-60">Status</p></div>
          <div class="sidebar-rigth-column">
            <div class="status-journal">
              <div class="student-journal-status-dot ${statusClass}"></div>
              <div class="sudent-status">
                <p class="text_l_dashboard white">${status}</p>
              </div>
            </div>
          </div>
        </div>
        <div class="sidebar-student-row">
          <div class="sidebar-left-column"><p class="text_l_dashboard white opacity-60">Time spent</p></div>
          <div class="sidebar-rigth-column">
            <div class="sidebar-journal-info-horizontal">
              <p class="text_l_dashboard white">${formatTime(journal.timeSpentInSeconds)}</p>
              <p class="text_l_dashboard white">minutes</p>
            </div>
          </div>
        </div>
        <div class="sidebar-student-row">
          <div class="sidebar-left-column"><p class="text_l_dashboard white opacity-60">Key details</p></div>
          <div class="sidebar-rigth-column">
            <div class="sidebar-journal-info">
              <p id="sidebar-ai-summary" class="text_m_dashboard opacity_60 w-node-e001fc25-f8e4-2877-0294-c06e32b9fa45-df3d87f2">Anger is just a cover—let’s uncover what’s really going on beneath the surface</p>
            </div>
          </div>
        </div>
      `;

      return wrapper;
    }


    function capitalize(str) {
      return str.charAt(0).toUpperCase() + str.slice(1);
    }



    // Initial fetch
    fetchAndRenderStudents();

    // Refresh every 60 seconds
    setInterval(fetchAndRenderStudents, 15000);
  });
})();
