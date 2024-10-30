import Link from "next/link";

export default function Admin() {
  return (
    <div>
      <h1 className="text-4xl">Administrator Panel</h1>
      <br/>
      <div className="pb-4">
        <div className="text-2xl">
          <Link href="/admin/news">News</Link>
        </div>
        <div>
          News view
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
          <Link href="/admin/lessons">Lessons</Link>
        </div>
        <div>
          Lessons view
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
          <Link href="/admin/words">Words</Link>
        </div>
        <div>
          Words view
        </div>
      </div>
      <div className="pb-4">
        <div className="text-2xl">
          <Link href="/admin/reports/paragraphs">Paragraph Reports</Link>
        </div>
        <div>
          Paragraph Reports view
        </div>
      </div>
      <div className="pb-4">
        <div className="text-2xl">
          <Link href="/admin/reports/lessons">Lesson Reports</Link>
        </div>
        <div>
          Paragraph Reports view
        </div>
      </div>
    </div>
  );
}