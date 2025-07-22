import React, { useState } from 'react';
import { apiService } from '../services/api';
import nioStarsIcon from '../assets/nio-stars.png';
import './RightSidebar.css';
 
interface RightSidebarProps {
  isCollapsed?: boolean;
  onCollapseChange?: (collapsed: boolean) => void;
  onQueryResult?: (result: any) => void;
}
 
interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  language?: string;
}
 
const langMap: Record<string, string> = {
  Afrikaans: 'af-ZA',
  Amharic: 'am-ET',
  Arabic: 'ar-SA',
  Azerbaijani: 'az-AZ',
  Bengali: 'bn-BD',
  Bulgarian: 'bg-BG',
  Catalan: 'ca-ES',
  Chinese: 'zh-CN',
  'Chinese (Mainland)': 'zh-CN',
  'Chinese (Hong Kong)': 'zh-HK',
  'Chinese (Taiwan)': 'zh-TW',
  Croatian: 'hr-HR',
  Czech: 'cs-CZ',
  Danish: 'da-DK',
  Dutch: 'nl-NL',
  English: 'en-US',
  'English (United Kingdom)': 'en-GB',
  Estonian: 'et-EE',
  Filipino: 'fil-PH',
  Finnish: 'fi-FI',
  French: 'fr-FR',
  German: 'de-DE',
  Greek: 'el-GR',
  Gujarati: 'gu-IN',
  Hebrew: 'he-IL',
  Hindi: 'hi-IN',
  Hungarian: 'hu-HU',
  Icelandic: 'is-IS',
  Indonesian: 'id-ID',
  Italian: 'it-IT',
  Japanese: 'ja-JP',
  Javanese: 'jv-ID',
  Kannada: 'kn-IN',
  Khmer: 'km-KH',
  Korean: 'ko-KR',
  Latvian: 'lv-LV',
  Lithuanian: 'lt-LT',
  Malayalam: 'ml-IN',
  Malay: 'ms-MY',
  Marathi: 'mr-IN',
  Nepali: 'ne-NP',
  Norwegian: 'no-NO',
  Persian: 'fa-IR',
  Polish: 'pl-PL',
  Portuguese: 'pt-PT',
  'Portuguese (Brazil)': 'pt-BR',
  Punjabi: 'pa-IN',
  Romanian: 'ro-RO',
  Russian: 'ru-RU',
  Serbian: 'sr-RS',
  Sinhala: 'si-LK',
  Slovak: 'sk-SK',
  Slovenian: 'sl-SI',
  Spanish: 'es-ES',
  Swahili: 'sw-KE',
  Swedish: 'sv-SE',
  Tamil: 'ta-IN',
  Telugu: 'te-IN',
  Thai: 'th-TH',
  Turkish: 'tr-TR',
  Ukrainian: 'uk-UA',
  Urdu: 'ur-PK',
  Vietnamese: 'vi-VN',
  Welsh: 'cy-GB',
  Albanian: 'sq-AL'
};
 
function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

const speakText = (text: string, detectedLanguage: string = 'en') => {
  const synth = window.speechSynthesis;
  const utterance = new SpeechSynthesisUtterance(text);

  const langCode =
    langMap[detectedLanguage] ||
    langMap[capitalize(detectedLanguage)] ||
    detectedLanguage || // assume it's already like "ja-JP"
    'en-US';

  utterance.lang = langCode;

  const selectVoice = () => {
    const voices = synth.getVoices();

    let voice = voices.find(v => v.lang === langCode && v.name.includes('Google'));

    if (!voice) {
      const base = langCode.split('-')[0];
      voice = voices.find(v => v.lang.startsWith(base) && v.name.includes('Google'));
    }

    if (!voice) {
      voice = voices.find(v => v.lang === langCode);
    }

    if (voice) {
      utterance.voice = voice;
      console.log(`✅ Voice selected: ${voice.name} (${voice.lang})`);
    } else {
      console.warn(`⚠️ No voice found for ${langCode}, using default`);
    }

    synth.cancel();
    synth.speak(utterance);
  };

  // voice list might not be ready yet
  if (synth.getVoices().length === 0) {
    synth.onvoiceschanged = () => {
      selectVoice();
    };
  } else {
    selectVoice();
  }
};

 
 
