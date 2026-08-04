import prisma from "../lib/prisma.js";

const allowFollow = async (req, res) => {
  const requestId = req.params.requestId;
  try {
    const findRequest = await prisma.followRequest.findUnique({
      where: {
        id: requestId,
      },
    });
    if (!findRequest) {
      return res.json({
        message: "Follow request doesn't exist",
      });
    } else {
      const allowFollow = await prisma.user.update({
        where: {
          id: req.user.id,
        },
        data: {
          followers: {
            connect: {
              id: findRequest.fromId,
            },
          },
        },
      });
      if (allowFollow) {
        const deleteRequest = await prisma.followRequest.delete({
          where: {
            id: requestId,
          },
        });
        return res.json({
          message: "User followed successfuly",
        });
      } else {
        return res.json({ message: "Follow request failed" });
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "An error occured",
    });
  }
};

const getUserFollowers = async (req, res) => {
  try {
    const followers = await prisma.user.findFirst({
      where: {
        id: req.user.id,
      },
      select: {
        followers: true,
      },
    });
    if (followers !== null) {
      return res.json({
        followers: followers,
      });
    } else {
      return res.json({
        message: "Couldn't retrieve followers",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "An error occured" });
  }
};
const getWhoTheUserFollows = async (req, res) => {
  try {
    const following = await prisma.user.findFirst({
      where: {
        id: req.user.id,
      },
      select: {
        following: true,
      },
    });
    if (following !== null) {
      return res.json({
        following: following,
      });
    } else {
      return res.json({ message: "Couldn't retreive following " });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: "An error occured",
    });
  }
};

const unfollowUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    const unfollow = await prisma.user.update({
      where: {
        id: req.user.id,
      },
      data: {
        followers: {
          disconnect: {
            id: userId,
          },
        },
      },
    });
    if (!unfollow) {
      return res.json({
        message: "Unfollow unsuccessful",
      });
    } else {
      return res.json({ message: "User unfollowed successfuly" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "An error occured" });
  }
};

const sendfollowRequest = async (req, res) => {
  const userId = req.params.userId;
  try {
    const request = await prisma.followRequest.create({
      data: {
        fromId: req.user.id,
        toId: userId,
      },
    });
    if (request !== null) {
      return res.json({
        message: "Follow request send successfuly",
        request,
      });
    } else {
      return res.status(400).json({
        error: "Follow request failed",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "An error occured" });
  }
};

const userInfo = async (req, res) => {
  try {
    const findUser = await prisma.user.findUnique({
      where: {
        id: req.user.id,
      },
      select: {
        id: true,
        user: true,
        first: true,
        last: true,
        _count: {
          select: {
            followers: true,
            following: true,
          },
        },
        post: {
          select: {
            id: true,
            text: true,
            date: true,
            _count: {
              select: {
                likes: true,
              },
            },
          },
        },
        comments: {
          select: {
            id: true,
            text: true,
            date: true,
            _count: {
              select: {
                likes: true,
              },
            },
          },
        },
      },
    });
    if (findUser) {
      return res.status(200).json({
        user: findUser,
      });
    } else {
      return res.status(404).json({
        error: "User doesn't exist or couldn't be found",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(404).json({ error: "An error occured" });
  }
};

const getFollowRequests = async (req, res) => {
  try {
    const followRequests = await prisma.followRequest.findMany({
      where: {
        toId: req.user.id,
      },
    });
    if (!followRequests) {
      return res.json({ message: "Coulnd't retrieve follow requests" });
    } else {
      return res.json({ requests: followRequests });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: "An error occured",
    });
  }
};

export {
  allowFollow,
  unfollowUser,
  getUserFollowers,
  getWhoTheUserFollows,
  userInfo,
  sendfollowRequest,
  getFollowRequests,
};
