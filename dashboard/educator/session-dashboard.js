import { fetchAndRenderJournals } from "https://luminous-yeot-e7ca42.netlify.app/dashboard/educator/journals-tab.js";
import { fetchAndRenderStudents, fetchAndRenderSessionStats } from "https://luminous-yeot-e7ca42.netlify.app/dashboard/educator/overview-tab.js";

(function () {
  const IS_PRODUCTION = window.location.hostname === "app.clayfulhealth.com";
  console.log(`educator/session-dashboard.js Environment: ${IS_PRODUCTION ? "production" : "staging"}`);
  const HOME_PAGE_URL = "/educators-home";

  document.addEventListener("DOMContentLoaded", function () {
    const currentSessionUrl = "https://us-central1-clayful-app.cloudfunctions.net/educator-getSessionStaging";
    const updateSessionUrl = "https://us-central1-clayful-app.cloudfunctions.net/educator-updateSessionStatusStaging";
    const journalsUrl = "https://us-central1-clayful-app.cloudfunctions.net/educator-getSessionJournalsStaging";

    const modalLoading = document.getElementById("modal-loading");

    const waitingText = document.getElementById("text-waiting-status");
    const studentList = document.getElementById("students-list");
    const studentViewTable = document.getElementById("student-view-table");

    const activeSessionTime = document.getElementById("active-session-time");
    const wrapperActiveSessionTime = document.getElementById("wrapper-active-session-time");
    const pausedSessionTime = document.getElementById("paused-session-time");
    const wrapperPausedSessionTime = document.getElementById("wrapper-paused-session-time");
    const countStudentsInSession = document.getElementById("count-students-in-session");

    const pauseBtn = document.getElementById("btn-pause-session");
    const pauseBtnConfirm = document.getElementById("btn-confirm-pause-session");
    const pauseModal = document.getElementById("pause-modal");
    const resumeBtn = document.getElementById("btn-resume-session");
    const endConfirmBtn = document.getElementById("btn-end-session");
    const endBtn = document.getElementById("btn-dashboard-end-session");

    const sidebarCloseBtn = document.getElementById("sidebar-close-btn");
    const studentSidebarBg = document.getElementById("student-sidebar-bg");

    const tabJournals = document.getElementById("tab-journals");
    const tabOverview = document.getElementById("tab-overview");

    const journalSidebar = document.getElementById("sidebar-journal");
    const journalSidebarBg = document.getElementById("sidebar-journal-bg");
    const journalSidebarCloseBtn = document.getElementById("sidebar-journal-close-btn");
    const journalViewTable = document.querySelector(".journal_view_table");

    if (!studentList || !waitingText || !studentViewTable || !pausedSessionTime || !wrapperPausedSessionTime || !modalLoading ||
      !activeSessionTime || !wrapperActiveSessionTime || !countStudentsInSession || !pauseBtn || !pauseBtnConfirm || !resumeBtn || !pauseModal
    ) return;

    studentList.innerHTML = "";
    studentViewTable.style.display = "none";
    wrapperActiveSessionTime.style.display = "none";
    wrapperPausedSessionTime.style.display = "none";
    journalViewTable.style.display = "none";

    const token = localStorage.getItem("_ms-mid");
    if (!token) return;

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    };

    const params = new URLSearchParams(window.location.search);
    let sessionId = params.get("sessionId") || "";
    // === Fetch session info and start timer
    fetch(`${currentSessionUrl}?sessionId=${sessionId}`, { headers })
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
        if (sessionData?.id) {
          sessionId = sessionData.id;
        }
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
        } else if (status === "finished") {
          pauseBtn.style.display = "none";
          resumeBtn.style.display = "none";
          endBtn.style.display = "none";

          pausedSessionTime.style.display = "none";
          wrapperPausedSessionTime.style.display = "none";

          activeSessionTime.style.display = "none";
          wrapperActiveSessionTime.style.display = "none";

          clearInterval(window._sessionTimerInterval);
          startSessionTimer(0);
        }

      })
      .catch(err => console.error("Failed to load session:", err));

    // === HANDLE ONCLICK EVENTS ===

    // === Handle pause session ===
    if (pauseBtnConfirm) {

      pauseBtnConfirm.addEventListener("click", function () {
        modalLoading.style.display = "flex";
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
            modalLoading.style.display = "none";
          })
          .catch(err => {
            console.error("Failed to pause session:", err);
            modalLoading.style.display = "none";
            alert("There was a problem pausing the session. Please try again.");
          });
      });
    }

    // === Handle resume session ===
    if (resumeBtn) {
      resumeBtn.addEventListener("click", function () {
        modalLoading.style.display = "flex";
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
                modalLoading.style.display = "none";
              }).catch(err => {
                modalLoading.style.display = "none";
                console.error("Failed to fetch updated session:", err);
              });
          })
          .catch(err => {
            modalLoading.style.display = "none";
            console.error("Failed to resume session:", err);
          });
      });
    }

    // === Handle finish session ===
    if (endConfirmBtn) {
      endConfirmBtn.addEventListener("click", function () {
        modalLoading.style.display = "flex";
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
            // Redirect to home page after finishing session
            window.location.href = `${window.location.href}?sessionId=${sessionId}`;
          })
          .catch(err => {
            modalLoading.style.display = "none";
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

    if (journalSidebarBg) {
      journalSidebarBg.addEventListener("click", function () {
        if (journalSidebar) {
          journalSidebar.style.display = "none";
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

    if (journalSidebarCloseBtn) {
      journalSidebarCloseBtn.addEventListener("click", function () {
        if (journalSidebar) {
          journalSidebar.style.display = "none";
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


    let fetchIntervalId = null;

    function setFetchInterval(fetchFn, interval = 15000) {
      fetchFn();
      if (fetchIntervalId) clearInterval(fetchIntervalId);
      fetchIntervalId = setInterval(fetchFn, interval);
    }

    if (tabJournals) {
      tabJournals.addEventListener("click", function () {
        setFetchInterval(() => fetchAndRenderJournals(journalsUrl, sessionId, headers));
      });
    }

    if (tabOverview) {
      tabOverview.addEventListener("click", function () {
        setFetchInterval(() => fetchAndRenderStudents(sessionId, headers));
      });
    }

    // Initial fetch
    if (tabJournals.classList.contains("w--current")) {
      setFetchInterval(() => fetchAndRenderJournals(journalsUrl, sessionId, headers));
    } else if (tabOverview.classList.contains("w--current")) {
      setFetchInterval(() => fetchAndRenderSessionStats(sessionId, headers));
      setFetchInterval(() => fetchAndRenderStudents(sessionId, headers));
    }
  });
})();
