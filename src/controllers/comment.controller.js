import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    let {page = 1, limit = 10} = req.query

    if(!videoId) {
        throw new ApiError(400, "Video id is required")
    }
    
    page = parseInt(page)
    limit = parseInt(limit)

    if(isNaN(page) || isNaN(limit)) {
        throw new ApiError(400, "Pagination params must be numbers")
    }

    const pipeline = await Comment.aggregate([
        {
            $match: {
                video: new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $sort: { createdAt: -1 }   // doesn't update order in database, but in the return array
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
                "owner._id": 1,
                "owner.username": 1,
                "owner.avatar": 1
            }   
        }
    ]);

    const options = {
        page,
        limit
    };

    const result = await Comment.aggregatePaginate(pipeline, options);

    return res.status(200).json(
        new ApiResponse(
            200,
            result,
            "Comments fetched successfully"
        )
    )

})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }
