/* eslint-disable no-undef */
module.exports = {
  generateHash: jest.fn(() => {
    throw new Error("Hash generation failure");
  }),
};
