package com.chatroom.config;

import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

public class WebScoketConfig implements WebSocketMessageBrokerConfigurer{

	
		public void configureMessageBroker(MessageBrokerRegistry config)
		{
			config.enableSimpleBroker("/app");
			config.setApplicationDestinationPrefixes("/chatroom","/user");
			config.setUserDestinationPrefix("/user");
		}
		
		
		public void registerStompEndpoints(StompEndpointRegistry registry)
		{
			registry.addEndpoint("/ws").setAllowedOriginPatterns("*").withSockJS();
			
		}
	}

