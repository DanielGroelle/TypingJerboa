import { ChangeEvent } from "react";
import { LanguageScripts } from "@/js/language-scripts";
import { Paragraph, Z_PARAGRAPH } from "@/js/types";
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
const Z_PARAGRAPHS_ARRAY = z.object({
  data: z.array(Z_PARAGRAPH)
});

function importFromCsv(paragraphs: Paragraph[], setParagraphs: (paragraphs: Paragraph[]) => void) {
  const csvFileInput = document.getElementById("csv-import");
  const languageScriptSelector = document.querySelector("#language-script-csv-select");

  if (csvFileInput instanceof HTMLInputElement && languageScriptSelector instanceof HTMLSelectElement) {
    const csvFile = csvFileInput.files?.[0];
    if (csvFile) {
      Papa.parse(csvFile, {
        // delimiter: ",", feel like delimiter shouldnt be specified in-case at some point a weird csv variant is used
        //papaparse is good at guessing anyways, it just returns an error when it has to guess
        complete: (results)=>{
          if (results.errors.length) {
            console.error("Errors parsing csv", results.errors);
          }

          const data = Z_CSV_RESULTS_DATA.parse(results.data);
          const author = data?.[0]?.[0];
          const source = data?.[0]?.[1];
          const texts = data.slice(1, data.length - 1).map((arr)=>arr[0]);
          const languageScript = languageScriptSelector.value;
          const selectable = true;

          void (async ()=>{
            try{
              const response = Z_PARAGRAPHS_ARRAY.parse(await(await fetch(`/api/admin/paragraph/bulk`, {
                method: "POST",
                body: JSON.stringify({
                  texts,
                  author,
                  source,
                  languageScript,
                  selectable
                }),
                mode: "cors",
                cache: "default"
              })).json());

              const newParagraphs = [...response.data, ...paragraphs]
              setParagraphs(newParagraphs);
            }
            catch(e: unknown) {
              console.error("Bulk paragraph add failed", e);
            }
          })();
        }
      });
    }
  }
}

export default function CsvImportComponent({paragraphs, setParagraphs}: {paragraphs: Paragraph[], setParagraphs: (paragraphs: Paragraph[]) => void}) {
  return (
    <div>
      <label htmlFor="csv-import" className="mr-1">Import From CSV</label>
      <input type="file" name="csv-import" id="csv-import" className="text-xs" accept=".csv" onChange={(e)=>handleCsvSelect(e)} />
      <input type="button" className="border-solid border-green-600 border rounded-lg p-2" onClick={()=>importFromCsv(paragraphs, setParagraphs)} value="Import"/>
      languageScript: 
      <select id="language-script-csv-select">
        {Object.values(LanguageScripts).map((languageScript)=>{
          return <option key={languageScript.internal} defaultValue={languageScript.internal}>{languageScript.internal}</option>
        })}
      </select>
    </div>
  );
}