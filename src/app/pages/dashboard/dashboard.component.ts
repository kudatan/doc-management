import { Component, OnInit, signal, inject, DestroyRef } from '@angular/core';
import { NgIf } from '@angular/common';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { DocumentDto, DocumentStatus } from '../../interfaces/dashboard.interface';
import { DocumentService } from '../../services/dashboard/document.service';
import { FileUploadDialogComponent } from '../../components/file-upload-dialog/file-upload-dialog.component';
import { Sort } from '@angular/material/sort';
import { UserService } from '../../services/user/user.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DocumentFiltersComponent } from '../../components/document-filters/document-filters.component';
import { DocumentTableComponent } from '../../components/document-table/document-table.component';
import { AddFileButtonComponent } from '../../components/add-file-button/add-file-button.component';
import { LoadingSpinnerComponent } from '../../components/loading-spinner/loading-spinner.component';
import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  DEFAULT_PAGE_SIZE_OPTIONS,
  DEFAULT_USERS_PAGE_SIZE,
} from '../../constants/dashboard.constants';
import { User } from '../../interfaces/user.interface';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    NgIf,
    MatPaginatorModule,
    DocumentFiltersComponent,
    DocumentTableComponent,
    AddFileButtonComponent,
    LoadingSpinnerComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  private readonly documentService = inject(DocumentService);
  private readonly userService = inject(UserService);
  private readonly dialog = inject(MatDialog);
  private readonly destroyRef = inject(DestroyRef);

  documents = signal<DocumentDto[]>([]);
  total = signal(0);
  loading = signal(false);

  page = signal(DEFAULT_PAGE);
  size = signal(DEFAULT_PAGE_SIZE);
  statusFilter = signal<DocumentStatus | undefined>(undefined);
  users = signal<User[]>([]);
  creatorFilter = signal<string | undefined>(undefined);
  userPage = signal(DEFAULT_PAGE);
  userSize = signal(DEFAULT_USERS_PAGE_SIZE);
  creatorEmailFilter = signal<string | undefined>(undefined);
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS;

  ngOnInit() {
    this.loadDocuments();

    if (!this.isUser) {
      this.loadUsers();
    }
  }

  loadUsers() {
    this.userService
      .getAllUsers(this.userPage(), this.userSize())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (users) => this.users.set(users),
      });
  }

  nextUserPage() {
    this.userPage.update((page) => page + 1);
    this.loadUsers();
  }

  prevUserPage() {
    this.userPage.update((page) => Math.max(1, page - 1));
    this.loadUsers();
  }

  loadDocuments() {
    this.loading.set(true);

    const pageSize = 50;
    let currentPage = 1;
    let allDocs: DocumentDto[] = [];

    const fetchNextPage = () => {
      this.documentService
        .getDocuments({
          page: currentPage,
          size: pageSize,
          status: this.statusFilter() || undefined,
          creatorId: this.creatorFilter() || undefined,
          creatorEmail: this.creatorEmailFilter() || undefined,
          sort: 'updatedAt,desc',
        })
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (res) => {
            const pageDocs = res.results;
            allDocs = [...allDocs, ...pageDocs];

            if (pageDocs.length === pageSize) {
              currentPage++;
              fetchNextPage();
            } else {
              this.processDocuments(allDocs);
            }
          },
          error: (err) => {
            this.loading.set(false);
          },
        });
    };

    fetchNextPage();
  }

  private processDocuments(allDocs: DocumentDto[]) {
    if (!this.isUser) {
      allDocs = allDocs.filter((doc) => doc.status !== 'DRAFT');
    }

    this.total.set(allDocs.length);

    const start = (this.page() - 1) * this.size();
    const end = start + this.size();
    const paginated = allDocs.slice(start, end);

    this.documents.set(paginated);
    this.loading.set(false);
  }

  onStatusChange(status: DocumentStatus | undefined) {
    this.statusFilter.set(status);
    this.resetToFirstPage();
    this.loadDocuments();
  }

  onPageChange(event: PageEvent) {
    this.page.set(event.pageIndex + 1);
    this.size.set(event.pageSize);
    this.loadDocuments();
  }

  onAddFile() {
    const dialogRef = this.dialog.open(FileUploadDialogComponent, {
      width: '500px',
    });

    dialogRef
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => {
        if (result) {
          this.loadDocuments();
        }
      });
  }

  onCreatorChange(creatorId: string | undefined) {
    this.creatorFilter.set(creatorId);
    this.creatorEmailFilter.set(undefined);
    this.resetToFirstPage();
    this.loadDocuments();
  }

  onCreatorEmailChange(email: string | undefined) {
    this.creatorEmailFilter.set(email);
    this.creatorFilter.set(undefined);
    this.resetToFirstPage();
    this.loadDocuments();
  }

  onSortChange(sort: Sort) {
    if (!sort.direction) {
      this.loadDocuments();
      return;
    }

    this.documentService
      .getDocuments({
        page: this.page(),
        size: this.size(),
        status: this.statusFilter() || undefined,
        creatorId: this.creatorFilter() || undefined,
        creatorEmail: this.creatorEmailFilter() || undefined,
        sort: `${sort.active},${sort.direction}`,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.documents.set(res.results);
          this.total.set(res.count);
        },
      });
  }

  resetFilters() {
    this.statusFilter.set(undefined);
    this.creatorFilter.set(undefined);
    this.creatorEmailFilter.set(undefined);
    this.resetToFirstPage();
    this.loadDocuments();
  }

  get isUser() {
    return this.userService.isUser();
  }

  get isReviewer(): boolean {
    return this.userService.isReviewer();
  }

  private resetToFirstPage() {
    this.page.set(1);
  }
}
