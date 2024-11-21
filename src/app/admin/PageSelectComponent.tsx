export default function PageSelectComponent({itemsLength, viewPage, setViewPage, itemsPerPage}: {
  itemsLength: number,
  viewPage: number,
  setViewPage: (viewPage: number) => void,
  itemsPerPage: number
}) {
  const pages = Math.ceil(itemsLength / itemsPerPage);

  return (
    <div className="flex">
      <p className="leading-10">Page:</p>

      <input type="button" className="border-solid border-white border rounded-lg w-6 m-1" onClick={()=>setViewPage(1)} value="«"/>
      <input type="button" className="border-solid border-white border rounded-lg w-6 m-1" onClick={()=>setViewPage(Math.max(viewPage - 1, 1))} value="<"/>
      <select onChange={(e: React.ChangeEvent<HTMLSelectElement>)=>{setViewPage(Number(e.target.value))}} value={viewPage} id="page-select">
        {Array.from(Array(pages)).map((_, i)=>{
          return <option key={i + 1}>{i + 1}</option>
        })}
      </select>
      <span className="leading-10">of {pages}</span>
      <input type="button" className="border-solid border-white border rounded-lg w-6 m-1" onClick={()=>setViewPage(Math.min(viewPage + 1, pages))} value=">"/>
      <input type="button" className="border-solid border-white border rounded-lg w-6 m-1" onClick={()=>setViewPage(pages)} value="»"/>
    </div>
  );
}