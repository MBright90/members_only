/* eslint-disable no-undef */
const { resolvePostFromReport } = require("../../controllers/postController");
const prisma = require("../../config/database");

jest.mock("../../config/database");

describe("resolvePostFromReport", () => {
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

  it("updates a report to resolved and redirects to the admin dashboard", async () => {
    const mockReport = { id: 201, reason: "testReason" };

    prisma.postReport.update.mockResolvedValue(mockReport);

    await resolvePostFromReport(req, res);

    expect(prisma.postReport.update).toHaveBeenCalledWith({
      where: {
        id: 201,
      },
      data: {
        resolved: true,
      },
    });
    expect(consoleSpy).toHaveBeenCalledWith(
      `Resolved report 201: ${JSON.stringify(mockReport, null, 2)}`,
    );
    expect(res.redirect).toHaveBeenCalledWith("/dashboard/posts");
  });

  it("returns a status 500 and renders an error page on primsa error", async () => {
    const mockError = new Error("Database error");

    prisma.postReport.update.mockRejectedValueOnce(mockError);

    await resolvePostFromReport(req, res);

    expect(prisma.postReport.update).toHaveBeenCalledWith({
      where: {
        id: 201,
      },
      data: {
        resolved: true,
      },
    });
    expect(consoleSpy).toHaveBeenCalledWith(
      "Err resolving report: Error: Database error",
    );
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.render).toHaveBeenCalledWith("/errors/error", {
      user: req.user,
      errMsg: ["Error resolving report", "Please try again later"],
    });
  });

  it("gracefully handles being passed an invalid reportId", async () => {
    req.params.reportId = "invalid";

    await resolvePostFromReport(req, res);

    expect(prisma.postReport.update).not.toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith(
      "Err resolving report: Error: Invalid reportId",
    );
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.render).toHaveBeenCalledWith("/errors/error", {
      user: req.user,
      errMsg: ["Error resolving report", "Please try again later"],
    });
  });
});
