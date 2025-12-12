import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
@Component({
  selector: 'app-root',
  imports: [
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatChipsModule
  ],
  template: `
  <mat-card class="upload-card">
      <mat-card-header>
        <mat-card-title>File Upload</mat-card-title>
      </mat-card-header>
      
      <mat-card-content>
        <div 
          class="drop-zone"
          [class.dragover]="isDragging"
          (dragover)="onDragOver($event)"
          (dragleave)="onDragLeave($event)"
          (drop)="onDrop($event)"
          (click)="fileInput.click()">
          
          <mat-icon class="upload-icon">cloud_upload</mat-icon>
          <p class="drop-text">
            Drag & drop files here or <span class="browse-link">browse</span>
          </p>
          <p class="file-info">Supports multiple files</p>
          
          <input 
            #fileInput
            type="file" 
            multiple 
            accept="image/*"
            (change)="onFileSelected($event)"
            style="display: none">
        </div>
        @if(files.length > 0){
          <div  class="file-list">
            <h3>Selected Files ({{files.length}})</h3>
            <mat-list>
              @for(file of files;track file){
              <mat-list-item >
                <mat-icon matListItemIcon>insert_drive_file</mat-icon>
                <div matListItemTitle>{{file.name}}</div>
                <div matListItemLine>{{formatFileSize(file.size)}}</div>
                <button 
                  mat-icon-button 
                  matListItemMeta
                  (click)="removeFile($index)"
                  color="warn">
                  <mat-icon>close</mat-icon>
                </button>
              </mat-list-item>
              }
            </mat-list>
          </div>
      }
        @if(files.length > 0){
          <div class="actions">
            <button mat-raised-button color="primary" (click)="uploadFiles()">
              <mat-icon>upload</mat-icon>
              Upload {{files.length}} file(s)
            </button>
            <button mat-stroked-button (click)="clearFiles()">
              Clear All
            </button>
          </div>
      }
      </mat-card-content>
    </mat-card>
  `,
  styleUrl: 'app.css',
})
export class App {
  files: File[] = [];
  isDragging = false;

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    const droppedFiles = event.dataTransfer?.files;
    if (droppedFiles) {
      this.addFiles(Array.from(droppedFiles));
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.addFiles(Array.from(input.files));
      input.value = ''; // Reset input
    }
  }

  addFiles(newFiles: File[]): void {
    this.files = [...this.files, ...newFiles];
  }

  removeFile(index: number): void {
    this.files.splice(index, 1);
  }

  clearFiles(): void {
    this.files = [];
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  uploadFiles(): void {
    // Implement your upload logic here
    console.log('Uploading files:', this.files);

    // Example: Using FormData for HTTP upload
    const formData = new FormData();
    this.files.forEach((file, index) => {
      formData.append(`file${index}`, file);
    });

    alert(`Ready to upload ${this.files.length} file(s)`);
  }
}
