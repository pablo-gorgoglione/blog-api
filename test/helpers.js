const initialPosts = [
  {
    authorId: '6201a6ee1057f2ef79e0df2d',
    title: 'this is new data',
    content: 'this is a test one',
    tags: ['test1', 'testIntegration'],
    isPublished: 0,
    likeCounter: 5,
    commentCounter: 0,
  },
  {
    authorId: '6201a6ee1057f2ef79e0df2d',
    title: 'test number two',
    content: 'this is a test two',
    tags: ['test2', 'testIntegration'],
    isPublished: 0,
    likeCounter: 5,
    commentCounter: 0,
  },
];

const testUser = {
  username: 'pablo-test',
  password: '123456',
};

module.exports = { initialPosts, testUser };
