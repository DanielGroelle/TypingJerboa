"use client"

import React, { FormEvent, useEffect, useState } from "react";
import { z } from "zod";
import FilterOptionsComponent from "../FilterOptionsComponent";
import ItemCardComponent from "../ItemCardComponent";

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
  const [viewPage, setViewPage] = useState(1);
  const newsPostsPerPage = 25;

  const [newNewsPost, setNewNewsPost] = useState<Omit<NewsPost, "id" | "postDate"> | null>(null);

  useEffect(()=>{
    void (async ()=>setNewsPosts(await getNewsPosts()))();
  },[]);

  function handleAdd(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    void (async ()=>{
      try {
        const response = Z_NEWSPOST.parse(await(await fetch(`/api/admin/news`, {
          method: "POST",
          body: JSON.stringify(newNewsPost),
          mode: "cors",
          cache: "default"
        })).json());

        //rerender edits
        setNewsPosts([response, ...newsPosts]);
        setNewNewsPost(null);
      }
      catch(e: unknown) {
        console.error("NewsPost add failed", e);
      }
    })();
  }

  function handleSave(editNewsPost: NewsPost) {
    void (async ()=>{
      try {
        const response = Z_NEWSPOST.parse(await(await fetch(`/api/admin/news/edit`, {
          method: "POST",
          body: JSON.stringify({...editNewsPost, tags: [...editNewsPost.tags]}),
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
  }

  function handleDelete(newsPostId: number) {
    void (async ()=>{
      try {
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

  const refFilteredNewsPosts: {items: NewsPost[]} = {items: []};
  const filterOptionsComponent = FilterOptionsComponent<NewsPost>({
    items: newsPosts,
    refFilteredItems: refFilteredNewsPosts,
    selectFilters: {},
    filters: {
      "id": { getter: (newsPost: NewsPost) => newsPost.id },
      "postDate": { getter: (newsPost: NewsPost) => newsPost.postDate },
      "title": { getter: (newsPost: NewsPost) => newsPost.title },
      // "tags": { getter: (newsPost: NewsPost) => newsPost.tags },
      "body": { getter: (newsPost: NewsPost) => newsPost.body }
    },
    setViewPage: setViewPage,
    deleteManyItems: null
  });

  return (
    <div className="flex flex-col overflow-y-hidden" style={{height: "85vh"}}>
      {filterOptionsComponent}

      <div>
        <input type="button" className="border-solid border-blue-600 border rounded-lg p-2 mr-2" onClick={()=>setNewNewsPost(newNewsPost ? null : {
          title: "",
          author: "",
          body: "",
          tags: []
        })} value="Add News Post" />
      </div>

      <div className="flex justify-between">
        <h1>News Posts</h1>
        <div className="flex mr-10">
          <p className="leading-10">Page:</p>
          <select onChange={(e: React.ChangeEvent<HTMLSelectElement>)=>{setViewPage(Number(e.target.value))}} value={viewPage} id="page-select">
            {Array.from(Array(Math.ceil(refFilteredNewsPosts.items.length / newsPostsPerPage))).map((_, i)=>{
              return <option key={i + 1}>{i + 1}</option>
            })}
          </select>
        </div>
      </div>

      {
        newNewsPost ?
        <div className="border-solid border-green-700 border">
        <form onSubmit={handleAdd}>
            <div className="flex">
              <span>title:</span>
              <input type="text" id="title-input" className="w-full" onChange={(e: React.ChangeEvent<HTMLInputElement>)=>{
                setNewNewsPost({...newNewsPost, title: e.target.value});
              }}/><br/>
            </div>
            <div className="flex">
              <span>author:</span>
              <input type="text" id="author-input" className="w-full" onChange={(e: React.ChangeEvent<HTMLInputElement>)=>{
                setNewNewsPost({...newNewsPost, author: e.target.value});
              }}/><br/>
            </div>
            <div className="flex">
              <span>tags:</span>
              <input type="text" id="tags-input" className="w-full" onChange={(e: React.ChangeEvent<HTMLInputElement>)=>{
                setNewNewsPost({...newNewsPost, tags: [e.target.value]});
              }}/><br/>
            </div>
            <div className="flex">
              <span>body:</span>
              <textarea id="body-input" className="w-full resize-none" onChange={(e: React.ChangeEvent<HTMLTextAreaElement>)=>{
                setNewNewsPost({...newNewsPost, body: e.target.value});
              }}></textarea><br/>
            </div>
            <div>
              <input type="button" className="border-solid border-gray-200 border-2 rounded-lg p-2" onClick={()=>setNewNewsPost(null)} value="Cancel" />
              <input type="submit" className="border-solid border-green-700 border-2 rounded-lg p-2" value="Add" />
            </div>
          </form>
        </div>
        :
        ""
      }
      <div className="flex flex-col overflow-y-auto">
        {refFilteredNewsPosts.items.slice(viewPage * newsPostsPerPage - newsPostsPerPage, viewPage * newsPostsPerPage).map((newsPost)=>
          (
            <ItemCardComponent
              item={newsPost}
              itemFields={{
                "id": {getter: (newsPost: NewsPost) => newsPost.id, editType: null, options: null},
                "title": {getter: (newsPost: NewsPost) => newsPost.title, editType: "text", options: null},
                "author": {getter: (newsPost: NewsPost) => newsPost.author, editType: "text", options: null},
                "tags": {getter: (newsPost: NewsPost) => newsPost.tags, editType: "array", options: null},
                "postDate": {getter: (newsPost: NewsPost) => newsPost.postDate, editType: null, options: null},
                "body": {getter: (newsPost: NewsPost) => newsPost.body, editType: "textarea", options: null}
              }}
              editParams={{
                items: newsPosts,
                setItems: setNewsPosts,
                saveItem: handleSave
              }}
              deleteItem={handleDelete}
              key={newsPost.id}
            />
          )
        )}
      </div>
      {refFilteredNewsPosts.items.length === 0 ? "Nobody here but us chickens!" : ""}
    </div>
  );
}