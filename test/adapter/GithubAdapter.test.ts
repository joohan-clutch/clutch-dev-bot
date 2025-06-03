import { expect } from "chai";
import { githubAdapter } from "../../src/adapter/GithubAdapter";

describe("GithubAdapter", () => {
  it("should run a test", async () => {
    try {
      const response = await githubAdapter.dispatchAction("sanity_test.yml", {
        team: "delorean",
      });
      console.log("response.data", response.data);
      expect(response.status).to.equal(204);
    } catch (error) {
      console.error("Process failed:", error);
    }
  });
});
