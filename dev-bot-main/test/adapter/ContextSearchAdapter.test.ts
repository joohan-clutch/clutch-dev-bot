import { expect } from "chai";
import { githubAdapter } from "../../src/adapter/GithubAdapter";
import { contextSearchAdapter } from "../../src/adapter/ContextSearchAdapter";

describe("ContextSearchAdapter", () => {
  // it("should search the similar bug report", async function () {
  //   this.timeout(60000);
  //   try {
  //     const exampleBugReport: string =
  //       "New Bug Report\n" + "From:\n" + "Details and possible workaround:";
  //
  //     const response = await contextSearchAdapter.search(exampleBugReport);
  //
  //     expect(response.related_reports).not.null;
  //   } catch (error) {
  //     console.error("Process failed:", error);
  //   }
  // });
  //
  // it("should be able to ingest slack messages to local json", async function () {
  //   this.timeout(60000);
  //   try {
  //     const response = await contextSearchAdapter.ingestSlackToJson([
  //       new Date(Date.now() - 24 * 60 * 60 * 1000), // yesterday
  //       new Date(), // today
  //     ]);
  //     expect(response.status).eq(200);
  //   } catch (error) {
  //     console.error("Process failed:", error);
  //   }
  // });
  //
  // it("should be able to ingest local json to vector store", async function () {
  //   this.timeout(60000);
  //   try {
  //     const response = await contextSearchAdapter.ingestJsonToVectorStore([
  //       new Date(Date.now() - 24 * 60 * 60 * 1000), // yesterday
  //       new Date(), // today
  //     ]);
  //     expect(response.status).eq(200);
  //   } catch (error) {
  //     console.error("Process failed:", error);
  //   }
  // });
});
