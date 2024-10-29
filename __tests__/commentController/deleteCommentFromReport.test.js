/* eslint-disable no-undef */
const {
  deleteCommentFromReport,
} = require("../../controllers/commentController");
const prisma = require("../../config/database");

jest.mock("../../config/database");

describe("deleteCommentFromReport", () => {
  let req, res;

  beforeAll(() => {
    consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});
  });

  beforeEach(() => {
    req = {
      user: {
        id: 1,
      },
      params: {
        reportId: 1,
      },
    };

    res = {
      redirect: jest.fn(),
      status: jest.fn().mockReturnThis(),
      render: jest.fn(),
    };
  });

  it("logs and deletes the relevant comment when passed a valid reportId and commentId", async () => {
    const mockReport = { id: 1, resolved: true, commentId: 101 };
    const mockDeleteResult = { id: 101, content: "Test comment" };

    prisma.commentReport.update.mockResolvedValueOnce(mockReport);
    prisma.comment.delete.mockResolvedValueOnce(mockDeleteResult);

    await deleteCommentFromReport(req, res);

    expect(prisma.$transaction).toHaveBeenCalled();
    expect(prisma.commentReport.update).toHaveBeenCalledWith({
      where: {
        id: 1,
      },
      data: {
        resolved: true,
      },
    });
    expect(prisma.comment.delete).toHaveBeenCalledWith({ where: { id: 101 } });
    expect(consoleSpy).toHaveBeenCalledWith(
      `Deleting comment 101 via report 1: ${JSON.stringify(mockDeleteResult, null, 2)}`,
    );
    expect(res.redirect).toHaveBeenCalledWith("/dashboard/comments");
  });

  it("responds with status 500 and throws an exception when prisma error occurs during update", async () => {
    prisma.commentReport.update.mockRejectedValue(new Error("Update error"));

    await deleteCommentFromReport(req, res);

    expect(prisma.$transaction).toHaveBeenCalled();
    expect(prisma.commentReport.update).toHaveBeenCalledWith({
      where: {
        id: 1,
      },
      data: {
        resolved: true,
      },
    });
    expect(prisma.comment.delete).not.toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith(
      "Err deleting comment by report: Error: Update error",
    );
    expect(res.render).toHaveBeenCalledWith("/errors/error", {
      user: req.user,
      errMsg: ["Error resolving report", "Please try again later"],
    });
  });

  it("responds with status 500 and throws an exception when prisma error occurs during delete", async () => {
    const mockReport = { id: 1, resolved: true, commentId: 101 };

    prisma.commentReport.update.mockResolvedValueOnce(mockReport);
    prisma.comment.delete.mockRejectedValue(new Error("Delete error"));

    await deleteCommentFromReport(req, res);

    expect(prisma.$transaction).toHaveBeenCalled();
    expect(prisma.commentReport.update).toHaveBeenCalledWith({
      where: {
        id: 1,
      },
      data: {
        resolved: true,
      },
    });
    expect(prisma.comment.delete).toHaveBeenCalledWith({
      where: {
        id: 101,
      },
    });
    expect(consoleSpy).toHaveBeenCalledWith(
      "Err deleting comment by report: Error: Delete error",
    );
    expect(res.render).toHaveBeenCalledWith("/errors/error", {
      user: req.user,
      errMsg: ["Error resolving report", "Please try again later"],
    });
  });

  it("Gracefully handles the report not being found", async () => {
    prisma.commentReport.update.mockResolvedValue(null);

    await deleteCommentFromReport(req, res);

    expect(prisma.$transaction).toHaveBeenCalled();
    expect(prisma.commentReport.update).toHaveBeenCalledWith({
      where: {
        id: 1,
      },
      data: {
        resolved: true,
      },
    });
    expect(consoleSpy).toHaveBeenCalledWith(
      "Err deleting comment by report: Error: Invalid commentId",
    );
    expect(res.render).toHaveBeenCalledWith("/errors/error", {
      user: req.user,
      errMsg: ["Error resolving report", "Please try again later"],
    });
  });
});
