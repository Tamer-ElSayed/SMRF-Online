(function() {
  var oldLog = console.log;
  var consoleOutput = document.getElementById("consoleOutput");

  console.log = function(message) {
      oldLog.apply(console, arguments); // Call original console.log function
      consoleOutput.innerHTML += message + "<br>"; // Append message to the <p> element
  };
})();
console.log("hello world");
var searchisAlive = false; 

// document.getElementById('txtPrimerSequence').value
// document.getElementById('txtPrimerSequence').value





function checkThenRun() {
    if (document.getElementById("txtPrimerSequence").value === "" ||
        document.getElementById("txtMismatchThr").value === "" ||
        document.getElementById("txtCodingSeq").value === "") {
        alert("Please fill in all fields before running the search");
    }
    else if (!checkPrimer()) {
        alert("The primer can only contain A, T, C, or G and no spaces");
    }
    else if (document.getElementById("txtPrimerSequence").value.length <= 8) {
        alert("Please enter a primer with length greater than 8");
    }
    else if (!checkInt(document.getElementById("txtMismatchThr").value)) {
        alert("Please enter only integers in the mismatch threshold field");
    }
    else if (!checkInt(document.getElementById("txtCodingSeq").value)) {
        alert("Please enter only integers in the first number in the coding sequence field");
    }
    else if (parseInt(document.getElementById("txtCodingSeq").value) <= 0) {
        alert("Please enter an integer greater than 0 in the coding sequence field");
    }
    else if (searchisAlive) {
        alert("Please wait until search is finished before running a new search");
    }
    else if (parseInt(document.getElementById("txtCodingSeq").value) >
        document.getElementById("txtPrimerSequence").value.length) {
        alert("Enter a correct value for the start of the coding sequence");
    }
    else if (!localStorage.getItem('SuccesfullyLoaded') || localStorage.getItem('SuccesfullyLoaded') === 'false') {
        alert("Please wait a moment while database loads. if it takes longer than 2 minutes reload the page")
    }
    else if (!searchisAlive) {
        run();
    }
}

function checkPrimer() {
	var check = true;
	var primer = document.getElementById("txtPrimerSequence").value;
	for (var i = 0; i < primer.length; i++) {
			var char = primer.charAt(i);
			if (!(char === 'A' || char === 'T' || char === 'G' || char === 'C' || char === 'a' || char === 't' || char === 'g' || char === 'c')) {
					check = false;
					break;
			}
	}
	return check;
}

function checkInt(input) {
	var integerPattern = /^\d+$/;

  // Test the input against the regular expression
   return integerPattern.test(input);
}


async function run() {
	searchisAlive = true;

    document.getElementById("loading-bar").style.display = "block";

	document.getElementById("consoleOutput").textContent = "";
	console.log("////////////////////////////////////////////////////////////////////////////////");
	console.log("////////////////Restriction sites already present (remove these)");
	console.log("////////////////////////////////////////////////////////////////////////////////<br>");
	await runSearch(0, 0);
	console.log("<br><br><br><br><br>////////////////////////////////////////////////////////////////////////////////");
	console.log("///////////////////Restriction sites to obtain by mutagenesis");
	console.log("////////////////////////////////////////////////////////////////////////////////<br>");
	await runSearch(parseInt(document.getElementById('txtMismatchThr').value)
		, 1);
	console.log("Program finished");
	console.log(
		"If no matches were obtained please run program again with the mismatched threshold increased by 1"
	);
	console.log("Created by Tamer ElSayed Abdelbary - German University in Cairo");

    document.getElementById("loading-bar").style.display = "none";

	searchisAlive = false;
}



