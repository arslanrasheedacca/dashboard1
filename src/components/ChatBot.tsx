import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { Mic, MicOff, Send, X, Maximize2, Minimize2, Search, RefreshCw } from 'react-feather';
import { generateAIResponse } from '../services/openai';
import ReactMarkdown from 'react-markdown';
import { getEnhancedAIResponse } from '../services/ai-models';

const ChatBotContainer = styled.div<{ isExpanded: boolean; darkMode: boolean }>`
  position: fixed;
  bottom: ${props => props.isExpanded ? '20px' : '100px'};
  right: 20px;
  width: ${props => props.isExpanded ? '400px' : '60px'};
  height: ${props => props.isExpanded ? '600px' : '60px'};
  background: ${props => props.darkMode ? '#2d2d2d' : '#fff'};
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  overflow: hidden;
  z-index: 1000;
`;

const ChatHeader = styled.div<{ darkMode: boolean }>`
  padding: 1rem;
  background: #4a3b7c;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;

  h6 {
    margin: 0;
    font-size: 1rem;
    font-weight: 500;
  }

  .controls {
    display: flex;
    gap: 0.5rem;
  }
`;

const ChatBody = styled.div<{ darkMode: boolean }>`
  height: calc(100% - 130px);
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: ${props => props.darkMode ? '#1a1a1a' : '#f0f0f0'};
  }

  &::-webkit-scrollbar-thumb {
    background: ${props => props.darkMode ? '#444' : '#ccc'};
    border-radius: 3px;
  }
`;

const Message = styled.div<{ isUser: boolean; darkMode: boolean }>`
  max-width: 80%;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  background: ${props => props.isUser 
    ? '#4a3b7c' 
    : props.darkMode ? '#1a1a1a' : '#f0f0f0'};
  color: ${props => props.isUser 
    ? '#fff' 
    : props.darkMode ? '#fff' : '#333'};
  align-self: ${props => props.isUser ? 'flex-end' : 'flex-start'};
  font-size: 0.875rem;
  line-height: 1.4;
`;

const ChatInput = styled.div<{ darkMode: boolean }>`
  padding: 1rem;
  border-top: 1px solid ${props => props.darkMode ? '#444' : '#e0e0e0'};
  display: flex;
  gap: 0.5rem;
  align-items: center;

  input {
    flex: 1;
    padding: 0.5rem 1rem;
    border: 1px solid ${props => props.darkMode ? '#444' : '#e0e0e0'};
    border-radius: 20px;
    background: ${props => props.darkMode ? '#1a1a1a' : '#fff'};
    color: ${props => props.darkMode ? '#fff' : '#333'};
    font-size: 0.875rem;

    &:focus {
      outline: none;
      border-color: #4a3b7c;
    }
  }
`;

const IconButton = styled.button<{ active?: boolean }>`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: ${props => props.active ? '#4a3b7c' : 'transparent'};
  color: ${props => props.active ? '#fff' : '#666'};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.active ? '#5a4b8c' : '#f0f0f0'};
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

const FloatingButton = styled(IconButton)`
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 60px;
  height: 60px;
  background: #4a3b7c;
  color: #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

  svg {
    width: 24px;
    height: 24px;
  }

  &:hover {
    background: #5a4b8c;
  }
`;

const ModelBadge = styled.span<{ model: string }>`
  display: inline-block;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
  margin-top: 0.5rem;
  background: ${props => 
    props.model === 'Deepseek' ? '#4a3b7c' :
    props.model === 'Gemini' ? '#1a73e8' :
    '#666'};
  color: white;
  opacity: 0.9;
`;

const FeatureTag = styled.span`
  display: inline-block;
  padding: 1px 4px;
  border-radius: 3px;
  font-size: 0.7rem;
  margin-right: 4px;
  background: rgba(255, 255, 255, 0.2);
