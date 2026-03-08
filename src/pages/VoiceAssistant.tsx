import { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, MicOff, Send, Volume2, Loader2, Bot, User, Trash2 } from 'lucide-react';
import { AppHeader } from '@/components/layout/AppHeader';
import { BottomNav } from '@/components/layout/BottomNav';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function VoiceAssistant() {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [micSupported, setMicSupported] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const langMap: Record<string, string> = {
    en: 'en-IN', hi: 'hi-IN', ta: 'ta-IN', te: 'te-IN',
    kn: 'kn-IN', bn: 'bn-IN', pa: 'pa-IN', mr: 'mr-IN',
  };

  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!SpeechRecognition) {
      setMicSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = langMap[language] || 'en-IN';

    recognition.onresult = (event: any) => {
      let transcript = '';
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setInput(transcript);
      // If final result, stop listening
      if (event.results[event.results.length - 1].isFinal) {
        setIsListening(false);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      if (event.error === 'not-allowed') {
        toast({ variant: 'destructive', title: 'Microphone Blocked', description: 'Please allow microphone access in your browser settings.' });
      } else if (event.error === 'no-speech') {
        toast({ variant: 'destructive', title: 'No Speech Detected', description: 'Please speak clearly and try again.' });
      } else {
        toast({ variant: 'destructive', title: 'Voice Error', description: `Error: ${event.error}. Try again.` });
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      try { recognition.abort(); } catch {}
    };
  }, [language]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Add initial greeting
  useEffect(() => {
    if (messages.length === 0) {
      const greetings: Record<string, string> = {
        en: "Hello! I'm your Crop Wise Assistant. Ask me anything about farming - crops, fertilizers, pests, weather, or government schemes!",
        hi: "नमस्ते! मैं आपका क्रॉप वाइज सहायक हूं। खेती के बारे में कुछ भी पूछें!",
        ta: "வணக்கம்! நான் உங்கள் Crop Wise உதவியாளர். விவசாயம் பற்றி எதையும் கேளுங்கள்!",
        te: "నమస్కారం! నేను మీ Crop Wise అసిస్టెంట్. వ్యవసాయం గురించి ఏదైనా అడగండి!",
        kn: "ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ Crop Wise ಸಹಾಯಕ. ಕೃಷಿ ಬಗ್ಗೆ ಏನಾದರೂ ಕೇಳಿ!",
        bn: "নমস্কার! আমি আপনার Crop Wise সহকারী। কৃষি সম্পর্কে যেকোনো কিছু জিজ্ঞাসা করুন!",
        pa: "ਸਤ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਤੁਹਾਡਾ Crop Wise ਸਹਾਇਕ ਹਾਂ। ਖੇਤੀ ਬਾਰੇ ਕੁਝ ਵੀ ਪੁੱਛੋ!",
        mr: "नमस्कार! मी तुमचा Crop Wise सहाय्यक आहे। शेतीबद्दल काहीही विचारा!",
      };
      setMessages([{
        id: '1',
        role: 'assistant',
        content: greetings[language] || greetings.en,
        timestamp: new Date(),
      }]);
    }
  }, []);

  const toggleListening = useCallback(async () => {
    if (!recognitionRef.current) {
      toast({ variant: 'destructive', title: 'Not Supported', description: 'Voice recognition is not supported in this browser. Please use Chrome.' });
      return;
    }

    if (isListening) {
      try { recognitionRef.current.stop(); } catch {}
      setIsListening(false);
    } else {
      // Request microphone permission first
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        recognitionRef.current.lang = langMap[language] || 'en-IN';
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error('Mic permission error:', err);
        toast({ variant: 'destructive', title: 'Microphone Access Denied', description: 'Please allow microphone in browser settings and try again.' });
      }
    }
  }, [isListening, language]);

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = langMap[language] || 'en-IN';
      speechSynthesis.speak(utterance);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-assistant`;
      
      const response = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: messages.map(m => ({ role: m.role, content: m.content })).concat([{ role: 'user', content: input.trim() }]),
          language,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = '';
      const assistantMessageId = (Date.now() + 1).toString();

      setMessages(prev => [...prev, {
        id: assistantMessageId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
      }]);

      if (reader) {
        let buffer = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          
          let newlineIndex: number;
          while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
            let line = buffer.slice(0, newlineIndex);
            buffer = buffer.slice(newlineIndex + 1);

            if (line.endsWith('\r')) line = line.slice(0, -1);
            if (line.startsWith(':') || line.trim() === '') continue;
            if (!line.startsWith('data: ')) continue;

            const jsonStr = line.slice(6).trim();
            if (jsonStr === '[DONE]') continue;

            try {
              const parsed = JSON.parse(jsonStr);
              const content = parsed.choices?.[0]?.delta?.content as string | undefined;
              if (content) {
                assistantContent += content;
                setMessages(prev => prev.map(m => 
                  m.id === assistantMessageId 
                    ? { ...m, content: assistantContent }
                    : m
                ));
              }
            } catch {
              buffer = line + '\n' + buffer;
              break;
            }
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to get response. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <PageContainer className="flex flex-col h-screen">
      <AppHeader title={t('voiceAssistant')} />

      {/* Chat Messages */}
      <div className="flex-1 overflow-hidden px-4">
        <ScrollArea className="h-full pr-4" ref={scrollRef}>
          <div className="space-y-4 py-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  message.role === 'user' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-secondary text-foreground'
                }`}>
                  {message.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                </div>
                <Card className={`max-w-[80%] ${
                  message.role === 'user' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-card'
                }`}>
                  <CardContent className="p-3">
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    {message.role === 'assistant' && message.content && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => speakText(message.content)}
                        className="mt-2 h-8 text-xs gap-1"
                      >
                        <Volume2 className="w-3 h-3" />
                        {language === 'hi' ? 'सुनें' : language === 'ta' ? 'கேளுங்கள்' : 'Listen'}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </div>
            ))}
            {isLoading && messages[messages.length - 1]?.role === 'user' && (
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                  <Bot className="w-5 h-5" />
                </div>
                <Card className="bg-card">
                  <CardContent className="p-3">
                    <Loader2 className="w-5 h-5 animate-spin" />
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Input Area */}
      <div className="p-4 border-t bg-background">
        {isListening && (
          <div className="text-center text-sm text-primary mb-2 animate-pulse">
            🎤 {language === 'hi' ? 'सुन रहा है... बोलिए' : language === 'ta' ? 'கேட்கிறது... பேசுங்கள்' : 'Listening... speak now'}
          </div>
        )}
        <div className="flex gap-2">
          <Button
            variant={isListening ? 'destructive' : 'outline'}
            size="icon"
            onClick={toggleListening}
            disabled={!micSupported}
            className="shrink-0 h-12 w-12"
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </Button>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder={language === 'hi' ? 'अपना प्रश्न लिखें...' : language === 'ta' ? 'உங்கள் கேள்வியை தட்டச்சு செய்யவும்...' : 'Type your question...'}
            className="h-12"
          />
          <Button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            size="icon"
            className="shrink-0 h-12 w-12"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </Button>
        </div>
        <div className="flex justify-center mt-2">
          <Button variant="ghost" size="sm" onClick={clearChat} className="text-xs text-muted-foreground gap-1">
            <Trash2 className="w-3 h-3" />
            {language === 'hi' ? 'चैट साफ़ करें' : 'Clear Chat'}
          </Button>
        </div>
      </div>

      <BottomNav />
    </PageContainer>
  );
}
