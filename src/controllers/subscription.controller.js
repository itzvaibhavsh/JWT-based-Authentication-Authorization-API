import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
   
    if(!channelId) {
        throw new ApiError(404, "Channel id is required")
    }

    const subscriberId = req.user?._id

    const existingSubscription = await Subscription.findOne({
        subscriber: subscriberId,
        channel: channelId
    })

    let result;
    let message;

    if(existingSubscription) {
        await Subscription.findByIdAndDelete(existingSubscription._id)

        result = false
        message = "Channel unsubscribed successfully"
    }

    else {
        await Subscription.create({
            subscriber: subscriberId,
            channel: channelId
        })

        result = true
        message = "Channel subscribed successfully"
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            {subscribed: result},
            message
        )
    )
    
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params

    if(!channelId) {
        throw new ApiError(400, "Channel id is required")
    }

    const subscribers = await Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(channelId)  // selects all rows with this channel id
            }
        },
        // adds subscriber details to each row
        {
            $lookup: {
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "subscriberDetails"
            }
        },
        {
            $unwind: "$subscriberDetails"  // converts subscriberDetails array to object
        },
        {
            $project: {
                _id: 0, // remove id from the response 
                subscriberId: "$subscriberDetails._id",
                username: "$subscriberDetails.username",
                fullName: "$subscriberDetails.fullName",
                avatar: "$subscriberDetails.avatar"
            }
        }
    ])

    return res.status(200).json(
        new ApiResponse(
        200,
        subscribers,
        "Channel subscribers fetched successfully"
        )
    )
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params

    if(!subscriberId) {
        throw new ApiError(400, "Subscriber id not found")
    }

    const subscribedChannels = await Subscription.aggregate([
        {
            $match: {
                subscriber: new mongoose.Types.ObjectId(subscriberId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as: "subscribedChannelDetails"
            }
        },
        {
            $unwind: "$subscribedChannelDetails"
        },
        {
            $project: {
                _id: 0,
                channelId: "$subscribedChannelDetails._id",
                username: "$subscribedChannelDetails.username",
                fullName: "$subscribedChannelDetails.fullName",
                avatar: "$subsribedChannelDetails.avatar"
            
            }
        }
    ])

    return res.status(200).json(
        new ApiResponse(
            200,
            subscribedChannels,
            "Subscribed channels fetched successfully"
        )
    )
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}