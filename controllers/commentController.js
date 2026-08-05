import prisma from "../lib/prisma.js";
import { validationResult, body } from "express-validator";

const getAllComments = async (req, res) => {
  const comments = await prisma.comment.findMany({
    where: {
      userId: req.user.id,
    },
  });
  if (comments !== null) {
    return res.json({
      comments: comments,
    });
  } else {
    return res.status(404).json({
      error: "Comments not found",
    });
  }
};
const getSpecificComment = async (req, res) => {
  const commentId = req.params.commentId;
  const comment = await prisma.comment.findFirst({
    where: {
      id: commentId,
    },
    include: {
      _count: {
        select: {
          likes: true,
        },
      },
      likes: {
        select: {
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
  if (comment !== null) {
    return res.json({
      comment: comment,
    });
  } else {
    return res.status(404).json({
      error: "Comment not found!",
    });
  }
};

const likeComment = async (req, res) => {
  try {
    const commentId = req.params.commentId;
    const commentExists = await prisma.comment.findUnique({
      where: {
        id: commentId,
      },
      select: {
        id: true,
      },
    });
    if (!commentExists) {
      return res.status(404).json({
        error: "Comment doesn't exist or couldn't be found",
      });
    } else {
      const likeDuplicates = await prisma.commentLikes.findFirst({
        where: {
          userId: req.user.id,
          commentId: commentId,
        },
        select: {
          id: true,
        },
      });
      if (likeDuplicates) {
        return res.json({
          error: "Comment already liked",
        });
      } else {
        const addLike = await prisma.commentLikes.create({
          data: {
            userId: req.user.id,
            commentId: commentId,
          },
        });
        if (!addLike) {
          return res.json({
            error: "Comment couldn't be liked",
          });
        } else {
          return res.json({
            error: "Comment liked successfuly",
          });
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

const unlikeComment = async (req, res) => {
  try {
    const commentId = req.params.commentId;
    const likeExists = await prisma.commentLikes.findFirst({
      where: {
        commentId: commentId,
        userId: req.user.id,
      },
      select: {
        userId: true,
        id: true,
      },
    });
    if (!likeExists) {
      return res.json({
        error: "Can\'t unlike comments that aren\'t liked",
      });
    } else {
      if (likeExists.userId !== req.user.id) {
        return res.json({
          error: "Permission denied",
        });
      }
      const unlike = await prisma.commentLikes.delete({
        where: {
          id: likeExists.id,
        },
      });
      if (!unlike) {
        return res.json({
          error: "Couln't unlike the comment",
        });
      } else {
        return res.json({
          error: "Comment unliked successfuly",
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

const validateAndReplyToComment = [
  body("comment")
    .trim()
    .not()
    .isEmpty()
    .withMessage("Replies to comments can't be empty"),
  async (req, res) => {
    try {
      const validationErrors = validationResult(req);
      if (validationErrors.isEmpty() === false) {
        return res
          .status(400)
          .json({ errors: validationErrors.array()[0].msg });
      }
      const comment = req.body.comment;
      const commentId = req.params.commentId;
      const commentExists = await prisma.comment.findUnique({
        where: {
          id: commentId,
        },
        select: {
          id: true,
        },
      });
      if (!commentExists) {
        return res.json({
          error: "Comment doesn't exist",
        });
      } else {
        const newComment = await prisma.comment.create({
          data: {
            text: comment,
            userId: req.user.id,
            date: new Date(),
            parentCommentId: commentId,
          },
          select: {
            date: true,
            id: true,
            text: true,
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
        });
        if (newComment) {
          await prisma.comment.update({
            where: {
              id: commentId,
            },
            data: {
              reply_count: { increment: 1 },
            },
          });
          newComment.isLikedByUser = false;
          return res.json({
            message: "Comment added successfuly",
            reply: newComment,
          });
        } else {
          return res.json({
            error: "Comment couldn't be added",
          });
        }
      }
    } catch (error) {
      console.log(error);
      return res.json({
        error: "An error occured",
      });
    }
  },
];

const getRepliesOfComment = async (req, res) => {
  try {
    const parentId = req.params.parentId;
    const parentCommentExists = await prisma.comment.findUnique({
      where: {
        id: parentId,
      },
      select: {
        id: true,
        childComments: {
          select: {
            user: {
              select: {
                id: true,
                user: true,
                first: true,
                last: true,
              },
            },
            id: true,
            text: true,
            date: true,
            likes: {
              select: {
                id: true,
              },
              where: {
                userId: req.user.id,
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
    });
    if (!parentCommentExists) {
      return res.json({
        error: "Parent comment doesn't exist or couldn't be found",
      });
    } else {
      parentCommentExists.childComments.forEach((reply) => {
        if (reply.likes.length === 0) {
          delete reply.likes;
          reply.isLikedByUser = false;
        } else {
          delete reply.likes;
          reply.isLikedByUser = true;
        }
      });
      return res.json({
        replies: parentCommentExists,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: "An error occured",
    });
  }
};
export {
  validateAndReplyToComment,
  getAllComments,
  getSpecificComment,
  likeComment,
  unlikeComment,
  getRepliesOfComment,
};
