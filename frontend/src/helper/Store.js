// The store defines global objects across all components.
// How to use:
// 1. import the store: import Store from './helper/Store';
// 2. define global object in the data function: meeting: Store.meeting,
// 3. access the global object in any function: this.meeting.status
export default {
  meeting: {
    enum: {
      BEFORE_MEETING: 1,
      IN_MEETING: 2,
      AFTER_MEETING: 3,
    },
    status: 1,
  },
};
