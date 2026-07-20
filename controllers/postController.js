import prisma from "../lib/prisma.js";
const createPost = async (req, res) => {
  const content = req.body.text;
  if (req.body.text.length > 250) {
    return res.json({
      message: "Post exceeds character limits",
      length: req.body.text.length,
    });
  }
  const newPost = await prisma.post.create({
    data: {
      text: content,
      date: new Date(),
      userId: req.user.id,
    },
  });
  if (newPost !== null) {
    return res.json({
      message: "Post created sucessfully",
      post: newPost,
    });
  } else {
    res.json({ message: "Failed" });
  }
};
const getPostsOfCurrentUser = async (req, res) => {
  const posts = await prisma.post.findMany({
    where: {
      userId: req.user.id,
    },
  });
  if (posts !== null) {
    return res.json({
      posts: posts,
    });
  } else {
    res.json({
      message: "There aren't any posts",
    });
  }
};
const getSpecificPost = async (req, res) => {
  const postId = req.params.postId;
  const post = await prisma.post.findFirst({
    where: {
      id: postId,
    },
  });
  if (post !== null) {
    return res.json({ post: post });
  } else {
    res.json({
      message: "Post not found",
    });
  }
};
const getCommentsOfPost = async (req, res) => {
  const postId = req.params.postId;
  const post = await prisma.post.findFirst({
    where: {
      id: postId,
    },
  });
  if (post === null) {
    return res.json({
      message: "Post doesn't exist",
    });
  } else {
    const comments = await prisma.comment.findMany({
      where: {
        postId: post,
      },
    });
    if (comments !== null) {
      return res.json({
        comments: comments,
      });
    } else {
      return res.json({
        message: "There was an error in getting the comments",
      });
    }
  }
};
const addComment = async (req, res) => {
  const postId = req.params.postId;
  const commentText = req.body.comment;
  const post = await prisma.post.findFirst({
    where: {
      id: postId,
    },
  });
  if (post === null) {
    return res.json({
      message: "Post doesn't exist",
    });
  } else {
    if (commentText.length > 100) {
      return res.json({
        message: "Comment exceeds character limits",
      });
    }
    const createComment = await prisma.comment.create({
      data: {
        text: commentText,
      },
    });
    if (createComment !== null) {
      res.json({
        message: "Comment created successfully",
        comment: createComment,
      });
    }
  }
};

const getPostsOfUsersCurrentUserFollows = async (req, res) => {
  try {
    const userFollows = await prisma.user.findUnique({
      where: {
        id: req.user.id,
      },
      select: {
        following: {
          select: {
            id: true,
          },
        },
      },
    });
    const followingId = [];
    userFollows.following.forEach((follow) => {
      followingId.push(follow.id);
    });
    const allFollowingPosts = await prisma.post.findMany({
      where: {
        userId: {
          in: followingId,
        },
      },
    });
    console.log(userFollows, allFollowingPosts);
    res.send(allFollowingPosts);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: "An error occured",
    });
  }
};
export {
  createPost,
  getPostsOfCurrentUser,
  getSpecificPost,
  getCommentsOfPost,
  addComment,
  getPostsOfUsersCurrentUserFollows,
};
