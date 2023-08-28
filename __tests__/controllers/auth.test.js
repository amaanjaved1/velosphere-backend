import { register } from "../../controllers/auth";
import { pool } from "../../db";
import bcrypt from "bcrypt";

jest.mock("pg");
jest.mock("bcrypt");

bcrypt.genSalt = jest.fn().mockResolvedValue("some_salt");
bcrypt.hash = jest.fn().mockResolvedValue("hashed_value");

describe("register controller", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return 401 if the user already exists", async () => {
    pool.query = jest.fn().mockResolvedValue({
      rows: [{ email: "test@tangerine.ca" }],
      rowCount: 1,
    });

    const req = {
      body: {
        username: "test123",
        password: "password",
        firstName: "first",
        lastName: "last",
        email: "test@tangerine.ca",
        studentProgram: "Velocity",
        company: "Tangerine",
        internPosition: "Business Systems Analyst",
        educationalInstitution: "Queens University",
        schoolProgram: "Computer Science",
        meInOneSentence: "I like to chill!",
        studentLocation: "Toronto",
        linkedIn: "n/a",
        facebook: "n/a",
        github: "n/a",
        meIn4Tags1: "Food",
        meIn4Tags2: "Soccer",
        meIn4Tags3: "Music",
        meIn4Tags4: "Skating",
        internTeam: "Global Wealth Engineering",
        currentTerm: "S23",
        commEmail: "amaanjaved2004@gmail.com",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await register(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "User already exists" });
  });

  it("should return invalid email adress", async () => {
    pool.query = jest.fn().mockResolvedValue({
      rows: [],
      rowCount: 0,
    });

    const req = {
      body: {
        username: "test123",
        password: "password",
        firstName: "first",
        lastName: "last",
        email: "test@google.ca",
        studentProgram: "Velocity",
        company: "Google",
        internPosition: "Business Systems Analyst",
        educationalInstitution: "Queens University",
        schoolProgram: "Computer Science",
        meInOneSentence: "I like to chill!",
        studentLocation: "Toronto",
        linkedIn: "n/a",
        facebook: "n/a",
        github: "n/a",
        meIn4Tags1: "Food",
        meIn4Tags2: "Soccer",
        meIn4Tags3: "Music",
        meIn4Tags4: "Skating",
        internTeam: "Global Wealth Engineering",
        currentTerm: "S23",
        commEmail: "amaanjaved2004@gmail.com",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await register(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Invalid email" });
  });

  it("should return invalid current term", async () => {
    pool.query = jest.fn().mockResolvedValue({
      rows: [],
      rowCount: 0,
    });

    const req = {
      body: {
        username: "test123",
        password: "password",
        firstName: "first",
        lastName: "last",
        email: "test@tangerine.ca",
        studentProgram: "Velocity",
        company: "Tangerine",
        internPosition: "Business Systems Analyst",
        educationalInstitution: "Queens University",
        schoolProgram: "Computer Science",
        meInOneSentence: "I like to chill!",
        studentLocation: "Toronto",
        linkedIn: "n/a",
        facebook: "n/a",
        github: "n/a",
        meIn4Tags1: "Food",
        meIn4Tags2: "Soccer",
        meIn4Tags3: "Music",
        meIn4Tags4: "Skating",
        internTeam: "Global Wealth Engineering",
        currentTerm: "S233",
        commEmail: "amaanjaved2004@gmail.com",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await register(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Invalid current term" });
  });

  it("should register a user successfully", async () => {
    // Mock pool.query to simulate that the user does not already exist
    pool.query.mockResolvedValueOnce({
      rows: [],
      rowCount: 0,
    });

    // Mock bcrypt functions
    bcrypt.genSalt.mockResolvedValueOnce("some_salt");
    bcrypt.hash.mockResolvedValueOnce("hashed_password");

    // Valid request payload
    const req = {
      body: {
        username: "test123",
        password: "password",
        firstName: "first",
        lastName: "last",
        email: "test@tangerine.ca",
        studentProgram: "Velocity",
        company: "Tangerine",
        internPosition: "Business Systems Analyst",
        educationalInstitution: "Queens University",
        schoolProgram: "Computer Science",
        meInOneSentence: "I like to chill!",
        studentLocation: "Toronto",
        linkedIn: "n/a",
        facebook: "n/a",
        github: "n/a",
        meIn4Tags1: "Food",
        meIn4Tags2: "Soccer",
        meIn4Tags3: "Music",
        meIn4Tags4: "Skating",
        internTeam: "Global Wealth Engineering",
        currentTerm: "S23",
        commEmail: "amaanjaved2004@gmail.com",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await register(req, res);

    // Expectations
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: "User succesfully registered. Happy networking!",
    });
  });
});
