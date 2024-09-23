"use client"

import React, { FormEvent, useEffect, useState } from "react";
import { z } from "zod";

const Z_NEWSPOST = z.object({
  id: z.number(),
  title: z.string(),
  author: z.string(),
  body: z.string(),
  postDate: z.string(),
  tags: z.array(z.string())
});
type NewsPost = z.infer<typeof Z_NEWSPOST>;

const Z_RESPONSE = z.object({
  newsPosts: z.array(Z_NEWSPOST)
});

async function getNewsPosts() {
  let response;
  try {
    response = Z_RESPONSE.parse(await (await fetch(`/api/news`, {
      method: "GET",
      mode: "cors",
      cache: "default"
    })).json());
  }
  catch(e: unknown) {
    console.log(e);
    throw "getNewsPosts failed";
  }

  return response.newsPosts;
}

export default function ClientAdminNews() {
  const [newsPosts, setNewsPosts] = useState<NewsPost[]>([]);
  const [adding, setAdding] = useState(false);
  const [newsPostEditing, setNewsPostEditing] = useState<number | null>(null);

  useEffect(()=>{
    void (async ()=>setNewsPosts(await getNewsPosts()))();
  },[]);

  function handleAdd(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const titleSelector = document.querySelector("#title-input");
    const authorSelector = document.querySelector("#author-input");
    const bodySelector = document.querySelector("#body-input");
    const tagsSelector = document.querySelector("#tags-input");
    if (!(titleSelector instanceof HTMLInputElement) ||
        !(authorSelector instanceof HTMLInputElement) ||
        !(bodySelector instanceof HTMLTextAreaElement) ||
        !(tagsSelector instanceof HTMLInputElement)
    ) {
      throw "Selected elements [titleSelector, authorSelector, bodySelector, tagsSelector] were of unexpected type";
    }

    const title = titleSelector.value;
    const author = authorSelector.value;
    const body = bodySelector.value;
    const tags = tagsSelector.value;

    void (async ()=>{
      try{
        const response = Z_NEWSPOST.parse(await(await fetch(`/api/admin/news`, {
          method: "POST",
          body: JSON.stringify({
            title,
            author,
            body,
            tags: [tags]
          }),
          mode: "cors",
          cache: "default"
        })).json());

        //rerender edits
        setNewsPosts([response, ...newsPosts]);
        setAdding(false);
      }
      catch(e: unknown) {
        console.error("NewsPost add failed", e);
      }
    })();
  }

  function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const titleSelector = document.querySelector("#title-input");
    const authorSelector = document.querySelector("#author-input");
    const bodySelector = document.querySelector("#body-input");
    const tagsSelector = document.querySelector("#tags-input");
    if (!(titleSelector instanceof HTMLInputElement) ||
        !(authorSelector instanceof HTMLInputElement) ||
        !(bodySelector instanceof HTMLTextAreaElement) ||
        !(tagsSelector instanceof HTMLInputElement)
    ) {
      throw "Selected elements [titleSelector, authorSelector, bodySelector, tagsSelector] were of unexpected type";
    }

    const title = titleSelector.value;
    const author = authorSelector.value;
    const body = bodySelector.value;
    const tags = tagsSelector.value;

    void (async ()=>{
      try{
        const response = Z_NEWSPOST.parse(await(await fetch(`/api/admin/news/edit`, {
          method: "POST",
          body: JSON.stringify({
            id: newsPostEditing,
            title,
            author,
            body,
            tags: [tags]
          }),
          mode: "cors",
          cache: "default"
        })).json());

        //rerender edits
        const newsPostIndex = newsPosts.findIndex((newsPost)=>newsPost.id === response.id);
        newsPosts[newsPostIndex] = response;

        setNewsPosts([...newsPosts]);
      }
      catch(e: unknown) {
        throw "Edit failed";
      }
    })();
    
    setNewsPostEditing(null);
  }

  function handleDelete(newsPostId: number) {
    void (async ()=>{
      try{
        await fetch(`/api/admin/news`, {
          method: "DELETE",
          body: JSON.stringify({
            id: newsPostId
          }),
          mode: "cors",
          cache: "default"
        });
      }
      catch(e: unknown) {
        throw "Delete failed";
      }
    })();
  
    const i = newsPosts.findIndex((newsPost)=>newsPost.id === newsPostId);
    const newNewsPosts = newsPosts.toSpliced(i, 1);

    setNewsPosts([...newNewsPosts]);
  }

  return (
    <div>
      <h1>Posts</h1>
      <br/>
      <input type="button" className="border-solid border-blue-600 border rounded-lg p-2 mr-2" onClick={()=>setAdding(true)} value="Create News Post" />
      <br/><br/>
      {
        adding ?
        <div className="border-solid border-green-700 border" key="adding">
        <form onSubmit={handleAdd}>
            <div className="flex">
              <span>title:</span>
              <input type="text" id="title-input" className="w-full" /><br/>
            </div>
            <div className="flex">
              <span>author:</span>
              <input type="text" id="author-input" className="w-full"/><br/>
            </div>
            <div className="flex">
              <span>body:</span>
              <textarea id="body-input" className="w-full resize-none"></textarea><br/>
            </div>
            <div className="flex">
              <span>tags:</span>
              <input type="text" id="tags-input" className="w-full"/><br/>
            </div>
            <div>
              <input type="button" className="border-solid border-gray-200 border-2 rounded-lg p-2" onClick={()=>setAdding(false)} value="Cancel" />
              <input type="submit" className="border-solid border-green-700 border-2 rounded-lg p-2" value="Add" />
            </div>
          </form>
        </div>
        :
        ""
      }
      {newsPosts.map((newsPost)=>
        <div className="border-solid border-white border" key={newsPost.id}>
        {
          //if theres a newsPost we're editing, display a form to change values
          newsPostEditing === newsPost.id ?
          <form onSubmit={handleSave}>
            id: {newsPost.id}<br/>
            <div className="flex">
              <span>title:</span>
              <input type="text" id="title-input" className="w-full" defaultValue={newsPost.title}/><br/>
            </div>
            <div className="flex">
              <span>author:</span>
              <input type="text" id="author-input" className="w-full" defaultValue={newsPost.author}/><br/>
            </div>
            <div className="flex">
              <span>body:</span>
              <textarea id="body-input" className="w-full resize-none" defaultValue={newsPost.body}></textarea><br/>
            </div>
            <div className="flex">
              <span>tags:</span>
              <input type="text" id="tags-input" className="w-full" defaultValue={newsPost.tags}/><br/>
            </div>
            <div className="flex justify-between">
              <div>
                <input type="button" className="border-solid border-gray-200 border-2 rounded-lg p-2" onClick={()=>setNewsPostEditing(null)} value="Cancel" />
                <input type="submit" className="border-solid border-green-700 border-2 rounded-lg p-2" value="Save" />
              </div>
              <input type="button" className="border-solid border-red-700 border-2 rounded-lg p-2" onClick={()=>handleDelete(newsPost.id)} value="X" />
            </div>
          </form>
          :
          //if we're not editing, display the newsPost data normally
          <>
            <div>
              id: {newsPost.id}<br/>
              title: {newsPost.title}<br/>
              author: {newsPost.author}<br/>
              tags: {newsPost.tags}<br/>
              postDate: {newsPost.postDate}<br/>
              body: {newsPost.body}<br/>
            </div>
            <div className="flex justify-between">
              <input type="button" className="border-solid border-green-700 border-2 rounded-lg p-2" onClick={()=>setNewsPostEditing(newsPost.id)} value="Edit" />
              <input type="button" className="border-solid border-red-700 border-2 rounded-lg p-2" onClick={()=>handleDelete(newsPost.id)} value="X" />
            </div>
          </>
        }
        </div>
      )}
      {newsPosts.length === 0 ? "Nobody here but us chickens!" : ""}
    </div>
  );
}