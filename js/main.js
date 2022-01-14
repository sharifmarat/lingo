import { toast } from './toast.js';
import { nl_easy } from './nl-easy-5.js';
import { nl_all } from './nl-all-5.js';

let gWord="";
let gRow = 0;
let gColumn = 0;
let gLosses = 0;
let gWins = 0;
let gHideToast = null;
const ROWS = 6;
const COLUMNS = 5;

function genRandomWord() {
  return nl_easy[Math.floor(Math.random()*nl_easy.length)];
}

function start() {
  gWord = genRandomWord();
}

function reset() {
  gWord="";
  gRow = 0;
  gColumn = 0;
  hideMessage();

  let tiles = document.getElementsByClassName('tile');
  for (let t of tiles) {
    t.innerHTML = "";
    t.style.backgroundColor = "var(--bg)";
  }

  let keys = document.getElementsByClassName('key');
  for (let k of keys) {
    if (k.id != "key_enter") {
      k.style.backgroundColor = "var(--bg-key)";
    }
  }

  document.getElementById("keyboard").style.display = 'block';
  document.getElementById("endgamerow").style.display = 'none';
}

function renderStats() {
  document.getElementById("wins").innerHTML = gWins;
  document.getElementById("losses").innerHTML = gLosses;
}

function finishGame(won) {
  if (won) {
    gWins += 1;
  } else {
    gLosses += 1;
  }

  renderStats();

  // update storage
  let storage = window.localStorage.setItem('stats', JSON.stringify({
    "wins": gWins,
    "losses": gLosses
  }));

  // disable keyboard
  document.getElementById("keyboard").style.display = 'none';
  document.getElementById("endgamerow").style.display = 'flex';

  gWord = "";
}

function wordInRow(row) {
    let word = "";
    for (let c = 0; c < COLUMNS; ++c) {
      word += document.getElementById(`tile_${row}_${c}`).innerHTML;
    }
    return word;
}

function wordEntered(word) {
  if (!nl_all[word]) {
    showMessage('Non existing word');
    return false;
  }

  for (let i = 0; i < COLUMNS; ++i) {
    if (gWord.indexOf(word[i]) == -1) {
      document.getElementById(`key_${word[i]}`).style.backgroundColor = "var(--letter-no-match)";
      document.getElementById(`tile_${gRow}_${i}`).style.backgroundColor = "var(--letter-no-match)";
    } else if (gWord[i] == word[i]) {
      document.getElementById(`tile_${gRow}_${i}`).style.backgroundColor = "var(--letter-full-match)";
    } else {
      document.getElementById(`tile_${gRow}_${i}`).style.backgroundColor = "var(--letter-partial-match)";
    }
  }

  if (word == gWord) {
    showMessage('YOU WON!!!');
    finishGame(true);
    return false;
  }
  return true;
}

function showMessage(msg) {
  gHideToast = toast.toast(msg);
}

function hideMessage() {
  if (gHideToast) {
    gHideToast.hide();
  }
}

function click(button) {
  if (button.innerHTML == "restart") {
    restart();
    return;
  }

  if (gWord == "") {
    return;
  }

  // pressing a button will hide a message
  hideMessage();

  if (button.innerHTML == "enter") {
    if (gColumn < COLUMNS) {
      showMessage("Word is too short");
    } else {
      let word = wordInRow(gRow);
      if (wordEntered(word)) {
        gColumn = 0;
        ++gRow;
        if (gRow == ROWS) {
          showMessage(`You lost. The word was: ${gWord}`);
          finishGame(false);
        }
      }
    }
  } else if (button.innerHTML == "del") {
    if (gColumn > 0) {
      --gColumn;
      document.getElementById(`tile_${gRow}_${gColumn}`).innerHTML = "";
    }
  } else if (gColumn < COLUMNS) {
    let tile_id = `tile_${gRow}_${gColumn}`;
    let tile = document.getElementById(tile_id);
    tile.innerHTML = button.innerHTML;
    ++gColumn;
  }
}

function windowResize() {
  let vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}

function restart() {
  reset();
  start();
}

window.addEventListener('resize', windowResize);

window.addEventListener('DOMContentLoaded', (e) => {
  windowResize();

  window.addEventListener("keydown", (e) => {
    let id = `key_${e.key.toLowerCase()}`;
    if (e.key == "Backspace" || e.key == "Delete") {
      id = "key_del";
    }
    let button = document.getElementById(id);
    if (button) {
      click(button);
    }
  });

  let buttons = document.getElementsByClassName('key');
  for (let b of buttons) {
    b.onclick = function() {
      click(b);
    }
  }

  let storage = window.localStorage.getItem('stats');
  if (storage) {
    try {
      let stats = JSON.parse(storage);
      gWins= stats['wins'];
      gLosses = stats['losses'];
    } catch(e) {
      console.log('Cannot restore stats');
    }
  }
  renderStats();

  reset();
  start();
  document.getElementById("all").style.visibility = 'visible';
});
