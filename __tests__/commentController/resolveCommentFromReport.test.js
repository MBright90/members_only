/* eslint-disable no-undef */
const {
  resolveCommentFromReport,
} = require("../../controllers/commentController");
const prisma = require("../../config/database");
const { beforeAll } = require("@jest/globals");

jest.mock("../../config/database");

describe("resolveCommentFromReport", () => {
  let req, res;

  beforeAll(() => {
    consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});
  });

  beforeEach(() => {
    req = {
      params: {
        reportId: 101,
      },
      user: {
        id: 201,
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

  it("logs the resolution of a report", async () => {
    const mockReport = { id: 101, resolved: true, reason: "testReason" };

    prisma.commentReport.update.mockResolvedValue(mockReport);

    await resolveCommentFromReport(req, res);

    expect(prisma.commentReport.update).toHaveBeenCalledWith({
      where: {
        id: 101,
      },
      data: {
        resolved: true,
      },
    });
    expect(consoleSpy).toHaveBeenCalledWith(
      `Resolved report 101: ${JSON.stringify(mockReport, null, 2)}`,
    );
    expect(res.redirect).toHaveBeenCalledWith("/dashboard/comments");
  });

  it("responds with status 500 and throws an exception when prisma error occurs", async () => {
    prisma.commentReport.update.mockRejectedValue(new Error("Database error"));

    await resolveCommentFromReport(req, res);

    expect(prisma.commentReport.update).toHaveBeenCalledWith({
      where: {
        id: 101,
      },
      data: {
        resolved: true,
      },
    });
    expect(consoleSpy).toHaveBeenCalledWith(
      "Err resolving report: Error: Database error",
    );
    expect(res.render).toHaveBeenCalledWith("/errors/error", {
      user: req.user,
      errMsg: ["Error resolving report", "Please try again later"],
    });
  });

  it("gracefully handles being passed an invalid reportId", async () => {
    req.params.reportId = "invalid";

    await resolveCommentFromReport(req, res);

    expect(prisma.commentReport.update).not.toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith(
      "Err resolving report: Error: Invalid reportId",
    );
    expect(res.render).toHaveBeenCalledWith("/errors/error", {
      user: req.user,
      errMsg: ["Error resolving report", "Please try again later"],
    });
  });
});
