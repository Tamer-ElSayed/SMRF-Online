// Check if the variable exists in local storage and its value is false
function shouldRunFunction() {
  const SuccesfullyLoaded = localStorage.getItem('SuccesfullyLoaded');
  return !SuccesfullyLoaded || SuccesfullyLoaded === 'false';
  
}




async function openDBandStore() {
  return new Promise((resolve, reject) => {
      const request = indexedDB.open('SMRF-Database', 1);
      request.onerror = function (event) {
          console.error('Error opening database:', event.target.error);
          reject(event.target.error);
      };
      request.onupgradeneeded = function(event) {
        const db = event.target.result;

        const objectStore = db.createObjectStore("defaultPackage", { keyPath: 'id', autoIncrement: true });
        objectStore.createIndex("Enzyme name", ["Enzyme"], { unique: false });
        objectStore.createIndex('Restriction site sequence', "RestrictionSite", { unique: false });

        const objectStore2 = db.createObjectStore("customPackage", { keyPath: 'id', autoIncrement: true });
        objectStore2.createIndex("Enzyme name", ["Enzyme"], { unique: false });
        objectStore2.createIndex('Restriction site sequence', "RestrictionSite", { unique: false });

      };
      request.onsuccess = function (event) {
          const db = event.target.result;
          resolve(db);
      };
  });
}



async function transferToIndexedDB(jsonData) {
  return new Promise(async (resolve, reject) => {
    try {
        // Open a connection to the IndexedDB database
        const db = await openDBandStore();

        // Add data to the IndexedDB database
        const transaction = db.transaction(['defaultPackage'], 'readwrite');
        const objectStore = transaction.objectStore('defaultPackage');

        // Assuming `jsonData` is your 2-dimensional array
        for (const item of jsonData) {
            // Add the entry to IndexedDB
            objectStore.add({ Enzyme: item[0], RestrictionSite: item[1] });
        }

        // Close the database connection
        transaction.oncomplete = function(event) {
            // Set the variable in local storage to true to indicate that it has been run
            localStorage.setItem('SuccesfullyLoaded', true);
            db.close();
            resolve();
        };
    } catch (error) {
        console.error('Error:', error);
        reject(error); // Reject the promise if an error occurs
    }
  });
}

async function importJSONFromFileToDb() {
  return new Promise(async (resolve, reject) => {
    try {
        // Fetch the JSON file
        const response = await fetch("./Master Default Package.json");

        // Check if the request was successful
        if (!response.ok) {
            throw new Error('Failed to fetch JSON file');
        }

        // Parse the JSON data
        const jsonData = await response.json();

        // Process the JSON data (e.g., transfer it to IndexedDB)
        await transferToIndexedDB(jsonData);
        resolve();


    } catch (error) {
        console.error('Error:', error);
        reject(error);
    }
  });
}

async function writeDefaultTable() {
  return new Promise(async (resolve, reject) => {
    try {
      // Open the IndexedDB database
      const request = indexedDB.open('SMRF-Database', 1);

      request.onerror = function (event) {
        console.error("Database error: " + event.target.errorCode);
      };

      request.onsuccess = function (event) {
        const db = event.target.result;
        const transaction = db.transaction('defaultPackage', 'readonly');
        const objectStore = transaction.objectStore('defaultPackage');
        const dataTable = document.getElementById('defaultListTable').getElementsByTagName('tbody')[0];

        objectStore.openCursor().onsuccess = function (event) {
          const cursor = event.target.result;
          var checkbox = document.createElement('input');
          checkbox.type = 'checkbox';
          checkbox.name = 'rowSelect';
          if (cursor) {
            const row = dataTable.insertRow();
            const cell1 = row.insertCell(0);
            const cell2 = row.insertCell(1);
            const cell3 = row.insertCell(2);
            cell1.appendChild(checkbox);
            cell2.textContent = cursor.value.Enzyme;
            cell3.textContent = cursor.value.RestrictionSite;
            cursor.continue();
          }
        };

        transaction.oncomplete = function(event) {
          db.close();
          resolve();
        };
      };

      
      


    } catch (error) {
      console.error('Error:', error);
      reject(error);
    }
  });
}

async function writeCustomTable() {
  return new Promise(async (resolve, reject) => {
    try {
      const request = indexedDB.open('SMRF-Database', 1);

      request.onerror = function (event) {
        console.error("Database error: " + event.target.errorCode);
      };

      request.onsuccess = function (event) {
        const db = event.target.result;
        const transaction = db.transaction('customPackage', 'readonly');
        const objectStore = transaction.objectStore('customPackage');
        const dataTable = document.getElementById('customListTable').getElementsByTagName('tbody')[0];

        objectStore.openCursor().onsuccess = function (event) {
          const cursor = event.target.result;
          var checkbox = document.createElement('input');
          checkbox.type = 'checkbox';
          checkbox.name = 'rowSelect';
          if (cursor) {
            const row = dataTable.insertRow();
            const cell1 = row.insertCell(0);
            const cell2 = row.insertCell(1);
            const cell3 = row.insertCell(2);
            cell1.appendChild(checkbox);
            cell2.textContent = cursor.value.Enzyme;
            cell3.textContent = cursor.value.RestrictionSite;
            cursor.continue();
          }
        };

        transaction.oncomplete = function(event) {
          db.close();
          resolve();
        };

      };
      
      


    } catch (error) {
      console.error('Error:', error);
      reject(error);
    }
  });
}


async function mainDatabase() {
  return new Promise(async (resolve, reject) => {
    try {
      if (shouldRunFunction()) {
        // Call the function to import JSON data from the file to db
        await importJSONFromFileToDb();
      }
      await writeDefaultTable();
      await writeCustomTable();
      resolve();
    }
    catch(error) {
      console.error('Error:', error);
      reject(error);
    }
  });
}