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