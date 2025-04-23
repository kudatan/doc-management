import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import PSPDFKit from 'pspdfkit';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';

import { DocumentService } from '../../services/dashboard/document.service';
import { ToastService } from '../../services/toast/toast.service';
import { UserService } from '../../services/user/user.service';
import {ReviewStatus} from '../../interfaces/dashboard.interface';

@Component({
  selector: 'app-document-view',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatIconModule,
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

  document = signal<any>(null);
  name = signal('');
  initialName = signal('');
  loading = signal(true);
  selectedStatus = signal<ReviewStatus  | null>(null);
  statusLoading = signal(false);

  user = this.userService.user$;

  get isUser(): boolean {
    return this.userService.isUser();
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    this.fetchDocument(id);
  }

  private fetchDocument(id: string): void {
    this.loading.set(true);

    this.documentService.getById(id).subscribe({
      next: (doc) => {
        this.document.set(doc);
        this.name.set(doc.name);
        this.initialName.set(doc.name);
        this.initViewer(doc.fileUrl);
      },
      error: () => this.showError('Failed to load document'),
      complete: () => this.loading.set(false),
    });
  }

  private async initViewer(fileUrl: string): Promise<void> {
    await PSPDFKit.load({
      container: '#pspdfkit-container',
      document: fileUrl,
      baseUrl: location.origin + '/',
    });
  }

  saveName(): void {
    const doc = this.document();
    const newName = this.name().trim();

    if (!doc?.id || !newName) return;

    this.documentService.updateName(doc.id, { name: newName }).subscribe({
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
    if (!this.canDelete(doc)) return;

    this.documentService.deleteDocument(doc.id).subscribe({
      next: () => {
        this.toast.show('Document deleted', 'success');
        history.back();
      },
      error: () => this.showError('Failed to delete document'),
    });
  }

  revokeDocument(): void {
    const doc = this.document();
    if (!this.canRevoke(doc)) return;

    this.documentService.revokeReview(doc.id).subscribe({
      next: () => {
        this.toast.show('Document revoked from review', 'success');
        this.refreshDocument();
      },
      error: () => this.showError('Failed to revoke document'),
    });
  }

  sendToReview(): void {
    const doc = this.document();
    if (!this.canSendToReview(doc)) return;

    this.documentService.sendToReview(doc.id).subscribe({
      next: () => {
        this.toast.show('Document sent to review', 'success');
        this.refreshDocument();
      },
      error: () => this.showError('Failed to send document to review'),
    });
  }

  changeStatus(): void {
    const doc = this.document();
    const status = this.selectedStatus();

    if (!doc?.id || !this.userService.isReviewer() || !status) return;

    this.statusLoading.set(true);
    this.documentService.changeStatus(doc.id, status).subscribe({
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

  refreshDocument(): void {
    const id = this.document()?.id;
    if (!id) return;

    this.documentService.getById(id).subscribe({
      next: (doc) => this.document.set(doc),
      error: () => this.showError('Failed to refresh document'),
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  private canDelete(doc: any): boolean {
    return !!doc && this.isUser && ['DRAFT', 'REVOKE'].includes(doc.status);
  }

  private canRevoke(doc: any): boolean {
    return !!doc && this.isUser && doc.status === 'READY_FOR_REVIEW';
  }

  private canSendToReview(doc: any): boolean {
    return !!doc && this.isUser && doc.status === 'DRAFT';
  }

  private showError(message: string): void {
    this.toast.show(message, 'error');
  }
}
