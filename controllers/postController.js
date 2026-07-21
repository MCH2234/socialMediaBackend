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
  const post = await prisma.post.findUnique({
    where: {
      id: postId,
    },
    include: {
      _count: {
        select: {
          likes: true,
        },
      },
      comments: {
        select: {
          id: true,
          date: true,
          postId: true,
          user: {
            select: {
              id: true,
              user: true,
              first: true,
              last: true,
            },
          },
          text: true,
          likes: {
            select: {
              id: true,
              user: {
                select: {
                  id: true,
                  user: true,
                  first: true,
                  last: true,
                },
              },
            },
          },
        },
      },
      likes: {
        select: {
          id: true,
          user: {
            select: {
              id: true,
              user: true,
              first: true,
              last: true,
            },
          },
        },
      },
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
  const post = await prisma.post.findUnique({
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
      include: {
        _count: {
          select: {
            likes: true,
          },
        },
        user: {
          select: {
            id: true,
            user: true,
            first: true,
            last: true,
          },
        },
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
  const post = await prisma.post.findUnique({
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
        date: new Date(),
        postId: postId,
        userId: req.user.id,
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
      select: {
        comments: {
          select: {
            id: true,
            likes: {
              select: {
                user: {
                  select: {
                    user: true,
                    first: true,
                    last: true,
                  },
                },
              },
            },
            user: {
              select: {
                user: true,
                first: true,
                last: true,
              },
            },
          },
        },
        likes: {
          select: {
            id: true,
            user: {
              select: {
                user: true,
                first: true,
                last: true,
              },
            },
          },
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

const likePost = async (req, res) => {
  try {
    const postId = req.params.postId;
    const likeDuplicates = await prisma.postLikes.findFirst({
      where: {
        userId: req.user.id,
        postId: postId,
      },
    });
    if (likeDuplicates) {
      return res.json({
        message: "Post already liked",
      });
    } else {
      const postExists = await prisma.post.findUnique({
        where: {
          id: postId,
        },
        select: {
          id: true,
        },
      });
      if (!postExists) {
        return res.json({ message: "Post couldn't be found" });
      } else {
        const likePost = await prisma.postLikes.create({
          data: {
            postId: postId,
            userId: req.user.id,
          },
        });
        if (!likePost) {
          return res.json({ message: "Post couldn't be liked" });
        } else {
          return res.json({ message: "Post liked successfully" });
        }
      }
    }
  } catch (error) {
    console.log(error);
    res.json({
      error: "An error occured",
    });
  }
};

const unlikePost = async (req, res) => {
  try {
    const likeId = parseInt(req.params.likeId);
    const likeExists = await prisma.postLikes.findUnique({
      where: {
        id: likeId,
      },
      select: {
        id: true,
        userId: true,
      },
    });
    if (!likeExists) {
      return res.json({
        message: "Post isn't liked/like couldn't be found",
      });
    } else {
      if (likeExists.userId !== req.user.id) {
        return res.json({
          message: "Permission denied",
        });
      }
      const unlike = await prisma.postLikes.delete({
        where: {
          id: likeId,
        },
      });
      if (!unlike) {
        return res.json({
          message: "Post couldn't be unliked",
        });
      } else {
        return res.json({
          message: "Post unliked successfuly",
        });
      }
    }
  } catch (error) {
    console.log(error);
    res.json({
      error: "An error occured",
    });
  }
};

// const getPostLikes = async (req, res) => {
//   try {
//     const postId = req.params.postId;
//   } catch (error) {
//     console.log(error);
//     res.json({
//       error: "An error occured",
//     });
//   }
// };
export {
  createPost,
  getPostsOfCurrentUser,
  getSpecificPost,
  getCommentsOfPost,
  addComment,
  getPostsOfUsersCurrentUserFollows,
  likePost,
  unlikePost,
  // getPostLikes,
};
