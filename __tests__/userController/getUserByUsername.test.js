/* eslint-disable no-undef */
const { getUserByUsername } = require("../../controllers/userController");
const prisma = require("../../config/database");

jest.mock("../../config/database");

describe("getUserByUsername", () => {
  it("returns a valid user when passed a valid username", async () => {
    const mockUser = {
      id: 1,
      username: "testUser",
    };

    prisma.user.findFirst.mockResolvedValueOnce(mockUser);

    const result = await getUserByUsername("testUser");

    expect(result).toEqual(mockUser);
    expect(prisma.user.findFirst).toHaveBeenCalledWith({
      where: {
        username: {
          equals: "testUser",
          mode: "insensitive",
        },
      },
    });
  });

  it("returns null when passed an invalid username", async () => {
    prisma.user.findFirst.mockResolvedValueOnce(null);

    const result = await getUserByUsername("nonexistentUsername");

    expect(result).toEqual(null);
    expect(prisma.user.findFirst).toHaveBeenCalledWith({
      where: {
        username: {
          equals: "nonexistentUsername",
          mode: "insensitive",
        },
      },
    });
  });

  it("throws an error when exception is thrown by prisma", async () => {
    const error = new Error("Database error");
    prisma.user.findFirst.mockRejectedValueOnce(error);

    const result = await getUserByUsername("will-error");

    expect(prisma.user.findFirst).toHaveBeenCalledWith({
      where: {
        username: {
          equals: "will-error",
          mode: "insensitive",
        },
      },
    });
    expect(result).toEqual(
      new Error("Error retrieving user by username: Error: Database error"),
    );
  });
});
