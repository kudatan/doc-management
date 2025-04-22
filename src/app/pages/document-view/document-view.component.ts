import { Component, OnInit, inject, signal } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import { CommonModule } from '@angular/common';
import {FormBuilder, FormsModule} from '@angular/forms';
import PSPDFKit from 'pspdfkit';
import { DocumentService } from '../../services/dashboard/document.service';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {HttpClient} from '@angular/common/http';
import {ToastService} from '../../services/toast/toast.service';
import {AuthService} from '../../services/auth/auth.service';
import {UserService} from '../../services/user/user.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {MatSelectModule} from '@angular/material/select';

@Component({
  selector: 'app-document-view',
  standalone: true,
  imports: [CommonModule, FormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatProgressSpinnerModule, MatSelectModule],
  templateUrl: './document-view.component.html',
  styleUrls: ['./document-view.component.scss'],
})
export class DocumentViewComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private documentService = inject(DocumentService);

  document = signal<any>(null);
  name = signal('');
  initialName = signal('');
  loading = signal(true);
  selectedStatus = signal<'UNDER_REVIEW' | 'APPROVED' | 'DECLINED' | null>(null);
  statusLoading = signal(false);


  private userService = inject(UserService);
  user = this.userService.user$;

  constructor(
    private toast: ToastService,
  ) {}

  get isUser() {
    return this.userService.isUser();
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.documentService.getById(id).subscribe({
      next: (doc) => {
        this.document.set(doc);
        this.name.set(doc.name);
        this.initialName.set(doc.name);
        this.loadViewer(doc.fileUrl);
        this.loading.set(false);
      },
      error: () => {
        this.toast.show('Failed to load document', 'error');
        this.loading.set(false);
      },
    });
  }

  saveName(): void {
    const id = this.document()?.id;
    const newName = this.name().trim();
    if (!id || !newName) return;

    this.documentService.updateName(id, { name: newName }).subscribe({
      next: () => {
        this.document.update(doc => ({ ...doc, name: newName }));
        this.initialName.set(newName);
        this.toast.show('Name updated successfully', 'success');
      },
      error: () => {
        this.toast.show('Failed to update name', 'error');
      },
    });
  }

  private async loadViewer(fileUrl: string) {
    await PSPDFKit.load({
      container: '#pspdfkit-container',
      document: fileUrl,
      baseUrl: location.origin + '/',
    });
  }

  deleteDocument(): void {
    const doc = this.document();
    if (!doc || !this.isUser || !(doc.status === 'DRAFT' || doc.status === 'REVOKE')) return;

    this.documentService.deleteDocument(doc.id).subscribe({
      next: () => {
        this.toast.show('Document deleted', 'success');
        history.back();
      },
      error: () => {
        this.toast.show('Failed to delete document', 'error');
      },
    });
  }

  revokeDocument(): void {
    const doc = this.document();
    if (!doc || !this.isUser || doc.status !== 'READY_FOR_REVIEW') return;

    this.documentService.revokeReview(doc.id).subscribe({
      next: () => {
        this.toast.show('Document revoked from review', 'success');
        this.refreshDocument();
      },
      error: () => {
        this.toast.show('Failed to revoke document', 'error');
      }
    });
  }

  refreshDocument(): void {
    const id = this.document()?.id;
    if (!id) return;

    this.documentService.getById(id).subscribe({
      next: (doc) => this.document.set(doc),
      error: () => this.toast.show('Failed to refresh document', 'error'),
    });
  }

  changeStatus(): void {
    const doc = this.document();
    const status = this.selectedStatus();
    if (!doc || !this.userService.isReviewer() || !status) return;

    this.statusLoading.set(true);
    this.documentService.changeStatus(doc.id, status).subscribe({
      next: () => {
        this.toast.show(`Status changed to ${status}`, 'success');
        this.refreshDocument();
        this.statusLoading.set(false);
      },
      error: () => {
        this.toast.show('Failed to change status', 'error');
        this.statusLoading.set(false);
      },
    });
  }


}
