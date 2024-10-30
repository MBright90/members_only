/* eslint-disable no-undef */
const { getUsersPosts } = require("../../controllers/postController");
const prisma = require("../../config/database");

jest.mock("../../config/database");
jest.mock("../../lib/timeUtils");

describe("getUsersPosts", () => {
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
        userId: 201,
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

  it("returns all of a users posts when passed a valid userId", async () => {
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

    await getUsersPosts(req, res);

    expect(prisma.post.findMany).toHaveBeenCalledWith({
      select: {
        id: true,
        title: true,
        content: true,
        createdAt: true,
        author: {
          select: {
            username: true,
          },
        },
      },
      where: {
        authorId: 201,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    expect(prisma.user.findFirst).not.toHaveBeenCalled();
    expect(res.render).toHaveBeenCalledWith("user-posts", {
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
      author: "testUsername",
    });
  });

  it("renders the username if the user has not made any posts", async () => {
    const mockPosts = [];

    prisma.post.findMany.mockResolvedValueOnce(mockPosts);
    prisma.user.findFirst.mockResolvedValueOnce({ username: "testUsername" });

    await getUsersPosts(req, res);

    expect(prisma.post.findMany).toHaveBeenCalledWith({
      select: {
        id: true,
        title: true,
        content: true,
        createdAt: true,
        author: {
          select: {
            username: true,
          },
        },
      },
      where: {
        authorId: 201,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    expect(prisma.user.findFirst).toHaveBeenCalledWith({
      where: { id: 201 },
    });
    expect(res.render).toHaveBeenCalledWith("user-posts", {
      posts: [],
      user: req.user,
      author: "testUsername",
    });
  });

  it("responds with a status 500 and throws an exception on prisma error", async () => {
    const mockError = new Error("Database error");

    prisma.post.findMany.mockRejectedValueOnce(mockError);

    await getUsersPosts(req, res);

    expect(prisma.post.findMany).toHaveBeenCalledWith({
      select: {
        id: true,
        title: true,
        content: true,
        createdAt: true,
        author: {
          select: {
            username: true,
          },
        },
      },
      where: {
        authorId: 201,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    expect(prisma.user.findFirst).not.toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith(
      "Err retrieving posts for user 201: Error: Database error",
    );
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.render).toHaveBeenCalledWith("/errors/error", {
      user: req.user,
      errMsg: ["Error retrieving posts for user"],
    });
  });

  it("responds with a status 500 and throws an exception on prisma error when retrieving username for empty post array", async () => {
    const mockError = new Error("Database error");

    prisma.post.findMany.mockResolvedValueOnce([]);
    prisma.user.findFirst.mockRejectedValue(mockError);

    await getUsersPosts(req, res);

    expect(prisma.post.findMany).toHaveBeenCalledWith({
      select: {
        id: true,
        title: true,
        content: true,
        createdAt: true,
        author: {
          select: {
            username: true,
          },
        },
      },
      where: {
        authorId: 201,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    expect(prisma.user.findFirst).toHaveBeenCalledWith({
      where: {
        id: 201,
      },
    });
    expect(consoleSpy).toHaveBeenCalledWith(
      "Err retrieving posts for user 201: Error: Database error",
    );
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.render).toHaveBeenCalledWith("/errors/error", {
      user: req.user,
      errMsg: ["Error retrieving posts for user"],
    });
  });

  it("gracefully handles being passed a non INT user id", async () => {
    req.params.userId = "invalid";

    await getUsersPosts(req, res);

    expect(prisma.post.findMany).not.toHaveBeenCalled();
    expect(prisma.user.findFirst).not.toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith(
      "Err retrieving posts for user invalid: Error: User does not exist",
    );
    expect(res.render).toHaveBeenCalledWith("/errors/error", {
      user: req.user,
      errMsg: ["Error retrieving posts for user"],
    });
  });
});
