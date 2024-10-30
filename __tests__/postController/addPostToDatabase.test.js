/* eslint-disable no-undef */
const { addPostToDatabase } = require("../../controllers/postController");
const prisma = require("../../config/database");
const { beforeEach } = require("@jest/globals");

jest.mock("../../config/database");

describe("addPostToDatabase", () => {
  let req, res;

  beforeAll(() => {
    consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});
  });

  beforeEach(() => {
    req = {
      user: { id: 1 },
      body: {
        title: "testTitle",
        content: "testContent",
        authorId: 1,
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

  it("adds a new post and redirects to posts", async () => {
    prisma.post.create.mockResolvedValue({ id: 201 });

    await addPostToDatabase(req, res);

    expect(prisma.post.create).toHaveBeenCalledWith({
      data: {
        title: "testTitle",
        content: "testContent",
        authorId: 1,
      },
    });
    expect(res.redirect).toHaveBeenCalledWith("/posts");
  });

  it("responds with status 500 and throws an exception on prisma error", async () => {
    prisma.post.create.mockRejectedValue(new Error("Database error"));

    await addPostToDatabase(req, res);

    expect(prisma.post.create).toHaveBeenCalledWith({
      data: {
        title: "testTitle",
        content: "testContent",
        authorId: 1,
      },
    });
    expect(consoleSpy).toHaveBeenCalledWith(
      "Error uploading post: Error: Database error",
    );
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.render).toHaveBeenCalledWith("/errors/error", {
      user: req.user,
      errMsg: ["Error adding post to database", "Please try again later"],
    });
  });
});
