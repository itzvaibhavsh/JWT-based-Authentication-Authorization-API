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
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist
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