async function runSearch(threshold, thresholdMin) {
    return new Promise(async (resolve, reject) => {
        try {
            const primer = document.getElementById('txtPrimerSequence').value;
            const codon = ["ttt", "ttc", "tta", "ttg", "tct", "tcc", "tca", "tcg", "tat", "tac", "taa",
                "tag", "tgt", "tgc", "tga", "tgg",
    
                "ctt", "ctc", "cta", "ctg", "cct", "ccc", "cca", "ccg", "cat", "cac", "caa", "cag", "cgt",
                "cgc", "cga", "cgg",
    
                "att", "atc", "ata", "atg", "act", "acc", "aca", "acg", "aat", "aac", "aaa", "aag", "agt",
                "agc", "aga", "agg",
    
                "gtt", "gtc", "gta", "gtg", "gct", "gcc", "gca", "gcg", "gat", "gac", "gaa", "gag", "ggt",
                "ggc", "gga", "ggg"
            ];
            const protein = ["phe", "phe", "leu", "leu", "ser", "ser", "ser", "ser", "tyr", "tyr", "stop",
                "stop", "cys", "cys", "stop", "trp",
    
                "leu", "leu", "leu", "leu", "pro", "pro", "pro", "pro", "his", "his", "gln", "gln", "arg",
                "arg", "arg", "arg",
    
                "ile", "ile", "ile", "met", "thr", "thr", "thr", "thr", "asn", "asn", "lys", "lys", "ser",
                "ser", "arg", "arg",
    
                "val", "val", "val", "val", "ala", "ala", "ala", "ala", "asp", "asp", "glu", "glu", "gly",
                "gly", "gly", "gly"
            ];
    
            const first = parseInt(document.getElementById('txtCodingSeq').value);
            var primercodeo = ""; // original amino acid sequence
            var primercoden = ""; // new amino acid sequence
            var mnum = 0; // number of current matches
            var misnum = 0; // number of current mismatches
            var arryres;
            var arryprim;
            const db = await openDB();
            const transaction = db.transaction(['defaultPackage'], 'readonly');
            const objectStore = transaction.objectStore('defaultPackage');
            const cursorRequest = objectStore.openCursor();
    
            cursorRequest.onsuccess = function (event) {
                const cursor = event.target.result;
                if (cursor) { // cycles through restriction sites in database
                    var row = cursor.value; // current restriction site data
                    arryres = row.RestrictionSite.toLowerCase().split('');
                    let containtsN = false;
                    let firstNsIndexResSite;
                    let lastNsIndexResSite;
                    let firstTime = true;
                    let lengthOfNs = 0;
                    // let last = x + row.RestrictionSite.length;
                    // let first = x;

                    for (let z = 0; z < row.RestrictionSite.length; z++) {
                        if (arryres[z] === 'n') {
                            containtsN = true;
                            if (firstTime) {
                                firstNsIndexResSite = z;
                                firstTime = false
                            }
                            lastNsIndexResSite = z;
                            lengthOfNs++;
                        }
                    }
                    if (containtsN) {
                        function generateBase4Combinations(length) {
                            const baseChars = ['A', 'T', 'C', 'G'];
                    
                            function generateCombinationsHelper(current, length) {
                                if (length === 0) {
                    
                                    unpackedRestrictionsite = row.RestrictionSite.substring(0, firstNsIndexResSite) + current + row.RestrictionSite.substring(lastNsIndexResSite + 1, row.RestrictionSite.length)
                    
                                    for (let x = 0; x <= primer.length - row.RestrictionSite.length; x++) {
                                        //^cycles through primer positions
                                        arryres = unpackedRestrictionsite.toLowerCase().split(''); // restriction site sequence character array
                                        arryprim = primer.substring(x, x + row.RestrictionSite.length).toLowerCase().split(''); // primer substring sequence character array
                                        mnum = 0;
                                        for (let z = 0; z < row.RestrictionSite.length; z++) {
                                            // ^cycles through characters
                                            if (arryres[z] === arryprim[z]) {
                                                mnum++;
                                            }
                                        }
                                        misnum = row.RestrictionSite.length - mnum; // number of current mismatches
                                        if (misnum <= threshold && misnum >= thresholdMin) { // if correct number of mismatches check coding sequence
                                            var rep = primer.substring(0, x) + unpackedRestrictionsite +
                                                primer.substring(x + row.RestrictionSite.length, primer.length); // the new primer with the changed bases matching the resitriction site
                                            const rep2 = primer.substring(0, x) + "[" + unpackedRestrictionsite + "]" +
                                                primer.substring(x + row.RestrictionSite.length, primer.length);
                                            let primercodeo = ""; // original amino acid sequence
                                            let primercoden = ""; // new amino acid sequence
                                            for (let z = 0; z + first + 2 < primer.length; z = z + 3) {
                                                // ^cycles through codon positions
                                                for (let f = 0; f < codon.length; f++) {
                                                    // ^cycles through codons in array
                                                    if (primer.substring(z + first - 1, z + first + 2).toLowerCase() === codon[f]) {
                                                        primercodeo = primercodeo + protein[f];
                                                    }
                                                }
                                            }
                                            for (let z2 = 0; z2 + first + 2 < rep.length; z2 = z2 + 3) {
                                                for (let f2 = 0; f2 < codon.length; f2++) {
                                                    if (rep.substring(z2 + first - 1, z2 + first + 2).toLowerCase() === codon[f2]) {
                                                        primercoden = primercoden + protein[f2];
                                                    }
                                                }
                                            }
                                            if (primercodeo.toLowerCase() === primercoden.toLowerCase()) {
                                                console.log("Match confirmed between base number " + (x + 1) + " and " +
                                                    (x + row.RestrictionSite.length) + " for " + unpackedRestrictionsite /*row.RestrictionSite*/ +
                                                    " restriction site (" + row.Enzyme + ")");
                                                console.log("New primer :");
                                                console.log(rep2);
                                                console.log("--------------------------------------------------------------------------------");
                                            }
                                        }
                                    }
                    
                    
                    
                                    
                                    return;
                                }
                                for (let i = 0; i < 4; i++) {
                                    generateCombinationsHelper(current + baseChars[i], length - 1);
                                }
                            }
                    
                            generateCombinationsHelper('', length);
                        }
                    
                        generateBase4Combinations(lengthOfNs);
                    }
                    else {
                        for (let x = 0; x <= primer.length - row.RestrictionSite.length; x++) {
                            //^cycles through primer positions
                            arryres = row.RestrictionSite.toLowerCase().split(''); // restriction site sequence character array
                            arryprim = primer.substring(x, x + row.RestrictionSite.length).toLowerCase().split(''); // primer substring sequence character array
                            mnum = 0;
                            for (let z = 0; z < row.RestrictionSite.length; z++) {
                                // ^cycles through characters
                                if (arryres[z] === arryprim[z]) {
                                    mnum++;
                                }
                            }
                            misnum = row.RestrictionSite.length - mnum; // number of current mismatches
                            if (misnum <= threshold && misnum >= thresholdMin) { // if correct number of mismatches check coding sequence
                                var rep = primer.substring(0, x) + row.RestrictionSite +
                                    primer.substring(x + row.RestrictionSite.length, primer.length); // the new primer with the changed bases matching the resitriction site
                                const rep2 = primer.substring(0, x) + "[" + row.RestrictionSite + "]" +
                                    primer.substring(x + row.RestrictionSite.length, primer.length);
                                let primercodeo = ""; // original amino acid sequence
                                let primercoden = ""; // new amino acid sequence
                                for (let z = 0; z + first + 2 < primer.length; z = z + 3) {
                                    // ^cycles through codon positions
                                    for (let f = 0; f < codon.length; f++) {
                                        // ^cycles through codons in array
                                        if (primer.substring(z + first - 1, z + first + 2).toLowerCase() === codon[f]) {
                                            primercodeo = primercodeo + protein[f];
                                        }
                                    }
                                }
                                for (let z2 = 0; z2 + first + 2 < rep.length; z2 = z2 + 3) {
                                    for (let f2 = 0; f2 < codon.length; f2++) {
                                        if (rep.substring(z2 + first - 1, z2 + first + 2).toLowerCase() === codon[f2]) {
                                            primercoden = primercoden + protein[f2];
                                        }
                                    }
                                }
                                if (primercodeo.toLowerCase() === primercoden.toLowerCase()) {
                                    console.log("Match confirmed between base number " + (x + 1) + " and " +
                                        (x + row.RestrictionSite.length) + " for " + row.RestrictionSite +
                                        " restriction site (" + row.Enzyme + ")");
                                    console.log("New primer :");
                                    console.log(rep2);
                                    console.log("--------------------------------------------------------------------------------");
                                }
                            }
                        }
                    }
                    
                    cursor.continue();
                }
            };
    
            transaction.oncomplete = function () {
                resolve(); // Resolve the promise after the transaction is complete
                db.close();
                
            };
        } 
        catch (error) {
            console.error('Error:', error);
            reject(error); // Reject the promise if an error occurs
        }
    });
  }
  
  async function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('SMRF-Database', 1);
        request.onerror = function (event) {
            console.error('Error opening database:', event.target.error);
            reject(event.target.error);
        };
        request.onsuccess = function (event) {
            const db = event.target.result;
            resolve(db);
        };
    });
  }

