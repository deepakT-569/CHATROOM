package com.chatroom.controller;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import com.chatroom.model.Message;

@Controller
public class ChatController {

public SimpMessagingTemplate simpMessagingTemplate;
@MessageMapping("/message")
@SendTo("/chatroom/room/")
public Message receiveMessage(@Payload Message message) {
	return message;	
}
@MessageMapping("/private-message")
	public Message recMessage(@Payload Message message)
	{
	simpMessagingTemplate.convertAndSendToUser(message.getSenderName(),"/private",message);
	return message;
	}
}
