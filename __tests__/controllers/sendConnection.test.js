import { sendConnection } from "../../controllers/profile";
import { pool } from "../../db";
import { connectionStatus } from "../../controllers/cstate";

jest.mock("pg");

jest.mock("../../controllers/cstate", () => ({
  connectionStatus: jest.fn(),
}));

describe("sendConnection controller", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return 401 if the user sends themselves a connection request", async () => {
    pool.query = jest.fn().mockResolvedValue({
      rows: [{ email: "fake.intern@tangerine.ca" }], // indicate that a user with this email exists
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

    await sendConnection(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "Cannot connect with yourself",
    });
  });

  it("should return 401 if the user does not exist", async () => {
    pool.query = jest.fn().mockResolvedValue({
      rows: [], // indicate that a user with this email exists
      rowCount: 0,
    });

    const req = {
      body: {
        actionFrom: "fake.intern@tangerine.ca",
      },
      params: {
        email: "otherfake.intern@tangerine.ca",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await sendConnection(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "User does not exist",
    });
  });

  it("should return 200 if the connection is sent", async () => {
    pool.query = jest.fn().mockResolvedValue({
      rows: [{ email: "fake.intern@tangerine.ca" }], // indicate that a user with this email exists
      rowCount: 1,
    });

    connectionStatus.mockResolvedValue(["pending", "fake.intern@tangerine.ca"]);

    const req = {
      body: {
        actionFrom: "fake.intern@tangerine.ca",
      },
      params: {
        email: "otherfake.intern@tangerine.ca",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await sendConnection(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "Connection already exists",
    });
  });
});
