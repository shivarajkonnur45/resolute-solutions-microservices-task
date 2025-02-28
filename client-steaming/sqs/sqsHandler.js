const AWS = require('aws-sdk');
const CourseControler =  require('../sqs/course_video');


AWS.config.update({ region: process.env.SQS_REGION });
var sqs = new AWS.SQS({ apiVersion: process.env.SQS_API_VERSION });

async function handleMessage(message) {
    
    message.Body = JSON.parse(message.Body);
    // console.log(`-------------------<>--------------------`);
    // console.log(message.Body)
    switch (message.Body.type) {
        case 'add_coursevideo':
            await CourseControler.add_coursevideo(message.Body.data);
            deleteMessage(message.ReceiptHandle)
        break;
        // case 'update_coursevideo':            
        //     await CourseControler.update_coursevideo(message.Body.data);
        //     deleteMessage(message.ReceiptHandle)
        default:
            // console.log('Unknown message type:', message.Body);
            // deleteMessage(message.ReceiptHandle)
    }
}

function receiveMessages() {
    const params = {
        QueueUrl: process.env.SQS_CLIENTLIENT_URL,
        MaxNumberOfMessages: 10, // Maximum number of messages to receive (adjust as needed)
        VisibilityTimeout: 10, // Time (in seconds) the received messages will be invisible to other consumers
        WaitTimeSeconds: 5 // Long polling, wait for messages to arrive
    };
    sqs.receiveMessage(params, function (err, data) {
        if (err) {
            console.log("Receive Error", err);
        } else if (data.Messages) {
            data.Messages.forEach(message => {
                handleMessage(message);
            });
        }
    });
}

function deleteMessage(receiptHandle) {
    const deleteParams = {
        QueueUrl: process.env.SQS_CLIENTLIENT_URL,
        ReceiptHandle: receiptHandle
    };
    sqs.deleteMessage(deleteParams, (err, data) => {
        if (err) {
            console.error('Error deleting message:', err);
        } else {
            console.log('Message deleted successfully');
        }
    });
}

module.exports = receiveMessages;
