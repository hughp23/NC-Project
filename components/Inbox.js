import React, { Component } from 'react';
import { ScrollView, Text, TouchableOpacity } from 'react-native';
import { getTheme } from 'react-native-material-kit';
import firebase from 'firebase';

const { getChatPartnerNames, chatsRef } = require('../Functionality/chatFunctions');
const { getCurrentUserInfo } = require('../Functionality/utilityFunctions');

const theme = getTheme();

class Inbox extends Component {
  //* *********NEEDS CURRENT USERID AS PROP*************** */
  state = {
    chats: [],
    // loading: true,
    currentUserID: null,
    currentUsername: null,
  };

  componentDidMount() {
    let currentUserID;
    firebase.auth().onAuthStateChanged((user) => {
      currentUserID = user.uid;
      // ***************
      getCurrentUserInfo(currentUserID).then((currentUserInfo) => {
        this.setState({
          currentUserID,
          currentUsername: currentUserInfo.username,
        });
      });
      // ***************
      const allUserChats = chatsRef.where('usersArr', 'array-contains', `${currentUserID}`);
      allUserChats.onSnapshot((querySnapshot) => {
        querySnapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const chatObj = {};
            change.doc.data().usersArr[0] === currentUserID
              ? (chatObj.otherUser = change.doc.data().usersArr[1])
              : (chatObj.otherUser = change.doc.data().usersArr[0]);
            chatObj.messages = change.doc.data().messages;
            getChatPartnerNames(chatObj.otherUser).then((chatPartnerObj) => {
              const compObj = {
                ...chatObj,
                otherUserUsername: chatPartnerObj.username,
                otherUserName: chatPartnerObj.name,
              };
              this.setState(previousState => ({
                chats: [...previousState.chats, compObj],
              }));
            });
          }
          if (change.type === 'modified') {
            const chatObj = {};
            change.doc.data().usersArr[0] === currentUserID
              ? (chatObj.otherUser = change.doc.data().usersArr[1])
              : (chatObj.otherUser = change.doc.data().usersArr[0]);
            chatObj.messages = change.doc.data().messages;
            getChatPartnerNames(chatObj.otherUser).then((chatPartnerObj) => {
              const compObj = {
                ...chatObj,
                otherUserUsername: chatPartnerObj.username,
                otherUserName: chatPartnerObj.name,
              };
              const currentChats = [...this.state.chats];
              const oldChats = currentChats.filter(
                chatObj => chatObj.otherUser !== compObj.otherUser,
              );
              this.setState({
                chats: [...oldChats, compObj],
              });
            });
          }
        });
      });
    });
  }

  render() {
    const { chats, currentUserID, currentUsername } = this.state;
    const { allNav } = this.props;
    return (
      <ScrollView>
        {chats.map((chat, index) => (
          <TouchableOpacity
            style={theme.cardStyle}
            key={`inbox${chat.otherUser}`}
            onPress={() => allNav({
              currentUserID,
              currentUsername,
              selectedUserID: chat.otherUser,
            })
            }
          >
            <>
              <Text style={theme.cardActionStyle}>
                {`Conversation with: ${chat.otherUserName} (${chat.otherUserUsername})`}
                {' '}
              </Text>
              <Text style={theme.cardContentStyle}>{`${chat.messages.length} messages`}</Text>
            </>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  }
}

export default Inbox;
