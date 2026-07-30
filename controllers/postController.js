import { nextDay } from "date-fns";
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
    newPost.user = {
      id: req.user.id,
      first: req.user.first,
      last: req.user.last,
      user: req.user.user,
    };
    newPost.isLikedByUser = false;
    newPost.comments = [];
    newPost._count = {
      likes: 0,
    };
    delete newPost.userId;

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
  try {
    const postId = req.params.postId;
    const cursor = req.query.cursor;
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
          postId: postId,
        },
        take: 5,
        skip: 1,
        cursor: {
          id: cursor,
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
        orderBy: {
          date: "desc",
        },
      });
      if (comments !== null) {
        return res.json({
          comments: comments,
          cursor:
            comments.length > 1 && comments.length === 5
              ? comments[comments.length - 1].id
              : null,
        });
      } else {
        return res.json({
          message: "There was an error in getting the comments",
        });
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "An error occured" });
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
            text: true,
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
    const postId = req.params.postId;
    const likeExists = await prisma.postLikes.findFirst({
      where: {
        userId: req.user.id,
        postId: postId,
      },
      select: {
        id: true,
      },
    });
    if (!likeExists) {
      return res.json({
        message: "Post isn't liked",
      });
    } else {
      const unlike = await prisma.postLikes.delete({
        where: {
          id: likeExists.id,
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
const getPosts = async (req, res) => {
  try {
    if (!req.query.cursor) {
      const findPosts = await prisma.post.findMany({
        take: 20,
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
          date: true,
          text: true,
          _count: {
            select: {
              likes: true,
            },
          },
          likes: {
            select: {
              id: true,
            },
            where: {
              userId: req.user.id,
            },
          },
          comments: {
            take: 3,
            select: {
              id: true,
              text: true,
              date: true,
              user: {
                select: {
                  id: true,
                  user: true,
                  first: true,
                  last: true,
                },
              },
              _count: {
                select: {
                  likes: true,
                },
              },
            },
            orderBy: {
              date: "desc",
            },
          },
        },
        orderBy: {
          date: "desc",
        },
      });
      if (!findPosts) {
        return res.status(404).json({
          error: "There was an error in getting the posts",
        });
      } else {
        findPosts.forEach((post) => {
          if (post.likes.length === 0) {
            delete post.likes;
            post.isLikedByUser = false;
          } else {
            delete post.likes;
            post.isLikedByUser = true;
          }
        });
        return res.json({
          posts: findPosts,
          cursor:
            findPosts.length === 20 ? findPosts[findPosts.length - 1].id : null,
        });
      }
    } else {
      const cursor = req.query.cursor;
      const nextPage = await prisma.post.findMany({
        take: 20,
        skip: 1,
        cursor: {
          id: cursor,
        },
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
          date: true,
          text: true,
          _count: {
            select: {
              likes: true,
            },
          },
          comments: {
            take: 3,
            select: {
              date: true,
              text: true,
              id: true,
              user: {
                select: {
                  id: true,
                  user: true,
                  first: true,
                  last: true,
                },
              },
              _count: {
                select: {
                  likes: true,
                },
              },
            },
            orderBy: {
              date: "desc",
            },
          },
        },
        orderBy: {
          date: "desc",
        },
      });
      if (nextPage) {
        return res.json({
          posts: nextPage,
          cursor:
            nextPage.length === 20 ? nextPage[nextPage.length - 1].id : null,
        });
      } else {
        return res.status(404).json({
          error: "There was an error in getting the posts",
        });
      }
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: "An error occured",
    });
  }
};

const deletePost = async (req, res) => {
  try {
    const postId = req.params.postId;
    const postExists = await prisma.post.findUnique({
      where: {
        id: postId,
      },
      select: {
        id: true,
        userId: true,
      },
    });
    if (postExists) {
      if (postExists.userId !== req.user.id) {
        return res.status(403).json({
          error: "Permission denied",
        });
      } else {
        const deleted = await prisma.post.delete({
          where: {
            id: postId,
          },
        });
        if (deleted) {
          return res.json({
            message: "Post deleted successfully",
          });
        } else {
          return res.status(404).json({
            error: "Post couldn't be deleted",
          });
        }
      }
    } else {
      return res.status(404).json({ error: "Post couldn't be found" });
    }
  } catch (error) {
    console.log(error);
    return res.json({
      error: "An error occured",
    });
  }
};

const editPost = async (req, res) => {
  try {
    const postId = req.params.postId;
    const edit = req.body.edit;
    const findPost = await prisma.post.findUnique({
      where: {
        id: postId,
      },
      select: {
        id: true,
        userId: true,
      },
    });
    if (findPost) {
      if (findPost.userId !== req.user.id) {
        return res.status(403).json({
          error: "Permission denied",
        });
      }
      const updatePost = await prisma.post.update({
        where: {
          id: postId,
        },
        data: {
          text: edit,
          date: new Date(),
        },
      });
      if (updatePost) {
        return res.json({
          message: "Post updated successfuly",
          post: updatePost,
        });
      } else {
        return res.status(400).json({
          error: "Post coudln't be updated",
        });
      }
    } else {
      return res.status(404).json({
        error: "Post doesn't exist",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(404).json({ error: "An error occured" });
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
  editPost,
  deletePost,
  getPostsOfCurrentUser,
  getSpecificPost,
  getCommentsOfPost,
  addComment,
  getPostsOfUsersCurrentUserFollows,
  likePost,
  unlikePost,
  getPosts,
  // getPostLikes,
};
