var AWS = require("aws-sdk");
AWS.config.update({ region: process.env.SQS_REGION });
var sqs = new AWS.SQS({ apiVersion: process.env.SQS_API_VERSION });
const clientlient = async (data) => {
    try {
        // console.log(`!!!!!!!!!!!!!!!!!!!!!!!!`);
        // console.log(data);
        // console.log(`!!!!!!!!!!!!!!!!!!!!!!!!`);

        var params = {
            DelaySeconds: 0,
            MessageBody: JSON.stringify(data),
            MessageDeduplicationId: "TheWhistler",  // Required for FIFO queues
            MessageGroupId: "Group1",  // Required for FIFO queues
            QueueUrl: process.env.SQS_CLIENTLIENT_URL,
        };

        sqs.sendMessage(params, function (err, data) {

            if (err) {
                return err
            } else {
                return data;
            }
        });
    } catch (error) {
        return error.message
    }
}

const techlog = async (data) => {
    try {
        // console.log(`!!!!!!!!!!!!!!!!!!!!!!!!`);
        // console.log(data);
        // console.log(`!!!!!!!!!!!!!!!!!!!!!!!!`);


        var params = {
            DelaySeconds: 0,
            MessageBody: JSON.stringify(data),
            MessageDeduplicationId: "TheWhistler",  // Required for FIFO queues
            MessageGroupId: "Group1",  // Required for FIFO queues
            QueueUrl: process.env.SQS_TECHLOG_URL,
        };

        sqs.sendMessage(params, function (err, data) {
            if (err) {
                return err;
            }
            else {
                // console.log(data);
                return data;
            }
        });
    } catch (error) {
        return error.message
    }
}


module.exports = {
    clientlient,
    techlog
}




// async function sqsValidator(req,res){
//     try {
//         var MessageBody = {
//             type:'add_student',
//             data: req.body
//         }
//         var params = {
//             DelaySeconds: 0,
//             MessageBody: JSON.stringify(MessageBody),
//             MessageDeduplicationId: "TheWhistler",  // Required for FIFO queues
//             MessageGroupId: "Group1",  // Required for FIFO queues
//             QueueUrl: QueueUrl,
//         };
//         sqs.sendMessage(params, function (err, data) {
//             if (err) {
//                 console.log("=======================");
//                 console.log("err", err);
//                 console.log("=======================");
//                 res.status(500).json({ message: err });

//             } else {
//                 console.log("=======================");
//                 console.log("Success", data);
//                 console.log("=======================");
//                 res.status(200).json({ message: data });
//             }
//         });
//     } catch (error) {
//         console.log("=======================");
//         console.log("Error", error);
//         console.log("=======================");
//         res.status(500).json({ message: error});

//     }
// }

// module.exports = sqsValidator;