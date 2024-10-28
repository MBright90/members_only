/* eslint-disable no-undef */
const { getUserById } = require("../../controllers/userController");
const prisma = require("../../config/database");

jest.mock("../../config/database");

describe("getUserByUsername", () => {
  it("returns a user object when passed a valid id", async () => {
    const user = { id: 1, username: "testUser" };
    prisma.user.findFirst.mockResolvedValueOnce(user);

    const result = await getUserById(1);

    expect(result).toEqual(user);
    expect(prisma.user.findFirst).toHaveBeenCalledWith({ id: 1 });
  });

  it("returns null when passed an invalid id", async () => {
    prisma.user.findFirst.mockResolvedValueOnce(null);

    const result = await getUserById(1);

    expect(result).toEqual(null);
    expect(prisma.user.findFirst).toHaveBeenCalledWith({ id: 1 });
  });

  it("throws an error when exception is thrown by prisma", async () => {
    const error = new Error("Database error");
    prisma.user.findFirst.mockRejectedValueOnce(error);

    const result = await getUserById(1);

    expect(prisma.user.findFirst).toHaveBeenCalledWith({ id: 1 });
    expect(result).toEqual(
      new Error("Error retrieving user by id: Error: Database error"),
    );
  });
});
