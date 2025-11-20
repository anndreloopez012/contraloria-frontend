import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Download, ZoomIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { fetchQuestions, searchSimilarQuestions, findBestAnswer, QuestionData } from '@/services/apiServiceQuestion';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  files?: Array<{
    id: number;
    name: string;
    url: string;
    formats?: {
      large?: string;
      medium?: string;
      small?: string;
      thumbnail?: string;
    };
  }>;
}

/**
 * Componente de Chat Bot flotante
 * Funciona como FAQ inteligente con búsqueda y filtrado de preguntas
 */
const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [suggestions, setSuggestions] = useState<QuestionData[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const isMobile = useIsMobile();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Cargar preguntas al abrir el chat
  useEffect(() => {
    if (isOpen && questions.length === 0) {
      loadQuestions();
    }
  }, [isOpen]);

  // Scroll automático a nuevos mensajes
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Mostrar mensaje de bienvenida al abrir
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: Message = {
        id: 'welcome',
        text: '¡Hola, mi nombre es CGC!, por favor escribe tu pregunta o selecciona alguno de los temas siguientes:',
        isUser: false,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen]);

  // Actualizar sugerencias basadas en el texto
  useEffect(() => {
    if (inputText.trim() && questions.length > 0) {
      const filtered = searchSimilarQuestions(questions, inputText);
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else if (questions.length > 0) {
      setSuggestions(questions.slice(0, 10));
      setShowSuggestions(inputText.length === 0);
    }
  }, [inputText, questions]);

  const loadQuestions = async () => {
    setIsLoading(true);
    try {
      const data = await fetchQuestions();
      setQuestions(data);
      setSuggestions(data.slice(0, 10));
    } catch (error) {
      console.error('Error cargando preguntas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);

    // Buscar la mejor respuesta
    const bestAnswer = findBestAnswer(questions, inputText);
    
    setTimeout(() => {
      let botMessage: Message;
      
      if (bestAnswer) {
        botMessage = {
          id: (Date.now() + 1).toString(),
          text: bestAnswer.response,
          isUser: false,
          timestamp: new Date(),
          files: bestAnswer.files.length > 0 ? bestAnswer.files : undefined
        };
      } else {
        botMessage = {
          id: (Date.now() + 1).toString(),
          text: 'Lo siento, no encontré una respuesta específica para tu pregunta. Por favor, selecciona una de las opciones disponibles o reformula tu pregunta.',
          isUser: false,
          timestamp: new Date()
        };
      }
      
      setMessages(prev => [...prev, botMessage]);
    }, 1000);

    setInputText('');
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (question: QuestionData) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      text: question.question,
      isUser: true,
      timestamp: new Date()
    };

    const botMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: question.response,
      isUser: false,
      timestamp: new Date(),
      files: question.files.length > 0 ? question.files : undefined
    };

    setMessages(prev => [...prev, userMessage, botMessage]);
    setInputText('');
    setShowSuggestions(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleImageClick = (imageUrl: string) => {
    setSelectedImageUrl(imageUrl);
  };

  const handleDownload = async (url: string, filename: string) => {
    const { secureDownloadPDF, sanitizeFilename } = await import('@/utils/secureDownload');
    
    try {
      await secureDownloadPDF({
        url,
        filename: sanitizeFilename(filename),
        onError: (error) => {
          console.error('[ChatBot] Error descargando archivo:', error);
        }
      });
    } catch (error) {
      console.error('[ChatBot] Error:', error);
    }
  };

  const closeChat = () => {
    setIsOpen(false);
    setMessages([]);
    setInputText('');
    setShowSuggestions(false);
  };

  return (
    <>
      {/* Botón flotante con imagen según dispositivo */}
      {!isOpen && (
        <div
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 cursor-pointer hover:scale-105 transition-transform duration-300"
        >
          <img
            src={isMobile ? "/lovable-uploads/8116c8f6-f630-4c1a-9dfc-dd77c77e2f5a.png" : "/lovable-uploads/af1ccd59-7da5-4d9c-bf95-91d6671bce04.png"}
            alt="Chat con CGC"
            className="w-16 h-20 md:w-16 md:h-16 lg:w-32 lg:h-32 drop-shadow-lg"
          />
        </div>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-80 sm:w-96 h-[500px] bg-white rounded-lg shadow-2xl border flex flex-col">
          {/* Header */}
          <div 
            className="flex items-center justify-between p-4 rounded-t-lg"
            style={{ backgroundColor: '#0E2855' }}
          >
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                <MessageCircle className="w-4 h-4" style={{ color: '#0E2855' }} />
              </div>
              <span className="text-white font-medium">CGC</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={closeChat}
              className="text-white hover:bg-white/20"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {isLoading ? (
              <div className="flex justify-center items-center h-full">
                <div className="animate-pulse text-gray-500">Cargando preguntas...</div>
              </div>
            ) : (
              <>
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex",
                      message.isUser ? "justify-end" : "justify-start"
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-xs px-3 py-2 rounded-lg text-sm",
                        message.isUser
                          ? "text-white"
                          : "bg-gray-100 text-gray-900"
                      )}
                      style={message.isUser ? { backgroundColor: '#B09B57' } : {}}
                    >
                      <p className="whitespace-pre-wrap">{message.text}</p>
                      
                      {/* Mostrar archivos adjuntos */}
                      {message.files && message.files.length > 0 && (
                        <div className="mt-2 space-y-2">
                          {message.files.map((file) => (
                            <div key={file.id} className="border rounded p-2 bg-white">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs text-gray-600 truncate">{file.name}</span>
                                <div className="flex space-x-1">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleImageClick(file.formats?.large || file.url)}
                                    className="p-1"
                                  >
                                    <ZoomIn className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleDownload(file.url, file.name)}
                                    className="p-1"
                                  >
                                    <Download className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                              <img
                                src={file.formats?.thumbnail || file.url}
                                alt={file.name}
                                className="w-full h-20 object-cover rounded cursor-pointer"
                                onClick={() => handleImageClick(file.formats?.large || file.url)}
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Suggestions */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="border-t border-gray-200 max-h-40 overflow-y-auto">
              <div className="p-2 text-xs text-gray-500 font-medium">Selecciona una opción:</div>
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion.id}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 border-b border-gray-100 last:border-b-0"
                  style={{ color: '#0E2855' }}
                >
                  {suggestion.question}
                </button>
              ))}
            </div>
          )}

          {/* Input Area */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex space-x-2">
              <Input
                ref={inputRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Escribe tu mensaje..."
                className="flex-1 text-sm"
              />
              <Button
                onClick={handleSendMessage}
                size="sm"
                disabled={!inputText.trim()}
                style={{ backgroundColor: '#B09B57' }}
                className="text-white hover:opacity-90"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para ver imagen en grande */}
      {selectedImageUrl && (
        <div 
          className="fixed inset-0 z-[100] bg-black bg-opacity-75 flex items-center justify-center p-4"
          onClick={() => setSelectedImageUrl(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedImageUrl(null)}
              className="absolute top-2 right-2 text-white hover:bg-white/20 z-10"
            >
              <X className="w-4 h-4" />
            </Button>
            <img
              src={selectedImageUrl}
              alt="Imagen ampliada"
              className="max-w-full max-h-full object-contain rounded"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;
