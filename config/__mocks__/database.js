/* eslint-disable no-undef */
const prisma = {
  post: {
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    delete: jest.fn(),
  },
  postReport: {
    create: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
  },
  user: {
    create: jest.fn(),
    findFirst: jest.fn(),
  },
  comment: {
    create: jest.fn(),
    findFirst: jest.fn(),
    delete: jest.fn(),
  },
  commentReport: {
    create: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
  },
  $transaction: jest.fn(async (callback) => {
    await callback(prisma);
  }),
};

module.exports = prisma;
