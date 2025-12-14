import { Component, inject, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import imageCompression, { Options } from 'browser-image-compression';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import JSZip from 'jszip';
import { MatSliderModule } from '@angular/material/slider';
import { Footer } from "./footer";

@Component({
  selector: 'app-root',
  imports: [
    MatSliderModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatChipsModule,
    Footer
  ],
  templateUrl: './app.html',
  styleUrl: 'app.css',
})
export class App {
  files = signal<File[]>([]);
  compressedFiles = signal<File[]>([]);
  isProcessing = signal(false);
  isDragging = false;
  sanitize = inject(DomSanitizer);
  maxSizeMb = signal<number>(1);
  initialQuality = signal<number>(80);

  formatLabel(value: number): string {
    return `${value}%`;
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
    console.log(newFiles);

    // validate file type. Only images are
    const containsNonImages = newFiles.some(file => !file.type.startsWith('image/'));
    if (containsNonImages) {
      alert("Rejected: Some of the files are not image");
      return;
    }

    // validate file size
    const hasOversizeFiles = newFiles.some(file => file.size > 10 * 1024 * 1024);
    if (hasOversizeFiles) {
      alert("Rejected: Some of the files exceeds 10MB");
      return;
    }

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
    this.compressedFiles.set([]);
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  getImagePreview(file: File): SafeUrl {
    return this.sanitize.bypassSecurityTrustUrl(URL.createObjectURL(file));
  }

  async processFiles() {
    if (this.isProcessing()) return;
    try {
      this.isProcessing.set(true);
      const options: Options = {
        maxSizeMB: this.maxSizeMb(),
        useWebWorker: true,
        initialQuality: this.initialQuality() / 100
      }
      const compressionPromises = this.files().map(async (imageFile) => {
        const compressedFile = await imageCompression(imageFile, options);
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

  downloadFile(file: File) {
    const url = URL.createObjectURL(file);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    a.click();

    setTimeout(() => URL.revokeObjectURL(url), 0)
  }

  async downloadAll() {
    if (this.compressedFiles().length === 0) return;
    try {
      const zip = new JSZip();
      this.compressedFiles().forEach((file, index) => {
        zip.file(file.name, file);
      });
      const zipBlob = await zip.generateAsync({ type: 'blob' });

      // Download the zip
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'compressed-images.zip';
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 0);
    }
    catch (ex) {
      console.log(ex);
    }

  }
}
