import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
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
  @Input() document: any;
  @Input() isUser = false;
  @Input() isReviewer = false;
  @Input() statusLoading = false;
  @Input() canDelete = false;
  @Input() canRevoke = false;
  @Input() canSendToReview = false;

  @Output() nameChange = new EventEmitter<string>();
  @Output() saveNameEvent = new EventEmitter<void>();
  @Output() deleteDocumentEvent = new EventEmitter<void>();
  @Output() revokeDocumentEvent = new EventEmitter<void>();
  @Output() sendToReviewEvent = new EventEmitter<void>();
  @Output() changeStatusEvent = new EventEmitter<ReviewStatus>();
  @Output() setUnderReviewEvent = new EventEmitter<void>();

  name = signal('');
  initialName = signal('');
  selectedStatus = signal<ReviewStatus | null>(null);
  reviewStatuses = DOCUMENT_REVIEW_STATUSES;

  ngOnChanges() {
    if (this.document) {
      this.name.set(this.document.name);
      this.initialName.set(this.document.name);
    }
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
