import { toast } from './toast.js';

let easy_words=[];
let all_words=[];
let gWord="";
let gRow = 0;
let gColumn = 0;
let gLosses = 0;
let gWins = 0;
let gHideToast = null;
let gLang = null;
let gKeyMatches = {} // 'k' -> "partial" or "full"
const LANGUAGES = {"nl":true, "en":true, "ru":true};
const ROWS = 6;
const COLUMNS = 5;

const MSG_NEW_GAME = "new_game";
const MSG_VICTORY = "victory";
const MSG_TOO_SHORT = "too_short";
const MSG_UNKNOWN_WORD = "unknown_word";
const MSG_DEFEAT = "defeat";

const LOCALIZATIONS = {
  [MSG_NEW_GAME]: {
    "en": "New Game",
    "nl": "Nieuw spel",
    "ru": "Новая игра"
  },
  [MSG_VICTORY]: {
    "en": "YOU WON!!!",
    "nl": "JIJ HEBT GEWONNEN!!!",
    "ru": "ВЫ УГАДАЛИ!!!"
  },
  [MSG_TOO_SHORT]: {
    "en": "Word is too short",
    "nl": "Woord is te kort",
    "ru": "Необходимо 5 букв"
  },
  [MSG_UNKNOWN_WORD]: {
    "en": "Enter another word",
    "nl": "Voer een ander woord in",
    "ru": "Введите другое слово"
  },
  [MSG_DEFEAT]: {
    "en": "You lost. The word was:",
    "nl": "Jij hebt verloren. Het woord was:",
    "ru": "Вы не угадали слово:"
  }
};

function localize(selector, lang) {
  return LOCALIZATIONS[selector][lang];
}

function genRandomWord() {
  return easy_words[Math.floor(Math.random()*easy_words.length)];
}

function start() {
  gWord = genRandomWord();
  if (location.hostname === "localhost") {
    // useful for debugging
    console.log(gWord);
  }
}

