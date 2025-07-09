export function fetchAndRenderJournals(journalsUrl, headers) {
  const journalStudentsUrl = "https://us-central1-clayful-app.cloudfunctions.net/educator-getSessionJournalStudentsStaging";

  const journalsList = document.getElementById("journals-list");
  const waitingTextJournals = document.getElementById("text-waiting-journals-status");
  const journalViewTable = document.querySelector(".journal_view_table");
  const sidebar = document.getElementById("sidebar-journal");
  const sidebarLoading = document.getElementById("sidebar-journal-loading")
  const sidebarStudentsTable = document.getElementById("sidebar-journal-students-table")
  const sidebarStudentsList = document.getElementById("sidebar-journal-student-list")

  const params = new URLSearchParams(window.location.search);
  let sessionId = params.get("sessionId") || "";

  fetch(journalsUrl, { headers })
    .then(res => res.json())
    .then(data => {
      const journals = data?.journals || [];

      if (!journals || journals.length === 0) {
        waitingTextJournals.style.display = "flex";
        journalViewTable.style.display = "none";
        //countStudentsInSession.textContent = "0";
        return;
      }

      //countStudentsInSession.textContent = students.length;
      journalsList.innerHTML = "";

      journals.forEach((journal, idx) => {
        const row = createJournalRow(journal, idx + 1);
        journalsList.appendChild(row);
      });

      waitingTextJournals.style.display = "none";
      journalViewTable.style.removeProperty("display");
      journalsList.style.removeProperty("display");
    })
    .catch(err => {
      console.error("Failed to fetch journals", err);
    });

  function createJournalRow(journal, id) {

    const row = document.createElement("div");
    row.className = "journal-collection-item w-dyn-item";
    row.role = "listitem"
    row.id = `journal-${id}`

    let formattedTime = "—";
    if (journal.avgTimeSpentInSeconds) {
      const seconds = (journal.avgTimeSpentInSeconds % 60).toString().padStart(2, '0');
      const minutes = Math.floor(journal.avgTimeSpentInSeconds / 60).toString().padStart(2, '0');
      formattedTime = `${minutes}:${seconds}`;
    }

    row.innerHTML = `
    <div class="journal-collection-item">
      <div class="journal-column number table">
        <p id="journal-number" class="text_l_dashboard white">
          ${id}</p>
      </div>
      <div class="journal-column journal-info">
        <img id="journal-thumbnail" loading="lazy" alt="" src="${journal.featuredImage}" class="journal-collection-image">
        <div class="journal-name-description width100">
          <p id="journal-title" fs-list-field="journalName" class="text_l_dashboard white">
            ${journal.name}</p>
          <p id="journal-desc" class="text_l_dashboard white opacity-60">
            ${journal.description}</p>
        </div>
      </div>
      <div class="journal-column table started">
        <p id="journal-started-count" class="text_l_dashboard white">
          ${journal.totalStarted}</p>
      </div>
      <div class="journal-column table completed">
        <p id="journal-completed-count" class="text_l_dashboard white">
          ${journal.totalCompleted}</p>
      </div>
      <div class="journal-column avg-time-spent table gap4">
        <p id="journal-avg-time" class="text_l_dashboard white">
          ${formattedTime}</p>
        <p id="journal-avg-time" class="text_l_dashboard white">
          minutes</p>
      </div>
      <div class="journal-column empty table">
        <a href="#" class="button-dashboard-arrow-journal w-inline-block" id="journal-open-details">
          <img loading="lazy" src="https://cdn.prod.website-files.com/62b25ea5deeeeae5c2f76889/685ed9c044c12bc74c8e8f66_tabler-icon-arrow-left.svg" alt="arrow pointing rigth" class="icon-dashboard-arrow-journal">
        </a>
      </div>
    </div>
  `;

    row.querySelector("#journal-open-details").addEventListener("click", async function (e) {
      e.preventDefault();

      if (!sidebar) {
        console.error("Sidebar element not found");
        return;
      }

      sidebar.style.display = "flex";

      const journalTitle = sidebar.querySelector("#sidebar-journal-title");
      const journalDescription = sidebar.querySelector("#sidebar-journal-desc");
      const journalImage = sidebar.querySelector("#sidebar-journal-img");

      if (journalTitle) journalTitle.textContent = journal.name;
      if (journalDescription) journalDescription.textContent = journal.description || "";
      if (journalImage) journalImage.innerHTML = `<img src="${journal.featuredImage}" alt="Journal Image" />`;
      sidebarLoading.style.display = "flex";
      sidebarStudentsTable.style.display = "none";

      await fetchAndRenderSidebarJournalStudents(journal.id);
      return;
    });

    return row;
  }

  async function fetchAndRenderSidebarJournalStudents(journalId) {
    sidebarStudentsList.innerHTML = "";
    sidebarStudentsList.role = "list"
    sidebarStudentsTable.style.display = "block";

    fetch(`${journalStudentsUrl}?journalId=${journalId}&sessionId=${sessionId}`, { headers })
      .then(res => res.json())
      .then(data => {
        const students = data?.students || [];

        sidebarLoading.style.display = "none";
        if (sidebarStudentsList) {
          students.forEach((student, idx) => {
            const row = createSidebarStudentElement(student, idx + 1);
            sidebarStudentsList.appendChild(row);
          });
        }
        console.log("Fetched journal students:", students);
      })
      .catch(err => {
        console.error("Failed to fetch journal students", err);
      });
  }

  function createSidebarStudentElement(student, id) {
    const row = document.createElement("div");
    row.id = `sidebar-journal-student-row-${id}`;
    row.role = "listitem"
    row.className = "students-item";

    let formattedTime = "—";
    if (student.timeSpentInSeconds) {
      const seconds = (student.timeSpentInSeconds % 60).toString().padStart(2, '0');
      const minutes = Math.floor(student.timeSpentInSeconds / 60).toString().padStart(2, '0');
      formattedTime = `${minutes}:${seconds}`;
    }

    row.innerHTML = `
        <div class="student-information width-200">
          <div class="info-wrapper">
            <div class="div-profile-pic">
              <div id="student-status-dot" class="student-status-dot">
              </div>
              <div class="student-profile-picture">
                <img id="sidebar-journal-student-emoji" loading="lazy" alt="" src="${student.emoji}" class="student-emoji">
              </div>
            </div>
            <div class="student-name-id">
              <p id="sidebar-journal-student-name" fs-list-field="studentName" class="text_m_dashboard">
                ${student.name}</p>
              <p id="sidebar-journal-student-email" fs-list-field="studentName" class="text_m_dashboard opacity_60">
                ${student.id}</p>
            </div>
          </div>
        </div>
        <div class="student-information width-140 status">
          ${renderStudentStatus(student.status)}
        </div>
        <div class="student-information width-140">
          <div class="info-wrapper">
            <div class="sudent-time">
              <p id="sidebar-journal-student-time-spent" fs-list-field="studentName" class="text_m_dashboard">
                ${formattedTime}</p>
              <p fs-list-field="studentName" class="text_m_dashboard">
                minutes</p>
            </div>
          </div>
        </div>
        <div class="student-information width-80">
          <a id="sidebar-journal-open-student-details" href="#" class="see-student-detials w-inline-block">
            <img loading="lazy" src="https://cdn.prod.website-files.com/62b25ea5deeeeae5c2f76889/68559845ddece1092eba8cca_tabler-icon-arrow-left.svg" alt="arrow pointing left">
          </a>
        </div>
    `;

    return row;
  }

  function renderStudentStatus(status) {
    if (status === "started") {
      return `
      <div id="sidebar-journal-status-started" class="status-journal">
        <div id="student-journal-status-dot" class="student-journal-status-dot-started">
        </div>
        <div class="sudent-status">
          <p id="student-journal-status" fs-list-field="a" class="text_m_dashboard">
            Started</p>
        </div>
      </div>
      `
    } else if (status === "completed") {
      return `
      <div id="sidebar-journal-status-completed" class="status-journal">
        <div id="student-journal-status-dot" class="student-journal-status-dot-completed">
        </div>
        <div class="sudent-status">
          <p id="student-journal-status" fs-list-field="completed" class="text_m_dashboard">
            Completed</p>
        </div>
      </div>
      `
    } else if (status === "chatting") {
      return `
      <div id="sidebar-journal-status-chatting" class="status-journal">
        <div id="student-journal-status-dot" class="student-journal-status-dot-chatting">
        </div>
        <div class="sudent-status">
          <p id="student-journal-status" fs-list-field="chatting" class="text_m_dashboard">
            Chatting with Coach</p>
        </div>
      </div>
      `
    }
    return "";
  }

  return;
}



