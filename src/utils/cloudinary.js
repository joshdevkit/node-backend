import {v2 as cloudinary } from 'cloudinary'

import{ config }  from 'dotenv'

config()

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_USERNAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECREY_KEY
})

export default cloudinary