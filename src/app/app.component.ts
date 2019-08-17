import { MediaMatcher } from '@angular/cdk/layout';
import { FocusMonitor } from '@angular/cdk/a11y';
import { ChangeDetectorRef, Component, OnDestroy, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit, OnDestroy {
  title:string = 'conundrum-app';
  mobileQuery: MediaQueryList;
  over = 'over';
  private _mobileQueryListener: () => void;

  constructor(changeDetectorRef: ChangeDetectorRef, media: MediaMatcher, private _focusMonitor: FocusMonitor) {
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
  }

  ngOnDestroy(): void {
    this.mobileQuery.removeListener(this._mobileQueryListener);
  }

  ngAfterViewInit() {
    this._focusMonitor.stopMonitoring(document.getElementById('conundrum-menu-button'));
    this._focusMonitor.stopMonitoring(document.getElementById('drawer-menu-button'));
    this._focusMonitor.stopMonitoring(document.getElementById('conundrum-menu-button-inside'));
    this._focusMonitor.stopMonitoring(document.getElementById('drawer-menu-button-inside'));
  }
}
