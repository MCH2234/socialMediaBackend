import prisma from "../lib/prisma.js";

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
    res.json({
      message: "Comments not found",
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
    res.json({
      message: "Comment not found!",
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
      return res.json({
        message: "Comment doesn't exist or couldn't be found",
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
          message: "Comment already liked",
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
            message: "Comment couldn't be liked",
          });
        } else {
          return res.json({
            message: "Comment liked successfuly",
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
    const likeId = parseInt(req.params.likeId);
    const likeExists = await prisma.commentLikes.findFirst({
      where: {
        id: likeId,
      },
      select: {
        userId: true,
      },
    });
    if (!likeExists) {
      return res.json({
        message: "Can\'t unlike comments that aren\'t liked",
      });
    } else {
      if (likeExists.userId !== req.user.id) {
        return res.json({
          message: "Permission denied",
        });
      }
      const unlike = await prisma.commentLikes.delete({
        where: {
          id: likeId,
        },
      });
      if (!unlike) {
        return res.json({
          message: "Couln't unlike the comment",
        });
      } else {
        return res.json({
          message: "Comment unliked successfuly",
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
export { getAllComments, getSpecificComment, likeComment, unlikeComment };
