import { connectionStatus } from "../../controllers/cstate"; // Import your function from the correct path
import { pool } from "../../db";

jest.mock("pg");

describe("connectionStatus controller", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return ["not connected", false] if no connections exist', async () => {
    pool.query = jest.fn().mockResolvedValue({ rows: [], rowCount: 0 });

    const req = {
      body: {
        actionFrom: "fake.intern@tangerine.ca",
      },
      params: {
        email: "fake.intern@tangerine.ca",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const result = await connectionStatus(req, res, "user1", "user2");

    expect(result).toStrictEqual(["not connected", false]);
  });

  it("should return the connection status and result if a connection exists - connection status is pending", async () => {
    pool.query = jest.fn().mockResolvedValue({
      rows: [{ cstate: "pending", sentby: "fake.intern@tangerine.ca" }],
      rowCount: 1,
    });

    const req = {
      body: {
        actionFrom: "fake.intern@tangerine.ca",
      },
      params: {
        email: "fake.intern@tangerine.ca",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const result = await connectionStatus(req, res, "user1", "user2");

    expect(result).toStrictEqual(["pending", "fake.intern@tangerine.ca"]);
  });

  it("should return the connection status and result if a connection exists - connection status is accepted", async () => {
    pool.query = jest.fn().mockResolvedValue({
      rows: [{ cstate: "accepted", sentby: "fake.intern@tangerine.ca" }],
      rowCount: 1,
    });

    const req = {
      body: {
        actionFrom: "fake.intern@tangerine.ca",
      },
      params: {
        email: "fake.intern@tangerine.ca",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const result = await connectionStatus(req, res, "user1", "user2");

    expect(result).toStrictEqual(["accepted", "fake.intern@tangerine.ca"]);
  });
});
