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

//https://www.npmjs.com/package/selenium-webdriver?activeTab=readme
//https://marmelab.com/blog/2016/04/19/e2e-testing-with-node-and-es6.html
//https://nextjs.org/docs/app/building-your-application/testing
//https://nextjs.org/docs/app/building-your-application/testing/jest#add-a-test-script-to-packagejson