import { Component, OnInit } from '@angular/core';
import {StatsService} from "../stats.service";
import {SnippetService} from "../snippet.service";
import * as moment from "moment";

@Component({
  selector: 'app-notices',
  templateUrl: './notices.component.html',
  styleUrls: ['./notices.component.scss']
})
export class NoticesComponent implements OnInit {

  constructor(
    private statsService: StatsService,
    private _snippetService: SnippetService,
  ) { }

  ngOnInit() {
  }

  get snippetService() {
    return this._snippetService;
  }

  get notices() {
    const poolConfig = this.statsService.poolConfig.getValue();
    if (!poolConfig || !poolConfig.notices) {
      return [];
    }

    return poolConfig.notices.slice(0, 10);
  }

  getTranslatedNoticeText(notice) {
    return notice.text[this.snippetService.selectedLanguage] || notice.text.en;
  }

  getFormattedDate(date) {
    return moment(date).format('YYYY-MM-DD');
  }
}
