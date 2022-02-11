const supertest = require('supertest');
const mongoose = require('mongoose');
const Post = require('../models/PostModel');
const Comment = require('../models/CommentModel');
const UserModel = require('../models/UserModel');

/* ---------- VARS ---------- */

const { app, server } = require('../app');
const { initialPosts, testUser } = require('./helpers');
var lengthCounter = initialPosts.length;
var token = '';
var userId = '';
var postId = '';
var commentId = '';

/* ---------- TODO ---------- */

/* 
 Like comentarios, cambiar nombre, cambiar contrasenia, update comentario
*/

/* ---------- TEST ---------- */
const api = supertest(app);

beforeAll(async () => {
  await Comment.deleteMany({});
  await Post.deleteMany({});
  await UserModel.deleteMany({});
  const post1 = new Post(initialPosts[0]);
  await post1.save();

  const post2 = new Post(initialPosts[1]);
  await post2.save();
});

test('user - user can register', async () => {
  const response = await api
    .post('/user/register')
    .send(testUser)
    .expect(201)
    .expect('Content-Type', /application\/json/);
  userId = response.body.Data._id;
});

test('user - user can login', async () => {
  const response = await api
    .post('/user/login')
    .send(testUser)
    .expect(200)
    .expect('Content-Type', /application\/json/);
  token = response.body.Data.token;
});

test('post - post are returned as json', async () => {
  await api
    .get('/post')
    .expect(200)
    .expect('Content-Type', /application\/json/);
});

test('post - there are some posts', async () => {
  const response = await api.get('/post');
  expect(response.body.Data).toHaveLength(lengthCounter);
});

test('post - a valid post can be added', async () => {
  const newPost = {
    title: 'test title',
    content: 'test',
    tags: ['test'],
    isPublished: 0,
  };

  const post = await api
    .post('/post')
    .set('Authorization', token)
    .send(newPost)
    .expect(201)
    .expect('Content-Type', /application\/json/);

  postId = post.body.Data._id;

  const response = await api.get('/post');
  lengthCounter = lengthCounter + 1;
  expect(response.body.Data).toHaveLength(lengthCounter);

  const contents = response.body.Data.map((post) => post.content);
  expect(contents).toContain('test');
});

test('post - a post with invalid format cant be added', async () => {
  const newPost = {
    title: 'this shouldnt save title',
    //content
    tags: ['invalid'],
    isPublished: 0,
  };

  await api
    .post('/post')
    .set('Authorization', token)
    .send(newPost)
    .expect(400)
    .expect('Content-Type', /application\/json/);

  const response = await api.get('/post');
  expect(response.body.Data).toHaveLength(lengthCounter);
});

test('like - a post can be liked', async () => {
  await api
    .post(`/post/${postId}/like`)
    .set('Authorization', token)
    .expect(201);
  //TODO
  const response = await api.get(`/post/${postId}`);
  const likeCounter = response.body.Data.likeCounter;
  expect(likeCounter).toBe(1);
});

test('like - a post can be disliked', async () => {
  await api
    .delete(`/post/${postId}/like`)
    .set('Authorization', token)
    .expect(200);

  const response = await api.get(`/post/${postId}`);
  const likeCounter = response.body.Data.likeCounter;
  expect(likeCounter).toBe(0);
});

test('comment -  can be added', async () => {
  await api
    .post(`/post/${postId}/comment`)
    .set('Authorization', token)
    .send({ content: 'This is a test comment' })
    .expect(201);

  const response = await api.get(`/post/${postId}`);
  const commentCounter = response.body.Data.commentCounter;
  expect(commentCounter).toBe(1);

  const comments = await api.get(`/post/${postId}/comment`);
  commentId = comments.body.Data[0]._id;
  expect(comments.body.Data).toHaveLength(1);
});

test('comment - invalid format cant be added', async () => {
  await api
    .post(`/post/${postId}/comment`)
    .set('Authorization', token)
    .send({})
    .expect(400);

  const response = await api.get(`/post/${postId}`);
  const commentCounter = response.body.Data.commentCounter;
  expect(commentCounter).toBe(1);
});

test('comment - can be deleted by the author', async () => {
  await api
    .delete(`/post/${postId}/comment/${commentId}`)
    .set('Authorization', token)
    .expect(200);

  const response = await api.get(`/post/${postId}`);
  const commentCounter = response.body.Data.commentCounter;
  expect(commentCounter).toBe(0);
});

afterAll(() => {
  mongoose.connection.close();
  server.close();
});
