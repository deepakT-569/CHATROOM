import React, { useEffect, useState } from 'react'
import {over} from 'stompjs';
import SockJS from 'sockjs-client';

var stompClient = null;
const ChatRoom = () => {
    const [publicChats, setPublicChats] = useState([]);
    const [privateChats, setPrivateChats] = useState(new Map());
    const [tab, setTab] = useState("CHATROOM");
    const [userData, setUserData] = useState({
        username:'',
        receivername:'',
        connected:false,
        message:''
});
useEffect(()=>{
    console.log(userData);
},[userData]);

const connect = () =>{
    let Sock = new SockJS("http://localhost:8080/ws");
    stompClient = over(Sock);
    stompClient.connect({},onConnected,onError);
}

const onConnected = () =>{
    setUserData({...userData,"connected":true});
    stompClient.subscribe("/chatroom/public", onPublicMessageReceived);
    stompClient.subscribe("/user/"+userData.username+"/private",onPrivateMessageReceived);
    userJoin();
}

const userJoin =()=>{
    let chatMessage = {
        senderName:userData.username,
        status:"JOIN"
    };
    stompClient.send('/app/message',{},JSON.stringify(chatMessage));
}

const onPublicMessageReceived = (payload) =>{
    var payloadData = JSON.parse(payload.body);
    switch(payloadData.status)
    {
        case "JOIN" :
            if(!privateChats.get(payloadData.senderName)) {
                privateChats.get(payloadData.senderName,[]);
                setPrivateChats(new Map(privateChats));}
        break;
        case "MESSAGE" :
            publicChats.push(payloadData);
            setPublicChats({...publicChats});
            break;
    }
}

const onPrivateMessageReceived = (payload) => {
    var payloadData = JSON.parse(payload.body);
    if(privateChats.get(payloadData.senderName))
    {
        privateChats.get(payloadData.senderName).push(payloadData);
        setPrivateChats(new Map(privateChats));
    }
    else
    {
        let lsit = [];
        lsit.push(payloadData);
        privateChats.set(payloadData.senderName).push(payloadData);
        setPrivateChats(new Map(privateChats));
    }      
}

const onError = (err) => 
{
    console.log(err);
}
   
const handleMessage = (e) => {
   const {value} = e.target;
    setUserData({...userData,"message":value});
    }

const sendPublicMessage=()=>{
    if(stompClient)
    {
    var chatMessage={
        senderName:userData.username,
        message:userData.message,
        status:"MESSAGE"
    };
    stompClient.send('/app/message',{},JSON.stringify(chatMessage));
    setUserData({...userData,"message":""});
}
}
const sendPrivateMessage=()=>{
    if(stompClient)
    {
    var chatMessage={
        senderName:userData.username,
        receiverName:tab,
        message:userData.message,
        status:"MESSAGE"
    };
    if(userData.username !== tab)
    {
        privateChats.get(tab).push(chatMessage);
        setPrivateChats(new Map(privateChats));
    }
    stompClient.send('/app/private-message',{},JSON.stringify(chatMessage));
    setUserData({...userData,"message":""});
}}

const handleUsername = (e) => {
    const {value} = e.target;
    setUserData({...userData,"username":value});
    }

const registerUser=()=>{
    connect();
}
  return (
    <div className="container">
        {
        userData.connected?
        <div className='chat-box'>
            <div className='member-list'>
                <ul>
                    <li onClick={()=>{setTab("CHATROOM")}} className={`member ${tab ==="CHATROOM" && "active"}`}>Chatroom</li>
                    {[...privateChats.keys()].map((name,index)=>(
                        <li onClick={()=>{setTab(name)}} className={`member ${tab === name && "active"}`} key={index}>
                             {name}
                         </li>
                    ))}
                </ul>
            </div>
           {tab === "CHATROOM" &&  <div className="chat-content">
            <ul className="chat-messages">
            {publicChats.map((chat,index)=>(
                        <li className = {`message ${chat.senderName === userData.username && "self"}`} key={index}>
                             {chat.senderName !== userData.username && <div className ="avatar">{chat.senderName}</div>}
                             <div className ="message-data">{chat.message}</div>
                             {chat.senderName === userData.username && <div className ="avatar self">{chat.senderName}</div>}
                         </li>
                    ))}
                    </ul>
                    <div className="send-message">
                        <input type="text" className="input-message" placeholder="Enter public message" value={userData.message} onChange={handleMessage}/>
                        <button type="button" className="send-button" onClick={sendPublicMessage}>Send</button>
                    </div>
            </div>}
            {tab !== "CHATROOM" &&  <div className="chat-content">
           <ul className="chat-messages">
            {[...privateChats.get(tab)].map((chat,index)=>(
                        <li className={`message ${chat.senderName === userData.username && "self"}`} key={index}>
                             {chat.senderName !== userData.username && <div className ='avatar'>{chat.senderName}</div>}
                             <div className="message-data">{chat.message}</div>
                             {chat.senderName === userData.username && <div className ='avatar self'>{chat.senderName}</div>}
                         </li>
                    ))}
                    </ul>
                    <div className="send-message">
                        <input type="text" className="input-message"  placeholder= "Enter public message"  value={userData.message} onChange={handleMessage}/>
                        <button type="button" className="send-button" onClick={sendPrivateMessage}>Send</button>
                    </div>
            </div>}

        </div>
        :
       <div className="register">
        <input
        id="user-name"
        name="username"
        placeholder="Enter your name"
        value={userData.username}
        onChange={handleUsername}
        />
        <button type="button" onClick={registerUser}>connect</button>
       </div>
       }
    </div>
  ) }

export default ChatRoom
