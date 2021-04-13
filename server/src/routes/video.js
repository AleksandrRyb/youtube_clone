import express from "express";
import { PrismaClient } from "@prisma/client";

import { getAuthUser, protect } from "../middlewares/authorization";

const prisma = new PrismaClient();

function getVideoRoutes() {
  const router = express.Router();

  router.get("/", getRecomendedVideos);
  router.get("/trending", getTrendingVideos);
  router.get("/search", searchVideos);
  router.get("/:videoId", getAuthUser, getVideo);
  router.delete("/:videoId", protect, deleteVideo);

  router.post("/", protect, createVideo);
  router.get("/:videoId/view", getAuthUser, addVideoView);
  router.get("/:videoId/like", protect, videoLike);
  router.get("/:videoId/dislike", protect, videoDislike);
  router.post("/:videoId/comment", protect, addComment);
  router.delete("/:videoId/comment/:commentId", protect, deleteComment);

  return router;
}

async function getVideoViews(videos) {
  for (const video of videos) {
    const views = await prisma.view.count({
      where: {
        videoId: {
          equals: video.id,
        },
      },
    });
    video.views = views;
  }
  return videos;
}

async function getRecomendedVideos(req, res) {
  let videos = await prisma.video.findMany({
    include: {
      user: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!videos.length) {
    return res.status(200).json({ videos });
  }

  videos = await getVideoViews(videos);

  res.status(200).json({ videos });
}

async function getTrendingVideos(req, res) {
  let videos = await prisma.video.findMany({
    include: {
      user: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!videos.length) {
    return res.status(200).json({ videos });
  }

  videos = await getVideoViews(videos);
  videos.sort((a, b) => b.video - a.video);

  res.status(200).json({ videos });
}

async function searchVideos(req, res, next) {
  const { query } = req.query;
  if (!query) {
    return next({
      message: "Please enter a search query.",
      statusCode: 400,
    });
  }

  let videos = await prisma.video.findMany({
    where: {
      OR: [
        {
          title: {
            contains: query,
            mode: "insensitive",
          },
        },
        {
          description: {
            contains: query,
            mode: "insensitive",
          },
        },
      ],
    },
  });

  if (!videos.length) {
    return res.status(200).json({ videos });
  }

  videos = await getVideoViews(videos);

  res.status(200).json({ videos });
}

async function createVideo(req, res) {
  const { title, description, thumbnail, url } = req.body;

  const video = await prisma.video.create({
    data: {
      title,
      description,
      thumbnail,
      url,
      user: {
        connect: {
          id: req.user.id,
        },
      },
    },
  });

  res.status(200).json({ video });
}

async function addComment(req, res, next) {
  const video = await prisma.video.findUnique({
    where: {
      id: req.params.videoId,
    },
  });

  if (!video) {
    return next({
      message: "There is no existing video",
      statusCode: 404,
    });
  }

  const comment = await prisma.comment.create({
    data: {
      text: req.body.text,
      user: {
        connect: {
          id: req.user.id,
        },
      },
      video: {
        connect: {
          id: req.params.videoId,
        },
      },
    },
  });

  res.status(200).json({ comment });
}

async function deleteComment(req, res) {
  const comment = await prisma.comment.findUnique({
    where: {
      id: req.params.commentId,
    },
    select: {
      userId: true,
    },
  });

  if (comment.userId !== req.user.id) {
    return res.status(401).send("Don't have permissiom do delete this comment");
  }

  await prisma.comment.delete({
    where: {
      id: req.params.commentId,
    },
  });

  res.status(200).json({});
}

async function addVideoView(req, res) {
  const video = await prisma.video.findUnique({
    where: {
      id: req.params.videoId,
    },
  });

  if (!video) {
    return next({
      message: "There is no existing video",
      statusCode: 404,
    });
  }

  if (req.user) {
    await prisma.view.create({
      data: {
        video: {
          connect: {
            id: req.params.videoId,
          },
        },
        user: {
          connect: {
            id: req.user.id,
          },
        },
      },
    });
  } else {
    await prisma.view.create({
      data: {
        video: {
          connect: {
            id: req.params.videoId,
          },
        },
      },
    });
  }

  res.status(200).json({});
}

async function videoLike(req, res, next) {
  const video = await prisma.video.findUnique({
    where: {
      id: req.params.videoId,
    },
  });

  if (!video) {
    return next({
      message: `No video found with id: ${req.params.videoId}`,
      statusCode: 404,
    });
  }

  const isLiked = await prisma.videoLike.findFirst({
    where: {
      userId: {
        equals: req.user.id,
      },
      videoId: {
        equals: req.params.videoId,
      },
      like: {
        equals: 1,
      },
    },
  });

  const isDisliked = await prisma.videoLike.findFirst({
    where: {
      userId: {
        equals: req.user.id,
      },
      videoId: {
        equals: req.params.videoId,
      },
      like: {
        equals: -1,
      },
    },
  });

  if (isLiked) {
    await prisma.videoLike.delete({
      where: {
        id: isLiked.id,
      },
    });
  } else if (isDisliked) {
    await prisma.videoLike.update({
      where: {
        id: isDisliked.id,
      },
      data: {
        like: 1,
      },
    });
  } else {
    await prisma.videoLike.create({
      data: {
        user: {
          connect: {
            id: req.user.id,
          },
        },
        video: {
          connect: {
            id: req.params.videoId,
          },
        },
        like: 1,
      },
    });
  }

  res.status(200).json({});
}

async function videoDislike(req, res, next) {
  const video = await prisma.video.findUnique({
    where: {
      id: req.params.videoId,
    },
  });

  if (!video) {
    return next({
      message: `No video found with id: ${req.params.videoId}`,
      statusCode: 404,
    });
  }

  const isLiked = await prisma.videoLike.findFirst({
    where: {
      userId: {
        equals: req.user.id,
      },
      videoId: {
        equals: req.params.videoId,
      },
      like: {
        equals: 1,
      },
    },
  });

  const isDisliked = await prisma.videoLike.findFirst({
    where: {
      userId: {
        equals: req.user.id,
      },
      videoId: {
        equals: req.params.videoId,
      },
      like: {
        equals: -1,
      },
    },
  });

  if (isDisliked) {
    await prisma.videoLike.delete({
      where: {
        id: isDisliked.id,
      },
    });
  } else if (isLiked) {
    await prisma.videoLike.update({
      where: {
        id: isLiked.id,
      },
      data: {
        like: -1,
      },
    });
  } else {
    await prisma.videoLike.create({
      data: {
        user: {
          connect: {
            id: req.user.id,
          },
        },
        video: {
          connect: {
            id: req.params.videoId,
          },
        },
        like: -1,
      },
    });
  }

  res.status(200).json({});
}

async function getVideo(req, res, next) {
  const video = await prisma.video.findUnique({
    where: {
      id: req.params.videoId,
    },
    include: {
      user: true,
      comments: {
        include: {
          user: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!video) {
    return next({
      message: `No video found with id: ${req.params.videoId}`,
      statusCode: 404,
    });
  }

  let isVideoMine = false;
  let isLiked = false;
  let isDisliked = false;
  let isSubscribed = false;
  let isViewed = false;

  if (req.user) {
    isVideoMine = req.user.id === video.userId;

    isLiked = await prisma.videoLike.findFirst({
      where: {
        userId: {
          equals: req.user.id,
        },
        videoId: {
          equals: req.params.videoId,
        },
        like: {
          equals: 1,
        },
      },
    });

    isDisliked = await prisma.videoLike.findFirst({
      where: {
        userId: {
          equals: req.user.id,
        },
        videoId: {
          equals: req.params.videoId,
        },
        like: {
          equals: -1,
        },
      },
    });

    isViewed = await prisma.view.findFirst({
      where: {
        userId: {
          equals: req.user.id,
        },
        videoId: {
          equals: req.params.videoId,
        },
      },
    });

    isSubscribed = await prisma.subscription.findFirst({
      where: {
        subscriberId: {
          equals: req.user.id,
        },
        subscribedToId: {
          equals: video.userId,
        },
      },
    });
  }

  const likesCount = await prisma.videoLike.count({
    where: {
      AND: {
        videoId: {
          equals: req.params.videoId,
        },
        like: {
          equals: 1,
        },
      },
    },
  });

  const dislikesCount = await prisma.videoLike.count({
    where: {
      AND: {
        videoId: {
          equals: req.params.videoId,
        },
        like: {
          equals: -1,
        },
      },
    },
  });

  const views = await prisma.view.count({
    where: {
      videoId: {
        equals: req.params.videoId,
      },
    },
  });

  const subscribersCount = await prisma.subscription.count({
    where: {
      subscribedToId: {
        equals: video.userId,
      },
    },
  });

  video.commentCount = video.comments.length;
  video.isLiked = Boolean(isLiked);
  video.isDisliked = Boolean(isDisliked);
  video.likesCount = likesCount;
  video.dislikesCount = dislikesCount;
  video.isVideoMine = isVideoMine;
  video.views = views;
  video.isSubscribed = Boolean(isSubscribed);
  video.isViewed = Boolean(isViewed);
  video.subscribersCount = subscribersCount;

  res.status(200).json({ video });
}

async function deleteVideo(req, res) {
  const video = await prisma.video.findUnique({
    where: {
      id: req.params.videoId,
    },
    select: {
      userId: true,
    },
  });

  if (video.userId !== req.user.id) {
    return res
      .status(401)
      .send("You don't have permissions to delete this video");
  }

  await prisma.view.deleteMany({
    where: {
      videoId: {
        equals: req.params.videoId,
      },
    },
  });

  await prisma.videoLike.deleteMany({
    where: {
      videoId: {
        equals: req.params.videoId,
      },
    },
  });

  await prisma.comment.deleteMany({
    where: {
      videoId: {
        equals: req.params.videoId,
      },
    },
  });

  await prisma.video.delete({
    where: {
      id: req.params.videoId,
    },
  });

  res.status(200).json({});
}

export { getVideoRoutes, getVideoViews };