`;

interface ChatBotProps {
  darkMode: boolean;
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  text: string;
  isUser: boolean;
  timestamp: Date;
  isMarkdown?: boolean;
  source?: string;
  features?: {
    codeGeneration?: boolean;
    dataAnalysis?: boolean;
    creativity?: boolean;
  };
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface AIResponse {
  text: string;
  source: string;
  features?: {
    codeGeneration?: boolean;
    dataAnalysis?: boolean;
    creativity?: boolean;
  };
}

const ChatBot: React.FC<ChatBotProps> = ({ darkMode, isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const chatBodyRef = useRef<HTMLDivElement>(null);
  const [responseStream, setResponseStream] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Check and request microphone permissions
  const checkMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop()); // Stop the stream after permission check
      return true;
    } catch (error) {
      console.error('Microphone permission error:', error);
      setMicError('Please allow microphone access to use voice features');
      return false;
    }
  };

  useEffect(() => {
    const initializeSpeechRecognition = async () => {
      try {
        // Check if browser supports speech recognition
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
          setMicError('Speech recognition is not supported in your browser');
          return;
        }

        // Check microphone permissions
        const hasPermission = await checkMicrophonePermission();
        if (!hasPermission) {
          return;
        }

        // Initialize speech recognition
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onstart = () => {
          setIsListening(true);
          setMicError(null);
          console.log('Speech recognition started');
        };

        recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
          const transcript = Array.from(event.results)
            .map(result => result[0].transcript)
            .join('');

          console.log('Speech recognized:', transcript);
          setInputText(transcript);
          
          if (event.results[event.results.length - 1].isFinal) {
            handleSendMessage(transcript);
          }
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
          
          switch (event.error) {
            case 'not-allowed':
              setMicError('Microphone access denied. Please check your browser settings.');
              break;
            case 'no-speech':
              setMicError('No speech detected. Please try again.');
              break;
            case 'network':
              setMicError('Network error. Please check your internet connection.');
              break;
            default:
              setMicError(`Error: ${event.error}`);
          }
        };

        recognitionRef.current.onend = () => {
          console.log('Speech recognition ended');
          setIsListening(false);
        };

      } catch (error) {
        console.error('Speech recognition initialization error:', error);
        setMicError('Failed to initialize speech recognition');
      }
    };

    if (isOpen) {
      initializeSpeechRecognition();
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isOpen]);

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages]);

  // Add welcome message when chat opens
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: Message = {
        text: "Hello! I'm your AI assistant. How can I help you with the dashboard today?",
        isUser: false,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
      speak(welcomeMessage.text);
    }
  }, [isOpen]);

  const toggleListening = async () => {
    if (!recognitionRef.current) {
      setMicError('Speech recognition is not supported');
      return;
    }

    try {
      if (isListening) {
        recognitionRef.current.stop();
        setIsListening(false);
      } else {
        const hasPermission = await checkMicrophonePermission();
        if (!hasPermission) {
          return;
        }
        
        setInputText('');
        setMicError(null);
        recognitionRef.current.start();
        console.log('Starting speech recognition...');
      }
    } catch (error) {
      console.error('Error toggling speech recognition:', error);
      setMicError('Error toggling microphone. Please try again.');
      setIsListening(false);
    }
  };

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 1;
      utterance.pitch = 1;
      utterance.volume = 1;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        setIsSpeaking(false);
      };

      window.speechSynthesis.speak(utterance);
    }
  };

  const performWebSearch = async (query: string) => {
    setIsSearching(true);
    try {
      const searchResponse = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const searchResults = await searchResponse.json();
      return searchResults;
    } catch (error) {
      console.error('Web search error:', error);
      return null;
    } finally {
      setIsSearching(false);
    }
  };

  const handleSendMessage = async (text: string = inputText.trim()) => {
    if (!text) return;

    const userMessage: Message = {
      text,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);
    setIsProcessing(true);
    setResponseStream('');

    try {
      // Perform web search if needed
      let searchResults = null;
      if (text.toLowerCase().includes('search') || 
          text.toLowerCase().includes('find') || 
          text.toLowerCase().includes('look up')) {
        searchResults = await performWebSearch(text);
      }

      // Update chat history
      const newHistory = [
        ...chatHistory,
        { role: 'user' as const, content: text }
      ];

      if (searchResults) {
        newHistory.push({
          role: 'system' as const,
          content: `Web search results: ${JSON.stringify(searchResults)}`
        });
      }

      // Get enhanced AI response
      const enhancedResponse = await getEnhancedAIResponse(
        text,
        {
          history: chatHistory,
          searchResults,
          darkMode,
          dashboardContext: true
        },
        {
          deepseek: process.env.REACT_APP_DEEPSEEK_API_KEY || '',
          gemini: process.env.REACT_APP_GEMINI_API_KEY || ''
        }
      );

      // Update chat history
      setChatHistory([...newHistory, { role: 'assistant' as const, content: enhancedResponse.text }]);

      const botResponse: Message = {
        text: enhancedResponse.text,
        isUser: false,
        timestamp: new Date(),
        isMarkdown: true,
        source: enhancedResponse.source,
        features: enhancedResponse.features
      };

      setMessages(prev => [...prev, botResponse]);
      speak(botResponse.text);
    } catch (error) {
      console.error('Error generating response:', error);
      const errorResponse: Message = {
        text: "I apologize, but I'm having trouble generating a response. Please try again.",
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
      setIsProcessing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <ChatBotContainer isExpanded={true} darkMode={darkMode}>
      <ChatHeader darkMode={darkMode}>
        <h6>Enhanced AI Assistant</h6>
        <div className="controls">
          {isSearching && <RefreshCw size={16} className="animate-spin" />}
          <IconButton onClick={onClose}>
            <X />
          </IconButton>
        </div>
      </ChatHeader>

      <ChatBody ref={chatBodyRef} darkMode={darkMode}>
        {messages.map((message, index) => (
          <Message 
            key={index} 
            isUser={message.isUser} 
            darkMode={darkMode}
          >
            {message.isMarkdown ? (
              <>
                <ReactMarkdown>{message.text}</ReactMarkdown>
                {message.source && (
                  <div>
                    <ModelBadge model={message.source}>
                      {message.source}
                    </ModelBadge>
                    {message.features && (
                      <div style={{ marginTop: '0.25rem' }}>
                        {message.features.codeGeneration && (
                          <FeatureTag>Code</FeatureTag>
                        )}
                        {message.features.dataAnalysis && (
                          <FeatureTag>Analysis</FeatureTag>
                        )}
                        {message.features.creativity && (
                          <FeatureTag>Creative</FeatureTag>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              message.text
            )}
          </Message>
        ))}
        {micError && (
          <Message 
            isUser={false} 
            darkMode={darkMode}
            style={{ background: '#ff6b6b', color: '#fff' }}
          >
            {micError}
          </Message>
        )}
        {isLoading && (
          <Message 
            isUser={false} 
            darkMode={darkMode}
            style={{ background: '#4a3b7c', opacity: 0.7 }}
          >
            {isSearching ? 'Searching the web...' : 
             isProcessing ? 'Processing with AI models...' : 
             'Thinking...'}
          </Message>
        )}
      </ChatBody>

      <ChatInput darkMode={darkMode}>
        <IconButton 
          active={isListening} 
          onClick={toggleListening}
          style={{ color: micError ? '#ff6b6b' : isListening ? '#fff' : '#666' }}
        >
          {isListening ? <MicOff /> : <Mic />}
        </IconButton>
        <input
          type="text"
          placeholder={
            isLoading ? (
              isSearching ? 'Searching...' : 
              isProcessing ? 'Processing with Deepseek and Gemini...' : 
              'Thinking...'
            ) :
            isListening ? 'Listening...' : 
            micError ? 'Microphone error - Type instead' : 
            'Ask me anything...'
          }
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isLoading}
        />
        <IconButton 
          onClick={() => handleSendMessage()}
          style={{ opacity: isLoading ? 0.5 : 1 }}
          disabled={isLoading}
        >
          <Send />
        </IconButton>
      </ChatInput>
    </ChatBotContainer>
  );
};

export default ChatBot; 