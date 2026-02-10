import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    const userId = req.user?._id

    if(!userId) {
        throw new ApiError(401, "Unauthorized request")
    }

    const channelId = new mongoose.Types.ObjectId(userId)

    const videoStats = await Video.aggregate([
        {
            $match: {
                owner: channelId
            }
        },
        {
            $group: {
                _id: null,
                totalVideos: {$sum: 1},
                totalViews: {$sum: "$views"}
            }
        }
    ])

    const likesStats = await Like.aggregate([
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "video"
            }
        },
        {
            $unwind: "$video"
        },
        {
            $match: {
                "video.owner": channelId
            }
        },
        {
            $group: {
                _id: null,
                totalLikes: {$sum: 1}
            }
        }
    ])

    const subscriberStats = await Subscription.aggregate([
        {
            $match: {
                channel: channelId
            }
        },
        {
            $group: {
                _id: null,
                totalSubscribers: {
                    $sum: 1
                }
            }
        }
    ])

    const stats = {
        totalVideos: videoStats[0]?.totalVideos || 0,
        totalViews: videoStats[0]?.totalViews || 0,
        totalLikes: likesStats[0]?.totalLikes || 0,
        totalSubscribers: subscriberStats[0]?.totalSubscribers || 0
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            stats,
            "Channel stats fetched successfully"
        )
    )
})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    const userId = req.user?._id
    if(!userId) {
        throw new ApiError(401, "Unauthorized")
    }
    
    let {page = 1, limit = 10} = req.query

    const aggregateQuery = Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId),
                isPublished: true
            }
        },
        {
            $sort: {createdAt: -1}
        },
        {
            $project: {
                __v: 0
            }
        }
    ])

    const videos = await Video.aggregatePaginate(
        aggregateQuery,
        {
            page: Number(page),
            limit: Number(limit)
        }
    )

    return res.status(200).json(
        new ApiResponse(
        200,
        videos,
        "Channel videos fetched successfully"
        )
    )

})

export {
    getChannelStats, 
    getChannelVideos
    }