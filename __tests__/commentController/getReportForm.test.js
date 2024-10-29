/* eslint-disable no-undef */
const { getReportForm } = require("../../controllers/commentController");
const prisma = require("../../config/database");

jest.mock("../../config/database");
jest.mock("../../lib/timeUtils");

describe("getReportForm", () => {
  let req, res, mockComment;

  beforeAll(() => {
    consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});
  });

  beforeEach(() => {
    req = {
      user: {
        id: 1,
      },
      params: {
        commentId: 101,
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      render: jest.fn(),
    };

    mockComment = {
      id: 101,
      content: "mock comment",
      createdAt: new Date().now,
      author: {
        username: "mock author",
      },
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("retrieves and renders a report form when passed a valid commentId", async () => {
    prisma.comment.findFirst.mockResolvedValue(mockComment);

    await getReportForm(req, res);

    expect(prisma.comment.findFirst).toHaveBeenCalledWith({
      select: {
        id: true,
        content: true,
        createdAt: true,
        author: {
          select: {
            username: true,
          },
        },
      },
      where: {
        id: 101,
      },
    });
    expect(res.render).toHaveBeenCalledWith("./forms/report-comment-form", {
      comment: {
        id: 101,
        content: "mock comment",
        createdAgo: "Formatted time",
        createdAt: new Date().now,
        author: {
          username: "mock author",
        },
      },
      user: {
        id: 1,
      },
    });
  });

  it("responds with status 500 and throws an exception on prisma error", async () => {
    prisma.comment.findFirst.mockRejectedValueOnce(new Error("Database error"));

    await getReportForm(req, res);

    expect(prisma.comment.findFirst).toHaveBeenCalledWith({
      select: {
        id: true,
        content: true,
        createdAt: true,
        author: {
          select: {
            username: true,
          },
        },
      },
      where: {
        id: 101,
      },
    });
    expect(consoleSpy).toHaveBeenCalledWith(
      "Err retrieving comment 101 for report: Error: Database error",
    );
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.render).toHaveBeenCalledWith("/errors/error", {
      user: req.user,
      errMsg: ["Could not match report to comment", "Please try again later"],
    });
  });

  it("gracefully handles being passed an alphaDigit commentId", async () => {
    req.params.commentId = "invalid";

    await getReportForm(req, res);

    expect(prisma.comment.findFirst).not.toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith(
      "Err retrieving comment invalid for report: Error: Invalid commentId",
    );
    expect(res.render).toHaveBeenCalledWith("/errors/error", {
      user: req.user,
      errMsg: ["Could not match report to comment", "Please try again later"],
    });
  });

  it("gracefully handles being passed a commentId which does not match", async () => {
    prisma.comment.findFirst.mockResolvedValueOnce(null);

    await getReportForm(req, res);

    expect(prisma.comment.findFirst).toHaveBeenCalledWith({
      select: {
        id: true,
        content: true,
        createdAt: true,
        author: {
          select: {
            username: true,
          },
        },
      },
      where: {
        id: 101,
      },
    });
    expect(res.render).toHaveBeenCalledWith("/errors/error", {
      user: req.user,
      errMsg: ["Could not retrieve comment", "Please try again later"],
    });
  });
});
