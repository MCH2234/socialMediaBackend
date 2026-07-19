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
export { getAllComments, getSpecificComment };
