import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, Platform, AlertController } from '@ionic/angular';
import { App } from '@capacitor/app';

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
  audio: HTMLAudioElement | null = null;

  constructor(private platform: Platform, private alertCtrl: AlertController) {}

  async ngOnInit() {
    this.updateClock();
    setInterval(() => this.updateClock(), 1000);

    this.platform.backButton.subscribeWithPriority(10, () => {
      App.exitApp();
    });
  }

  updateClock() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = (hours % 12 || 12).toString();
    this.currentTime = `${formattedHours}:${minutes}:${seconds} ${ampm}`;
  }

  startPomodoro() {
    if (this.sessionRunning) return;

    this.sessionRunning = true;
    this.onBreak = false;
    this.countdown = 25 * 60; // 25 minutes in seconds
    this.displayCountdown = this.formatTime(this.countdown);

    this.startCountdown();
  }

  startCountdown() {
    this.interval = setInterval(() => {
      this.countdown--;
      this.displayCountdown = this.formatTime(this.countdown);

      if (this.countdown <= 0) {
        clearInterval(this.interval);

        if (this.onBreak) {
          // Break session finished
          this.playAlarmSound(3000); // Play alarm for 3 seconds
          this.triggerAlarm('Break finished! Ready for another Pomodoro 🍅');
        } else {
          // Work session finished, transition to break
          this.triggerAlarm('Work session done! Time for a break 🎉');
        }
      }
    }, 1000);
  }

  startBreak() {
    this.onBreak = true; // Indicate that it's break time
    this.countdown = 5 * 60; // 5 minutes in seconds
    this.displayCountdown = this.formatTime(this.countdown);

    this.startCountdown(); // Start the countdown for the break
  }

  resetCycle() {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0; // Reset the audio playback position
    }

    this.sessionRunning = false;
    this.onBreak = false;
    this.displayCountdown = '';
  }

  resetPomodoro() {
    if (this.interval) {
      clearInterval(this.interval); // Stop the countdown timer
      this.interval = null;
    }

    if (this.audio) {
      this.audio.pause(); // Stop the alarm sound
      this.audio.currentTime = 0; // Reset the audio playback position
    }

    this.sessionRunning = false; // Reset session state
    this.onBreak = false; // Reset break state
    this.countdown = 25 * 60; // Reset the countdown to 25 minutes
    this.displayCountdown = this.formatTime(this.countdown); // Update the display
  }

  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60).toString().padStart(2, '0');
    const sec = (seconds % 60).toString().padStart(2, '0');
    return `${minutes}:${sec}`;
  }

  async triggerAlarm(message: string) {
    this.vibratePhone();
    this.playAlarmSound();
    await this.showAlertNotification(message);

    // Stop the alarm sound after pressing "OK"
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
    }

    if (this.onBreak) {
      this.resetCycle(); // Reset after break
    } else {
      this.startBreak(); // Start break after work session
    }
  }

  async showAlertNotification(message: string) {
    const alert = await this.alertCtrl.create({
      header: 'Pomodoro Timer',
      message: message,
      buttons: ['OK']
    });
    await alert.present();
  }

  vibratePhone() {
    if (navigator.vibrate) {
      navigator.vibrate([300, 100, 300]);
    }
  }

  playAlarmSound(duration: number = 0) {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
    }

    this.audio = new Audio('assets/sound/alarm.wav');
    this.audio.load();
    this.audio.play().catch((error) => {
      console.error('Error playing alarm sound:', error);
    });

    if (duration > 0) {
      setTimeout(() => {
        if (this.audio) {
          this.audio.pause();
          this.audio.currentTime = 0;
        }
      }, duration);
    }
  }
}
