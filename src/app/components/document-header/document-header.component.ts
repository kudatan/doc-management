import { Component, input, output, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { ReviewStatus } from '../../interfaces/dashboard.interface';
import { DOCUMENT_REVIEW_STATUSES } from '../../constants/document-view.constants';

@Component({
  selector: 'app-document-header',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule,
  ],
  templateUrl: './document-header.component.html',
  styleUrls: ['./document-header.component.scss'],
})
export class DocumentHeaderComponent {
  document = input<any>(null);
  isUser = input(false);
  isReviewer = input(false);
  statusLoading = input(false);
  canDelete = input(false);
  canRevoke = input(false);
  canSendToReview = input(false);

  nameChange = output<string>();
  saveNameEvent = output<void>();
  deleteDocumentEvent = output<void>();
  revokeDocumentEvent = output<void>();
  sendToReviewEvent = output<void>();
  changeStatusEvent = output<ReviewStatus>();
  setUnderReviewEvent = output<void>();

  name = signal('');
  initialName = signal('');
  selectedStatus = signal<ReviewStatus | null>(null);
  reviewStatuses = DOCUMENT_REVIEW_STATUSES;

  constructor() {
    effect(() => {
      if (this.document()) {
        this.name.set(this.document().name);
        this.initialName.set(this.document().name);
      }
    });
  }

  onNameChange(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.name.set(value);
    this.nameChange.emit(value);
  }

  saveName() {
    this.saveNameEvent.emit();
  }

  deleteDocument() {
    this.deleteDocumentEvent.emit();
  }

  revokeDocument() {
    this.revokeDocumentEvent.emit();
  }

  sendToReview() {
    this.sendToReviewEvent.emit();
  }

  onStatusChange(status: ReviewStatus) {
    this.selectedStatus.set(status);
    this.changeStatusEvent.emit(status);
  }

  setUnderReview() {
    this.setUnderReviewEvent.emit();
  }
}
