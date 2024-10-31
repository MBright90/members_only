/* eslint-disable no-undef */
const { deletePostFromReport } = require("../../controllers/postController");
const prisma = require("../../config/database");

jest.mock("../../config/database");

describe("deletePostFromReport", () => {
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
        reportId: 201,
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

  it("deletes a reported post when passed a valid reportId and redirects to admin dashboard", async () => {
    const mockReportResult = { postId: 301, resolved: true };
    const mockPostDelete = { id: 301, content: "testContent" };

    prisma.postReport.update.mockResolvedValueOnce(mockReportResult);
    prisma.post.delete.mockResolvedValueOnce(mockPostDelete);

    await deletePostFromReport(req, res);

    expect(prisma.$transaction).toHaveBeenCalled();
    expect(prisma.postReport.update).toHaveBeenCalledWith({
      where: {
        id: 201,
      },
      data: {
        resolved: true,
      },
    });
    expect(prisma.post.delete).toHaveBeenCalledWith({
      where: {
        id: 301,
      },
    });
    expect(consoleSpy).toHaveBeenCalledWith(
      `Deleting post 301 via report 201: ${JSON.stringify(mockPostDelete, null, 2)}`,
    );
    expect(res.redirect).toHaveBeenCalledWith("/dashboard/posts");
  });

  it("returns a status 500 and renders error page on update prisma error", async () => {
    const mockError = new Error("Database error");

    prisma.postReport.update.mockRejectedValueOnce(mockError);

    await deletePostFromReport(req, res);

    expect(prisma.$transaction).toHaveBeenCalled();
    expect(prisma.postReport.update).toHaveBeenCalledWith({
      where: {
        id: 201,
      },
      data: {
        resolved: true,
      },
    });
    expect(prisma.post.delete).not.toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith(
      "Err deleting post by report: Error: Database error",
    );
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.render).toHaveBeenCalledWith("/errors/error", {
      user: req.user,
      errMsg: ["Error resolving report", "Please try again later"],
    });
  });

  it("returns a status 500 and renders error page on delete prisma error", async () => {
    const mockReportResult = { postId: 301, resolved: true };
    const mockError = new Error("Database error");

    prisma.postReport.update.mockResolvedValueOnce(mockReportResult);
    prisma.post.delete.mockRejectedValueOnce(mockError);

    await deletePostFromReport(req, res);

    expect(prisma.$transaction).toHaveBeenCalled();
    expect(prisma.postReport.update).toHaveBeenCalledWith({
      where: {
        id: 201,
      },
      data: {
        resolved: true,
      },
    });
    expect(prisma.post.delete).toHaveBeenCalledWith({
      where: {
        id: 301,
      },
    });
    expect(consoleSpy).toHaveBeenCalledWith(
      "Err deleting post by report: Error: Database error",
    );
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.render).toHaveBeenCalledWith("/errors/error", {
      user: req.user,
      errMsg: ["Error resolving report", "Please try again later"],
    });
  });

  it("gracefully handles being passed an invalid reportId", async () => {
    req.params.reportId = "invalid";

    await deletePostFromReport(req, res);

    expect(prisma.$transaction).not.toHaveBeenCalled();
    expect(prisma.postReport.update).not.toHaveBeenCalled();
    expect(prisma.post.delete).not.toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith(
      "Err deleting post by report: Error: Invalid reportId",
    );
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.render).toHaveBeenCalledWith("/errors/error", {
      user: req.user,
      errMsg: ["Error resolving report", "Please try again later"],
    });
  });
});
