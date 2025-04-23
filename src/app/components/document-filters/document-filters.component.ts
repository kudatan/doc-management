import {
  Component,
  computed,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  signal,
  SimpleChanges,
} from '@angular/core';
import { NgIf, NgFor } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { DocumentStatus } from '../../interfaces/dashboard.interface';
import { User } from '../../interfaces/user.interface';
import { DOCUMENT_STATUSES } from '../../constants/dashboard.constants';

@Component({
  selector: 'app-document-filters',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
  ],
  templateUrl: './document-filters.component.html',
  styleUrls: ['./document-filters.component.scss'],
})
export class DocumentFiltersComponent implements OnChanges {
  @Input() isUser = false;
  @Input() isReviewer = false;
  @Input() users: User[] = [];
  @Input() selectedStatus: DocumentStatus | undefined;
  @Input() selectedCreatorId: string | undefined;
  @Input() selectedCreatorEmail: string | undefined;

  @Output() statusChange = new EventEmitter<DocumentStatus | undefined>();
  @Output() creatorChange = new EventEmitter<string | undefined>();
  @Output() creatorEmailChange = new EventEmitter<string | undefined>();
  @Output() resetFiltersEvent = new EventEmitter<void>();
  @Output() nextUserPageEvent = new EventEmitter<void>();
  @Output() prevUserPageEvent = new EventEmitter<void>();

  statusFilter = signal<DocumentStatus | undefined>(undefined);
  creatorFilter = signal<string | undefined>(undefined);
  creatorEmailFilter = signal<string | undefined>(undefined);

  statuses = DOCUMENT_STATUSES;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedStatus']) {
      this.statusFilter.set(this.selectedStatus);
    }
    if (changes['selectedCreatorId']) {
      this.creatorFilter.set(this.selectedCreatorId);
    }
    if (changes['selectedCreatorEmail']) {
      this.creatorEmailFilter.set(this.selectedCreatorEmail);
    }
  }

  readonly filteredStatuses = computed(() => {
    return this.isUser
      ? this.statuses
      : this.statuses.filter((status) => status !== 'DRAFT');
  });

  onStatusChange(status: DocumentStatus | '') {
    this.statusFilter.set(status || undefined);
    this.statusChange.emit(this.statusFilter());
  }

  onCreatorChange(creatorId: string | '') {
    this.creatorFilter.set(creatorId || undefined);
    this.creatorEmailFilter.set(undefined);
    this.creatorChange.emit(this.creatorFilter());
  }

  onCreatorEmailChange(email: string | '') {
    this.creatorEmailFilter.set(email || undefined);
    this.creatorFilter.set(undefined);
    this.creatorEmailChange.emit(this.creatorEmailFilter());
  }

  resetFilters() {
    this.statusFilter.set(undefined);
    this.creatorFilter.set(undefined);
    this.creatorEmailFilter.set(undefined);
    this.resetFiltersEvent.emit();
  }

  nextUserPage() {
    this.nextUserPageEvent.emit();
  }

  prevUserPage() {
    this.prevUserPageEvent.emit();
  }
}
