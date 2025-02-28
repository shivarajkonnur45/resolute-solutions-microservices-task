const jwt = require('jsonwebtoken');
const db = require('../models/index');
const Sequelize = require('sequelize');
const add_coursevideo = async (MessageBody) => {
    console.log('MessageBody',MessageBody)
    
    try {
        const CouseData = await db.CourseVideo.create({
            UserID : MessageBody.UserID,
            VideoName : MessageBody.VideoName,
            BufferTime : MessageBody.BufferTime,
            AccountType : MessageBody.AccountType,
            ParentID : MessageBody.ParentID,
        });
        if (!CouseData) {
            return res.status(400).send({ErrorCode: "REQUEST",message: "Course record not added"});
        }
        return "Course addedd successfully"
    } catch (error) {
        return "Sorry! there was server-side error"
    }
    
}


// const update_coursevideo = async (MessageBody) => {
//     try {

//         try{
//             var data = {
//                 // UserID : MessageBody.UserID,
//                 VideoName : MessageBody.VideoName,
//                 BufferTime : MessageBody.BufferTime,
//                 AccountType : MessageBody.AccountType,
//                 ParentID : MessageBody.ParentID,
//             }

//             //---Course history table-------------------------------------------//
//                 const UserID_wise_data = await db.user.findOne({
//                     where: { UserID: MessageBody.UserID },
//                 });
                
//                 if (!UserID_wise_data) {
//                     return res.status(400).send({ErrorCode: "REQUEST",message: "Course Data not found"});
//                 }

//                 const CreateUserHistoryData = await db.CourseVideoHistory.create(
//                     UserID_wise_data.dataValues
//                 );

//                 if (!CreateUserHistoryData) {
//                     return res.status(400).send({ErrorCode: "REQUEST",message: "Course Data Not insert in History Table"});
//                 }
//             //-------------------------------------------------------------------//
//             await db.CourseVideo.update(
//                 data,
//                 { where:{ UserID : MessageBody.UserID } }
//             );
//             return "Course updated successfully"
//         } catch (error) {
//             return "Failed to update course"
//         } 
//     } catch (error) {
//         return "Sorry! there was server-side error"
//     }
// }
module.exports = {
    add_coursevideo,
    //update_coursevideo,
}