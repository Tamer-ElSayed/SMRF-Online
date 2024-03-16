

function openTab(event, tabName) {
  var i, tabcontent, tablinks;
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }
  tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].classList.remove("active");
  }
  document.getElementById(tabName).style.display = "block";
  if (tabName == "Custom-Enzyme-List-Tab") {
    document.getElementById(tabName).style.display = "flex";
  }
  event.currentTarget.classList.add("active");
}

document.addEventListener("DOMContentLoaded", function() {
  var defaultTabId = "Program-Tab"; // Change this to the id of your default tab
  //var defaultTabButton = document.getElementById("default");
  var defaultTabButton = document.querySelector(".tablinks[id='default']");
  openDefaultTab(defaultTabButton, defaultTabId);
});

function openDefaultTab(defaultTabButton, tabName) {
  var i, tabcontent, tablinks;
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }
  tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].classList.remove("active");
  }
  document.getElementById(tabName).style.display = "block";
  defaultTabButton.classList.add("active");
}

// Get the button to click
const editEnzymeButton = document.getElementById('editEnzymeButton');

// Get the target element
const targetElement = document.getElementById('enzymeListTablink');

// Add event listener to the button
editEnzymeButton.addEventListener('click', function() {
  // Click the target element
  targetElement.click();
});