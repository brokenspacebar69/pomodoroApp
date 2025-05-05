import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController, Platform } from '@ionic/angular';
import { formatDate } from '@angular/common';
import { App } from '@capacitor/app';
import { LocalNotifications } from '@capacitor/local-notifications';

@Component({
  standalone: true,
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  imports: [IonicModule, CommonModule]
})
export class HomePage {
  currentTime: string = '';
  interval: any;
  countdown: number = 0;
  displayCountdown: string = '';
  sessionRunning = false;
  onBreak = false;
  

  constructor(private toastCtrl: ToastController, private platform: Platform) {}

  async ngOnInit() {
    this.updateClock();
    setInterval(() => this.updateClock(), 1000);

    this.platform.backButton.subscribeWithPriority(10, () => {
      App.exitApp();
    });

    // Request notification permissions
    const permission = await LocalNotifications.requestPermissions();
    if (permission.display !== 'granted') {
      console.error('Notification permissions not granted');
    }
  }

  updateClock() {
    this.currentTime = formatDate(new Date(), 'HH:mm:ss', 'en-US');
  }

  startPomodoro() {
    if (this.sessionRunning) return;

    this.sessionRunning = true;
    this.countdown = 5; // 25 minutes
    this.startCountdown(() => {
      this.sendNotification('Work session done! Time for a break 🎉');
      this.startBreak();
    });
  }

  startBreak() {
    this.onBreak = true;
    this.countdown = 5 * 60; // 5 minutes
    this.startCountdown(() => {
      this.sendNotification('Break finished! Ready for another Pomodoro 🍅');
      this.resetCycle();
    });
  }

  startCountdown(callback: Function) {
    this.interval = setInterval(() => {
      this.countdown--;
      this.displayCountdown = this.formatTime(this.countdown);

      if (this.countdown <= 0) {
        clearInterval(this.interval);
        this.vibratePhone();
        callback();
      }
    }, 1000);
  }

  resetCycle() {
    this.sessionRunning = false;
    this.onBreak = false;
    this.displayCountdown = '';
  }

  resetPomodoro() {
    this.sessionRunning = false;
    this.onBreak = false;
    this.displayCountdown = '25:00'; // Reset to default timer value
  }

  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60).toString().padStart(2, '0');
    const sec = (seconds % 60).toString().padStart(2, '0');
    return `${minutes}:${sec}`;
  }

  async sendNotification(message: string) {
    await LocalNotifications.requestPermissions(); // ask permission
    await LocalNotifications.schedule({
      notifications: [
        {
          title: 'Pomodoro Timer',
          body: message,
          id: new Date().getTime(),
          schedule: { at: new Date(Date.now()) },
          sound: 'beep.wav', // optional: customize with your own sound
          smallIcon: 'ic_launcher',
        }
      ]
    });

    const toast = await this.toastCtrl.create({
      message: message,
      duration: 2000,
      position: 'top',
      color: 'primary'
    });
    await toast.present();
  }

  vibratePhone() {
    if (navigator.vibrate) {
      navigator.vibrate([300, 100, 300]);
    }
  }
}
