"use client";

export default function ButtonComponent({name, route} : {name: string, route: string}) {
  return (
    <input type="button" value={name} onClick={()=>{window.location.href = route}} />
  );
}