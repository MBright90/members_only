/* eslint-disable no-undef */
const prisma = {
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
};

module.exports = prisma;
