import { Component, OnInit } from '@angular/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [IonicModule, CommonModule] // add other needed imports
})

export class HomePage implements OnInit {
  currentTime: string = '';
  timer: number = 0;
  interval: any;
  timerRunning: boolean = false;
  timerLabel: string = 'Pomodoro';
  
  ngOnInit() {
    this.updateClock();
    setInterval(() => this.updateClock(), 1000);
    LocalNotifications.requestPermissions();
  }

  updateClock() {
    const now = new Date();
    this.currentTime = now.toLocaleTimeString();
  }

  startPomodoroCycle() {
    if (this.timerRunning) return;

    this.timerLabel = 'Work';
    this.startCountdown(25 * 60, async () => {
      await this.notifyUser('Pomodoro Finished!', 'Time for a break ☕');
      this.timerLabel = 'Break';
      this.startCountdown(5 * 60, async () => {
        await this.notifyUser('Break Ended!', 'Back to work! 💼');
        this.resetCycle();
      });
    });
  }

  startCountdown(seconds: number, onComplete: () => void) {
    this.timer = seconds;
    this.timerRunning = true;

    this.interval = setInterval(() => {
      this.timer--;
      if (this.timer <= 0) {
        clearInterval(this.interval);
        this.timerRunning = false;
        onComplete();
      }
    }, 1000);
  }

  resetCycle() {
    this.timer = 0;
    this.timerLabel = 'Pomodoro';
    this.timerRunning = false;
  }

  async notifyUser(title: string, body: string) {
    await LocalNotifications.schedule({
      notifications: [{
        title,
        body,
        id: new Date().getTime(),
        sound: 'beep.wav',
        smallIcon: 'ic_stat_icon_config_sample',
      }]
    });
  }
}
