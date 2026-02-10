import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body
    
    //TODO: create playlist
    if(!name || !name.trim()) {
        throw new ApiError(400, "Playlist name is required")
    }

    if(!description || !description.trim()) {
        throw new ApiError(400, "Playlist description is required")
    }

    const userId = req.user?._id

    if(!userId) {
        throw new ApiError(401, "Unauthorized")
    }

    const existingPlaylist = await Playlist.findOne({
        owner: userId,
        name: name.trim()
    })

    if(existingPlaylist) {
        throw new ApiError(409, "Playlist with same name already exists")
    }

    const playlist = await Playlist.create({
        name: name.trim(),
        description: description.trim(),
        owner: userId
    })

    if(!playlist) {
        throw new ApiError(500, "Failed to create playlist")
    }

    return res.status(201).json(
        new ApiResponse(
            201,
            playlist,
            "Playlist created successfully"
        )
    )

})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    //TODO: get user playlists
    if(!userId) {
        throw new ApiError(400, "user id is required")
    }

    const playlists = await Playlist.find({
        owner: userId
    }).select("-__v").sort({createdAt: -1})

    if(!playlists.length){
        return res.status(200).json(
            new ApiResponse(
                200,
                [],
                "No playlists found"
            )
        )
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            playlists,
            "Playlists fetched successfully by user"
        )
    )

})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id
    if(!playlistId) {
        throw new ApiError(400, "Playlist id is required")
    }

    const playlist = await Playlist.findById(playlistId)

    if(!playlist) {
        throw new ApiError(404, "Playlist not found")
    }

    return res.status(200).json(
        new ApiResponse(
        200,
        playlist,
        "Playlist fetched successfully by id"
        )
    )
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params

    const userId = req.user?._id

    if(!playlistId || !videoId) {
        throw new ApiError(400, "Playlist id and video id is required")
    }

    if(!userId) {
        throw new ApiError(401, "Unauthorized")
    }

    const updatedPlaylist = await Playlist.findOneAndUpdate(
        {
            _id: playlistId,
            owner: userId
        },
        {
            $addToSet:  { videos: videoId }
        },
        {
            new: true
        }
).select("-__v")
   
    if(!updatedPlaylist){
        throw new ApiError(404, "Playlist not found or you are not authorized")
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            updatedPlaylist,
            "Video added to playlist successfully"
        )
    )

})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist
    const userId = req.user?._id

    if(!playlistId || !videoId) {
        throw new ApiError(400, "Playlist id and Video id is required")
    }

    if(!userId) {
        throw new ApiError(401, "Unauthorized")
    }

    const playlist = await Playlist.findByIdAndUpdate(
        {
            _id: playlistId,
            owner: userId
        },
        {
            $pull: {
                videos: new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            new: true
        }
    )

    if(!playlist) {
        throw new ApiError(404, "Playlist not authorized or access denied")
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            playlist,
            "Video removed from playlist successfully"
        )
    )

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist
    if(!playlistId) {
        throw new ApiError(400, "Playlist id is required")
    }
    const userId = req.user?._id
    if(!userId) {
        throw new ApiError(401, "Unauthorized")
    }

    // both owner and playlistId need to be checked so that only the authorized user can delete the playlist
    const playlist = await Playlist.findOneAndDelete({
        _id: playlistId,
        owner: userId
    })

    if(!playlist) {
        throw new ApiError(404, "Playlist not found or access denied")
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "Playlist deleted successfully"
        )
    )
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist
    const userId = req.user?._id

    if(!playlistId) {
        throw new ApiError(400, "Playlist id is required")
    }

    if(!userId) {
        throw new ApiError(401, "Unauthorized")
    }
    
    // build update object dynamically (PATCH dynamically)
    const updateFields = {}

    if(name?.trim()){
        updateFields.name = name.trim()
    }

    if(description?.trim()){
        updateFields.description = description.trim()
    }

    if(Object.keys(updateFields).length === 0) {
        throw new ApiError(400, "At least one field is required to update")
    }

    const playlist = await Playlist.findOneAndUpdate(
        {
            _id: playlistId,
            owner: userId
        },
        {
            $set: updateFields
        },
        {
            new: true,
            runValidators: true
        }
    )

    if(!playlist) {
        throw new ApiError(404, "Playlist not found or access denied")
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            playlist,
            "Playlist updated successfully"
        )
    )
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}
