// === Function to fetch and render students ===
export function fetchAndRenderStudents(sessionId, headers) {
  const studentsUrl = "https://us-central1-clayful-app.cloudfunctions.net/educator-getSessionStudentsStaging?full=true";
  const studentList = document.getElementById("students-list");
  const studentViewTable = document.getElementById("student-view-table");
  const countStudentsInSession = document.getElementById("count-students-in-session");
  const waitingText = document.getElementById("text-waiting-status");

  fetch(`${studentsUrl}&sessionId=${sessionId}`, { headers })
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
        const row = createStudentRow(student, sessionId, headers);
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
export async function fetchAndRenderSidebarStudentJournals(studentUserId, sessionId, headers) {
  const sidebarStudentJournalWrapper = document.getElementById("sidebar-student-journals-wrapper")
  const sidebarStudentLoading = document.getElementById("sidebar-student-loading");

  const studentsJournalsUrl = "https://us-central1-clayful-app.cloudfunctions.net/educator-getSessionStudentJournalsStaging";
  sidebarStudentJournalWrapper.innerHTML = "";

  fetch(`${studentsJournalsUrl}?studentUserId=${studentUserId}&sessionId=${sessionId}`, { headers })
    .then(res => res.json())
    .then(data => {
      const journals = data?.journals || [];

      sidebarStudentLoading.style.display = "none";
      console.log("journal container", sidebarStudentJournalWrapper);
      if (sidebarStudentJournalWrapper) {

        journals.forEach((journal) => {
          const el = createSidebarJournalElement(journal);
          sidebarStudentJournalWrapper.appendChild(el);
        });
      }
      console.log("Fetched student journals:", journals);
    })
    .catch(err => {
      console.error("Failed to fetch student journals", err);
    });
}


function createStudentRow(student, sessionId, headers) {
  const sidebar = document.getElementById("sidebar-student");
  const sidebarStudentLoading = document.getElementById("sidebar-student-loading");
  const sidebarContent = document.querySelector(".sidebar-content");

  const row = document.createElement("div");
  row.className = "students-item";
  row.id = "student-row";
  row.setAttribute("fs-list-element", "item");

  let formattedTime = "";
  const activeJournal = student.activeJournal || {};
  if (activeJournal.timeSpentInSeconds) {
    const seconds = (activeJournal.timeSpentInSeconds % 60).toString().padStart(2, '0');
    const minutes = Math.floor(activeJournal.timeSpentInSeconds / 60).toString().padStart(2, '0');
    formattedTime = `${minutes}:${seconds}`;
  }

  const journalLink = student.activeJournal
    ? `
          <a id="open-student-details" href="${activeJournal.url || "#"}" class="see-student-detials w-inline-block">
            <img loading="lazy" src="https://cdn.prod.website-files.com/62b25ea5deeeeae5c2f76889/68559845ddece1092eba8cca_tabler-icon-arrow-left.svg" alt="arrow pointing left">
          </a>
        `
    : '';
  const journalStatusStarted = activeJournal.status === "started";
  const journalStatus = activeJournal.status
    ? journalStatusStarted ? "Started" : "Completed"
    : "";

  const journalStatusClass = activeJournal.status
    ? `student-journal-status-dot-${journalStatusStarted ? "started" : "completed"}`
    : "";

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

        <div class="student-information align-center width-140">
          <div class="info-wrapper" id="student-consent">
            <div class="sudent-consent-status">
              <p class="text_xl_dashboard">${student.consentStatus?.trim().charAt(0) || "❌"}</p>
            </div>
          </div>
        </div>

        <div class="student-information width-200">
          <div class="info-wrapper">
            <div class="sudent-journal">
              <p class="text_m_dashboard" id="student-journal-name" fs-list-field="journalName">${activeJournal.name || ""}</p>
              <p class="text_m_dashboard opacity_60" id="student-journal-desc" fs-list-field="journalDescription">${activeJournal?.description || ""}</p>
            </div>
          </div>
        </div>

        <div class="student-information width-140 status">
          <div class="status-journal">
            <div class="${journalStatusClass}"></div>
            <div class="sudent-status">
              <p class="text_m_dashboard" id="student-journal-status" fs-list-field="status">
                ${journalStatus}
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
          ${journalLink}
        </div>
      `;

  if (student.activeJournal) {

    row.querySelector("#open-student-details").addEventListener("click", async function (e) {
      e.preventDefault();

      if (!sidebar) {
        console.error("Sidebar element not found");
        return;
      }

      sidebar.style.display = "flex";
      sidebarContent.style.display = "flex";

      const sidebarName = sidebar.querySelector("#sidebar-student-name");
      const sidebarEmail = sidebar.querySelector("#sidebar-student-email");
      const sidebarEmoji = sidebar.querySelector("#sidebar-student-emoji");

      if (sidebarName) sidebarName.textContent = student.studentName;
      if (sidebarEmail) sidebarEmail.textContent = student.email || "";
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
      sidebarStudentLoading.style.display = "flex";

      await fetchAndRenderSidebarStudentJournals(student.id, sessionId, headers);
    });
  }

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
