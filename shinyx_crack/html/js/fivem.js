
let progressBarTimer;

let currentContainerIndex = 1;
$(document).ready(function() {

  window.addEventListener("message", function(event) {
    if (event.data.action === "StartMinigame") {
      startGame();
    }
  });


function startProgressBar(duration, onComplete) {
  let progressBar = document.querySelector(".fill");
  let progress = 100;
  let interval = 10;

  progressBarTimer = setInterval(function() {
    if (progress <= 0) {
      clearInterval(progressBarTimer);
      if (typeof onComplete === "function") {
        onComplete();
      }
    } else {
      progress -= (interval / duration) * 100;
      progressBar.style.height = Math.max(progress, 0) + "%";
    }
  }, interval);
}

function stopProgressBar() {
  clearInterval(progressBarTimer);
}

function startGame() {
  $('.minigame-container').fadeIn(500)
  let correctCode = generateCode();

  $('.minigame-action').text('GENEROWANIE HASLA...')
    startProgressBar(2000, function() {
      $('.minigame-action').fadeOut(500)
      $('.password-container').fadeIn(500)
      startProgressBar(30000, function() {
        $('.minigame-action').text('ERROR')
        $('.minigame-action').fadeIn(500)
        $('.password-container').fadeOut(500)
        startProgressBar(2000, function() {
          $('.minigame-container').fadeOut(500)
          $.post(`https://${GetParentResourceName()}/nieudane`);
          resetContainers();
        })
      })
    })

function generateCode() {
  let code = '';
  let availableDigits = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

  for (let i = 0; i < 4; i++) {
    const randomIndex = Math.floor(Math.random() * availableDigits.length);
    code += availableDigits[randomIndex];
    availableDigits.splice(randomIndex, 1); 
  }
  console.log(code)
  return code;
}


function resetContainers() {
  for (let i = 1; i <= 4; i++) {
    document.getElementById(i).textContent = '_';
    document.getElementById(i).classList.remove('correct', 'incorrect');
  }
  currentContainerIndex = 1;
}


function handleKeyPress(event) {

  if (event.key >= '1' && event.key <= '9') {
    if (currentContainerIndex <= 4) {
      const currentContainerId = currentContainerIndex.toString();

      const container = document.getElementById(currentContainerId);
      container.textContent = event.key;


      if (currentContainerIndex === 4) {
        checkCode();
      }

      currentContainerIndex++;
    }
  }
}

function checkCode() {
  let enteredCode = '';
  for (let i = 1; i <= 4; i++) {
    enteredCode += document.getElementById(i).textContent;
  }

  let correctDigits = 0;

  for (let i = 0; i < 4; i++) {
    const digit = enteredCode[i];
    const correctDigit = correctCode[i];

    if (digit === correctDigit) {
      document.getElementById(i + 1).classList.add('correct');
      correctDigits++;
    } else if (correctCode.includes(digit)) {
      document.getElementById(i + 1).classList.add('incorrect');
    }
  }

  if (correctDigits === 4) {
    performAction(); 
  } else {
    setTimeout(resetContainers, 1000);
  }
}

// Funkcja do wykonania po poprawnym kodzie
function performAction() {
  stopProgressBar()
  $('.minigame-action').text('SUKCES')
  $.post(`https://${GetParentResourceName()}/udane`);
  $('.minigame-action').fadeIn(500)
  $('.password-container').fadeOut(500)
  startProgressBar(2000, function() {
    resetContainers()
    $('.minigame-container').fadeOut(500)
  })
}

// Nasłuchiwanie na zdarzenia klawiszy
document.addEventListener('keypress', handleKeyPress);
}

});
