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
const getAllUserPosts = async (req, res) => {
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
export { createPost, getAllUserPosts };
