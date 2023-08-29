import { login } from "../../controllers/auth";
import { pool } from "../../db";
import bcrypt from "bcrypt";

jest.mock("pg");
jest.mock("bcrypt");

bcrypt.compare = jest.fn().mockResolvedValue(false);

describe("login controller", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return 400 if the email does not exist", async () => {
    pool.query = jest.fn().mockResolvedValue({
      rows: [],
      rowCount: 0,
    });

    const req = {
      body: {
        email: "fake.email@tangerine.ca",
        password: "incorrect-password",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Invalid email" });
  });

  it("should return 400 if the password is incorrect", async () => {
    pool.query = jest.fn().mockResolvedValue({
      rows: [
        {
          email: "real.email@tangerine.ca",
          password: "password",
        },
      ],
      rowCount: 1,
    });

    // Change the value for the bcrypt.compare() mock value only for this test to true
    bcrypt.compare.mockResolvedValueOnce(false);

    const req = {
      body: {
        email: "real.email@tangerine.ca",
        password: "password",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Invalid password" });
  });
});
