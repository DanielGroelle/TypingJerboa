import { LanguageScripts } from "@/js/language-scripts";
import { useState } from "react";

type fieldEditType = "text" | "select" | "textarea" | "array" | "languageScript" | "checkbox" | null;

export default function ItemCardComponent<T, IdT extends string | number>(
{item, itemFields, deleteItem, editParams}: {
  item: T,
  itemFields: {
    id: {
      getter: (item: T) => IdT,
      editType: null,
      options: null
    },
    [fieldType: string]: {
      getter: (item: T) => (string | number | string[] | null),
      editType: fieldEditType,
      options: string[] | null
    }
  },
  editParams: {
    items: T[],
    setItems: ((items: T[]) => void)
    saveItem: ((
      editItem: T,
      items: T[],
      setItems: ((items: T[]) => void)
    ) => void)
  } | null,
  deleteItem: ((itemId: IdT) => void) | null,
}) {
  const [editItem, setEditItem] = useState<T | null>(null);

  return (
    <div className="border-solid border-white border">
      <div>
        {
          //if editing display an edit form
          editParams !== null && editItem !== null ?

          <form onSubmit={e => {e.preventDefault()}}>
            {Object.entries(itemFields).map(([key, field]) => {
              if (field.editType === null) return <p key={key}>{key}: {field.getter(editItem)}</p>
              if (field.editType === "text") {
                return (
                  <div className="flex" key={key}>
                    <span>{key}:</span>
                    <input type="text" className="w-full" value={itemFields[key].getter(editItem) ?? ""} onChange={(e: React.ChangeEvent<HTMLInputElement>)=>{
                      setEditItem({...editItem, [key]: e.target.value});
                    }}/>
                  </div>
                );
              }
              if (field.editType === "select" && field.options) {
                return (
                  <div className="flex" key={key}>
                    <span>{key}:</span>
                    <select value={itemFields[key].getter(editItem) ?? ""} onChange={(e: React.ChangeEvent<HTMLSelectElement>)=>{
                      setEditItem({...editItem, [key]: e.target.value});
                    }}>
                      {field.options.map(option => 
                        <option key={option} value={option}>{option}</option>
                      )}
                    </select>
                  </div>
                );
              }
              if (field.editType === "textarea") {
                return (
                  <div className="flex" key={key}>
                    <span>{key}:</span>
                    <textarea className="w-full" value={itemFields[key].getter(editItem) ?? ""} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>)=>{
                      setEditItem({...editItem, [key]: e.target.value});
                    }}></textarea>
                  </div>
                );
              }
              if (field.editType === "array") {
                const arrayValues = itemFields[key].getter(editItem);
                if (!Array.isArray(arrayValues)) throw "Expected array not received while editType was declared as array!";

                return (
                  <div className="flex" key={key}>
                    <span>{key}:</span>
                    {
                      arrayValues.map((value, index) => (
                        <input type="text" className="w-full border-solid border-black border" key={index} value={value} onChange={(e: React.ChangeEvent<HTMLInputElement>)=>{
                          const newValues = [...arrayValues];
                          newValues[index] = e.target.value;
                          setEditItem({...editItem, [key]: newValues});
                        }}/>
                      ))
                    }
                    <div>
                      <input type="button" className="border-solid border-green-500 border rounded-sm align-middle w-5 h-5 m-1" onClick={()=>{
                        setEditItem({...editItem, [key]: [...arrayValues, ""]});
                      }} value="+" />
                      <input type="button" className="border-solid border-red-500 border rounded-sm align-middle w-5 h-5 m-1" onClick={()=>{
                        if (arrayValues.length > 1) {
                          setEditItem({...editItem, [key]: [...arrayValues.slice(0, arrayValues.length - 1)]});
                        }
                      }} value="-" />
                    </div>
                  </div>
                );
              }
              if (field.editType === "languageScript") {
                return (
                  <div className="flex" key={key}>
                    <span>{key}:</span>
                    <select id="language-script-edit-select" value={itemFields[key].getter(editItem) ?? ""} onChange={(e: React.ChangeEvent<HTMLSelectElement>)=>{
                      setEditItem({...editItem, [key]: e.target.value});
                    }}>
                      {Object.values(LanguageScripts).map((languageScript)=>{
                        return <option key={languageScript.internal} value={languageScript.internal}>{languageScript.internal}</option>
                      })}
                    </select>
                  </div>
                );
              }
              if (field.editType === "checkbox") {
                throw "not implemented";
                return (
                  <div className="flex" key={key}>
                    <span>{key}:</span>
                    <input type="checkbox" className="w-full" checked={itemFields[key].getter(editItem) === "true"} onChange={(e: React.ChangeEvent<HTMLInputElement>)=>{
                      setEditItem({...editItem, [key]: String(e.target.checked)});
                    }}/>
                  </div>
                );
              }
            })}
            <div className="flex justify-between">
              <div>
                <input type="button" className="border-solid border-gray-200 border-2 rounded-lg p-2" onClick={()=>setEditItem(null)} value="Cancel" />
                <input type="button" className="border-solid border-green-700 border-2 rounded-lg p-2"
                  onClick={()=>{
                    editParams.saveItem(editItem, editParams.items, editParams.setItems);
                    setEditItem(null);
                  }}
                value="Save" />
              </div>
              {deleteItem ?
                <input type="button" className="border-solid border-red-700 border-2 rounded-lg p-2" onClick={()=>deleteItem(itemFields.id.getter(editItem))} value="X" />
                :
                ""
              }
            </div>
          </form>
          :
          //not editing
          (<>
            {Object.entries(itemFields).map(([key, field]) => {
              let value = field.getter(item);
              if (Array.isArray(value)) {
                value = value.map(v => `"${v}"`).join(", ");
              }
              return <p key={key}>{key}: {value}</p>
            })}
            <div className="flex justify-between">
              {editParams !== null ?
                <input type="button" className="border-solid border-green-700 border-2 rounded-lg p-2" onClick={()=>setEditItem({...item})} value="Edit" />
                :
                ""
              }
              {deleteItem ?
                <input type="button" className="border-solid border-red-700 border-2 rounded-lg p-2" onClick={()=>deleteItem(itemFields.id.getter(item))} value="X" />
                :
                ""
              }
            </div>
          </>)
        }
      </div>

      
    </div>
  );
}