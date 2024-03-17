

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

function copySelectedRows() {
    // Get reference to source table and target table
    var sourceTable = document.getElementById('defaultListTable');
    var targetTable = document.getElementById('customListTable');

    // Get all checkboxes for row selection
    var checkboxes = sourceTable.querySelectorAll('input[type="checkbox"][name="rowSelect"]');

    // Iterate through checkboxes and copy selected rows
    checkboxes.forEach(function(checkbox) {
        if (checkbox.checked) {
            // Get the corresponding row
            var sourceRow = checkbox.parentNode.parentNode;

            // Check if the row already exists in the target table
            var rowExists = Array.from(targetTable.getElementsByTagName('tr')).some(function(row) {
                // Check if each cell's content matches in the source and target rows
                var cellsMatch = Array.from(row.cells).every(function(cell, index) {
                    return cell.textContent === sourceRow.cells[index].textContent;
                });
                return cellsMatch;
            });

            // If the row doesn't already exist in the target table, clone and append it
            if (!rowExists) {
                var clonedRow = sourceRow.cloneNode(true);
                sourceRow.classList.add('copied-row'); // Add class to copied row
                targetTable.getElementsByTagName('tbody')[0].appendChild(clonedRow);
            }
        }
    });

    // Deselect all checkboxes after copying rows
    checkboxes.forEach(function(checkbox) {
        checkbox.checked = false;
    });
    checkboxes = targetTable.querySelectorAll('input[type="checkbox"][name="rowSelect"]');
    checkboxes.forEach(function(checkbox) {
        checkbox.checked = false;
    });
}




function transferTableToDatabase() {
    // Open or create an IndexedDB database
    const request = indexedDB.open('SMRF-Database', 1);

    request.onerror = function (event) {
        console.error('Error opening database:', event.target.error);
        reject(event.target.error);
    };

    request.onsuccess = function(event) {
        db = event.target.result;
        var transaction = db.transaction('customPackage', 'readwrite');
        var objectStore = transaction.objectStore('customPackage');
        
        // Clear the ObjectStore first
        var clearRequest = objectStore.clear();

        clearRequest.onsuccess = function() {
            // Extract data from the HTML table and add it to the ObjectStore
            var table = document.getElementById('customListTable');
            var rows = table.querySelectorAll('tbody tr');
            rows.forEach(function(row) {
                var data = {
                    Enzyme: row.cells[1].textContent,
                    RestrictionSite: row.cells[2].textContent
                };
                objectStore.add(data);
            });

            transaction.oncomplete = function() {
                console.log('Data transferred to database successfully.');
            };

            transaction.onerror = function(event) {
                console.error('Error transferring data to database:', event.target.error);
            };
        };

        clearRequest.onerror = function(event) {
            console.error('Error clearing ObjectStore:', event.target.error);
        };
    };

    request.onerror = function(event) {
        console.error('Error opening database:', event.target.error);
    };
}

function copyThenTransferDb() {
    copySelectedRows();
    transferTableToDatabase();
}