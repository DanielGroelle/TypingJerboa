"use client";

import { useState, useEffect } from "react";
import { z } from "zod";
import FilterOptionsComponent from "../../FilterOptionsComponent";
import { LessonReport, Z_LESSON_REPORT } from "@/js/types";
import ItemCardComponent from "../../ItemCardComponent";

const Z_RESPONSE = z.object({
  reports: z.array(Z_LESSON_REPORT)
});

async function getReports() {
  let response;
  try {
    response = Z_RESPONSE.parse(await (await fetch(`/api/admin/lesson/report`, {
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

export default function ClientAdminLessonReports() {
  const [reports, setReports] = useState<LessonReport[]>([]);
  const [viewPage, setViewPage] = useState(1);
  const reportsPerPage = 25;

  useEffect(()=>{
    void (async ()=>{
      const fetchedReports = await getReports();
      setReports(fetchedReports);
    })();
  },[]);

  function handleSave(editReport: LessonReport) {
    void (async ()=>{
      try {
        const response = Z_LESSON_REPORT.parse(await(await fetch(`/api/admin/lesson/report/edit`, {
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
  }

  function handleDelete(reportId: number) {
    void (async ()=>{
      try {
        await fetch(`/api/admin/lesson/report`, {
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

  function deleteManyReports(deleteReports: LessonReport[]) {
    const reportIds = deleteReports.map(report => report.id);
    
    void (async ()=>{
      try {
        await fetch(`/api/admin/lesson/report/bulk`, {
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

  const refFilteredReports: {items: LessonReport[]} = {items: []};
  const filterOptionsComponent = FilterOptionsComponent<LessonReport>({
    items: reports,
    refFilteredItems: refFilteredReports,
    selectFilters: {
      resolved: {
        getter: report => report.resolved.toString(),
        options: ["false", "true"]
      }
    },
    filters: {
      "id": { getter: (report: LessonReport) => report.id },
      "lessonId": { getter: (report: LessonReport) => String(report.lesson?.id) },
      "lessonChararcters": { getter: (report: LessonReport) => String(report.lesson?.lessonCharacters) },
      "lessonText": { getter: (report: LessonReport) => report.lessonText },
      "username": { getter: (report: LessonReport) => String(report.user?.username) },
      "sessionToken": { getter: (report: LessonReport) => String(report.session?.token) },
      "createdAt": { getter: (report: LessonReport) => new Date(report.createdAt) },
    },
    setViewPage: setViewPage,
    deleteManyItems: deleteManyReports
  });

  //TODO: have some way to delete lessons or go to /admin/lessons page filtered on the specific lesson to handle the report

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
        (
          <ItemCardComponent
            item={report}
            itemFields={{
              "id": {getter: (report: LessonReport) => report.id, editType: null, options: null},
              "lessonId": {getter: (report: LessonReport) => report.lesson?.id ?? null, editType: null, options: null},
              "lessonCharacters": {getter: (report: LessonReport) => report.lesson?.lessonCharacters ?? null, editType: null, options: null},
              "lessonText": {getter: (report: LessonReport) => report.lessonText, editType: null, options: null},
              "user": {getter: (report: LessonReport) => report.user ? `${String(report.user?.username)} - ${String(report.user?.id)}` : null, editType: null, options: null},
              "session": {getter: (report: LessonReport) => report.session?.token ? `${String(report.session?.token)}` : null, editType: null, options: null},
              "resolved": {getter: (report: LessonReport) => String(report.resolved), editType: "checkbox", options: null},
              "createdAt": {getter: (report: LessonReport) => report.createdAt, editType: null, options: null},
            }}
            editParams={{
              items: reports,
              setItems: setReports,
              saveItem: handleSave
            }}
            deleteItem={handleDelete}
            key={report.id}
          />
        )
      )}
      {refFilteredReports.items.length === 0 ? "No reports found" : ""}
    </div>
  );
}