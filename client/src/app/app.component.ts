import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ChatMessage, ChatService } from './chat.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'client';
  form:FormGroup
  text:string = 'Join'
  messages: ChatMessage[] = []
  event$: Subscription

  constructor(private fb: FormBuilder, private chatSvc:ChatService) {}

  ngOnInit() {
    this.createForm()
  }

  sendMessage() {
    const message = this.form.get('message').value
    this.chatSvc.sendMessage(message)
    this.form.get('message').reset()
    console.info(">>> MESSAGE: ", message)
  }

  toggleConnection() {
    if (this.text =='Join') {
      this.text = 'Leave'
      const name = this.form.get('name').value
      console.info(">>> NAME: ", name)
      this.chatSvc.join(name)
      this.event$ = this.chatSvc.event.subscribe(chat => {
        this.messages.unshift(chat)
        console.info(this.messages)
      })
    } else if (this.text =='Leave') {
      this.text = 'Join'
      this.chatSvc.leave()
    }
  }

  ngOnDestroy() {
    // check if we are connected  before unsubscribing
    if (null != this.event$) {
      this.event$.unsubscribe()
      this.event$ = null
    }
  }

  private createForm() {
    this.form = this.fb.group({
      name: this.fb.control('', [Validators.required]),
      message: this.fb.control('')
    })
  }
}
