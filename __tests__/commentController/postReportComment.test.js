/* eslint-disable no-undef */
const { postReportComment } = require("../../controllers/commentController");
const prisma = require("../../config/database");

jest.mock("../../config/database");

describe("postReportComment", () => {
  let req, res;

  beforeAll(() => {
    consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});
  });

  beforeEach(() => {
    req = {
      user: {
        id: 100,
      },
      body: {
        commentId: 200,
        reason: "testReason",
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

  it("adds a new comment report to the database and redirects to posts", async () => {
    prisma.commentReport.create.mockResolvedValueOnce({ id: 500 });

    await postReportComment(req, res);

    expect(prisma.commentReport.create).toHaveBeenCalledWith({
      data: {
        commentId: 200,
        reason: "testReason",
      },
    });
    expect(res.redirect).toHaveBeenCalledWith("/posts");
  });

  it("responds with a status code 500 and renders error screen on Prisma error", async () => {
    const error = new Error("Database error");
    prisma.commentReport.create.mockRejectedValueOnce(error);

    await postReportComment(req, res);

    expect(prisma.commentReport.create).toHaveBeenCalledWith({
      data: {
        commentId: 200,
        reason: "testReason",
      },
    });
    expect(consoleSpy).toHaveBeenCalledWith(
      "Error adding comment: Error: Database error",
    );
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.render).toHaveBeenCalledWith("/errors/error", {
      user: req.user,
      errMsg: ["Error creating report", "Please try again later"],
    });
  });

  it("responds with a status code 500 and renders error when passed invalid commentId", async () => {
    req.body.commentId = "invalid";

    await postReportComment(req, res);

    expect(prisma.commentReport.create).not.toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith(
      "Error adding comment: Error: Invalid commentId",
    );
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.render).toHaveBeenCalledWith("/errors/error", {
      user: req.user,
      errMsg: ["Error creating report", "Please try again later"],
    });
  });
});
