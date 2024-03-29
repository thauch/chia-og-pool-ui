import {Component, OnInit} from '@angular/core';
import {interval, Observable, Subscription} from 'rxjs';
import {StatsService} from '../stats.service';
import * as humanizeDuration from 'humanize-duration';
import * as moment from 'moment';
import Capacity from '../capacity';
import {SnippetService} from '../snippet.service';

@Component({
  selector: 'app-stats-card',
  templateUrl: './stats-card.component.html',
  styleUrls: ['./stats-card.component.scss']
})
export class StatsCardComponent implements OnInit {

  private _poolConfig:any = {};
  private _poolStats:any = {};
  private _exchangeStats:any = {};
  private _elapsedSeconds = 0;
  private _remainingSeconds = 0;
  private counter: Observable<any>;
  private subscription: Subscription;
  public accountStats:any = {};
  public rewardStats:any = {};

  constructor(
    private statsService: StatsService,
    private _snippetService: SnippetService
  ) {}

  get snippetService(): SnippetService {
    return this._snippetService;
  }

  ngOnInit() {
    this.statsService.poolConfig.asObservable().subscribe((poolConfig => this.poolConfig = poolConfig));
    this.statsService.poolStats.asObservable().subscribe((poolStats => this.poolStats = poolStats));
    this.statsService.exchangeStats.asObservable().subscribe((exchangeStats => this.exchangeStats = exchangeStats));
    this.statsService.accountStats.asObservable().subscribe((accountStats => this.accountStats = accountStats));
    this.statsService.rewardStats.asObservable().subscribe((rewardStats => this.rewardStats = rewardStats));
    this.poolConfig = this.statsService.poolConfig.getValue();
    this.poolStats = this.statsService.poolStats.getValue();
    this.rewardStats = this.statsService.rewardStats.getValue();
    this.exchangeStats = this.statsService.exchangeStats.getValue();
    this.accountStats = this.statsService.accountStats.getValue();
    this.counter = interval(1000);
    this.subscription = this.counter.subscribe(() => {
      this.updateElapsed();
    });
    this.updateElapsed();
  }

  set poolConfig(poolConfig) {
    this._poolConfig = poolConfig;
  }

  get poolConfig() {
    return this._poolConfig;
  }

  set poolStats(stats) {
    this._poolStats = stats;
    this.updateElapsed();
  }

  get poolStats() {
    return this._poolStats;
  }

  set exchangeStats(stats) {
    this._exchangeStats = stats;
  }

  get exchangeStats() {
    return this._exchangeStats;
  }

  updateElapsed() {
    if (!this.poolStats.receivedAt) {
      return;
    }
    const start = (new Date(this.poolStats.receivedAt)).getTime();
    const now = (new Date()).getTime();
    this._elapsedSeconds = (now - start) / 1000;
    if (this._exchangeStats.bestDeadline === null || this._exchangeStats.bestDeadline === undefined) {
      this._remainingSeconds = null;
      return;
    }
    this._remainingSeconds = this._exchangeStats.bestDeadline - this._elapsedSeconds;
  }

  get elapsed() {
    return humanizeDuration(this._elapsedSeconds * 1000, { round: true, language: this.snippetService.selectedLanguage });
  }

  get bestDeadline() {
    if (this.exchangeStats.bestDeadline === null) {
      return this.snippetService.getSnippet('general.not-available.short');
    }
    const duration = moment.duration(this.exchangeStats.bestDeadline, 'seconds');
    if (duration.months() > 0) {
      return `${duration.months()}m ${duration.days()}d ${duration.hours().toString().padStart(2, '0')}:${duration.minutes().toString().padStart(2, '0')}:${duration.seconds().toString().padStart(2, '0')}`;
    } else if (duration.days() > 0) {
      return `${duration.days()}d ${duration.hours().toString().padStart(2, '0')}:${duration.minutes().toString().padStart(2, '0')}:${duration.seconds().toString().padStart(2, '0')}`;
    }

    return `${duration.hours().toString().padStart(2, '0')}:${duration.minutes().toString().padStart(2, '0')}:${duration.seconds().toString().padStart(2, '0')}`;
  }

  getFormattedCapacityFromTiB(capacityInTiB) {
    return Capacity.fromTiB(capacityInTiB).toString();
  }

  getFormattedCapacityFromGiB(capacityInGiB) {
    return new Capacity(capacityInGiB).toString();
  }

  get dailyRewardPerPiB() {
    if (!this.rewardStats || !this.rewardStats.dailyRewardPerPiB) {
      return 0;
    }

    return (this.rewardStats.dailyRewardPerPiB || 0).toFixed(2);
  }

  get dailyRewardPerPiBFiat() {
    if (!this.exchangeStats || !this.exchangeStats.rates) {
      return 0;
    }
    if (!this.rewardStats.dailyRewardPerPiB) {
      return 0;
    }
    if (this.poolConfig.isTestnet) {
      return 0;
    }
    if (!this.exchangeStats.rates.usd) { // TODO: user configurable
      return 0;
    }

    return this.rewardStats.dailyRewardPerPiB * this.exchangeStats.rates.usd;
  }

  get poolBalance() {
    if (!this.poolStats.balance) {
      return 0;
    }
    const balance = parseFloat(this.poolStats.balance);
    const decimalPlaces = (balance < 100) ? 2 : 0;

    return balance.toFixed(decimalPlaces);
  }
}
