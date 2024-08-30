export const LanguageScripts = {
  CYRILLIC_RUSSIAN: "cyrillic-russian",
  LATIN_ENGLISH: "latin-english"
} as const;

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
  [LanguageScripts.LATIN_ENGLISH]: {
    letters: {
      homerow: [["d", "f", "j", "k"], ["a", "s", "l"], ["g", "h"]],
      upperrow: [["e", "r"], ["u", "i"], ["q", "w"], ["o", "p"], ["t", "y"]],
      lowerrow: [["c", "v"], ["m"], ["z", "x"], ["b", "n"]],
      symbolrow: []
    },
    capitals: {
      homerow: [["D", "F", "J", "K"], ["A", "S", "L"], ["G", "H"]],
      upperrow: [["E", "R"], ["U", "I"], ["Q", "W"], ["O", "P"], ["T", "Y"]],
      lowerrow: [["C", "V"], ["M"], ["Z", "X"], ["B", "N"]],
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
  [LanguageScripts.CYRILLIC_RUSSIAN]: {
    letters: {
      homerow: [["в", "а", "о", "л"], ["ф", "ы"], ["д", "ж", "э"], ["п", "р"]],
      upperrow: [["у", "к"], ["г", "ш"], ["й", "ц"], ["щ", "з"], ["е", "н"], ["х", "ъ"]],
      lowerrow: [["с", "м"], ["ь", "б", "ю"], ["я", "ч"], ["и", "т"]],
      symbolrow: [["ё"]]
    },
    capitals: {
      homerow: [["В", "А", "О", "Л"], ["Ф", "Ы"], ["Д", "Ж", "Э"], ["П", "Р"]],
      upperrow: [["У", "К"], ["Г", "Ш"], ["Й", "Ц"], ["Щ", "З"], ["Е", "Н"], ["Х", "Ъ"]],
      lowerrow: [["С", "М"], ["Ь", "Б", "Ю"], ["Я", "Ч"], ["И", "Т"]],
      symbolrow: [["Ё"]]
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