// Text helpers that work for both Turkish and English names.

// Folds text for search so Turkish and English spellings meet:
// "İpek" -> "ipek", "YILMAZ" -> "yilmaz", "Öztürk" -> "ozturk", "EMILY" -> "emily".
// Plain toLowerCase() is not enough: "İ".toLowerCase() is "i" plus an invisible combining dot,
// and toLocaleLowerCase("tr") would wrongly turn the English "I" in "EMILY" into "ı".
const normalizeForSearch = (text) =>
  text
    .normalize("NFD") // split letters from their marks: "Ö" -> "O" + "¨", "ş" -> "s" + "¸"
    .replace(/[̀-ͯ]/g, "") // drop the marks
    .toLowerCase()
    .replace(/ı/g, "i"); // dotless ı has no mark to drop

// Turkish alphabet order (C < Ç < D, O < Ö < P, S < Ş < T ...), ignoring upper/lower case.
// English names have no special letters, so they sort as usual among the Turkish ones.
const collator = new Intl.Collator("tr", { sensitivity: "base" });
const compareText = (a, b) => collator.compare(a, b);

module.exports = { normalizeForSearch, compareText };
