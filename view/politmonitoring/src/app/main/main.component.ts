import {Component, OnInit, ViewEncapsulation, ViewChild, ElementRef, AfterViewInit} from '@angular/core';
import { DataService } from '../shared/data.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./main.component.css']
})

export class MainComponent implements OnInit, AfterViewInit {
  data: any[];
  originalData: any[];
  categoryFilter: String;
  @ViewChild('content') content: ElementRef;
  firstDisplay = true;

  constructor(
      private dataService: DataService,
      private modalService: NgbModal
  ) { }

  ngOnInit() {
    this.dataService.getData().subscribe(
        (data) => {
          data.forEach(d => {
            /* When the .xlsx file is parsed to JSON, some numbers can be converted with a tail of 000000 or 99999
             * Fix the flawful paring, keeping lenght at 7
             */
            if (d['Geschäfts-nr'].length > 7) {
              if (d['Geschäfts-nr'].substring(7, 8) === '9') {
                debugger;
                if (Number(d['Geschäfts-nr']) !== NaN) {
                  let tmp = parseFloat(d['Geschäfts-nr']).toFixed(4).toString();
                  if (tmp.length < 7) {
                    tmp = '0' + tmp;
                  }
                  d['Geschäfts-nr'] = tmp;
                } else {
                  d['Geschäfts-nr'] = d['Geschäfts-nr'].substring(0, 7);
                }
              } else {
                d['Geschäfts-nr'] = d['Geschäfts-nr'].substring(0, 7);
              }
            }

            // extract numbers of categories
            d.Themenbereich_Number = DataService.extractNumber(d['Themenbereich 1']);
            d.Thema2_Number = DataService.extractNumber(d['Thema 2']);

            // remove number
            d['Themenbereich 1'] = d['Themenbereich 1'].substring(0, d['Themenbereich 1'].indexOf('(')).trim();
            if (d['Themenbereich 2']) {
              d['Themenbereich 2'] = d['Themenbereich 2'].substring(0, d['Themenbereich 2'].indexOf('(')).trim();
            }
            d['Thema 1'] = d['Thema 1']
              .substring(0, d['Thema 1'].indexOf('(')).trim();
            d['Thema 2'] = d['Thema 2'].substring(0, d['Thema 2'].indexOf('(')).trim();
          });
          // Remove empty elements from array
          const filteredData = data.filter( el => el['Geschäfts-nr'] > 0);
          this.data = filteredData;
          this.originalData = filteredData;
        },
        (err) => {
          alert('An error occurred. See console for details.');
          console.log(err); // TODO: Add error handling
        });
  }

  ngAfterViewInit(): void {
    if (this.firstDisplay) {
      // do this async (not in same digest). Otherwise it will throw expressionChangedAfterItHasBeenCheckedError
      setTimeout(() => {
        this.modalService.open(this.content, { size: 'lg' });
        this.firstDisplay = false;
      }, 0);
    }
  }

  /*
  * Retruns true if used browser is of type IE 11, 10 or older
  */
  detectIE(): boolean {
    const ua = window.navigator.userAgent;
    return ua.indexOf('Trident/') > 0 || ua.indexOf('MSIE ') > 0;
  }

  replaceFilteredData(value: any) {
    this.data = value.data;
    this.categoryFilter = value.categoryFilter;
  }
  /*
  * Triggers the modal to apear. Modaloption can be passed as arguments
  * See: https://ng-bootstrap.github.io/#/components/modal/examples
  */
  openLg(content) {
    this.modalService.open(content, { size: 'lg' , windowClass: 'animated slideInUp' });
  }
}
