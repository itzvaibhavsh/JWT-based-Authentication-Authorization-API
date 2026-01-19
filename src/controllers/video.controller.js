import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary, deleteFromCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    let { page = 1, limit = 10, query, sortBy = "createdAt", sortType = "desc", userId } = req.query
    //TODO: get all videos based on query, sort, pagination
    page = parseInt(page);
    limit = parseInt(limit)

    const matchStage = {
        isPublished: true
    }

    if(userId) {
        matchStage.owner = new mongoose.Types.ObjectId(userId)
    }

    if(query) {
        const searchRegex = new RegExp(query.trim(), "i"); // i means case insensitive
        matchStage.$or = [
            {title: searchRegex},
            {description: searchRegex}
        ]
    }

    const aggregate = await Video.aggregate([
        {
            $match: matchStage
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
            $unwind: "$owner"  // breaks array into objects
        },
        {
            $project: {
                title: 1,
                description: 1,
                videoFile: 1,
                thumbnail: 1,
                createdAt: 1,
                "owner.username": 1,
                "owner.avatar": 1
            }
        }
    ])

    //console.log(aggregate)

    const options = {
        page,
        limit,
        sort: {
            [sortBy]: sortType === "asc" ? 1 : -1  // dynamically assign object key(here sortBy) in runtime
        }
    }

    const result = await Video.aggregatePaginate(aggregate, options)

    //console.log(result)

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                videos: result.docs,
                page,
                limit,
                totalVideos: result.totalDocs,
                totalPages: result.totalPages,
                hasNextPage: result.hasNextPage,
                hasPrevPage: result.hasPrevPage
            },
            "Videos fetched successfully"
        )
    )


    
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video
    if(!title || !description) {
        throw new ApiError(400, "Both fields are required")
    }

    const videoFileLocalPath = req.files?.videoFile?.[0]?.path

    if(!videoFileLocalPath) {
        throw new ApiError(400, "Video File is required")
    }

    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path

    if(!thumbnailLocalPath) {
        throw new ApiError(400, "Thumbail is required")
    }

    const videoFile = await uploadOnCloudinary(videoFileLocalPath)
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)

    //console.log(videoFile)

    if(!videoFile?.url) {
        throw new ApiError(400, "Video upload failed")
    }
    if(!thumbnail?.url) {
        throw new ApiError(400, "Thumbnail upload failed")
    }
    
    const video = await Video.create({
        title,
        description,
        videoFile: videoFile.url,
        thumbnail: thumbnail.url,
        duration: videoFile.duration,
        owner: req.user._id,
        isPublished: true
    })
    
    if(!video) {
        throw new ApiError(500, "Failed to publish video")
    }

    return res.status(201).json(
        new ApiResponse(
        201,
        video,
        "Video Published Successfully"
        )
    )

})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
    if(!videoId) {
        throw new ApiError(400, "Video ID is required")
    }
    const video = await Video.findByIdAndUpdate(
        videoId,
        {
            $inc: { views : 1}
        },
        {new: true}
    ).populate("owner", "username avatar")  // replaces owner field's object id with owner object containing _id,
    //username and avatar. Works like $lookup

    if(!video) {
        throw new ApiError(404, "Video not found")
    }

    await User.findByIdAndUpdate(
        req.user._id,
        {
            $pull: { watchHistory: videoId },   // removes the video from array
        }
    )

    await User.findByIdAndUpdate(
        req.user._id,
        {
            $push: {
                watchHistory: {
                    $each: [videoId],   // tells to push how many items to push
                    $position: 0    // works only with $each
                }
            }
        },
    )
    //console.log(uuser)

    return res.status(200).json(
        new ApiResponse(
        200,
        video,
        "Video fetched successfully"
    )
    )
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail
    const {title, description} = req.body
    if(!videoId) {
        throw new ApiError(400, "Video id is required")
    }
    
    const video = await Video.findById(videoId)
    if(!video) {
        throw new ApiError(404, "Video not found")
    }

    if(!video.owner.equals(req.user._id)) {
        throw new ApiError(403, "You are not allowed to update the video")
    }

    const uploadFields = {}
    if(title) uploadFields.title = title
    if(description) uploadFields.description = description


    let thumbnail
    if(req.file?.path) {
        thumbnail = await uploadOnCloudinary(req.file.path)

    if(!thumbnail?.url) {
        throw new ApiError(500, "Thumbnail upload failed")
    }

    uploadFields.thumbnail = thumbnail.url
}

    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {uploadFields}
        },
        {new: true}
    )
    

    return res.status(200).json(
        new ApiResponse(200, updatedVideo, "Video updated successfully")
    )

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
    if(!videoId) {
        throw new ApiError(400, "Video id is required")
    }

    const video = await Video.findById(videoId)
    if(!video) {
        throw new ApiError(404, "Video not found")
    }

    if(!video.owner.equals(req.user._id)){
        throw new ApiError(403, "You are not allowed to delete the video")
    }

    if(video.videoFile) {
        await deleteFromCloudinary(video.videoFile)
    }

    if(video.thumbnail) {
        await deleteFromCloudinary(video.thumbnail)
    }

    await Video.
    findByIdAndDelete(videoId)

    return res.status(200).json(
        new ApiResponse(200, null, "Video deleted successfully")
    )

})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if(!videoId) {
        throw new ApiError(400, "Video id is required")
    }

    const video = await Video.findById(videoId)

    if(!video) {
        throw new ApiError(404, "Video not found")
    }

    // .toString used because without it, mongoDB compares objectIds which are addresses which are generally different 
    // so returns false
    if(video.owner.toString() !== req.user._id.toString()) {  
        throw new ApiError(403, "Not authorized")
    }

    video.isPublished = !video.isPublished
    await video.save()

    return res.status(200).json(
        new ApiResponse(200, video, "Publish status toggled successfully")
    )
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
