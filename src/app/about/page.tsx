import Image from "next/image";
import Link from "next/link";
import TypingJerboaLogo from "../images/TypingJerboaLogoWhiteKB.png";

export default function About() {
  return (
    <article>
      <h1>About TypingJerboa</h1>
      <br/>
      <p>TypingJerboa is a website built for the purpose of teaching others how to type in a language that uses a unique script. Currently it supports Latin English and Russian Cyrillic.</p>
      <br/>
      <p>There are two main modes offered in TypingJerboa: <Link href="/learn" className="underline">Learn</Link>, and <Link href="/race" className="underline">Race</Link>.</p>
      <br/>
      <p>The Learn section focuses on teaching a user where the characters for the selected language are located on the keyboard over many practice lessons. These lessons build on each other so that by the end, users will have the muscle memory to type just about anything in the selected language.</p>
      <br/>
      <p>The Race section puts a users current typing ability to the test by requiring them to type out an entire paragraph in the selected language as quickly as possible. The words per minute and mistakes are displayed at the end of the race.</p>
      <br/>
      <p>If you&apos;d like to keep track of your progress, it is possible and encouraged to <Link href="/register" className="underline">register</Link> a completely free account, with no email necessary.</p>
      <br/>
      <a target="_blank" href="https://github.com/DanielGroelle/TypingJerboa" className="underline flex">
        <img className="bg-white mr-1" width="24" alt="GitHub Logo" src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/GitHub_Invertocat_Logo.svg/256px-GitHub_Invertocat_Logo.svg.png"></img>
        TypingJerboa GitHub
      </a>

      <Image src={TypingJerboaLogo} alt=""></Image>
      <p>The jerboa is the website&apos;s mascot. Learn more <a target="_blank" href="https://en.wikipedia.org/wiki/Jerboa" className="underline">here.</a></p>
    </article>
  );
}