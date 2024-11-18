import { ChangeEvent, useState } from "react";
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

async function singleWorkImport(languageScript: string, texts: string[], author: string | null, source: string | null) {
  try {
    return Z_PARAGRAPHS_ARRAY.parse(await(await fetch(`/api/admin/paragraph/bulk/single-work`, {
      method: "POST",
      body: JSON.stringify({
        texts,
        author,
        source,
        languageScript,
        selectable: true
      }),
      mode: "cors",
      cache: "default"
    })).json());
  }
  catch(e: unknown) {
    console.error("Bulk paragraph add failed", e);
  }
}

async function nonSingleWorkImport(languageScript: string, texts: {text: string, source: string | null, author: string | null}[]) {
  try {
    return Z_PARAGRAPHS_ARRAY.parse(await(await fetch(`/api/admin/paragraph/bulk`, {
      method: "POST",
      body: JSON.stringify({
        texts,
        languageScript,
        selectable: true
      }),
      mode: "cors",
      cache: "default"
    })).json());
  }
  catch(e: unknown) {
    console.error("Bulk paragraph add failed", e);
  }
}

function importFromCsv(paragraphs: Paragraph[], setParagraphs: (paragraphs: Paragraph[]) => void, languageScript: string, singleWork: boolean) {
  const csvFileInput = document.getElementById("csv-import");

  if (csvFileInput instanceof HTMLInputElement) {
    const csvFile = csvFileInput.files?.[0];
    if (csvFile) {
      Papa.parse(csvFile, {
        delimiter: ",", //feel like delimiter shouldnt be specified in-case at some point a weird csv variant is used
        //papaparse is good at guessing anyways, it just returns an error when it has to guess
        complete: (results)=>{
          if (results.errors.length) {
            console.error("Errors parsing csv", results.errors);
          }

          const data = Z_CSV_RESULTS_DATA.parse(results.data);
          if (singleWork) {
            const author = data?.[0]?.[0] !== "" ? data?.[0]?.[0] : null;
            const source = data?.[0]?.[1] !== "" ? data?.[0]?.[1] : null;
            const texts = data.slice(1).map(arr => arr[0]);
            if (texts[texts.length - 1] === undefined) texts.pop();
            void (async ()=>{
              const response = Z_PARAGRAPHS_ARRAY.parse(await singleWorkImport(languageScript, texts, author, source));

              const newParagraphs = [...response.data, ...paragraphs];
              setParagraphs(newParagraphs);
            })();
          }
          else {
            const texts = data.map(paragraph => {
              return {
                text: paragraph?.[0],
                source: paragraph?.[1] !== "" ? paragraph?.[1] : null,
                author: paragraph?.[2] !== "" ? paragraph?.[2] : null
              }
            });
            if (texts[texts.length - 1].source === undefined) texts.pop();
            void (async ()=>{
              const response = Z_PARAGRAPHS_ARRAY.parse(await nonSingleWorkImport(languageScript, texts));

              const newParagraphs = [...response.data, ...paragraphs];
              setParagraphs(newParagraphs);
            })();
          }          
        }
      });
    }
  }
}

export default function CsvImportComponent({paragraphs, setParagraphs}: {paragraphs: Paragraph[], setParagraphs: (paragraphs: Paragraph[]) => void}) {
  const [languageScript, setLanguageScript] = useState<string>(Object.values(LanguageScripts)[0].internal);
  const [singleWork, setSingleWork] = useState(true);

  return (
    <div>
      <label htmlFor="csv-import" className="mr-1">Import From CSV</label>
      <input type="file" name="csv-import" id="csv-import" className="text-xs" accept=".csv" onChange={(e)=>handleCsvSelect(e)} />
      <input type="button" className="border-solid border-green-600 border rounded-lg p-2" onClick={()=>importFromCsv(paragraphs, setParagraphs, languageScript, singleWork)} value="Import"/>
      <span>languageScript:</span>
      <select id="language-script-csv-select" value={languageScript} onChange={(e: React.ChangeEvent<HTMLSelectElement>)=>{
        setLanguageScript(e.target.value);
      }}>
        {Object.values(LanguageScripts).map((languageScript)=>{
          return <option key={languageScript.internal} value={languageScript.internal}>{languageScript.internal}</option>
        })}
      </select>
      <input type="checkbox" id="single-work" checked={singleWork} onChange={()=>setSingleWork(!singleWork)} />
      <label className="ml-1" htmlFor="single-work">Single Work</label>
    </div>
  );
}