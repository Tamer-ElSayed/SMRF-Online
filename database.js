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


// Run the function only if the condition is met
async function main() {
  if (shouldRunFunction()) {
    // Call the function to import JSON data from the file to db
    importJSONFromFileToDb();
    
  }
};


main();

