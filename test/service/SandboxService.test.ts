import { describe } from "node:test";
import { SandboxService } from "../../src/service/SandboxService";
import chai, { expect } from "chai";
import { AppDataSource } from "../../src/AppDataSource";
import chaiAsPromised from "chai-as-promised";

chai.use(chaiAsPromised);

describe("Create, Delete, Book, Cancel sandbox", () => {
  let service: SandboxService;
  const SANDBOX_NAME = "Test1";
  const SANDBOX_USER = "user1";
  const BOOK_FOR_IN_MS = 2 * 3600 * 1000; // 2 hours
  before(async () => {
    await AppDataSource.initialize();
    service = new SandboxService();

    await service.removeSandbox(SANDBOX_NAME);
  });

  it("Should add and delete a sandbox", async () => {
    const createdSandbox = await service.addSandbox(SANDBOX_NAME);
    expect(createdSandbox.name).to.equal(
      SANDBOX_NAME,
      "Failed to create a sandbox"
    );

    const sandboxes = await service.getSandboxes(0, 50);
    expect(sandboxes.map((sandbox) => sandbox.name)).to.include(
      SANDBOX_NAME,
      "Created sandbox does not show up on the listing"
    );

    const bookingResult = await service.bookSandbox(
      SANDBOX_NAME,
      SANDBOX_USER,
      BOOK_FOR_IN_MS
    );
    expect(bookingResult.name).to.equal(SANDBOX_NAME);
    expect(bookingResult.bookedBy).to.equal(SANDBOX_USER);
    expect(bookingResult.bookedUntil?.getTime()).to.approximately(
      Date.now() + BOOK_FOR_IN_MS,
      60 * 1000,
      "The booking time is not correct"
    );

    const cancelResult = await service.cancelBookingSandbox(SANDBOX_NAME);
    expect(cancelResult.name).to.equal(SANDBOX_NAME);
    expect(cancelResult.bookedBy).to.equal(null);
    expect(cancelResult.bookedUntil).to.equal(
      null,
      "The booking is not canceled"
    );

    const deleteResult = await service.removeSandbox(SANDBOX_NAME);
    expect(deleteResult.affected).to.equal(1);
  });

  it("Should handle double booking", async () => {
    await service.addSandbox(SANDBOX_NAME);
    await service.bookSandbox(SANDBOX_NAME, SANDBOX_USER, BOOK_FOR_IN_MS);
    expect(
      service.bookSandbox(SANDBOX_NAME, SANDBOX_USER, BOOK_FOR_IN_MS)
    ).to.be.rejectedWith(
      `${SANDBOX_NAME} is already booked by <@${SANDBOX_USER}>.`
    );

    await service.removeSandbox(SANDBOX_NAME);
  });

  it("Should fail to create multiple sandboxes with the same name", async () => {
    const createdSandbox = await service.addSandbox(SANDBOX_NAME);
    expect(createdSandbox.name).to.equal(SANDBOX_NAME);
    expect(service.addSandbox(SANDBOX_NAME)).to.be.rejectedWith(
      `The sandbox: ${SANDBOX_NAME} already exists.`
    );
    await service.removeSandbox(SANDBOX_NAME);
  });

  it("Should failed to book not existing sandbox", async () => {
    expect(
      service.bookSandbox(SANDBOX_NAME, SANDBOX_USER, BOOK_FOR_IN_MS)
    ).to.be.rejectedWith(`The sandbox: ${SANDBOX_NAME} does not exist.`);

    await service.removeSandbox(SANDBOX_NAME);
  });
});
