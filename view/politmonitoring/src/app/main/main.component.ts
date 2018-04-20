import {Component, OnInit, ViewEncapsulation, ViewChild, ElementRef, AfterViewInit} from '@angular/core';
import { DataService } from '../shared/data.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./main.component.css']
})

export class MainComponent implements OnInit {
  data: any[];
  originalData: any[];
  categoryFilter: String;
  @ViewChild('content') content: ElementRef;
  firstDisplay: boolean = true;

  constructor(
      private dataService: DataService,
      private modalService: NgbModal
  ) { }

  ngOnInit() {
    this.dataService.getData().subscribe(
        (data) => {
          data.forEach(d => {
            d.Themenbereich = d.Themenbereich.substring(0, d.Themenbereich.indexOf('(')).trim();
            // TODO dangerous. Maybe we should simplify the property name
            d['Thema 1 (gleiche Nr wie Themenbereich)'] = d['Thema 1 (gleiche Nr wie Themenbereich)']
              .substring(0, d['Thema 1 (gleiche Nr wie Themenbereich)'].indexOf('(')).trim();
            d['Thema 2 (andere Nr)'] = d['Thema 2 (andere Nr)'].substring(0, d['Thema 2 (andere Nr)'].indexOf('(')).trim();
          });
          // Remove empty elements from array
          const filteredData = data.filter( el => el['Geschäfts-nr'] > 0);
          this.data = filteredData;
          this.originalData = filteredData;
        },
        (err) => {
          alert('An error occurred. See console for details.');
          console.log(err); // TODO Add error handling
        });
  }
  // ngAfterViewInit(): void {
  //   if (this.firstDisplay) {
  //     this.modalService.open(this.content, {size: 'lg'});
  //     this.firstDisplay = false;
  //   }
  // }

  replaceFilteredData(value: any) {
    this.data = value.data;
    this.categoryFilter = value.categoryFilter;
  }
  openLg(content) {
    this.modalService.open(content, { size: 'lg' , windowClass: 'animated slideInUp' });
  }
}
