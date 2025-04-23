import { Component, signal, inject, DestroyRef } from '@angular/core';
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
import { DocumentService } from '../../services/dashboard/document.service';
import { ToastService } from '../../services/toast/toast.service';
import { DocumentDto } from '../../interfaces/dashboard.interface';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {MatIconModule} from '@angular/material/icon';

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
    MatIconModule,
  ],
  templateUrl: './file-upload-dialog.component.html',
  styleUrls: ['./file-upload-dialog.component.scss'],
})
export class FileUploadDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<FileUploadDialogComponent>);
  private readonly fb = inject(FormBuilder);
  private readonly documentService = inject(DocumentService);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  form: FormGroup;
  loading = signal(false);
  selectedFile: File | null = null;

  constructor() {
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
    formData.append('status', 'DRAFT');
    this.documentService
      .uploadDocument(formData)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res: DocumentDto) => {
          const selectedStatus = this.form.value.status;

          if (selectedStatus === 'READY_FOR_REVIEW') {
            this.documentService
              .sendToReview(res.id)
              .pipe(takeUntilDestroyed(this.destroyRef))
              .subscribe({
                next: () => {
                  this.toast.show(
                    'Document sent to review successfully',
                    'success'
                  );
                  this.loading.set(false);
                  this.dialogRef.close(true);
                },
                error: () => {
                  this.toast.show('Failed to send document to review', 'error');
                  this.loading.set(false);
                },
              });
          } else {
            this.toast.show('File uploaded successfully', 'success');
            this.loading.set(false);
            this.dialogRef.close(true);
          }
        },
        error: () => {
          this.toast.show('File upload failed', 'error');
          this.loading.set(false);
        },
      });
  }
}
