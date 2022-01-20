const LANGUAGES = {"nl":true, "en":true, "ru":true, "tt":true};
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
    "ru": "Новая игра",
    "tt": "Новая игра"
  },
  [MSG_VICTORY]: {
    "en": "YOU WON!!!",
    "nl": "JIJ HEBT GEWONNEN!!!",
    "ru": "ВЫ УГАДАЛИ!!!",
    "tt": "ВЫ УГАДАЛИ!!!"
  },
  [MSG_TOO_SHORT]: {
    "en": "Word is too short",
    "nl": "Woord is te kort",
    "ru": "Необходимо 5 букв",
    "tt": "Необходимо 5 букв"
  },
  [MSG_UNKNOWN_WORD]: {
    "en": "Enter another word",
    "nl": "Voer een ander woord in",
    "ru": "Введите другое слово",
    "tt": "Введите другое слово"
  },
  [MSG_DEFEAT]: {
    "en": "You lost. The word was:",
    "nl": "Jij hebt verloren. Het woord was:",
    "ru": "Вы не угадали слово:",
    "tt": "Вы не угадали слово:"
  }
};

function localize(selector, lang) {
  return LOCALIZATIONS[selector][lang];
}

function wordInRow(row) {
    let word = "";
    for (let c = 0; c < COLUMNS; ++c) {
      word += document.getElementById(`tile_${row}_${c}`).innerHTML;
    }
    return word;
}
