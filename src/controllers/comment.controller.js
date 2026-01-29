import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {Video} from "../models/video.model.js"

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
    const {videoId} = req.params
    const {comment} = req.body    
    
    if(!videoId) {
        throw new ApiError(400, "Video id is missing")
    }


    // comment.trim() === "" checks if there is only spaces in the comment, it gets ignored
    if(!comment || comment.trim() === "") {  
        throw new ApiError(400, "Comment text is required")
    }

    const video = await Video.findById(videoId)
    if(!video) {
        throw new ApiError(404, "Video not found")
    }

    const newComment = await Comment.create({
       content: comment.trim(),
       video: videoId,
       owner: req.user._id
    })

    const populatedComment = await Comment.findById(newComment._id).populate("owner", "username avatar")

    return res.status(200).json(
        new ApiResponse(
        200,
        populatedComment,
        "Comment added successfully"
        )
    )
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const {commentId} = req.params
    const {comment} = req.body

    if(!commentId) {
        throw new ApiError(400, "Comment id is missing")
    }

    if(!comment?.trim()) {
        throw new ApiError(400, "Comment text is required")
    }

    const commentToBeUpdated = await Comment.findById(commentId)
    if(!commentToBeUpdated) {
        throw new ApiError(400, "Comment not found")
    }

    if(!commentToBeUpdated.owner.equals(req.user._id)){
        throw new ApiError(403, "Not authorized to update this comment")
    }

    const updatedComment = await Comment.findByIdAndUpdate(
        commentId,
        {
          $set: {
            content: comment.trim()
          }  
        },
        {
            new: true
        }
    )

    return res.status(200).json(
        new ApiResponse(
            200,
            updatedComment,
            "Comment updated successfully"
        )
    )
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
