/* eslint-disable no-undef */
const { getRecentPosts } = require("../../controllers/postController");
const prisma = require("../../config/database");

jest.mock("../../config/database");
jest.mock("../../lib/timeUtils");

describe("getRecentPosts", () => {
  let req, res;

  beforeAll(() => {
    consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});
  });

  beforeEach(() => {
    req = {
      user: {
        id: 101,
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      render: jest.fn(),
    };
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  it("renders recent posts", async () => {
    const mockPosts = [
      {
        id: 301,
        title: "testTitle",
        content: "testContent",
        createdAt: new Date(),
        author: {
          id: 201,
          username: "testUsername",
        },
      },
    ];

    prisma.post.findMany.mockResolvedValueOnce(mockPosts);

    await getRecentPosts(req, res);

    expect(prisma.post.findMany).toHaveBeenCalledWith({
      select: {
        id: true,
        title: true,
        content: true,
        createdAt: true,
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
      take: 20,
    });
    expect(res.render).toHaveBeenCalledWith("recent-posts", {
      posts: [
        {
          id: 301,
          title: "testTitle",
          content: "testContent",
          createdAt: expect.any(Date),
          createdAgo: "Formatted time",
          author: {
            id: 201,
            username: "testUsername",
          },
        },
      ],
      user: req.user,
    });
  });

  it("returns a status 500 and renders error page on prisma error", async () => {
    const mockError = new Error("Database error");
    prisma.post.findMany.mockRejectedValueOnce(mockError);

    await getRecentPosts(req, res);

    expect(prisma.post.findMany).toHaveBeenCalledWith({
      select: {
        id: true,
        title: true,
        content: true,
        createdAt: true,
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
      take: 20,
    });
    expect(consoleSpy).toHaveBeenCalledWith(
      "Error retrieving recent posts: Error: Database error",
    );
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.render).toHaveBeenCalledWith("/errors/error", {
      user: req.user,
      errMsg: ["Error retrieving recent posts"],
    });
  });
});
