import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { DocumentService } from '../../../services/dashboard/document.service';
import { ToastService } from '../../../services/toast/toast.service';

@Component({
  selector: 'app-file-upload-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    ReactiveFormsModule,
  ],
  templateUrl: './file-upload-dialog.component.html',
  styleUrls: ['./file-upload-dialog.component.scss'],
})
export class FileUploadDialogComponent {
  form: FormGroup;
  loading = signal(false);
  selectedFile: File | null = null;

  constructor(
    private dialogRef: MatDialogRef<FileUploadDialogComponent>,
    private fb: FormBuilder,
    private documentService: DocumentService,
    private toast: ToastService
  ) {
    this.form = this.fb.group({
      name: ['', [Validators.required]],
      status: ['DRAFT', [Validators.required]],
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      this.selectedFile = input.files[0];
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.form.invalid || !this.selectedFile) {
      return;
    }

    this.loading.set(true);

    const formData = new FormData();
    formData.append('file', this.selectedFile);
    formData.append('name', this.form.value.name);
    formData.append('status', this.form.value.status);

    this.documentService.uploadDocument(formData).subscribe({
      next: () => {
        this.toast.show('File uploaded successfully', 'success');
        this.loading.set(false);
        this.dialogRef.close(true);
      },
      error: () => {
        this.toast.show('File upload failed', 'error');
        this.loading.set(false);
      },
    });
  }
}
