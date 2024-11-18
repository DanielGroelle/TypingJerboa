"use client"

import React, { useEffect, useState } from "react";
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
    console.error(e);
    throw "getNewsPosts failed";
  }

  return response.newsPosts;
}

export default function ClientNews({AdminLink}: {AdminLink: React.ReactElement | null}) {
  const [newsPosts, setNewsPosts] = useState<NewsPost[]>([]);

  useEffect(()=>{
    void (async ()=>setNewsPosts(await getNewsPosts()))();
  },[]);

  return (
    <div>
      {AdminLink}
      <h1>Posts</h1>
      {newsPosts.map((newsPost)=> 
        <div className="m-6" key={newsPost.id}>
          <h2 className="text-xl underline">{newsPost.title}</h2>
          <p className="text-sm">Posted: {new Date(newsPost.postDate).toDateString()}</p>
          <p className="text-sm">Author: {newsPost.author}</p>
          <p className="text-sm">Tags: {newsPost.tags.join(", ")}</p>
          <p className="mt-1">{newsPost.body}</p>
        </div>
      )}
      <p>{newsPosts.length === 0 ? "Nobody here but us chickens!" : ""}</p>
    </div>
  );
}