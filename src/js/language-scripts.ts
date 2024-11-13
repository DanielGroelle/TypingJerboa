export const LanguageScripts = {
  "cyrillic-russian": {
    internal: "cyrillic-russian",
    display: "Cyrillic (Russian)"
  },
  "latin-english": {
    internal: "latin-english",
    display: "Latin (English)"
  }
} as const;

//these are ordered in this way so then characters on homerow are always learned first, then upperrow, etc.
export type Rows = {
  homerow: string[][],
  upperrow: string[][],
  lowerrow: string[][],
  symbolrow: string[][]
};

export type ManualKeyboardMapping = {
  letters: Rows,
  capitals: Rows,
  numbers: Rows,
  symbols: Rows
};

export const ManualKeyboardMap: {[key: string]: ManualKeyboardMapping} = {
  [LanguageScripts["latin-english"].internal]: {
    letters: {
      homerow: [["d", "f", "j", "k"], ["a", "s", "l"], ["g", "h"]],
      upperrow: [["e", "r"], ["u", "i"], ["q", "w"], ["o", "p"], ["t", "y"]],
      lowerrow: [["c", "v"], ["z", "x"], ["b", "n", "m"]],
      symbolrow: []
    },
    capitals: {
      homerow: [["D", "F", "J", "K"], ["A", "S", "L"], ["G", "H"]],
      upperrow: [["E", "R"], ["U", "I"], ["Q", "W"], ["O", "P"], ["T", "Y"]],
      lowerrow: [["C", "V"], ["Z", "X"], ["B", "N", "M"]],
      symbolrow: []
    },
    numbers: {
      homerow: [],
      upperrow: [],
      lowerrow: [],
      symbolrow: [["1", "2", "3", "4"], ["5", "6", "7"], ["8", "9", "0"]]
    },
    symbols: {
      homerow: [[";", "'"], [":", "\""]],
      upperrow: [["[", "]", "\\"], ["{", "}", "|"]],
      lowerrow: [[",", ".", "/"], ["<", ">", "?"]],
      symbolrow: [["!", "@", "#"], ["$", "%", "^"], ["&", "*", "(", ")"], ["-", "="], ["_", "+"], ["`", "~"]]
    }
  },
  [LanguageScripts["cyrillic-russian"].internal]: {
    letters: {
      homerow: [["в", "а", "о", "л"], ["ф", "ы"], ["д", "ж", "э"], ["п", "р"]],
      upperrow: [["у", "к"], ["г", "ш"], ["й", "ц"], ["щ", "з"], ["е", "н"], ["х", "ъ"]],
      lowerrow: [["с", "м"], ["ь", "б", "ю"], ["я", "ч"], ["и", "т", "ё"]], //despite ё technically being on symbolrow, having it be by itself isnt good for a lesson
      symbolrow: []
    },
    capitals: {
      homerow: [["В", "А", "О", "Л"], ["Ф", "Ы"], ["Д", "Ж", "Э"], ["П", "Р"]],
      upperrow: [["У", "К"], ["Г", "Ш"], ["Й", "Ц"], ["Щ", "З"], ["Е", "Н"], ["Х", "Ъ"]],
      lowerrow: [["С", "М"], ["Ь", "Б", "Ю"], ["Я", "Ч"], ["И", "Т", "Ё"]],
      symbolrow: []
    },
    numbers: {
      homerow: [],
      upperrow: [],
      lowerrow: [],
      symbolrow: [["1", "2", "3", "4"], ["5", "6", "7"], ["8", "9", "0"]]
    },
    symbols: {
      homerow: [],
      upperrow: [["\\", "/"]],
      lowerrow: [[".", ","]],
      symbolrow: [["!", "\"", "№"], [";", "%", ":"], ["?", "*", "(", ")"], ["_", "+"]]
    }
  }
};

