import React, { Component } from "react";
import $ from "jquery";
import io from "socket.io-client";
import './chat.css'


class Chat extends Component {
  constructor() {
    super();
    this.socket = io("localhost:8080");
    this.user = { accountNum: window.location.search.split("=")[1] };
    this.state = {
      toUserName: "",
      toAccountNum: "",
      contact: []
    };
    this.socket.emit("login", this.user);
    this.socket.on("render", contact => {
      this.setState({
        contact
      });
    });
    this.socket.on("msg", data => {
      if (data.referrer !== undefined) {
        if (data.referrer === this.state.toAccountNum) {
          $(this.refs.chatContent).append(
            `<li className='other'>${data.msg}</li>`
          );
        } else {
          let contact = this.state.contact;
          let index = contact.findIndex(
            item => item.accountNum === data.referrer
          );
          contact.splice(index, 1, {
            ...contact[index],
            username: contact[index].username + "未读"
          });
          this.setState({
            ...this.state,
            contact
          });
        }
      } else {
        $(this.refs.chatContent).append(`<li className='me'>${data.msg}</li>`);
      }
    });
  }
  clickChat(data) {
    $('')
    if (data.toUserName.endsWith("未读")) {
      data.toUserName = data.toUserName.slice(0, data.toUserName.length - 2);
      let contact = this.state.contact;
      let index = contact.findIndex(
        item => item.accountNum === data.toAccountNum
      );
      contact.splice(index, 1, {
        username: data.toUserName.slice(0, data.toUserName.length - 2),
        accountNum: data.toAccountNum
      });
      this.setState({
        contact
      });
    }
    this.socket.emit("chat", data.toAccountNum);
    this.setState({
      ...this.state,
      toUserName: data.toUserName,
      toAccountNum: data.toAccountNum
    });
  }
  chating() {
    this.socket.emit("msg", this.refs.input.value);
    this.refs.input.value = "";
  }
  render() {
    return (
      <div className="chat">
        <div className="contact">
          <ul className="contactPerson">
            {this.state.contact.map(
              item => (
                <li 
                onClick={this.clickChat.bind(this, {toAccountNum:item.accountNum,toUserName:item.username})} 
                key={item.accountNum}
                >
                {item.username}
                </li>
              )       
            )}
          </ul>
        </div>
        <div className="room">
          <div ref='title' className="title">{this.state.toUserName}</div>
          {/* <div className="content">
            <ul ref="chatContent"></ul>
          </div> */}
          <div className="send">
            <input class="chatInput" ref="input" type="text" />
            <button class="chatButton" onClick={this.chating.bind(this)}>发送</button>
          </div>
        </div>
      </div>
    );
  }
}
export default Chat;
