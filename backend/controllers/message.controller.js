import { Conversation } from "../models/conversation.model.js";
import { Message } from "../models/message.model.js";

// SEND MESSAGE
export const sendMessage = async (req, res) => {
    try {
        const senderId = req.id;
        const receiverId = req.params.id;
        const { message } = req.id;

        let conversation = await Conversation.findOne({
            participants: { $all: { senderId, receiverId } }
        });

        if (!conversation) {
            conversation = await Conversation.create({
                participants: [senderId, receiverId],
            });
        }

        const newMessage = await Message.create({
            senderId,
            receiverId,
            message
        });

        if (newMessage) {
            conversation.messages.push(newMessage._id);
            await Promise.all([conversation.save(), newMessage.save()]);
        }

        // Socket.io for real time data transfer    

        return res.status(200).json({
            success: true,
            newMessage
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error!"
        });
    }
}