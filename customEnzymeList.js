

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
                sourceRow.classList.add('highlighted-row'); // Add class to copied row
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


function deleteSelectedRows() {

    var targetTable = document.getElementById('customListTable');

    // Get all checkboxes for row selection
    var checkboxes = targetTable.querySelectorAll('input[type="checkbox"][name="rowSelect"]');

    // Iterate through checkboxes and copy selected rows
    checkboxes.forEach(function(checkbox) {
        if (checkbox.checked) {
            // Get the corresponding row
            var targetRow = checkbox.parentNode.parentNode;
            targetRow.parentNode.removeChild(targetRow);

        }
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
                db.close();
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

function highlightExistingRows() {
    // Get reference to both tables
    let defaultTable = document.getElementById('defaultListTable');
    let customTable = document.getElementById('customListTable');

    // Get all rows from custom
    var rowsCustomTable = customTable.getElementsByTagName('tbody')[0].getElementsByTagName('tr');

    // Iterate through each row in default
    for (var i = 0; i < defaultTable.rows.length; i++) {
        var rowDefaultTable = defaultTable.rows[i];

        // Iterate through each row in custom to find matches
        for (var j = 0; j < rowsCustomTable.length; j++) {
            var rowCustomTable = rowsCustomTable[j];

            // Compare content of each cell in both rows
            var match = true;
            for (var k = 0; k < rowDefaultTable.cells.length; k++) {
                if (rowDefaultTable.cells[k].textContent !== rowCustomTable.cells[k].textContent) {
                    match = false;
                    break;
                }
            }

            // If all cells match, change background color of the row in default
            if (match) {
                rowDefaultTable.classList.add('highlighted-row'); // Add class to copied row
                break; // Break the loop since we found a match
            }
        }
    }
}


function removeAllHighlights() {
    // Get reference to both tables
    let defaultTable = document.getElementById('defaultListTable');


    // Iterate through each row in default
    for (var i = 0; i < defaultTable.rows.length; i++) {
        var rowDefaultTable = defaultTable.rows[i];
        rowDefaultTable.classList.remove('highlighted-row'); // Add class to deleted row
        
    }
}

var checkboxesSelected = false;

function toggleCheckboxes(tableId) {
    var table = document.getElementById(tableId);
    var checkboxes = table.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(function(checkbox) {
        checkbox.checked = !checkboxesSelected;
    });
    checkboxesSelected = !checkboxesSelected;
}

function checkIfTableIsEmpty() {
    // Get references to the table and the select all checkbox
    const table = document.getElementById('customListTable');
    const Checkbox = document.getElementById('enzymeListCheckbox');
    const checkboxLabel = document.getElementById('enzymeListCheckboxLabel');
    // Check if there's only one row (the table head)
    if (table.rows.length === 1) {
        Checkbox.checked = false; // Uncheck the checkbox
        localStorage.setItem('enzymeListCheckboxIsChecked', false);
        Checkbox.disabled = true; // Disable the checkbox
        checkboxLabel.style.color = 'gray';
    } else {
        Checkbox.disabled = false; // Enable the checkbox
        checkboxLabel.style.color = 'black';
    }
}

function copyThenUpdateDb() {
    copySelectedRows();
    transferTableToDatabase();
    checkIfTableIsEmpty();
}

function deleteThenUpdateDb() {
    deleteSelectedRows();
    transferTableToDatabase();
    removeAllHighlights();
    highlightExistingRows();
    checkIfTableIsEmpty();
}

function mainEnzymeLists() {
    highlightExistingRows();
    checkIfTableIsEmpty();
}
