"use client";

export default function NavigationComponent({name, route, className} : {name: string, route: string, className: string}) {
  return (
    <input className={className} type="button" value={name} onClick={()=>{window.location.href = route}} />
  );
}