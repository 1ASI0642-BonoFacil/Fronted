import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  avatar?: string;
}

interface ChatResponse {
  response: string;
  status: string;
  timestamp: string;
}

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.css']
})
export class ChatbotComponent implements OnInit, OnDestroy {
  isOpen = false;
  isMaximized = false;
  isFullscreen = false;
  isLoading = false;
  messages: ChatMessage[] = [];
  currentMessage = '';
  userId = '';
  hasSentWelcomeMessage = false;

  // Barbara's avatar URL
  barbaraAvatar = 'https://i.ibb.co/ymf4N6vQ/Imagen-de-WhatsApp-2025-07-05-a-las-22-32-33-5626ea5e.jpg';
  
  // Chatbot API endpoint
  private readonly chatApiUrl = 'https://barbara-bonofacil-chatbot.onrender.com/chat';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.generateUserId();
  }

  ngOnDestroy() {
    // Cleanup if needed
  }

  private generateUserId() {
    // Generate a unique user ID for this session
    this.userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  private addWelcomeMessage() {
    const welcomeMessage: ChatMessage = {
      id: 'welcome',
      text: '¡Hola! Soy Barbara, tu asistente financiera de BonoFacil Platform 🏦💼 ¿En qué puedo ayudarte hoy? Puedo explicarte sobre bonos, cálculos financieros, TCEA, TREA, duración, convexidad y mucho más!',
      isUser: false,
      timestamp: new Date(),
      avatar: this.barbaraAvatar
    };
    this.messages.push(welcomeMessage);
  }

  openChatbot() {
    this.isOpen = true;
    if (!this.hasSentWelcomeMessage) {
      this.addWelcomeMessage();
      this.hasSentWelcomeMessage = true;
    }
  }

  toggleChatbot() {
    this.isOpen = !this.isOpen;
    if (this.isOpen && !this.hasSentWelcomeMessage) {
      this.addWelcomeMessage();
      this.hasSentWelcomeMessage = true;
    }
  }

  toggleMaximize() {
    this.isMaximized = !this.isMaximized;
    this.isFullscreen = false;
  }

  toggleFullscreen() {
    this.isFullscreen = !this.isFullscreen;
    this.isMaximized = false;
  }

  closeChat() {
    this.isOpen = false;
    this.isMaximized = false;
    this.isFullscreen = false;
  }

  async sendMessage() {
    if (!this.currentMessage.trim() || this.isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: this.currentMessage,
      isUser: true,
      timestamp: new Date()
    };

    this.messages.push(userMessage);
    const messageToSend = this.currentMessage;
    this.currentMessage = '';
    this.isLoading = true;

    try {
      const response = await this.sendToChatbot(messageToSend);
      
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: response.response,
        isUser: false,
        timestamp: new Date(),
        avatar: this.barbaraAvatar
      };

      this.messages.push(botMessage);
    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: 'Lo siento, estoy teniendo problemas técnicos en este momento. Por favor, intenta de nuevo en unos minutos o contacta con soporte técnico. 🔧',
        isUser: false,
        timestamp: new Date(),
        avatar: this.barbaraAvatar
      };

      this.messages.push(errorMessage);
    } finally {
      this.isLoading = false;
      this.scrollToBottom();
    }
  }

  private async sendToChatbot(message: string): Promise<ChatResponse> {
    const payload = {
      message: message,
      user_id: this.userId
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    const response = await this.http.post<ChatResponse>(this.chatApiUrl, payload, { headers }).toPromise();
    if (!response) {
      throw new Error('No response from chatbot API');
    }
    return response;
  }

  onKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  private scrollToBottom() {
    setTimeout(() => {
      const chatMessages = document.querySelector('.chat-messages');
      if (chatMessages) {
        chatMessages.scrollTop = chatMessages.scrollHeight;
      }
    }, 100);
  }

  clearChat() {
    this.messages = [];
    this.addWelcomeMessage();
  }

  get chatWindowClasses() {
    return {
      'chat-window': true,
      'maximized': this.isMaximized,
      'fullscreen': this.isFullscreen
    };
  }
} 