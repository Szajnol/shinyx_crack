
let progressBarTimer;

let currentContainerIndex = 1; // Indeks aktualnie wybranego kontenera (1, 2, 3, 4)
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
  let correctCode = generateCode(); // Wygenerowanie poprawnego 4-cyfrowego kodu

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
          $.post(`http://${GetParentResourceName()}/nieudane`);
        })
      })
    })

// Funkcja do generowania 4-cyfrowego kodu
function generateCode() {
  let code = '';
  let availableDigits = ['1', '2', '3', '4', '5', '6', '7', '8', '9']; // Dostępne cyfry do wyboru

  for (let i = 0; i < 4; i++) {
    const randomIndex = Math.floor(Math.random() * availableDigits.length);
    code += availableDigits[randomIndex];
    availableDigits.splice(randomIndex, 1); // Usunięcie wybranej cyfry z dostępnych
  }
  console.log(code)
  return code;
}

// Funkcja do resetowania kontenerów
function resetContainers() {
  for (let i = 1; i <= 4; i++) {
    document.getElementById(i).textContent = '_';
    document.getElementById(i).classList.remove('correct', 'incorrect');
  }
  currentContainerIndex = 1;
}

// Definiujemy funkcję do obsługi kliknięć
function handleKeyPress(event) {
  // Sprawdzamy czy naciśnięty klawisz jest cyfrą
  if (event.key >= '1' && event.key <= '9') {
    if (currentContainerIndex <= 4) {
      const currentContainerId = currentContainerIndex.toString();

      const container = document.getElementById(currentContainerId);
      container.textContent = event.key;

      // Sprawdzamy czy wprowadzony kod jest już kompletny
      if (currentContainerIndex === 4) {
        checkCode();
      }

      currentContainerIndex++;
    }
  }
}

// Funkcja do sprawdzania kodu
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
    performAction(); // Wykonaj akcję po poprawnym kodzie
  } else {
    setTimeout(resetContainers, 1000); // Resetuj kontenery po sekundzie przy błędnym kodzie
  }
}

// Funkcja do wykonania po poprawnym kodzie
function performAction() {
  stopProgressBar()
  $('.minigame-action').text('SUKCES')
  $.post(`http://${GetParentResourceName()}/udane`);
  $('.minigame-action').fadeIn(500)
  $('.password-container').fadeOut(500)
  startProgressBar(2000, function() {
    $('.minigame-container').fadeOut(500)
  })
}

// Nasłuchiwanie na zdarzenia klawiszy
document.addEventListener('keypress', handleKeyPress);
}

});