type KeyboardMapping = {[languageScriptKey: string]: {
  "shift": {[key: string]: string},
  "noshift": {[key: string]: string}
}};
//for mapping characters between languageScripts
export const KeyboardMap: KeyboardMapping = {
  [LanguageScripts["latin-english"].internal]: {
    noshift: {
      "Backquote": "`",
      "Digit1": "1",
      "Digit2": "2",
      "Digit3": "3",
      "Digit4": "4",
      "Digit5": "5",
      "Digit6": "6",
      "Digit7": "7",
      "Digit8": "8",
      "Digit9": "9",
      "Digit0": "0",
      "Minus": "-",
      "Equal": "=",
      "KeyQ": "q",
      "KeyW": "w",
      "KeyE": "e",
      "KeyR": "r",
      "KeyT": "t",
      "KeyY": "y",
      "KeyU": "u",
      "KeyI": "i",
      "KeyO": "o",
      "KeyP": "p",
      "BracketLeft": "[",
      "BracketRight": "]",
      "Backslash": "\\",
      "KeyA": "a",
      "KeyS": "s",
      "KeyD": "d",
      "KeyF": "f",
      "KeyG": "g",
      "KeyH": "h",
      "KeyJ": "j",
      "KeyK": "k",
      "KeyL": "l",
      "Semicolon": ";",
      "Quote": "'",
      "KeyZ": "z",
      "KeyX": "x",
      "KeyC": "c",
      "KeyV": "v",
      "KeyB": "b",
      "KeyN": "n",
      "KeyM": "m",
      "Comma": ",",
      "Period": ".",
      "Slash": "/"
    },
    shift: {
      "Backquote": "~",
      "Digit1": "!",
      "Digit2": "@",
      "Digit3": "#",
      "Digit4": "$",
      "Digit5": "%",
      "Digit6": "^",
      "Digit7": "&",
      "Digit8": "*",
      "Digit9": "(",
      "Digit0": ")",
      "Minus": "_",
      "Equal": "+",
      "KeyQ": "Q",
      "KeyW": "W",
      "KeyE": "E",
      "KeyR": "R",
      "KeyT": "T",
      "KeyY": "Y",
      "KeyU": "U",
      "KeyI": "I",
      "KeyO": "O",
      "KeyP": "P",
      "BracketLeft": "{",
      "BracketRight": "}",
      "Backslash": "|",
      "KeyA": "A",
      "KeyS": "S",
      "KeyD": "D",
      "KeyF": "F",
      "KeyG": "G",
      "KeyH": "H",
      "KeyJ": "J",
      "KeyK": "K",
      "KeyL": "L",
      "Semicolon": ":",
      "Quote": "\"",
      "KeyZ": "Z",
      "KeyX": "X",
      "KeyC": "C",
      "KeyV": "V",
      "KeyB": "B",
      "KeyN": "N",
      "KeyM": "M",
      "Comma": "<",
      "Period": ">",
      "Slash": "?"
    }
  },
  [LanguageScripts["cyrillic-russian"].internal]: {
    noshift: {
      "Backquote": "ё",
      "Digit1": "1",
      "Digit2": "2",
      "Digit3": "3",
      "Digit4": "4",
      "Digit5": "5",
      "Digit6": "6",
      "Digit7": "7",
      "Digit8": "8",
      "Digit9": "9",
      "Digit0": "0",
      "Minus": "-",
      "Equal": "=",
      "KeyQ": "й",
      "KeyW": "ц",
      "KeyE": "у",
      "KeyR": "к",
      "KeyT": "е",
      "KeyY": "н",
      "KeyU": "г",
      "KeyI": "ш",
      "KeyO": "щ",
      "KeyP": "з",
      "BracketLeft": "х",
      "BracketRight": "ъ",
      "Backslash": "\\",
      "KeyA": "ф",
      "KeyS": "ы",
      "KeyD": "в",
      "KeyF": "а",
      "KeyG": "п",
      "KeyH": "р",
      "KeyJ": "о",
      "KeyK": "л",
      "KeyL": "д",
      "Semicolon": "ж",
      "Quote": "э",
      "KeyZ": "я",
      "KeyX": "ч",
      "KeyC": "с",
      "KeyV": "м",
      "KeyB": "и",
      "KeyN": "т",
      "KeyM": "ь",
      "Comma": "б",
      "Period": "ю",
      "Slash": "."
    },
    shift: {
      "Backquote": "Ё",
      "Digit1": "!",
      "Digit2": "\"",
      "Digit3": "№",
      "Digit4": ";",
      "Digit5": "%",
      "Digit6": ":",
      "Digit7": "?",
      "Digit8": "*",
      "Digit9": "(",
      "Digit0": ")",
      "Minus": "_",
      "Equal": "+",
      "KeyQ": "Й",
      "KeyW": "Ц",
      "KeyE": "У",
      "KeyR": "К",
      "KeyT": "Е",
      "KeyY": "Н",
      "KeyU": "Г",
      "KeyI": "Ш",
      "KeyO": "Щ",
      "KeyP": "З",
      "BracketLeft": "Х",
      "BracketRight": "Ъ",
      "Backslash": "/",
      "KeyA": "Ф",
      "KeyS": "Ы",
      "KeyD": "В",
      "KeyF": "А",
      "KeyG": "П",
      "KeyH": "Р",
      "KeyJ": "О",
      "KeyK": "Л",
      "KeyL": "Д",
      "Semicolon": "Ж",
      "Quote": "Э",
      "KeyZ": "Я",
      "KeyX": "Ч",
      "KeyC": "С",
      "KeyV": "М",
      "KeyB": "И",
      "KeyN": "Т",
      "KeyM": "Ь",
      "Comma": "Б",
      "Period": "Ю",
      "Slash": ","
    }
  }
};