const AWS = require('aws-sdk');
const studentControler = require('../sqs/student');
const parentControler = require('../sqs/parent');
const companyControler = require('../sqs/company');
const db = require('../models/index');
// const { sendFCMNotification } = require('../middleware/notification');

AWS.config.update({ region: process.env.SQS_REGION });
var sqs = new AWS.SQS({ apiVersion: process.env.SQS_API_VERSION });

async function handleMessage(message) {

    message.Body = JSON.parse(message.Body);
    // console.log(message.Body)
    switch (message.Body.type) {
        case 'add_student':
            await studentControler.add_student(message.Body.data);
            deleteMessage(message.ReceiptHandle)
            break;
        case 'update_student':
            await studentControler.update_student(message.Body.data);
            deleteMessage(message.ReceiptHandle)
            break;
        case 'delete_student':
            await studentControler.delete_student(message.Body.data);
            deleteMessage(message.ReceiptHandle)
            break;
        case 'add_parent':
            await parentControler.add_parent(message.Body.data);
            deleteMessage(message.ReceiptHandle)
            break;
        case 'update_parent':
            await parentControler.update_parent(message.Body.data);
            deleteMessage(message.ReceiptHandle)
            break;
        case 'delete_parent':
            await parentControler.delete_parent(message.Body.data);
            deleteMessage(message.ReceiptHandle)
            break;
        case 'add_company':
            await companyControler.add_company(message.Body.data);
            deleteMessage(message.ReceiptHandle)
            break;
        case 'update_company':
            await companyControler.update_company(message.Body.data);
            deleteMessage(message.ReceiptHandle)
            break;
        case 'delete_company':
            await companyControler.delete_company(message.Body.data);
            deleteMessage(message.ReceiptHandle)
            break;
        case 'signIn':
            // const loginNotify = await db.visualnotification.findOne({
            //     where: { notificationType: 'signIn', userId: message.Body.userId }
            // });
            // if (loginNotify) {
            //     await sendFCMNotification(loginNotify);
            // }
            // deleteMessage(message.ReceiptHandle)
            // receiveMessages();
            break;
        default:
        // console.log('Unknown message type:', message.Body);
        // deleteMessage(message.ReceiptHandle)
    }
}

async function receiveMessages() {
    try {
        const params = {
            QueueUrl: process.env.SQS_CLIENTLIENT_URL,
            MaxNumberOfMessages: 10, // Maximum number of messages to receive (adjust as needed)
            VisibilityTimeout: 20, // Time (in seconds) the received messages will be invisible to other consumers
            WaitTimeSeconds: 20 // Long polling, wait for messages to arrive
        };
        const data = await sqs.receiveMessage(params).promise();

        if (data.Messages && data.Messages.length > 0) {
            for (let i = 0; i < data.Messages.length; i++) {
                console.log(data.Messages);
                await handleMessage(data.Messages[i])
            }
        }
    } catch (error) {
        console.log(error);
    }
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
