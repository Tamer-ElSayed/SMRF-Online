// Open the IndexedDB database
const request = indexedDB.open('SMRF-Database', 1);

request.onerror = function(event) {
    console.error("Database error: " + event.target.errorCode);
};

request.onsuccess = function(event) {
    const db = event.target.result;
    const transaction = db.transaction('defaultPackage', 'readonly');
    const objectStore = transaction.objectStore('defaultPackage');
    const dataTable = document.getElementById('defaultListTable').getElementsByTagName('tbody')[0];

    objectStore.openCursor().onsuccess = function(event) {
        const cursor = event.target.result;
        if (cursor) {
            const row = dataTable.insertRow();
            const cell1 = row.insertCell(0);
            const cell2 = row.insertCell(1);
            const cell3 = row.insertCell(2);
            cell1.textContent = cursor.key;
            cell2.textContent = cursor.value.Enzyme;
            cell3.textContent = cursor.value.RestrictionSite;
            cursor.continue();
        }
    };
};

// Add search functionality
document.getElementById('searchInput').addEventListener('input', function() {
    const filter = this.value.toLowerCase();
    const table = document.getElementById('defaultListTable');
    const rows = table.getElementsByTagName('tr');
    for (let i = 0; i < rows.length; i++) {
        const cells = rows[i].getElementsByTagName('td');
        let shouldHide = true;
        for (let j = 0; j < cells.length; j++) {
            const cellText = cells[j].textContent.toLowerCase();
            if (cellText.indexOf(filter) > -1) {
                shouldHide = false;
                break;
            }
        }
        rows[i].style.display = shouldHide ? 'none' : '';
    }
});