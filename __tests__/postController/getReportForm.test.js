/* eslint-disable no-undef */
const { getReportForm } = require("../../controllers/postController");
const prisma = require("../../config/database");

jest.mock("../../config/database");
jest.mock("../../lib/timeUtils");

describe("getReportForm", () => {
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

  it("renders the report form when passed a valid postId", async () => {
    const mockPost = {
      id: 201,
      title: "testTitle",
      content: "testContent",
      createdAt: new Date(),
      author: {
        username: "testUsername",
      },
    };
    prisma.post.findFirst.mockResolvedValueOnce(mockPost);

    await getReportForm(req, res);

    expect(prisma.post.findFirst).toHaveBeenCalledWith({
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
        id: 201,
      },
    });
    expect(res.render).toHaveBeenCalledWith("./forms/report-post-form", {
      user: req.user,
      post: {
        id: 201,
        title: "testTitle",
        content: "testContent",
        createdAt: expect.any(Date),
        createdAgo: "Formatted time",
        author: {
          username: "testUsername",
        },
      },
    });
  });

  it("returns a status 500 and renders and error page on prisma error", async () => {
    const mockError = new Error("Database error");
    prisma.post.findFirst.mockRejectedValueOnce(mockError);

    await getReportForm(req, res);

    expect(prisma.post.findFirst).toHaveBeenCalledWith({
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
        id: 201,
      },
    });
    expect(consoleSpy).toHaveBeenCalledWith(
      "Err retrieving post 201 for report: Error: Database error",
    );
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.render).toHaveBeenCalledWith("/errors/error", {
      user: req.user,
      errMsg: ["Could not match report to post", "Please try again later"],
    });
  });

  it("renders an error page when passed invalid postId", async () => {
    req.params.postId = "invalid";

    await getReportForm(req, res);

    expect(prisma.post.findFirst).not.toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith(
      "Err retrieving post invalid for report: Error: Invalid postId",
    );
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.render).toHaveBeenCalledWith("/errors/error", {
      user: req.user,
      errMsg: ["Could not match report to post", "Please try again later"],
    });
  });

  it("renders an error page when no report found with valid id", async () => {
    prisma.post.findFirst.mockResolvedValueOnce(null);

    await getReportForm(req, res);

    expect(prisma.post.findFirst).toHaveBeenCalledWith({
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
        id: 201,
      },
    });
    expect(consoleSpy).not.toHaveBeenCalled();
    expect(res.render).toHaveBeenCalledWith("/errors/error", {
      user: req.user,
      errMsg: ["Could not retrieve post", "Please try again later"],
    });
  });
});
