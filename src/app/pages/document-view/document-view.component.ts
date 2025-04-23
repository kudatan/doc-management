import { Component, OnInit, inject, signal, DestroyRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { DocumentService } from '../../services/dashboard/document.service';
import { ToastService } from '../../services/toast/toast.service';
import { UserService } from '../../services/user/user.service';
import { ReviewStatus } from '../../interfaces/dashboard.interface';
import { DocumentHeaderComponent } from '../../components/document-header/document-header.component';
import { BackButtonComponent } from '../../components/back-button/back-button.component';
import { PdfViewerComponent } from '../../components/pdf-viewer/pdf-viewer.component';
import { LoadingSpinnerComponent } from '../../components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-document-view',
  standalone: true,
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    DocumentHeaderComponent,
    BackButtonComponent,
    PdfViewerComponent,
    LoadingSpinnerComponent,
  ],
  templateUrl: './document-view.component.html',
  styleUrls: ['./document-view.component.scss'],
})
export class DocumentViewComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private documentService = inject(DocumentService);
  private toast = inject(ToastService);
  private userService = inject(UserService);
  private readonly destroyRef = inject(DestroyRef);

  document = signal<any>(null);
  name = signal('');
  initialName = signal('');
  loading = signal(true);
  selectedStatus = signal<ReviewStatus | null>(null);
  statusLoading = signal(false);

  get isUser(): boolean {
    return this.userService.isUser();
  }

  get isReviewer(): boolean {
    return this.userService.isReviewer();
  }

  get canDelete(): boolean {
    const doc = this.document();
    return !!doc && this.isUser && ['DRAFT', 'REVOKE'].includes(doc.status);
  }

  get canRevoke(): boolean {
    const doc = this.document();
    return !!doc && this.isUser && doc.status === 'READY_FOR_REVIEW';
  }

  get canSendToReview(): boolean {
    const doc = this.document();
    return !!doc && this.isUser && doc.status === 'DRAFT';
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    this.fetchDocument(id);
  }

  private fetchDocument(id: string): void {
    this.loading.set(true);

    this.documentService
      .getById(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (doc) => {
          this.document.set(doc);
          this.name.set(doc.name);
          this.initialName.set(doc.name);
        },
        error: () => this.showError('Failed to load document'),
        complete: () => this.loading.set(false),
      });
  }

  onNameChange(newName: string): void {
    this.name.set(newName);
  }

  saveName(): void {
    const doc = this.document();
    const newName = this.name().trim();

    if (!doc?.id || !newName) return;

    this.documentService
      .updateName(doc.id, { name: newName })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.document.update((d) => ({ ...d, name: newName }));
          this.initialName.set(newName);
          this.toast.show('Name updated successfully', 'success');
        },
        error: () => this.showError('Failed to update name'),
      });
  }

  deleteDocument(): void {
    const doc = this.document();
    if (!doc?.id) return;

    this.documentService
      .deleteDocument(doc.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.toast.show('Document deleted', 'success');
          this.goBack();
        },
        error: () => this.showError('Failed to delete document'),
      });
  }

  revokeDocument(): void {
    const doc = this.document();
    if (!doc?.id) return;

    this.documentService
      .revokeReview(doc.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.toast.show('Document revoked from review', 'success');
          this.refreshDocument();
        },
        error: () => this.showError('Failed to revoke document'),
      });
  }

  sendToReview(): void {
    const doc = this.document();
    if (!doc?.id) return;

    this.documentService
      .sendToReview(doc.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.toast.show('Document sent to review', 'success');
          this.refreshDocument();
        },
        error: () => this.showError('Failed to send document to review'),
      });
  }

  changeStatus(status: ReviewStatus): void {
    const doc = this.document();
    if (!doc?.id || !this.userService.isReviewer()) return;

    this.statusLoading.set(true);
    this.documentService
      .changeStatus(doc.id, status)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.toast.show(`Status changed to ${status}`, 'success');
          this.refreshDocument();
        },
        error: (err) => {
          const msg = err.error?.message || 'Failed to change status';
          this.toast.show(msg, 'error');
        },
        complete: () => this.statusLoading.set(false),
      });
  }

  setUnderReview(): void {
    const doc = this.document();
    if (!doc?.id || !this.userService.isReviewer()) return;

    this.statusLoading.set(true);
    this.documentService
      .changeStatus(doc.id, 'UNDER_REVIEW')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.toast.show('Status changed to UNDER_REVIEW', 'success');
          this.refreshDocument();
        },
        error: (err) => {
          const msg = err.error?.message || 'Failed to change status';
          this.toast.show(msg, 'error');
        },
        complete: () => this.statusLoading.set(false),
      });
  }

  refreshDocument(): void {
    const id = this.document()?.id;
    if (!id) return;

    this.documentService
      .getById(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (doc) => this.document.set(doc),
        error: () => this.showError('Failed to refresh document'),
      });
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  private showError(message: string): void {
    this.toast.show(message, 'error');
  }
}
