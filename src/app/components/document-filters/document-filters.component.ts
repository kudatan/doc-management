import { Component, computed, effect, input, output, signal } from '@angular/core';
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
export class DocumentFiltersComponent {
  isUser = input(false);
  isReviewer = input(false);
  users = input<User[]>([]);
  selectedStatus = input<DocumentStatus | undefined>(undefined);
  selectedCreatorId = input<string | undefined>(undefined);
  selectedCreatorEmail = input<string | undefined>(undefined);

  statusChange = output<DocumentStatus | undefined>();
  creatorChange = output<string | undefined>();
  creatorEmailChange = output<string | undefined>();
  resetFiltersEvent = output<void>();
  nextUserPageEvent = output<void>();
  prevUserPageEvent = output<void>();

  statusFilter = signal<DocumentStatus | undefined>(undefined);
  creatorFilter = signal<string | undefined>(undefined);
  creatorEmailFilter = signal<string | undefined>(undefined);

  statuses = DOCUMENT_STATUSES;

  constructor() {
    effect(() => {
      this.statusFilter.set(this.selectedStatus());
      this.creatorFilter.set(this.selectedCreatorId());
      this.creatorEmailFilter.set(this.selectedCreatorEmail());
    });
  }

  readonly filteredStatuses = computed(() => {
    return this.isUser() ? this.statuses : this.statuses.filter((status) => status !== 'DRAFT');
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
