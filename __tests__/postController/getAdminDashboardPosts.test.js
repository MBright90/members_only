/* eslint-disable no-undef */
const { getAdminDashboardPosts } = require("../../controllers/postController");
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
      status: jest.fn().mockReturnThis(),
      render: jest.fn(),
    };

    mockReports = [
      {
        id: 1,
        reason: "Inappropriate language",
        resolved: false,
        post: {
          id: 101,
          title: "testTitle",
          content: "testContent",
          createdAt: new Date(),
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
    prisma.postReport.findMany.mockResolvedValueOnce(mockReports);

    await getAdminDashboardPosts(req, res);

    expect(prisma.postReport.findMany).toHaveBeenCalledWith({
      select: {
        id: true,
        reason: true,
        resolved: true,
        post: {
          select: {
            id: true,
            title: true,
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

    expect(res.render).toHaveBeenCalledWith("adminDashboardPosts", {
      user: req.user,
      reports: [
        {
          id: 1,
          reason: "Inappropriate language",
          resolved: false,
          post: {
            id: 101,
            title: "testTitle",
            content: "testContent",
            createdAt: expect.any(Date),
            createdAgo: "Formatted time",
            author: {
              id: 201,
              username: "testUser",
            },
          },
        },
      ],
    });
  });
  it("responds with a status code 500 and renders error screen on Prisma error", async () => {
    const mockError = new Error("Database error");
    prisma.postReport.findMany.mockRejectedValueOnce(mockError);

    await getAdminDashboardPosts(req, res);

    expect(prisma.postReport.findMany).toHaveBeenCalledWith({
      select: {
        id: true,
        reason: true,
        resolved: true,
        post: {
          select: {
            id: true,
            title: true,
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
      "Error retrieving post reports: Error: Database error",
    );
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.render).toHaveBeenCalledWith("/errors/error", {
      user: req.user,
      errMsg: ["Error retrieving post reports", "Please try again later"],
    });
  });

  it("gracefully handles no unresolved reports being found", async () => {
    prisma.postReport.findMany.mockResolvedValue([]);

    await getAdminDashboardPosts(req, res);

    expect(prisma.postReport.findMany).toHaveBeenCalledWith({
      select: {
        id: true,
        reason: true,
        resolved: true,
        post: {
          select: {
            id: true,
            title: true,
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
    expect(res.render).toHaveBeenCalledWith("adminDashboardPosts", {
      user: req.user,
      reports: [],
    });
  });
});
