import Link from "next/link";

export default function Admin() {
  //TODO: make inaccessible unless logged in and with proper privilege

  return (
    <div>
      <h1 className="text-4xl">Administrator Panel</h1>
      <br/>
      <div className="pb-4">
            <div className="text-2xl">
                <Link href="/admin/races">Races</Link>
            </div>
            <div>
                Races view
            </div>
        </div>
        <div className="pb-4">
            <div className="text-2xl">
                <Link href="/admin/paragraphs">Paragraphs</Link>
            </div>
            <div>
                Paragraphs view
            </div>
        </div>
        <div className="pb-4">
            <div className="text-2xl">
                <Link href="/admin/users">Users</Link>
            </div>
            <div>
                Users view
            </div>
        </div>
    </div>
  );
}