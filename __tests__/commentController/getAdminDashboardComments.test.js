/* eslint-disable no-undef */
const {
  getAdminDashboardComments,
} = require("../../controllers/commentController");
const prisma = require("../../config/database");

jest.mock("../../config/database");
jest.mock("../../lib/timeUtils");

describe("getAdminDashboardComments", () => {
  let req, res, mockReports;

  beforeAll(() => {
    consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});
  });

  beforeEach(() => {
    req = {
      user: {
        id: 100,
      },
    };

    res = {
      redirect: jest.fn(),
      status: jest.fn().mockReturnThis(),
      render: jest.fn(),
    };

    mockReports = [
      {
        id: 1,
        reason: "Inappropriate language",
        resolved: false,
        comment: {
          id: 101,
          content: "This is a test comment",
          createdAt: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
          author: {
            id: 201,
            username: "testUser",
          },
        },
      },
    ];
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("retrieves and renders an array of reported comments", async () => {
    prisma.commentReport.findMany.mockResolvedValueOnce(mockReports);

    await getAdminDashboardComments(req, res);

    expect(prisma.commentReport.findMany).toHaveBeenCalledWith({
      select: {
        id: true,
        reason: true,
        resolved: true,
        comment: {
          select: {
            id: true,
            content: true,
            createdAt: true,
            author: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        },
      },
      where: {
        resolved: false,
      },
      orderBy: {
        createdAt: "asc",
      },
    });
    expect(res.render).toHaveBeenCalledWith("adminDashboardComments", {
      user: req.user,
      reports: [
        {
          id: 1,
          reason: "Inappropriate language",
          resolved: false,
          comment: {
            author: {
              id: 201,
              username: "testUser",
            },
            id: 101,
            content: "This is a test comment",
            createdAt: expect.any(Date),
            createdAgo: "Formatted time",
          },
        },
      ],
    });
  });

  it("responds with a status code 500 and renders error screen on Prisma error", async () => {
    const error = new Error("Database error");
    prisma.commentReport.findMany.mockRejectedValue(error);

    await getAdminDashboardComments(req, res);

    expect(prisma.commentReport.findMany).toHaveBeenCalledWith({
      select: {
        id: true,
        reason: true,
        resolved: true,
        comment: {
          select: {
            id: true,
            content: true,
            createdAt: true,
            author: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        },
      },
      where: {
        resolved: false,
      },
      orderBy: {
        createdAt: "asc",
      },
    });
    expect(consoleSpy).toHaveBeenCalledWith(
      "Error retrieving comment reports: Error: Database error",
    );
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.render).toHaveBeenCalledWith("/errors/error", {
      user: req.user,
      errMsg: ["Error retrieving comment reports", "Please try again later"],
    });
  });

  it("gracefully handles no unresolved reports being found", async () => {
    prisma.commentReport.findMany.mockResolvedValue([]);

    await getAdminDashboardComments(req, res);

    expect(prisma.commentReport.findMany).toHaveBeenCalledWith({
      select: {
        id: true,
        reason: true,
        resolved: true,
        comment: {
          select: {
            id: true,
            content: true,
            createdAt: true,
            author: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        },
      },
      where: {
        resolved: false,
      },
      orderBy: {
        createdAt: "asc",
      },
    });
    expect(res.render).toHaveBeenCalledWith("adminDashboardComments", {
      user: req.user,
      reports: [],
    });
  });
});
