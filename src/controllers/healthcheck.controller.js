import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

// mostly checks if the server is running
const healthcheck = asyncHandler(async (req, res) => {
    res.status(200).json({status: "OK"})
})

export {
    healthcheck
    }
    