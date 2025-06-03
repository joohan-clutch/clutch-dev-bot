import { confluenceService } from "../../src/service/ConfluenceService";
import { expect } from "chai";

describe("ConfluenceService", () => {
  it("should get on call schedule", async () => {
    const onCallSchedule = await confluenceService.getOnCallSchedule();
    expect(onCallSchedule.length).to.be.greaterThan(0);
    expect(onCallSchedule[0].name).to.be.a("string");
    expect(onCallSchedule[0].startDate).to.be.a("Date");
    expect(onCallSchedule[0].endDate).to.be.a("Date");
  });
});
