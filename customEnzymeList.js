

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