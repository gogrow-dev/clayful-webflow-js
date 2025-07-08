export function fetchAndRenderJournals(journalsUrl, headers) {
  const journalsList = document.getElementById("journals-list");
  const waitingTextJournals = document.getElementById("text-waiting-journals-status");
  const journalViewTable = document.querySelector(".journal_view_table");
  const sidebar = document.getElementById("sidebar-journal");

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
      if (journalImage) journalImage.src = journal.featuredImage;

      //const sidebarConsentTrue = sidebar.querySelector("#sidebar-student-consent-true");
      //const sidebarConsentFalse = sidebar.querySelector("#sidebar-student-consent-false");
      //if (student.consentStatus && student.consentStatus.trim().startsWith("✅")) {
      //  if (sidebarConsentTrue) sidebarConsentTrue.style.display = "block";
      //  if (sidebarConsentFalse) sidebarConsentFalse.style.display = "none";
      //} else {
      //  if (sidebarConsentTrue) sidebarConsentTrue.style.display = "none";
      //  if (sidebarConsentFalse) sidebarConsentFalse.style.display = "block";
      //}
      //sidebarStudentLoading.style.display = "flex";

      //await fetchAndRenderSidebarStudentJournals(student.id);
      return;
    });

    return row;
  }

  return;
}



