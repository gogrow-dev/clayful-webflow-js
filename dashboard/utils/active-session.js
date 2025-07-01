export function fetchActiveSession(
  getSessionUrl
) {
  const studentJoinSessionButton = document.getElementById("btn-nav-join-session");
  const educatorLaunchSessionButton = document.getElementById("btn-nav-launch-session");

  const sessionBanner = document.getElementById("session-banner");
  const activeSessionMsg = document.getElementById("active-session-msg");
  const pausedSessionMsg = document.getElementById("paused-session-msg");
  const activeSessionTimeMsg = document.getElementById("active-session-time-msg");
  const pausedSessionTimeMsg = document.getElementById("paused-session-time-msg");
  const activeSessionTime = document.getElementById("active-session-time");
  const pausedSessionTime = document.getElementById("paused-session-time");
  const startingSoonSessionMsg = document.getElementById("starting-soon-session-msg");

  fetch(getSessionUrl, { headers })
    .then(res => {
      if (!res.ok) {
        sessionBanner.style.display = "none";
        if (studentJoinSessionButton) {
          studentJoinSessionButton.style.display = "flex";
          studentJoinSessionButton.disabled = false;
        } else if (educatorLaunchSessionButton) {
          educatorLaunchSessionButton.style.display = "flex";
          educatorLaunchSessionButton.disabled = false;
        }

        return;
      }
      return res.json();
    })
    .then(sessionData => {
      if (!sessionData) return;

      if (studentJoinSessionButton) {
        studentJoinSessionButton.style.display = "none";
        studentJoinSessionButton.disabled = true;
      } else if (educatorLaunchSessionButton) {
        educatorLaunchSessionButton.style.display = "none";
        educatorLaunchSessionButton.disabled = true;
      }

      if (sessionBanner) {
        sessionBanner.style.display = "flex";

        let totalTimeInSeconds = sessionData?.status_time_in_seconds ?? 0;

        if (sessionData?.status == "running") {
          totalTimeInSeconds += sessionData?.total_session_time_in_seconds ?? 0;
        }

        if (typeof window !== "undefined") {
          clearInterval(window._sessionTimerInterval);
          window._sessionTimerInterval = null;

          window._sessionTimerInterval = setInterval(() => {
            totalTimeInSeconds++;
            const minutes = Math.floor(totalTimeInSeconds / 60).toString().padStart(2, '0');
            const seconds = (totalTimeInSeconds % 60).toString().padStart(2, '0');
            const formattedTime = `${minutes}:${seconds}`;

            pausedSessionTime.textContent = formattedTime;
            activeSessionTime.textContent = formattedTime;
          }, 1000);
        }

        if (sessionData?.status == "on_hold") {
          startingSoonSessionMsg.style.display = "flex";
          activeSessionTime.style.display = "none";
          pausedSessionTime.style.display = "none";
          activeSessionTimeMsg.style.display = "none";
          pausedSessionTimeMsg.style.display = "none";
          activeSessionMsg.style.display = "none";
          pausedSessionMsg.style.display = "none";
        } else if (sessionData?.status == "paused") {
          startingSoonSessionMsg.style.display = "none";
          activeSessionTime.style.display = "none";
          pausedSessionTime.style.display = "flex";
          activeSessionTimeMsg.style.display = "none";
          pausedSessionTimeMsg.style.display = "flex";
          pausedSessionTimeMsg.style.display = "flex";
          activeSessionMsg.style.display = "none";
          pausedSessionMsg.style.display = "flex";
        } else if (sessionData?.status == "running") {
          startingSoonSessionMsg.style.display = "none";
          activeSessionTime.style.display = "flex";
          pausedSessionTime.style.display = "none";
          activeSessionTimeMsg.style.display = "flex";
          pausedSessionTimeMsg.style.display = "none";
          activeSessionMsg.style.display = "flex";
          pausedSessionMsg.style.display = "none";
        } else {
          sessionBanner.style.display = "none";
        }
      }
    })
    .catch(err => console.error("Failed to get active session:", err));
}
