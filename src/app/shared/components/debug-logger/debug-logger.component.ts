import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoggerService, LogLevel } from '../../services/logger.service';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-debug-logger',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="debug-logger" [class.minimized]="isMinimized">
      <div class="debug-header" (click)="toggleMinimized()">
        <span>🐛 Debug Logger ({{ logs.length }})</span>
        <button class="toggle-btn">{{ isMinimized ? '⬆️' : '⬇️' }}</button>
      </div>
      
      <div class="debug-content" *ngIf="!isMinimized">
        <div class="debug-controls">
          <button 
            *ngFor="let level of logLevels" 
            (click)="filterLevel = filterLevel === level ? null : level"
            [class.active]="filterLevel === level"
            class="filter-btn"
          >
            {{ level }} ({{ getLogCount(level) }})
          </button>
          <button (click)="clearLogs()" class="clear-btn">🧹 Clear</button>
          <button (click)="exportLogs()" class="export-btn">💾 Export</button>
        </div>
        
        <div class="logs-container">
          <div 
            *ngFor="let log of getFilteredLogs(); trackBy: trackByFn" 
            class="log-entry"
            [class]="'log-' + log.level.toLowerCase()"
          >
            <div class="log-header">
              <span class="log-time">{{ log.timestamp | date:'HH:mm:ss.SSS' }}</span>
              <span class="log-level">{{ log.level }}</span>
              <span class="log-component">{{ log.component || 'Unknown' }}</span>
            </div>
            <div class="log-message">{{ log.message }}</div>
            <div class="log-data" *ngIf="log.data" (click)="toggleData(log)">
              <span class="toggle-data">{{ log.showData ? '📦 ▼' : '📦 ▶' }} Data</span>
              <pre *ngIf="log.showData">{{ formatData(log.data) }}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .debug-logger {
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 500px;
      max-height: 400px;
      background: #1a1a1a;
      border: 2px solid #333;
      border-radius: 8px;
      font-family: 'Courier New', monospace;
      font-size: 12px;
      z-index: 9999;
      box-shadow: 0 4px 20px rgba(0,0,0,0.5);
    }
    
    .debug-logger.minimized {
      max-height: 40px;
    }
    
    .debug-header {
      background: #2d2d2d;
      color: #fff;
      padding: 10px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      cursor: pointer;
      font-weight: bold;
    }
    
    .toggle-btn {
      background: none;
      border: none;
      color: #fff;
      cursor: pointer;
      font-size: 14px;
    }
    
    .debug-content {
      max-height: 350px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    
    .debug-controls {
      padding: 10px;
      background: #333;
      display: flex;
      gap: 5px;
      flex-wrap: wrap;
    }
    
    .filter-btn, .clear-btn, .export-btn {
      padding: 4px 8px;
      border: 1px solid #555;
      background: #444;
      color: #fff;
      border-radius: 4px;
      cursor: pointer;
      font-size: 10px;
    }
    
    .filter-btn.active {
      background: #667eea;
    }
    
    .clear-btn {
      background: #dc3545;
    }
    
    .export-btn {
      background: #28a745;
    }
    
    .logs-container {
      flex: 1;
      overflow-y: auto;
      padding: 10px;
      max-height: 250px;
    }
    
    .log-entry {
      margin-bottom: 8px;
      padding: 6px;
      border-left: 3px solid #666;
      background: #2a2a2a;
      border-radius: 4px;
    }
    
    .log-debug { border-left-color: #6c757d; }
    .log-info { border-left-color: #0066cc; }
    .log-warn { border-left-color: #ff8c00; }
    .log-error { border-left-color: #dc3545; }
    
    .log-header {
      display: flex;
      gap: 10px;
      margin-bottom: 4px;
      font-size: 10px;
    }
    
    .log-time {
      color: #999;
      min-width: 70px;
    }
    
    .log-level {
      color: #fff;
      font-weight: bold;
      min-width: 50px;
    }
    
    .log-component {
      color: #4CAF50;
      font-weight: bold;
    }
    
    .log-message {
      color: #e0e0e0;
      margin-bottom: 4px;
    }
    
    .log-data {
      background: #1a1a1a;
      border-radius: 4px;
      padding: 4px;
    }
    
    .toggle-data {
      color: #ffa500;
      cursor: pointer;
      user-select: none;
      font-size: 10px;
    }
    
    .toggle-data:hover {
      color: #ffcc00;
    }
    
    pre {
      margin: 4px 0 0 0;
      color: #c0c0c0;
      font-size: 10px;
      white-space: pre-wrap;
      max-height: 100px;
      overflow-y: auto;
    }
    
    ::-webkit-scrollbar {
      width: 6px;
    }
    
    ::-webkit-scrollbar-track {
      background: #2a2a2a;
    }
    
    ::-webkit-scrollbar-thumb {
      background: #666;
      border-radius: 3px;
    }
    
    ::-webkit-scrollbar-thumb:hover {
      background: #888;
    }
  `]
})
export class DebugLoggerComponent implements OnInit, OnDestroy {
  logs: any[] = [];
  logLevels: LogLevel[] = ['DEBUG', 'INFO', 'WARN', 'ERROR'];
  filterLevel: LogLevel | null = null;
  isMinimized = false;
  private subscription: Subscription = new Subscription();

  constructor(private logger: LoggerService) {}

  ngOnInit() {
    // Actualizar logs cada segundo
    this.subscription.add(
      interval(1000).subscribe(() => {
        this.logs = this.logger.getLogs().map(log => ({
          ...log,
          showData: (log as any).showData || false
        }));
      })
    );

    // Cargar logs iniciales
    this.logs = this.logger.getLogs().map(log => ({
      ...log,
      showData: false
    }));
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  getFilteredLogs() {
    if (this.filterLevel) {
      return this.logs.filter(log => log.level === this.filterLevel);
    }
    return this.logs;
  }

  getLogCount(level: LogLevel): number {
    return this.logs.filter(log => log.level === level).length;
  }

  toggleMinimized() {
    this.isMinimized = !this.isMinimized;
  }

  toggleData(log: any) {
    log.showData = !log.showData;
  }

  clearLogs() {
    this.logger.clearLogs();
    this.logs = [];
  }

  exportLogs() {
    const logsText = this.logger.exportLogs();
    const blob = new Blob([logsText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `debug-logs-${new Date().toISOString().slice(0, 19)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  formatData(data: any): string {
    try {
      return JSON.stringify(data, null, 2);
    } catch {
      return String(data);
    }
  }

  trackByFn(index: number, item: any) {
    return item.timestamp.getTime() + item.message;
  }
} 