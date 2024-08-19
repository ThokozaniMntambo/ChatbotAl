import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { ImageBackground, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons'; 
import { GiftedChat } from 'react-native-gifted-chat';
import * as speech from 'expo-speech';
import axios from 'axios';

export default function App() {
  const [inputMessage, setInputMessage] = useState('');
  const [outputMessage, setOutputMessage] = useState('Results will be shown here!!');
  const [messages, setMessages] = useState([]);

  const handleButtonClick = () => {
    console.log(inputMessage);
    if (inputMessage.toLowerCase().startsWith("generate image")) {
      generateImages();
    } else {
      generateText();
    }
  }

  const generateText = () => {
    console.log(inputMessage);
    const newMessage = {
      _id: Math.random().toString(36).substring(7),
      text: inputMessage,
      createdAt: new Date(),
      user: { _id: 1 }
    };
    setMessages((previousMessages) => GiftedChat.append(previousMessages, newMessage));

    axios.post('https://api-inference.huggingface.co/models/gpt2', {
      inputs: inputMessage,
    }, {
      headers: {
        'Authorization': 'API KEY',
        'Content-Type': 'application/json'  
      }
    })
    .then((response) => {
      if (response.data && response.data.generated_text) {
        const botResponse = response.data.generated_text;
        console.log(botResponse);
        setInputMessage("");
        setOutputMessage(botResponse.trim());
        const newBotMessage = {
          _id: Math.random().toString(36).substring(7),
          text: botResponse.trim(),
          createdAt: new Date(),
          user: { _id: 2, name: "Hope" }
        };
        setMessages((previousMessages) => GiftedChat.append(previousMessages, newBotMessage));
        speech.speak(botResponse.trim());
      } else {
        console.error('Unexpected API response:', response);
        setOutputMessage('Failed to get response from API.');
      }
    })
    .catch((error) => {
      console.error('Error calling API:', error);
      setOutputMessage('Error calling API. Please try again.');
    });
  }

  const generateImages = () => {
    console.log(inputMessage);
    const newMessage = {
      _id: Math.random().toString(36).substring(7),
      text: inputMessage,
      createdAt: new Date(),
      user: { _id: 1 }
    };
    setMessages((previousMessages) => GiftedChat.append(previousMessages, newMessage));

    axios.post('https://api-inference.huggingface.co/models/dalle-mini', {
      inputs: inputMessage,
    }, {
      headers: {
        'Authorization': 'API',  
        'Content-Type': 'application/json' 
      }
    })
    .then((response) => {
      if (response.data && response.data.generated_images) {
        setInputMessage("");
        response.data.generated_images.forEach((image_url) => {
          const newImageMessage = {
            _id: Math.random().toString(36).substring(7),
            text: "Image",
            createdAt: new Date(),
            user: { _id: 2, name: "Hope" },
            image: image_url,
          };
          setMessages((previousMessages) => GiftedChat.append(previousMessages, newImageMessage));
        });
      } else {
        console.error('Unexpected API response:', response);
        setOutputMessage('Failed to get images from API.');
      }
    })
    .catch((error) => {
      console.error('Error calling API:', error);
      setOutputMessage('Error calling API. Please try again.');
    });
  }

  const handleTextInput = (text) => {
    setInputMessage(text);
    console.log(text);
  }

  return (
    <ImageBackground style={styles.container} source={require('./assets/20 - bg.jpg')}>
      <View style={styles.container}>
        <View style={styles.chatText}>
          <Text>{outputMessage}</Text>
          <GiftedChat messages={messages} renderInputToolbar={() => {}} user={{ _id: 1 }} minInputToolbarHeight={0} />
        </View>
        <View style={styles.innerContainer}>
          <View style={styles.chat}>
            <TextInput
              placeholder='Talk to Chat here'
              onChangeText={handleTextInput}
              value={inputMessage} 
            />
          </View>
          <TouchableOpacity onPress={handleButtonClick}>
            <View style={styles.text}>
              <Ionicons name="send" size={30} color="#fff" style={{ marginLeft: 10 }} />
            </View>
          </TouchableOpacity>
        </View>
        <StatusBar style="auto" />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  text: {
    backgroundColor: "green",
    padding: 5,
    marginRight: 10,
    marginBottom: 20,
    borderRadius: 9999,
    width: 60,
    height: 60,
    justifyContent: "center",
  },
  innerContainer: {
    flexDirection: "row",
    padding: 5,
    marginRight: 10,
  },
  chat: {
    flex: 1,
    marginLeft: 10,
    marginBottom: 20,
    backgroundColor: "white",
    borderRadius: 10,
    borderColor: "grey",
    borderWidth: 1,
    height: 60,
    marginLeft: 10,
    marginRight: 10,
    justifyContent: "center",
    paddingLeft: 10,
    padding: 10,
  },
  chatText: {
    flex: 1,
    justifyContent: "center",
  },
});
