import { acceptConnection } from "../../controllers/profile";
import { pool } from "../../db";
import { connectionStatus } from "../../controllers/cstate";

jest.mock("pg");

jest.mock("../../controllers/cstate", () => ({
  connectionStatus: jest.fn(),
}));

describe("acceptConnection controller", () => {
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

    await acceptConnection(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "Cannot add yourself",
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

    await acceptConnection(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "User does not exist",
    });
  });

  it("should return 401 if the connection does not exist", async () => {
    pool.query = jest.fn().mockResolvedValue({
      rows: [{ email: "fake.intern@tangerine.ca" }], // indicate that a user with this email exists
      rowCount: 1,
    });

    connectionStatus.mockResolvedValue([false, "fake.intern@tangerine.ca"]);

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

    await acceptConnection(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "Connection does not exist",
    });
  });

  it("should return 401 if the connection is already accepted", async () => {
    pool.query = jest.fn().mockResolvedValue({
      rows: [{ email: "fake.intern@tangerine.ca" }], // indicate that a user with this email exists
      rowCount: 1,
    });

    connectionStatus.mockResolvedValue([
      "accepted",
      "fake.intern@tangerine.ca",
    ]);

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

    await acceptConnection(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "Connection is already accepted",
    });
  });

  it("should return 401 if the user tries to accept their own request", async () => {
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

    await acceptConnection(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "Cannot accept your own request",
    });
  });

  it("should return 200 if the connection is removed", async () => {
    // First pool.query call: for checking if the email exists
    pool.query.mockImplementationOnce(() =>
      Promise.resolve({
        rows: [{ email: "fake.intern@tangerine.ca" }], // indicate that a user with this email exists
        rowCount: 1,
      })
    );

    // Second pool.query call: for the actual removal
    pool.query.mockImplementationOnce(() => Promise.resolve());

    // Mock connectionStatus to return specific value
    connectionStatus.mockResolvedValue(["pending", "fake.intern@tangerine.ca"]);

    const req = {
      body: {
        actionFrom: "otherfake.intern@tangerine.ca",
      },
      params: {
        email: "fake.intern@tangerine.ca",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await acceptConnection(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Connection accepted successfully",
    });
  });
});