function reset() {
  gWord="";
  gRow = 0;
  gColumn = 0;
  gKeyMatches = {};
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

function lightUpKey(letter, rowId, columnId, match) {
  if (match == "full") {
    document.getElementById(`tile_${rowId}_${columnId}`).style.backgroundColor = "var(--letter-full-match)";
    if (gKeyMatches[letter] != "full") {
      document.getElementById(`key_${letter}`).style.backgroundColor = "var(--letter-full-match)";
      gKeyMatches[letter] = "full";
    }
  } else if (match == "partial") {
    document.getElementById(`tile_${rowId}_${columnId}`).style.backgroundColor = "var(--letter-partial-match)";
    if (gKeyMatches[letter] != "full" && gKeyMatches[letter] != "partial") {
      // do not downgrade from full match to partial
      document.getElementById(`key_${letter}`).style.backgroundColor = "var(--letter-partial-match)";
      gKeyMatches[letter] = "partial";
    }
  } else if (match == "no") {
    document.getElementById(`tile_${rowId}_${columnId}`).style.backgroundColor = "var(--letter-no-match)";
    if (gKeyMatches[letter] != "full" && gKeyMatches[letter] != "partial") {
      // do not downgrade from full or partial match
      document.getElementById(`key_${letter}`).style.backgroundColor = "var(--letter-no-match)";
    }
  } else {
    showMessage("Internal error :(");
  }
}

function wordEntered(word) {
  if (!all_words[word] /*&& location.hostname !== "localhost"*/) {
    showMessage(localize(MSG_UNKNOWN_WORD, gLang));
    return false;
  }

  // If true, the letter from the gWord has been already matched.
  // If `gWord` is "sleep"
  // and `word` is "xeexe",
  // then the first "e" is partial match, second "e" is full match and the last "e" is no match.
  // `isUsed` array is used to track already matched letters.
  let isUsed = [false, false, false, false, false];

  // First match green letters
  for (let i = 0; i < COLUMNS; ++i) {
    if (gWord[i] == word[i]) {
      isUsed[i] = true;
      lightUpKey(word[i], gRow, i, "full");
    }
  }

  // Second, match partial matches or no matches.
  for (let i = 0; i < COLUMNS; ++i) {
    if (gWord[i] == word[i]) {
      // skip full matches.
      continue;
    }

    let isPartialMatch = false;
    for (let j = 0; j < COLUMNS; ++j) {
      if (word[i] == gWord[j] && !isUsed[j]) {
        isPartialMatch = true;
        isUsed[j] = true;
        break;
      }
    }

    if (isPartialMatch) {
      lightUpKey(word[i], gRow, i, "partial");
    } else {
      lightUpKey(word[i], gRow, i, "no");
    }
  }

  if (word == gWord) {
    showMessage(localize(MSG_VICTORY, gLang));
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
  // TODO: do not rely on innerHTML much
  if (button.innerHTML == localize(MSG_NEW_GAME, gLang)) {
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
      showMessage(localize(MSG_TOO_SHORT, gLang));
    } else {
      let word = wordInRow(gRow);
      if (wordEntered(word)) {
        gColumn = 0;
        ++gRow;
        if (gRow == ROWS) {
          showMessage(localize(MSG_DEFEAT, gLang) + gWord);
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

function initializeKeyboard(layout) {
  let keyboard = document.getElementById("keyboard");
  for (const l of layout) {
    let row = document.createElement("div");
    row.setAttribute("class", "keyboardrow");
    for (const k of l) {
      let key = document.createElement("button");
      if (k == "enter") {
        key.setAttribute("class", "key key-enter unselectable");
      } else {
        key.setAttribute("class", "key unselectable");
      }
      key.setAttribute("id", `key_${k}`);
      key.setAttribute("tabIndex", "-1");
      key.innerHTML = k;
      row.appendChild(key);
    }
    keyboard.appendChild(row);
  }
}

function initializeRussianKeyboard() {
  initializeKeyboard([
    ["й", "ц", "у", "к", "е", "н", "г", "ш", "щ", "з", "х", "ъ"],
    ["ф", "ы", "в", "а", "п", "р", "о", "л", "д", "ж", "э", "del"],
    ["я", "ч", "с", "м", "и", "т", "ь", "б", "ю", "enter"]
  ]);
}

function initializeQwertyKeyboard() {
  initializeKeyboard([
    ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
    ["a", "s", "d", "f", "g", "h", "j", "k", "l", "del"],
    ["z", "x", "c", "v", "b", "n", "m", "enter"]
  ]);
}

function solve() {
  let words = all_words;
  let full_match = "rgb(83, 141, 78)"
  let partial_match = "rgb(204, 119, 34)"
  let no_match = "rgb(96, 16, 11)"
  import(`https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js`).then((jq) => {
    function checkInRow(word, row) {
        for (let i = 0; i < 5; ++i) {
            let tile = $(`#tile_${row}_${i}`)
            let ch = word.charAt(i);
            if (tile.css("background-color") == full_match && tile.html() != ch) {
                return false;
            }
            if (tile.css("background-color") == partial_match && tile.html() == ch) {
                return false;
            }
            if (tile.css("background-color") == partial_match && word.indexOf(tile.html()) == -1) {
                return false;
            }
            if ($(`#key_${ch}`).css("background-color") == no_match) {
                return false;
            }
            if (word == wordInRow(row)) {
                return false;
            }
        }
        return true;
    }

    function checkWord(word, iteration) {
        for (let i = 0; i < iteration; i++) {
            if (!checkInRow(word, i)) {
                return false;
            }
        }
        return true;
    }

    for (let iteration = 0; iteration < 6; iteration++) {
        let wordIndex = 0;
        let word = "";
        let val;
        for([word, val] of Object.entries(words)) {
          if (checkWord(word, iteration)) {
            break;
          }
        }
        //let word = words[wordIndex];
        for (let i = 0; i < word.length; i++) {
            $("#key_"+word.charAt(i)).click();
        }
        $("#key_enter").click();
    }
  })
  .catch(err => alert("Error loading jquery: " + err));
}

function initialize(lang) {
  gLang = lang;
  windowResize();

  if (lang == "ru") {
    initializeRussianKeyboard();
  } else {
    initializeQwertyKeyboard();
  }

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

  let settings = document.getElementById("settings-button");
  settings.innerHTML = lang;
  settings.onclick = function() {
    const languageSelection = `<a href="?lang=en" class="settings-button">English</a><br/>
                               <a href="?lang=nl" class="settings-button">Nederlands</a><br/>
                               <a href="?lang=ru" class="settings-button">Русский</a><br/>
                              `;
    let div = document.createElement('div');
    div.innerHTML = languageSelection;
    showMessage(div);
  }

  // some static localization
  document.getElementById("key_restart").innerHTML = localize(MSG_NEW_GAME, gLang);

  window.solve = solve;
  reset();
  start();
  document.getElementById("all").style.visibility = 'visible';
}

window.addEventListener('DOMContentLoaded', (e) => {
  const params = new URLSearchParams(window.location.search);

  let lang = params.get('lang');
  if (!lang) {
    lang = "nl"; //default language
  }

  if (!LANGUAGES[lang]) {
    showMessage(`Unsupported language`);
    return;
  }

  import(`./${lang}/easy-5.js`)
    .then((module_easy) => {
      easy_words = module_easy.words;
      import(`./${lang}/all-5.js`)
        .then((module_all) => {
          all_words = module_all.words;
          initialize(lang);
        })
        .catch(err => showMessage("Error when loading dictionaries"));
    })
    .catch(err => showMessage("Error when loading dictionaries"));
});
