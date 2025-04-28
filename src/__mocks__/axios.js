// Set up a simpler mocked axios
const axios = {
  create: jest.fn(() => {
    return {
      interceptors: {
        request: {
          use: jest.fn()
        },
        response: {
          use: jest.fn()
        }
      },
      post: jest.fn(() => Promise.resolve({ data: {} })),
      get: jest.fn(() => Promise.resolve({ data: {} }))
    };
  }),
  post: jest.fn(() => Promise.resolve({ data: {} })),
  get: jest.fn(() => Promise.resolve({ data: {} })),
  defaults: {
    baseURL: 'http://46.101.105.28/api'
  },
  interceptors: {
    request: {
      use: jest.fn()
    },
    response: {
      use: jest.fn()
    }
  }
};

// Export the mocked axios
export default axios; 