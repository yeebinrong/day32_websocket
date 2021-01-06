import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface ChatMessage {
  from: string
  message: string
  ts: string
}

@Injectable()
export class ChatService {
  private ws: WebSocket = null
  event = new Subject<ChatMessage>()
  join(name: string) {
    const params = new HttpParams().set('name', name)
    this.ws = new WebSocket(`ws://localhost:3000/chat?${params.toString()}`)

    // handle incoming message
    this.ws.onmessage = (payload: MessageEvent) => {
      // parse the string to chatmessage
      const chat = JSON.parse(payload.data) as ChatMessage
      console.info(payload.data)
      this.event.next(chat)
    }
    // handle errors
    this.ws.onclose = () => {
      if (this.ws != null) {
        console.info("closing socket due to server close")
        this.ws.close()
        this.ws = null
      }
    }
  }

  leave() {
    if (this.ws != null) {
      console.info("closing socket due to user leaving")
      this.ws.close()
      this.ws= null
    }
  }

  sendMessage(message) {
    this.ws.send(message)
  }
}
