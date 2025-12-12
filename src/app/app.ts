import { Component, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import imageCompression, { Options } from 'browser-image-compression';

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
        @if(files().length > 0){
          <div  class="file-list">
            <h3>Selected Files ({{files().length}})</h3>
            <mat-list>
              @for(file of files();track file){
              <mat-list-item >
                <mat-icon matListItemIcon>insert_drive_file</mat-icon>
                 <img  href="getImagePreview(file)"/>
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
        @if(files().length > 0){
          <div class="actions">
            <button mat-raised-button color="primary" (click)="processFiles()">
              <mat-icon>upload</mat-icon>
              Process {{files().length}} file(s)
            </button>
            <button mat-stroked-button (click)="clearFiles()">
              Clear All
            </button>
          </div>
      }

      @if(isProcessing()){
        <span>Processing {{files().length}} files...</span>
      }
     <!-- Why compressed files are not being shown -->
      @if(compressedFiles().length > 0){
          <div  class="file-list">
            <h3>Compressed Files ({{compressedFiles().length}})</h3>
            <mat-list>
              @for(file of compressedFiles();track file){
              <mat-list-item >
                <mat-icon matListItemIcon>insert_drive_file</mat-icon>
                 <!-- <img class="file-thumbnail" [href]="file."/> -->
                <div matListItemTitle>{{file.name}}</div>
                <div matListItemLine>{{formatFileSize(file.size)}}</div>
                <button 
                  mat-icon-button 
                  matListItemMeta
                  (click)="removeCompressedFile($index)"
                  color="warn">
                  <mat-icon>close</mat-icon>
                </button>
              </mat-list-item>
              }
            </mat-list>
          </div>
      }
      </mat-card-content>
    </mat-card>
  `,
  styleUrl: 'app.css',
})
export class App {
  files = signal<File[]>([]);
  compressedFiles = signal<File[]>([]);
  isProcessing = signal(false);
  isDragging = false;

  options: Options = {
    maxSizeMB: 1,
    useWebWorker: true,
  }

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
    this.files.update(current => [...current, ...newFiles]);
  }

  removeFile(index: number): void {
    this.files.update(current => {
      const updated = [...current];
      updated.splice(index, 1);
      return updated;
    });
  }

  removeCompressedFile(index: number): void {
    this.compressedFiles.update(current => {
      const updated = [...current];
      updated.splice(index, 1);
      return updated;
    });
  }

  clearFiles(): void {
    this.files.set([]);
    this.clearCompressedFiles();
  }

  clearCompressedFiles(): void {
    this.files.set([]);
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  getImagePreview(file: File) {
    return URL.createObjectURL(file);
  }

  async processFiles() {
    if (this.isProcessing()) return;
    try {
      this.isProcessing.set(true);
      const compressionPromises = this.files().map(async (imageFile) => {
        const compressedFile = await imageCompression(imageFile, this.options);
        return compressedFile;
      });
      const compressed: File[] = await Promise.all(compressionPromises);
      this.compressedFiles.set(compressed);
    } catch (error) {
      console.log(error);
    }
    finally {
      this.isProcessing.set(false);
    }
  }
}
