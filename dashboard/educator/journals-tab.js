export function fetchAndRenderJournals(journalsUrl, headers) {
  const journalsList = document.getElementById("journals-list");

  fetch(journalsUrl, { headers })
    .then(res => res.json())
    .then(data => {
      const journals = data?.journals || [];

      console.log("Fetched journals:", journals);
      if (!journals || journals.length === 0) {
        //waitingText.style.display = "flex";
        //studentViewTable.style.display = "none";
        //countStudentsInSession.textContent = "0";
        return;
      }

      //countStudentsInSession.textContent = students.length;
      journalsList.innerHTML = "";

      journals.forEach((journal, idx) => {
        const row = createJournalRow(journal, idx + 1);
        journalsList.appendChild(row);
      });

      //waitingText.style.display = "none";
      //studentViewTable.style.removeProperty("display");
      //studentList.style.removeProperty("display");
    })
    .catch(err => {
      console.error("Failed to fetch journals", err);
    });
}


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
      <a href="#" class="button-dashboard-arrow-journal w-inline-block">
        <img loading="lazy" src="https://cdn.prod.website-files.com/62b25ea5deeeeae5c2f76889/685ed9c044c12bc74c8e8f66_tabler-icon-arrow-left.svg" alt="arrow pointing rigth" class="icon-dashboard-arrow-journal">
      </a>
    </div>
  </div>
  `;

  return row;
}

