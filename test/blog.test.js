const supertest = require('supertest');
const mongoose = require('mongoose');
const Post = require('../models/PostModel');
const Comment = require('../models/CommentModel');
const UserModel = require('../models/UserModel');
const Like = require('../models/LikeModel');

/* ---------- VARS ---------- */

const { app, server } = require('../app');
const { initialPosts, testUser } = require('./helpers');
var lengthCounter = initialPosts.length;
var token = '';
var postId = '';
var commentIdDelete = '';
var commentId = '';
var posts = 0;
var commentLikeCounter = 0;
var postLikeCounter = 0;
var userLikedPosts = 0;
var userLikedComments = 0;
var comments = 0;

/* ---------- TEST ---------- */
const api = supertest(app);

beforeAll(async () => {
  await Comment.deleteMany({});
  await Post.deleteMany({});
  await UserModel.deleteMany({});
  await Like.deleteMany({});

  const post1 = new Post(initialPosts[0]);
  await post1.save();

  const post2 = new Post(initialPosts[1]);
  await post2.save();
});

test('user 1 -register', async () => {
  const response = await api
    .post('/user/register')
    .send(testUser)
    .expect(201)
    .expect('Content-Type', /application\/json/);
  userId = response.body.Data._id;
});

test('user 2 -login', async () => {
  const response = await api
    .post('/user/login')
    .send(testUser)
    .expect(200)
    .expect('Content-Type', /application\/json/);
  token = response.body.Data.token;
  userId = response.body.Data._id;
});

test('post 1 -post are returned as json', async () => {
  await api
    .get('/post')
    .expect(200)
    .expect('Content-Type', /application\/json/);
});

test('post 2 -there are some posts', async () => {
  const response = await api.get('/post');
  expect(response.body.Data).toHaveLength(lengthCounter);
});

test('post 3 -adds 1  ', async () => {
  const newPost = {
    title: 'Creando posts',
    content: 'test',
    tags: ['test'],
    isPublished: 1,
  };

  const post = await api
    .post('/author/post')
    .set('Authorization', token)
    .send(newPost)
    .expect(201)
    .expect('Content-Type', /application\/json/);

  postId = post.body.Data._id;

  const response = await api.get('/post').expect(200);
  lengthCounter = lengthCounter + 1;
  expect(response.body.Data).toHaveLength(lengthCounter);

  const contents = response.body.Data.map((post) => post.content);
  expect(contents).toContain('test');
});

test('post 4 -with invalid format cant be added', async () => {
  const newPost = {
    title: 'this shouldnt save title',
    //content
    tags: ['invalid'],
    isPublished: 0,
  };

  await api
    .post('/author/post')
    .set('Authorization', token)
    .send(newPost)
    .expect(400)
    .expect('Content-Type', /application\/json/);

  const response = await api.get('/post');
  expect(response.body.Data).toHaveLength(lengthCounter);
});

test('like-post 1 -can be liked', async () => {
  const res = await api
    .post(`/user/post/${postId}/like`)
    .set('Authorization', token)
    .expect(201);

  postLikeCounter++;
  userLikedPosts++;

  const likeCounter = res.body.Data.likeCounter;
  const likedPosts = res.body.Data.likedPosts;
  expect(likeCounter).toBe(postLikeCounter);
  expect(likedPosts).toHaveLength(userLikedPosts);
});

test('like-post 2 -cant be liked twice', async () => {
  await api
    .post(`/user/post/${postId}/like`)
    .set('Authorization', token)
    .expect(400);

  const post = await api
    .get(`/post/${postId}`)
    .set('Authorization', token)
    .expect(200);
  const likeCounter = post.body.Data.likeCounter;

  const user = await api.get(`/user`).set('Authorization', token).expect(200);
  const likedPosts = user.body.Data.likedPosts;

  expect(likeCounter).toBe(postLikeCounter);
  expect(likedPosts).toHaveLength(userLikedPosts);
});

