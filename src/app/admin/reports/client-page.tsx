"use client";

import { useState, useEffect, FormEvent } from "react";
import { z } from "zod";
import FilterOptionsComponent from "../FilterOptionsComponent";
import { ParagraphReport, Z_PARAGRAPH_REPORT } from "@/js/types";

const Z_RESPONSE = z.object({
  reports: z.array(Z_PARAGRAPH_REPORT)
});

async function getReports() {
  let response;
  try {
    response = Z_RESPONSE.parse(await (await fetch(`/api/admin/report`, {
      method: "GET",
      mode: "cors",
      cache: "default"
    })).json());
  }
  catch(e: unknown) {
    throw "getReports failed";
  }

  return response.reports;
}

function handleSave(
  event: FormEvent<HTMLFormElement>,
  reports: ParagraphReport[],
  setReports: (reports: ParagraphReport[]) => void,
  editReport: ParagraphReport | null,
  setEditReport: (editReport: ParagraphReport | null) => void
) {
  event.preventDefault();

  if (editReport === null) throw "Edit Report is null!";

  void (async ()=>{
    try{
      const response = Z_PARAGRAPH_REPORT.parse(await(await fetch(`/api/admin/report/edit`, {
        method: "POST",
        body: JSON.stringify(editReport),
        mode: "cors",
        cache: "default"
      })).json());

      //rerender edits
      const reportIndex = reports.findIndex((report)=>report.id === response.id);
      reports[reportIndex] = response;

      setReports([...reports]);
    }
    catch(e: unknown) {
      throw "Edit failed";
    }
  })();
  
  setEditReport(null);
}

export default function ClientAdminReports() {
  const [reports, setReports] = useState<ParagraphReport[]>([]);
  const [viewPage, setViewPage] = useState(1);
  const reportsPerPage = 25;

  const [editReport, setEditReport] = useState<ParagraphReport | null>(null);

  useEffect(()=>{
    void (async ()=>{
      const fetchedReports = await getReports();
      setReports(fetchedReports);
    })();
  },[]);

  function handleDelete(reportId: number) {
    void (async ()=>{
      try{
        await fetch(`/api/admin/report`, {
          method: "DELETE",
          body: JSON.stringify({
            id: reportId
          }),
          mode: "cors",
          cache: "default"
        });
      }
      catch(e: unknown) {
        throw "Delete failed";
      }
    })();
  
    const i = reports.findIndex((report)=>report.id === reportId);
    const newReports = reports.toSpliced(i, 1);

    setReports([...newReports]);
  }

  function deleteManyReports() {
    const reportIds = reports.map((report)=>report.id);
    
    void (async ()=>{
      try{
        await fetch(`/api/admin/report/bulk`, {
          method: "DELETE",
          body: JSON.stringify({
            ids: reportIds
          }),
          mode: "cors",
          cache: "default"
        });
      }
      catch(e: unknown) {
        throw "Delete failed";
      }
    })();
  
    const newReports = reports.filter((report)=>{
      return !reportIds.includes(report.id)
    });

    setReports([...newReports]);
  }

  function handlePageChange() {
    const pageSelector = document.querySelector("#page-select");
    if (!(pageSelector instanceof HTMLSelectElement)) {
      throw "pageSelector is not of HTMLSelectElement type";
    }

    setViewPage(Number(pageSelector.value));
  }

  const refFilteredReports: {items: ParagraphReport[]} = {items: []};
  const filterOptionsComponent = FilterOptionsComponent<ParagraphReport>({
    items: reports,
    refFilteredItems: refFilteredReports,
    selectFilters: {
      resolved: {
        getter: report => report.resolved.toString(),
        options: ["false", "true"]
      }
    },
    filters: {
      "id": { getter: (report: ParagraphReport) => report.id },
      "paragraphId": { getter: (report: ParagraphReport) => String(report.paragraph?.id) },
      "paragraphText": { getter: (report: ParagraphReport) => report.paragraphText },
      "username": { getter: (report: ParagraphReport) => String(report.user?.username) },
      "sessionToken": { getter: (report: ParagraphReport) => String(report.session?.token) },
      "createdAt": { getter: (report: ParagraphReport) => report.createdAt },
    },
    setViewPage: setViewPage,
    deleteManyItems: deleteManyReports
  });

  //TODO: have some way to delete paragraphs or go to /admin/paragraphs page filtered on the specific paragraph to handle the report

  return (
    <div>
      {filterOptionsComponent}
      <br/>

      <div className="flex justify-between">
        <h1>Reports</h1>
        <div className="flex mr-10">
          <p className="leading-10">Page:</p>
          <select onChange={handlePageChange} id="page-select">
            {Array.from(Array(Math.ceil(refFilteredReports.items.length / reportsPerPage))).map((_, i)=>{
              return <option key={i + 1}>{i + 1}</option>
            })}
          </select>
        </div>
      </div>
      <br/>
      {refFilteredReports.items.slice(viewPage * reportsPerPage - reportsPerPage, viewPage * reportsPerPage).map(report =>
        <div className="border-solid border-white border" key={report.id}>
          <div>
          {
            //if theres a report we're editing, display a form to change values
            editReport?.id === report.id ?
            <form onSubmit={e => handleSave(e, reports, setReports, editReport, setEditReport)}>
              id: {report.id}<br/>
              paragraphId: {report.paragraph?.id}<br/>
              paragraphText: {report.paragraphText}<br/>
              paragraphAuthor: {report.paragraph?.author}<br/>
              paragraphSource: {report.paragraph?.source}<br/>
              user: {report.user?.username} - {report.user?.id}<br/>
              session: {report.session?.token}<br/>
              <div>
                resolved:<select id="resolved-select" value={editReport.resolved.toString()} onChange={(e: React.ChangeEvent<HTMLSelectElement>)=>{
                  setEditReport({...editReport, resolved: e.target.value === "true"});
                }}>
                  <option value="true">true</option>
                  <option value="false">false</option>
                </select><br/>
              </div>
              createdAt: {report.createdAt}<br/>
              <div className="flex justify-between">
                <div>
                  <input type="button" className="border-solid border-gray-200 border-2 rounded-lg p-2" onClick={()=>setEditReport(null)} value="Cancel" />
                  <input type="submit" className="border-solid border-green-700 border-2 rounded-lg p-2" value="Save" />
                </div>
                <input type="button" className="border-solid border-red-700 border-2 rounded-lg p-2" onClick={()=>handleDelete(editReport.id)} value="X" />
              </div>
            </form>
            :
            //if we're not editing, display the paragraph data normally
            <>
              id: {report.id}<br/>
              paragraphId: {report.paragraph?.id}<br/>
              paragraphText: {report.paragraphText}<br/>
              paragraphAuthor: {report.paragraph?.author}<br/>
              paragraphSource: {report.paragraph?.source}<br/>
              user: {report.user?.username} - {report.user?.id}<br/>
              session: {report.session?.token}<br/>
              resolved: {String(report.resolved)}<br/>
              createdAt: {report.createdAt}<br/>
              <div className="flex justify-between">
                <input type="button" className="border-solid border-green-700 border-2 rounded-lg p-2" onClick={()=>setEditReport(report)} value="Edit" />
                <input type="button" className="border-solid border-red-700 border-2 rounded-lg p-2" onClick={()=>handleDelete(report.id)} value="X" />
              </div>
            </>
            }
          </div>
        </div>
      )}
      {reports.length === 0 ? "No reports found" : ""}
    </div>
  );
}