/* eslint-disable no-undef */
const { getPostWithComments } = require("../../controllers/postController");
const prisma = require("../../config/database");

jest.mock("../../config/database");
jest.mock("../../lib/timeUtils");

describe("getPostWithComments", () => {
  let req, res;

  beforeAll(() => {
    consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});
  });

  beforeEach(() => {
    req = {
      user: {
        id: 101,
      },
      params: {
        postId: 201,
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      render: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders a single, specific post with related comments when passed a valid postId", async () => {
    const mockPost = {
      id: 201,
      title: "testTitle",
      content: "testContent",
      createdAt: new Date(),
      author: {
        id: 301,
        username: "testUsername",
      },
      comments: [
        {
          id: 401,
          content: "testCommentContent",
          createdAt: new Date(),
          author: {
            id: 501,
            username: "testCommentUsername",
          },
        },
      ],
    };
    prisma.post.findFirst.mockResolvedValueOnce(mockPost);

    await getPostWithComments(req, res);

    expect(prisma.post.findFirst).toHaveBeenCalledWith({
      where: {
        id: 201,
      },
      include: {
        comments: {
          include: {
            author: {
              select: {
                id: true,
                username: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        author: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });
    expect(res.render).toHaveBeenCalledWith("post", {
      user: req.user,
      post: {
        id: 201,
        title: "testTitle",
        content: "testContent",
        createdAt: expect.any(Date),
        createdAgo: "Formatted time",
        author: {
          id: 301,
          username: "testUsername",
        },
        comments: [
          {
            id: 401,
            content: "testCommentContent",
            createdAt: expect.any(Date),
            createdAgo: "Formatted time",
            author: {
              id: 501,
              username: "testCommentUsername",
            },
          },
        ],
      },
    });
  });

  it("renders a single, specific post which has no comments when passed a valid postId", async () => {
    const mockPost = {
      id: 201,
      title: "testTitle",
      content: "testContent",
      createdAt: new Date(),
      author: {
        id: 301,
        username: "testUsername",
      },
      comments: [],
    };
    prisma.post.findFirst.mockResolvedValueOnce(mockPost);

    await getPostWithComments(req, res);

    expect(prisma.post.findFirst).toHaveBeenCalledWith({
      where: {
        id: 201,
      },
      include: {
        comments: {
          include: {
            author: {
              select: {
                id: true,
                username: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        author: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });
    expect(res.render).toHaveBeenCalledWith("post", {
      user: req.user,
      post: {
        id: 201,
        title: "testTitle",
        content: "testContent",
        createdAt: expect.any(Date),
        createdAgo: "Formatted time",
        author: {
          id: 301,
          username: "testUsername",
        },
        comments: [],
      },
    });
  });

  it("returns status 500, renders error page and logs on database error", async () => {
    const mockError = new Error("Database error");
    prisma.post.findFirst.mockRejectedValue(mockError);

    await getPostWithComments(req, res);

    expect(prisma.post.findFirst).toHaveBeenCalledWith({
      where: {
        id: 201,
      },
      include: {
        comments: {
          include: {
            author: {
              select: {
                id: true,
                username: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        author: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });
    expect(consoleSpy).toHaveBeenCalledWith(
      "Error retrieving post with comments: Error: Database error",
    );
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.render).toHaveBeenCalledWith("/errors/error", {
      user: req.user,
      errMsg: ["Could not retrieve post"],
    });
  });

  it("returns status 500, renders error page and logs on invalid postId", async () => {
    req.params.postId = "invalid";

    await getPostWithComments(req, res);

    expect(prisma.post.findFirst).not.toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith(
      "Error retrieving post with comments: Error: Invalid postId",
    );
    expect(res.render).toHaveBeenCalledWith("/errors/error", {
      user: req.user,
      errMsg: ["Could not retrieve post"],
    });
  });
});
