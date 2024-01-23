import "@testing-library/jest-dom";

import prisma from "../lib/prisma";
// import { render, screen } from "@testing-library/react";
// import Home from "../app/page";

describe("Home page", ()=> {
  test("Rendered properly", async ()=>{
    console.log("hiiii");
    
    // await prisma.user.create({
    //   data: {
    //     username: "hi",
    //     password: "a"
    //   }
    // })

    let a = await prisma.user.findMany({
      select: {
        id: true
      }
    });

    console.log(a);

    expect(1).toEqual(1);
    // render(<Home />);

    // const learn = screen.getByText("Learn");

    // expect(learn).toBeInTheDocument();
  });
});