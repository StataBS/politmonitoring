import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';


import {AppComponent} from './app.component';
import { NavbarComponent } from './navbar/navbar.component';
import {AppRoutingModule} from "./app-routing.module";
import { MainComponent } from './main/main.component';
import { UploadComponent } from './upload/upload.component';
import {BootstrapTableModule} from "./shared/bootstrap-table/bootstrap-table.module";
import {HttpClientModule} from "@angular/common/http";
import {DataService} from "./shared/data.service";
import { BubbleChartComponent } from './main/bubble-chart/bubble-chart.component';
import { DataFilterComponent } from './main/data-filter/data-filter.component';


@NgModule({
    declarations: [
        AppComponent,
        NavbarComponent,
        MainComponent,
        UploadComponent,
        BubbleChartComponent,
        DataFilterComponent
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        BootstrapTableModule,
        HttpClientModule
    ],
    providers: [DataService],
    bootstrap: [AppComponent]
})
export class AppModule {
}
