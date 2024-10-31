/* eslint-disable no-undef */
const { postReportForm } = require("../../controllers/postController");
const prisma = require("../../config/database");

jest.mock("../../config/database");

describe("postReportForm", () => {
  let req, res;

  beforeAll(() => {
    consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});
  });

  beforeEach(() => {
    req = {
      user: {
        id: 101,
      },
      body: {
        reason: "testReason",
        postId: 201,
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

  it("creates a new postReport and redirects home", async () => {
    prisma.postReport.create.mockResolvedValueOnce({ id: 301 });

    await postReportForm(req, res);

    expect(prisma.postReport.create).toHaveBeenCalledWith({
      data: {
        postId: 201,
        reason: "testReason",
      },
    });
    expect(res.redirect).toHaveBeenCalledWith("/");
  });

  it("returns a 500 status and renders error page on prisma error", async () => {
    mockError = new Error("Database error");
    prisma.postReport.create.mockRejectedValueOnce(mockError);

    await postReportForm(req, res);

    expect(prisma.postReport.create).toHaveBeenCalledWith({
      data: {
        postId: 201,
        reason: "testReason",
      },
    });
    expect(consoleSpy).toHaveBeenCalledWith(
      "Error reporting post: Error: Database error",
    );
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.render).toHaveBeenCalledWith("/errors/error", {
      user: req.user,
      errMsg: ["Error reporting post", "Please try again later"],
    });
  });

  it("gracefully handles being passed an invalid postId and renders error page", async () => {
    req.body.postId = "invalid";

    await postReportForm(req, res);

    expect(prisma.postReport.create).not.toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith(
      "Error reporting post: Error: Invalid postId",
    );
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.render).toHaveBeenCalledWith("/errors/error", {
      user: req.user,
      errMsg: ["Error reporting post", "Please try again later"],
    });
  });
});
