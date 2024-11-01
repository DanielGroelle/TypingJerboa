import { ChangeEvent, useState } from "react";
import { LanguageScripts } from "@/js/language-scripts";
import { Word, Z_WORD } from "@/js/types";
import { z } from "zod";
import Papa from "papaparse";

function handleCsvSelect(e: ChangeEvent<HTMLInputElement>) {
  //dont allow upload of files other than csv
  if (e) {
    if (e.target.files?.[0]?.type !== "text/csv") {
      e.target.value = "";
    }
  }
}

const Z_CSV_RESULTS_DATA = z.array(z.array(z.string()));
const Z_WORDS_ARRAY = z.object({
  data: z.array(Z_WORD)
});

function importFromCsv(words: Word[], setWords: (words: Word[]) => void, languageScript: string) {
  const csvFileInput = document.getElementById("csv-import");

  
  if (csvFileInput instanceof HTMLInputElement) {
    const csvFile = csvFileInput.files?.[0];

    if (csvFile) {
      Papa.parse(csvFile, {
        delimiter: ",", //maybe delimiter shouldnt be specified in-case at some point a weird csv variant is used
        //papaparse is good at guessing anyways, it just returns an error when it has to guess
        complete: (results)=>{
          if (results.errors.length) {
            console.error("Errors parsing csv", results.errors);
          }

          const data = Z_CSV_RESULTS_DATA.parse(results.data);
          const csvWords = data.map(arr => arr[0]);

          void (async ()=>{
            try {
              const response = Z_WORDS_ARRAY.parse(await(await fetch(`/api/admin/word/bulk`, {
                method: "POST",
                body: JSON.stringify({
                  languageScript,
                  words: csvWords,
                }),
                mode: "cors",
                cache: "default"
              })).json());

              const newWords = [...words, ...response.data];
              setWords(newWords);
            }
            catch(e: unknown) {
              console.error("Bulk word add failed", e);
            }
          })();
        }
      });
    }
  }
}

export default function CsvImportComponent({words, setWords}: {words: Word[], setWords: (words: Word[]) => void}) {
  const [languageScript, setLanguageScript] = useState<string>(Object.values(LanguageScripts)[0].internal);

  return (
    <div>
      <label htmlFor="csv-import" className="mr-1">Import From CSV</label>
      <input type="file" name="csv-import" id="csv-import" className="text-xs" accept=".csv" onChange={(e)=>handleCsvSelect(e)} />
      <input type="button" className="border-solid border-green-600 border rounded-lg p-2" onClick={()=>importFromCsv(words, setWords, languageScript)} value="Import"/>
      <span>languageScript:</span>
      <select id="language-script-csv-select" value={languageScript} onChange={(e: React.ChangeEvent<HTMLSelectElement>)=>{
        setLanguageScript(e.target.value);
      }}>
        {Object.values(LanguageScripts).map(languageScript => {
          return <option key={languageScript.internal} value={languageScript.internal}>{languageScript.internal}</option>
        })}
      </select>
    </div>
  );
}