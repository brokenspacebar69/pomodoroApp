import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController, Platform } from '@ionic/angular';
import { formatDate } from '@angular/common';

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

  ngOnInit() {
    this.updateClock();
    setInterval(() => this.updateClock(), 1000);
  }

  updateClock() {
    this.currentTime = formatDate(new Date(), 'HH:mm:ss', 'en-US');
  }

  startPomodoro() {
    if (this.sessionRunning) return;

    this.sessionRunning = true;
    this.countdown = 25 * 60; // 25 mins
    this.startCountdown(() => {
      this.showNotification('Work session done! Time for a break 🎉');
      this.startBreak();
    });
  }

  startBreak() {
    this.onBreak = true;
    this.countdown = 5 * 60; // 5 mins
    this.startCountdown(() => {
      this.showNotification('Break finished! Back to work ☕');
      this.resetCycle();
    });
  }

  startCountdown(callback: Function) {
    this.interval = setInterval(() => {
      this.countdown--;
      this.displayCountdown = this.formatTime(this.countdown);

      if (this.countdown <= 0) {
        clearInterval(this.interval);
        callback();
        this.vibratePhone();
      }
    }, 1000);
  }

  resetCycle() {
    this.sessionRunning = false;
    this.onBreak = false;
    this.displayCountdown = '';
  }

  formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  async showNotification(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      position: 'top'
    });
    await toast.present();
  }

  vibratePhone() {
    if (this.platform.is('capacitor') && navigator.vibrate) {
      navigator.vibrate(1000);
    }
  }
}
