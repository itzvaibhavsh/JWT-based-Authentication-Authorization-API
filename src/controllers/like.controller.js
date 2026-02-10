import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params

    const userId = req.user?._id

    if(!videoId) {
        throw new ApiError(400, "Video id is required")
    }

    if(!userId) {
        throw new ApiError(401, "Unauthorized")
    }

    const existingLike = await Like.findOne({
        video: videoId,
        likedBy: userId
    })
    
    let result
    let message

    if(existingLike) {
        await Like.findByIdAndDelete(existingLike._id)

        result = false
        message = "Video unliked successfully"
    } else {
        await Like.create({
            video: videoId,
            likedBy: userId
        })

        result = true
        message = "Video liked successfully"
    }

    return res.status(200).json(
        new ApiResponse(
        200,
        {liked: result},
        message
        )
    )

})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    const userId = req.user?._id

    if(!commentId) {
        throw new ApiError(400, "Comment id is required")
    }

    if(!userId) {
        throw new ApiError(401, "Unauthorized")
    }

    const existingLike = Like.findOne({
        comment: commentId,
        likedBy: userId
    })
    
    let result
    let message

    if(existingLike) {
        await Like.findByIdAndDelete(existingLike._id)

        result = false
        message = "Video unliked successfully"
    } else {
        await Like.create({
            comment: commentId,
            likedBy: userId
        })

        result = true
        message = "Video liked successfully"
    }

    return res.status(200).json(
        new ApiResponse(
        200,
        {liked: result},
        message
        )
    )
})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    const userId = req.user?._id

    if(!tweetId) {
        throw new ApiError(400, "Tweet id is required")
    }

    if(!userId) {
        throw new ApiError(401, "Unauthorized")
    }

    const existingLike = Like.findOne({
        tweet: tweetId,
        likedBy: userId
    })
    
    let result
    let message

    if(existingLike) {
        await Like.findByIdAndDelete(existingLike._id)

        result = false
        message = "Video unliked successfully"
    } else {
        await Like.create({
            tweet: tweetId,
            likedBy: userId
        })

        result = true
        message = "Video liked successfully"
    }

   return res.status(200).json(
        new ApiResponse(
        200,
        {liked: result},
        message
        )
    )
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
   
    const userId = req.user?._id

    if(!userId) {
        throw new ApiError(401, "Unauthorized")
    }

    let {page = 1, limit = 10} = req.query

    const pipeline = Like.aggregate([
        {
            $match: {
                likedBy: new mongoose.Types.ObjectId(userId),
                video: {$ne: null}
            }
        },
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
                "video.isPublished": true
            }
        },
        {
            $sort: {
                createdAt: -1
            }
        },
        {
            $project: {
                _id: 0,
                likedAt: "$createdAt",
                videoId: "$video._id",
                title: "$video.title",
                thumbnail: "$video.thumbnail",
                views: "$video.views",
                duration: "$video.duration",
                owner: "$video.owner"
            }
        }
    ])

    const options = {
        page: Number(page),
        limit: Number(limit)
    }

    const result = await Like.aggregatePaginate(pipeline, options)

    return res.status(200).json(
        new ApiResponse(
            200,
            result,
            "Liked videos fetched successfully"
        )
    )
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}