test('dislike-post 1 -can be disliked', async () => {
  const res = await api
    .delete(`/user/post/${postId}/like`)
    .set('Authorization', token)
    .expect(200);

  postLikeCounter--;
  userLikedPosts--;
  const likeCounter = res.body.Data.likeCounter;
  const likedPosts = res.body.Data.likedPosts;
  expect(likeCounter).toBe(postLikeCounter);
  expect(likedPosts).toHaveLength(userLikedPosts);
});

test('dislike-post 2 -cant be disliked twice', async () => {
  await api
    .delete(`/user/post/${postId}/like`)
    .set('Authorization', token)
    .expect(400);
});

test('comment 1 - adds 2', async () => {
  const comment = await api
    .post(`/user/post/${postId}/comment`)
    .set('Authorization', token)
    .send({ content: '1 This is a test comment' })
    .expect(201);

  const com = await api
    .post(`/user/post/${postId}/comment`)
    .set('Authorization', token)
    .send({ content: '2 This will be deleted' })
    .expect(201);

  comments = 2;

  const post = await api
    .get(`/post/${postId}`)
    .set('Authorization', token)
    .expect(200);

  commentIdDelete = comment.body.Data.idComment;
  commentId = com.body.Data.idComment;
  expect(post.body.Data.commentCounter).toBe(comments);
});

test('comment 2 - author deletes 1', async () => {
  const res = await api
    .delete(`/user/post/${postId}/comment/${commentIdDelete}`)
    .set('Authorization', token)
    .expect(200);
  comments--;
  expect(res.body.Data.commentCounter).toBe(comments);

  const post = await api
    .get(`/post/${postId}`)
    .set('Authorization', token)
    .expect(200);
  expect(post.body.Data.commentCounter).toBe(comments);
});

test('comment 3 -invalid format cant be added', async () => {
  await api
    .post(`/user/post/${postId}/comment`)
    .set('Authorization', token)
    .send({})
    .expect(400);

  const response = await api.get(`/post/${postId}`);
  const commentCounter = response.body.Data.commentCounter;
  expect(commentCounter).toBe(comments);
});

test('like-comment 1 -like', async () => {
  const like = await api
    .post(`/user/post/${postId}/comment/${commentId}/like`)
    .set('Authorization', token)
    .expect(201);
  commentLikeCounter++;
  userLikedComments++;

  expect(like.body.Data.likeCounter).toBe(commentLikeCounter);
  expect(like.body.Data.likedComments).toHaveLength(userLikedComments);
});

test('like-comment 2 -cant be liked twice ', async () => {
  const like = await api
    .post(`/user/post/${postId}/comment/${commentId}/like`)
    .set('Authorization', token)
    .expect(400);
});

test('dislike-comment 1 -can dislike', async () => {
  const dislike = await api
    .delete(`/user/post/${postId}/comment/${commentId}/like`)
    .set('Authorization', token)
    .expect(200);

  commentLikeCounter--;
  userLikedComments--;

  expect(dislike.body.Data.likeCounter).toBe(commentLikeCounter);
  expect(dislike.body.Data.likedComments).toHaveLength(userLikedComments);
});

test('dislike-comment 2 -cant be disliked twice', async () => {
  const dislike = await api
    .delete(`/user/post/${postId}/comment/${commentId}/like`)
    .set('Authorization', token)
    .expect(400);
});

test('comment plus -likeCounter is updated', async () => {
  const comm = await api
    .get(`/post/${postId}/comment`)
    .set('Authorization', token)
    .expect(200);
  expect(comm.body.Data.length).toBe(comments);
  expect(comm.body.Data[0].likeCounter).toBe(commentLikeCounter);
});

test('post plus -likeCounter is updated', async () => {
  const post = await api
    .get(`/post/${postId}`)
    .set('Authorization', token)
    .expect(200);
  expect(post.body.Data.likeCounter).toBe(postLikeCounter);
});

test('user plus -likedPosts and likedComments is updated', async () => {
  const user = await api.get(`/user/`).set('Authorization', token).expect(200);
  console.log(user.body.Data);
  expect(user.body.Data.likedPosts).toHaveLength(userLikedPosts);
  expect(user.body.Data.likedComments).toHaveLength(userLikedComments);
});

afterAll(() => {
  mongoose.connection.close();
  server.close();
});
