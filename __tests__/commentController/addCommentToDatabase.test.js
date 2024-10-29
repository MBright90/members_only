/* eslint-disable no-undef */
const { addCommentToDatabase } = require("../../controllers/commentController");
const prisma = require("../../config/database");

jest.mock("../../config/database");

describe("addCommentToDatabase", () => {
  let req, res;

  beforeAll(() => {
    consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});
  });

  beforeEach(() => {
    req = {
      user: {
        id: 200,
      },
      body: {
        content: "message content",
        postId: 100,
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

  it("adds a new user and redirects to the posts address", async () => {
    prisma.comment.create.mockResolvedValueOnce({
      id: 10,
      content: "message content",
    });

    await addCommentToDatabase(req, res);

    expect(prisma.comment.create).toHaveBeenCalledWith({
      data: {
        content: "message content",
        postId: 100,
        authorId: 200,
      },
    });
    expect(res.redirect).toHaveBeenCalledWith("/posts/100");
  });

  it("responds with a status code 500 and renders error screen on Prisma error", async () => {
    prisma.comment.create.mockRejectedValueOnce(new Error("Database error"));

    await addCommentToDatabase(req, res);

    expect(prisma.comment.create).toHaveBeenCalledWith({
      data: {
        content: "message content",
        postId: 100,
        authorId: 200,
      },
    });
    expect(consoleSpy).toHaveBeenCalledWith(
      "Error uploading comment: Error: Database error",
    );
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.render).toHaveBeenCalledWith("/errors/error", {
      user: req.user,
      errMsg: ["Error adding comment", "Please try again later"],
    });
  });

  it("responds with a status code 500 and renders error screen on invalid post id", async () => {
    req.body.postId = "invalid123";

    await addCommentToDatabase(req, res);

    expect(consoleSpy).toHaveBeenCalledWith(
      `Error uploading comment: Error: Invalid postId`,
    );
    expect(prisma.comment.create).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.render).toHaveBeenCalledWith("/errors/error", {
      user: req.user,
      errMsg: ["Error adding comment", "Please try again later"],
    });
  });
});
