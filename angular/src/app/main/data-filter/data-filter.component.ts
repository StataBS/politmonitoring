import { AfterViewChecked, Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { DataService} from '../../shared/data.service';
import * as moment from 'moment';
import { AuthService } from '../../shared/auth.service';
import { Category } from '../../shared/category';
declare const $: any;
declare var jQuery: any;

interface jQuery {
  tooltip(options?: any): any;
}

@Component({
  selector: 'app-data-filter',
  templateUrl: './data-filter.component.html',
  styleUrls: ['./data-filter.component.css']
})
export class DataFilterComponent implements OnInit, AfterViewChecked, OnChanges {

  @Input() data: any[];
  @Output() onFiltered: EventEmitter<any> = new EventEmitter();

  searchText = '';
  originalData: any[] = [];
  categoryDropdown: Category[];
  keyTopicDropdown: string[];
  partyDropdown: string[];
  instrumentDropdown: string[];
  yearDropdown = [];
  categoryFilter: Category = {description: 'all', number: -1}; // if categoryFilter is -1, no filter is set
  keyTopicFilter = 'all';
  partyFilter = 'all';
  instrumentFilter = 'all';
  statusFilter = 'all';
  filtered = false;
  yearFilterSet = false;
  subCategoryFilter = 'all';
  subCategoryDropdown: string[];
  admin: boolean;

  // Keep filter/searchbar visible on scrolling
  static scroll() {
    const navHeight = $('.navbar').outerHeight();
    const scrollTop = navHeight - $(window).scrollTop();
    $('.custom-fixed-navbar').css('top', (Math.max(scrollTop, 0)));
  }

  constructor(
    private dataService: DataService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    window.addEventListener('scroll', DataFilterComponent.scroll, true);
    this.authService.currentAdminState.subscribe(admin => this.admin = admin);
  }

  ngAfterViewChecked(): void {
    DataFilterComponent.scroll();
  }

  ngOnChanges(changes: any) {
    // save originalData when data is loaded the first time
    if (changes.data.currentValue && this.originalData.length === 0) {
      this.originalData = changes.data.currentValue;
      this.initDropdowns();
      this.getOriginalDownloadData();
    }
  }

  // filter on Enter key
  keyDownFunction(event) {
    if (event.keyCode === 13) {
      this.filterData();
    }
  }

  filterData() {
    this.data = this.originalData;
    if (this.categoryFilter.description !== 'all') {
      this.data = this.dataService.filterByCategory(this.data, this.categoryFilter.number);
      if (this.subCategoryFilter !== 'all') {
        this.data = this.dataService.filterBySubCategory(this.data, this.subCategoryFilter);
      }
    }
    if (this.keyTopicFilter !== 'all') {
      this.data = this.dataService.filterByKeyTopic(this.data, this.keyTopicFilter);
    }
    if (this.statusFilter !== 'all') {
      this.data = this.dataService.filterByStatus(this.data, this.statusFilter);
    }
    if (this.partyFilter !== 'all') {
      this.data = this.dataService.filterByParty(this.data, this.partyFilter);
    }
    if (this.instrumentFilter !== 'all') {
      this.data = this.dataService.filterByInstrument(this.data, this.instrumentFilter);
    }
    this.data = this.dataService.searchInArrayOfObjects(this.data, this.searchText);
    this.data = this.dataService.filterYears(this.data, this.yearDropdown);
    // check if any filter is set.
    this.checkFilterYearsSet();
    this.filtered = this.categoryFilter.description !== 'all' || this.keyTopicFilter !== 'all' || this.searchText.length > 0
      || this.statusFilter !== 'all' || this.yearFilterSet || this.partyFilter !== 'all' || this.instrumentFilter !== 'all';
    // Has to be done async (not in same digest) to avoid expressionChangedAfterItHasBeenCheckedError
    setTimeout(() => {
      this.onFiltered.emit({data: this.data, categoryFilter: this.categoryFilter.description});
      this.getDownloadData();
    }, 0);
  }

  filterYears(entry: any) {
    entry.checked = !entry.checked;
    this.filterData();
  }

  checkAllYears() {
    this.yearDropdown.forEach(d => d.checked = true);
    this.filterData();
  }

  uncheckAllYears() {
    this.yearDropdown.forEach(d => d.checked = false);
    this.filterData();
  }

  // checks if filter of year is set
  checkFilterYearsSet() {
    this.yearFilterSet = JSON.stringify(this.yearDropdown) !== JSON.stringify(this.getInitYears());
  }

  filterStatus(status: string) {
    this.statusFilter = status;
    this.filterData();
  }

  // first argument is true no filter is set.
  filterByCategory(noFilter: boolean, category?: Category) {
    if (noFilter) {
      this.categoryFilter = {description: 'all', number: -1};
    } else {
      this.categoryFilter = category;
    }
    this.filterData();
    // prepare sub category dropdown
    const allCategories = this.data.map(d => d['Thema 1']);
    this.subCategoryDropdown = this.dataService.unique(allCategories);
    this.subCategoryDropdown.sort();
    this.subCategoryFilter = 'all';
  }

  filterByKeyTopic(keyTopic: string) {
    this.keyTopicFilter = keyTopic;
    this.filterData();
  }

  filterByParty(party: string) {
    this.partyFilter = party;
    this.filterData();
  }

  filterByInstrument(instrument: string) {
    this.instrumentFilter = instrument;
    this.filterData();
  }

  filterBySubCategory(subCategory: string) {
    this.subCategoryFilter = subCategory;
    this.filterData();
  }

  resetFilters() {
    this.searchText = '';
    this.categoryFilter = { description: 'all', number: -1 };
    this.keyTopicFilter = 'all';
    this.yearDropdown = this.getInitYears();
    this.statusFilter = 'all';
    this.partyFilter = 'all';
    this.instrumentFilter = 'all';
    this.filterData();
  }

  resetSearchText() {
    this.searchText = '';
    this.filterData();
  }

  resetCategoryFilter() {
    this.categoryFilter = { description: 'all', number: - 1};
    this.filterData();
  }

  resetKeyTopicFilter() {
    this.keyTopicFilter = 'all';
    this.filterData();
  }

  resetPartyFilter() {
    this.partyFilter = 'all';
    this.filterData();
  }

  resetInstrumentFilter() {
    this.instrumentFilter = 'all';
    this.filterData();
  }

  resetYearFilter() {
    this.yearDropdown = this.getInitYears();
    this.filterData();
  }

  resetStatusFilter() {
    this.statusFilter = 'all';
    this.filterData();
  }

  stopEventPropagation(event) {
    event.stopPropagation();
  }

  private initDropdowns() {
    this.categoryDropdown = this.dataService.uniqueCategories(this.originalData.map(d => {
      return { description: d['Themenbereich 1'], number: d.Themenbereich_Number };
    }));
    this.categoryDropdown.sort((a, b) => a.description.localeCompare(b.description));
    this.keyTopicDropdown = this.dataService
      .unique(this.originalData.map(d => d['Schwerpunktthema (bei Bedarf)']))
      .filter(d => d !== '');
    this.keyTopicDropdown.sort((a, b) => a.localeCompare(b));
    this.partyDropdown = ['BastA!', 'CVP', 'EVP', 'FDP', 'GLP', 'Grüne', 'LDP', 'SP', 'SVP', 'Parteilos', 'Kommission', 'Bevölkerung'];
    this.instrumentDropdown = ['Petition', 'Anzug', 'Motion', 'Initiative'];
    this.yearDropdown = this.getInitYears();
    this.filterData();
  }

  // get the original values for years
  // tick only last 5 years (if year bigger than 2018)
  private getInitYears() {
    const years = this.dataService.unique(this.originalData.map(d => d.Jahr));
    // sort descending
    years.sort((a, b) => {
      return b - a;
    });
    return years.map((d, i) => {
      const checked = (i < 5 && d > 2014);
      return {
        year: d, checked: checked
      };
    });
  }

  private getDownloadData(): void {
    this.dataService.sendJSON(this.data);
  }

  private getOriginalDownloadData(): void {
    this.dataService.sendOriginalJSON(this.originalData);
  }

}
