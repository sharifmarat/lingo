let full_match = "rgb(83, 141, 78)"
let partial_match = "rgb(204, 119, 34)"
let no_match = "rgb(96, 16, 11)"

// The first word is different per languages
const START_WORD = {
  "nl":"eruit",
  "en":"usage",
  "ru":"авеню",
  "tt":"аерту"
};

// After a certain key combination is typed a solver will be triggered.
export class CombinationTrigger {
  // Constructs solver with a combination.
  // combination is an expected array with keys.
  constructor(combination) {
    this.combination = combination;
    this.pos = 0;
  }

  reset() {
    this.pos = 0;
  }

  // return true when reached the end combination, false otherwise.
  checkKey(key) {
    if (this.pos >= this.combination.length || this.combination[this.pos] != key) {
      this.reset();
      return false;
    }

    if (this.pos == this.combination.length - 1) {
      // Succesfully reached the end of combination
      this.reset();
      return true;
    } else {
      // Still in the middle of combination
      this.pos += 1;
      return false;
    }
  }
}

export function solve(lang, currentRow, words) {
  import(`./jquery-3.6.0.min.js`).then((jq) => {
    function checkInRow(word, row) {
        for (let i = 0; i < COLUMNS; ++i) {
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
            if (tile.css("background-color") == no_match && tile.html() == ch) {
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

    function enterWord(word) {
      for (let i = 0; i < word.length; i++) {
          $("#key_"+word.charAt(i)).click();
      }
      $("#key_enter").click();
    }

    let startWord = START_WORD[lang];
    let iteration = currentRow;
    if (words[startWord] && checkWord(startWord, iteration)) {
      enterWord(startWord);
      ++iteration;
    }

    for(let [word, val] of Object.entries(words)) {
      if (iteration >= ROWS) {
        break;
      }
      if (checkWord(word, iteration)) {
        enterWord(word);
        ++iteration;
      }
    }
  })
  .catch(err => alert("Error loading jquery: " + err));
}
