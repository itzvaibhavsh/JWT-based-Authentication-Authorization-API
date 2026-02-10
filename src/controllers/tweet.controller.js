import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
   
    const {content} = req.body
    const userId = req.user?._id

    if(!userId) {
        throw new ApiError(401, "Unauthorized")
    }

    if(!content || content.trim() === "") {
        throw new ApiError(400, "Tweet content is required")
    }

    if(content.length > 280){
        throw new ApiError(400, "Tweet content exceeds 280 characters")
    }

    const tweet = await Tweet.create({
        content: content.trim(),
        owner: userId
    })

    if(!tweet) {
        throw new ApiError(500, "Failed to create tweet")
    }

    return res.status(201).json(
        new ApiResponse(201, tweet, "Tweet created successfully")
    )
})

const getUserTweets = asyncHandler(async (req, res) => {
    
    const {userId} = req.params
    if(!userId) {
        throw new ApiError(400, "User id is required")
    }

    if(!mongoose.isValidObjectId(userId)){
        throw new ApiError(400, "Invalid user id")
    }

    const page = Number(req.query.page) || 1
    const limit = Number(req.query.page) || 10

    const tweetAggregate = Tweet.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $sort: {
                createdAt: -1
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner"
            }
        },
        {
            $unwind: "$owner"
        },
        {
            $project: {
                content: 1,
                createdAt: 1,
                owner: {
                    _id: 1,
                    username: 1,
                    avatar: 1
                }
            }
        }
    ])

    const tweets = await Tweet.aggregatePaginate(tweetAggregate, {
        page, limit
    })

    return res.status(200).json(
        new ApiResponse(
            200,
            tweets,
            "User tweets fetched successfully"
        )
    )
})

const updateTweet = asyncHandler(async (req, res) => {
   
    const {tweetId} = req.params
    const {content} = req.body
    if(!tweetId) {
        throw new ApiError(400, "Tweet id is required")
    }

    if(!mongoose.isValidObjectId(tweetId)){
        throw new ApiError(400, "Invalid tweet id")
    }

    const userId = req.user?._id
    if(!userId) {
        throw new ApiError(401, "Unauthorized")
    }

    if(!content || content.trim() === ""){
        throw new ApiError(400, "Content is required")
    }

    const tweet = await Tweet.findOneAndUpdate({
        _id: tweetId,
        owner: userId
    },
    {
        $set: {content}    // ensures partial update without changing whole document
    } ,
    {
        new: true,
        runValidators: true // findOneAndUpdate doesn't run schema validators by its own, so this
    }
    )

    if(!tweet){
        throw new ApiError(404, "Tweet not found")
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            tweet,
            "Tweet updated succesfully"
        )
    )

})

const deleteTweet = asyncHandler(async (req, res) => {
   
    const {tweetId} = req.params
    if(!tweetId){
        throw new ApiError(400, "Tweet id is required")
    }

    const userId = req.user?._id
    if(!userId){
        throw new ApiError(401, "Unauthorized")
    }

    const tweet = await Tweet.findOneAndDelete({
        _id: tweetId,
        owner: userId
    })

    if(!tweet){
        throw new ApiError(404, "Tweet not found or access denied")
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "Tweet deleted successfully"
        )
    )
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}