const RightSidebar: React.FC<RightSidebarProps> = ({
  isCollapsed = false,
  onCollapseChange,
  onQueryResult
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(true);
 
  const [isListening, setIsListening] = useState(false);
 
  const handleVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Sorry, your browser does not support voice input.');
      return;
    }
 
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
 
    setIsListening(true);
 
    recognition.onresult = async (event: any) => {
      const transcript = event.results[0][0].transcript;
      setIsListening(false);
 
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'user',
        content: transcript,
        timestamp: new Date(),
      };
 
      setChatMessages((prev) => [...prev, userMessage]);
      setShowSuggestions(false);
      setIsLoading(true);
 
      try {
        const response = await apiService.queryWithAI(transcript, true); // is_transcript = true
        const assistantLang = response.language || 'en-US';
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: response.insights || response.data?.[0] || 'Query completed successfully',
          timestamp: new Date(),
          language: assistantLang
        };
       
        setChatMessages((prev) => [...prev, assistantMessage]);
        onQueryResult?.(response);
      } catch (err) {
        setChatMessages((prev) => [...prev, {
          id: Date.now().toString(),
          type: 'assistant',
          content: 'Voice query failed to process.',
          timestamp: new Date(),
        }]);
        console.error('Voice input error:', err);
      } finally {
        setIsLoading(false);
      }
    };
 
    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };
 
    recognition.onend = () => {
      setIsListening(false);
    };
 
    recognition.start();
  };
 
 
  const toggleCollapse = () => {
    const newCollapsed = !isCollapsed;
    onCollapseChange?.(newCollapsed);
  };
 
  const suggestions = [
    {
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1">
          <rect x="1" y="3" width="14" height="10" rx="2" />
          <line x1="1" y1="7" x2="15" y2="7" />
          <line x1="5" y1="11" x2="11" y2="11" />
        </svg>
      ),
      title: 'Show me only the last 20 orders',
      description: 'Display the 20 most recent orders'
    },
    {
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1">
          <rect x="1" y="1" width="14" height="14" rx="2" />
          <line x1="1" y1="6" x2="15" y2="6" />
          <line x1="6" y1="1" x2="6" y2="15" />
        </svg>
      ),
      title: 'Create a table with the most relevant columns for me',
      description: 'Generate a focused table view with key information'
    },
    {
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1">
          <circle cx="8" cy="8" r="6" />
          <polyline points="8,4 8,8 11,11" />
        </svg>
      ),
      title: 'Show overdue orders',
      description: 'Display orders that are past their due date'
    }
  ];
 
  const handleSuggestionClick = async (suggestion: { title: string }) => {
    if (isLoading) return;
   
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: suggestion.title,
      timestamp: new Date()
    };
   
    setChatMessages(prev => [...prev, userMessage]);
    setShowSuggestions(false);
    setInputValue('');
    setIsLoading(true);
   
    try {
      const response = await apiService.queryWithAI(suggestion.title);
     
      const assistantLang = response.language || 'en-US';
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response.insights|| response.data?.[0] || 'Query completed successfully',
        timestamp: new Date(),
        language: assistantLang
      };
 
      setChatMessages(prev => [...prev, assistantMessage]);
      onQueryResult?.(response);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'Sorry, I encountered an error processing your request.',
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, errorMessage]);
      console.error('Query failed:', error);
    } finally {
      setIsLoading(false);
    }
  };
 
  const handleInputSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'user',
        content: inputValue.trim(),
        timestamp: new Date()
      };
     
      setChatMessages(prev => [...prev, userMessage]);
      setShowSuggestions(false);
      const queryText = inputValue.trim();
      setInputValue('');
      setIsLoading(true);
     
      try {
        const response = await apiService.queryWithAI(queryText);
       
        const assistantLang = response.language || 'en-US';
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: response.insights|| response.data?.[0] || 'Query completed successfully',
          timestamp: new Date(),
          language: assistantLang
        };
       
        setChatMessages(prev => [...prev, assistantMessage]);
        onQueryResult?.(response);
      } catch (error) {
        const errorMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: 'Sorry, I encountered an error processing your request.',
          timestamp: new Date()
        };
        setChatMessages(prev => [...prev, errorMessage]);
        console.error('Query failed:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };
 
  const handleNewChat = async () => {
    setChatMessages([]);
    setShowSuggestions(true);
    setInputValue('');
   
    // Clear the query result to reset the table view
    onQueryResult?.(null);
   
    // Clear the conversation memory on the backend by calling a new endpoint
    try {
      await fetch('http://localhost:8080/clear-memory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error('Failed to clear conversation memory:', error);
    }
  };
 
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    // Auto-resize the textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  };
 
  return (
    <aside className={`right-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Header */}
      <div className="right-sidebar-header">
        {!isCollapsed && (
          <button
            className="collapse-btn"
            onClick={toggleCollapse}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className={`collapse-icon ${isCollapsed ? 'rotated' : ''}`}>
              <path d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/>
            </svg>
          </button>
        )}
        {!isCollapsed && (
          <div className="hp-nio-branding">
            <div className="hp-logo-section">
              <img src="/hp-logo.png" alt="HP" className="hp-logo" />
            </div>
            <div className="nio-section">
              <div className="nio-icon">
                <img src={nioStarsIcon} alt="Nio" className="nio-stars" />
              </div>
              <span className="nio-title">Nio</span>
            </div>
            <button className="new-chat-btn" aria-label="New chat" onClick={handleNewChat}>
              <span className="new-chat-text">New Chat</span>
            </button>
          </div>
        )}
        {isCollapsed && (
          <div className="collapsed-nio-icon">
            <div className="nio-icon" onClick={toggleCollapse}>
              <img src={nioStarsIcon} alt="Nio" className="nio-stars-collapsed" />
            </div>
          </div>
        )}
      </div>
 
      {!isCollapsed && (
        <div className="right-sidebar-content">
          {/* Welcome Message */}
          {showSuggestions && (
            <div className="welcome-section">
              <h2 className="welcome-title">Good morning Javier. Let's work on your orders together.</h2>
              <p className="welcome-subtitle">Use Nio to analyze your orders with natural language queries or pick a suggestion to get started.</p>
            </div>
          )}
 
          {/* Suggestions */}
          {showSuggestions && (
            <div className="suggestions-section">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  className="suggestion-card"
                  onClick={() => handleSuggestionClick(suggestion)}
                  disabled={isLoading}
                >
                  <div className="suggestion-icon">{suggestion.icon}</div>
                  <div className="suggestion-content">
                    <h3 className="suggestion-title">{suggestion.title}</h3>
                  </div>
                </button>
              ))}
            </div>
          )}
 
          {/* Chat Messages */}
          {!showSuggestions && (
            <div className="chat-messages">
              {chatMessages.map((message) => (
                <div key={message.id} className={`chat-message ${message.type}`}>
                  <div className="message-content">
                    {message.content}
                    {message.type === 'assistant' && (
                      <button
                        className="tts-button"
                        onClick={() => speakText(message.content, message.language || 'en')}
                        title="Read this out loud"
                        aria-label="Speak response"
                      >
                        🔊
                      </button>
                    )}
                  </div>
                  <div className="message-timestamp">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="chat-message assistant">
                  <div className="message-content">
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
 
          {/* Input Area */}
          <div className="input-section">
            <div className="input-container">
              <form onSubmit={handleInputSubmit} className="input-form">
                <div className="context-tag">
                  <span className="context-label">Orders Table</span>
                  <button type="button" className="context-close-btn" aria-label="Remove context">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                    </svg>
                  </button>
                </div>
                <div className="input-row">
                  <textarea
                    value={inputValue}
                    onChange={handleInputChange}
                    placeholder="What do you want to know?"
                    className="text-input"
                    rows={1}
                  />
                    <button
                      type="button"
                      onClick={handleVoiceInput}
                      className={`mic-btn ${isListening ? 'active' : ''}`}
                      aria-label="Start voice input"
                      title="Speak a query"
                    >
                      🎤
                    </button>
                  <button
                    type="submit"
                    className="submit-btn"
                    disabled={!inputValue.trim() || isLoading}
                    aria-label="Submit"
                  >
                    {isLoading ? (
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" className="loading-spinner">
                        <path d="M10 2a8 8 0 0 1 8 8h-2a6 6 0 0 0-6-6V2z"/>
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 3.586a1 1 0 0 1 1.707-.707l6 6a1 1 0 0 1 0 1.414l-6 6a1 1 0 0 1-1.414-1.414L14.586 11H4a1 1 0 1 1 0-2h10.586l-4.293-4.293A1 1 0 0 1 10 3.586z" transform="rotate(-90 10 10)" strokeWidth="2"/>
                      </svg>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
 
export default RightSidebar;