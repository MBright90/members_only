/* eslint-disable no-undef */
const { addUserToDatabase } = require("../../controllers/userController");
const prisma = require("../../config/database");

jest.mock("../../config/database");

describe("addUserToDatabase", () => {
  let consoleSpy, req, res;

  beforeAll(() => {
    consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});
  });

  beforeEach(() => {
    req = {
      body: {
        username: "testUser",
        password: "password123",
        email: "test@example.com",
      },
    };

    res = {
      redirect: jest.fn(),
      status: jest.fn().mockReturnThis(),
      render: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("adds a new user and redirects to /log-in", async () => {
    prisma.user.create.mockResolvedValueOnce({
      id: 1,
      username: "testUser",
    });

    await addUserToDatabase(req, res);

    expect(prisma.user.create).toHaveBeenCalledWith({
      data: {
        username: "testUser",
        email: "test@example.com",
        salt: expect.any(String),
        hash: expect.any(String),
      },
    });
    expect(res.redirect).toHaveBeenCalledWith("/log-in");
  });

  it("responds with a status code 500 and renders error screen on Primsa error", async () => {
    const error = new Error("test_error");
    prisma.user.create.mockRejectedValueOnce(error);

    await addUserToDatabase(req, res);

    expect(consoleSpy).toHaveBeenCalledWith(
      `Error adding user to database: ${error}`,
    );
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.render).toHaveBeenCalledWith("/errors/error", {
      errMsg: ["Error adding user to database"],
    });
  });

  it("responds with a status code 500 and renders error on duplicate user creation", async () => {
    const error = new Error(
      "Unique constraint failed on the fields: (`username`, `email`)",
    );
    error.code = "p2002";
    prisma.user.create.mockRejectedValueOnce(error);

    await addUserToDatabase(req, res);

    expect(consoleSpy).toHaveBeenCalledWith(
      `Error adding user to database: ${error}`,
    );
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.render).toHaveBeenCalledWith("/errors/error", {
      errMsg: ["Error adding user to database"],
    });
  });
});
