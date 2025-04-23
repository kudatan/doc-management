import { Component, computed, OnInit, signal } from '@angular/core';
import { NgIf, NgFor, DatePipe } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import {
  DocumentDto,
  DocumentStatus,
} from '../../interfaces/dashboard.interface';
import { DocumentService } from '../../services/dashboard/document.service';
import { FileUploadDialogComponent } from '../../components/file-upload-dialog/file-upload-dialog.component';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { RouterLink } from '@angular/router';
import { MatDivider, MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {User} from '../../interfaces/user.interface';
import {UserService} from '../../services/user/user.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    MatFormFieldModule,
    MatSelectModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatTableModule,
    MatSortModule,
    DatePipe,
    MatInputModule,
    RouterLink,
    MatDividerModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  documents = signal<DocumentDto[]>([]);
  total = signal(0);
  loading = signal(false);

  page = signal(1);
  size = signal(5);
  statusFilter = signal<DocumentStatus | undefined>(undefined);
  users = signal<User[]>([]);
  creatorFilter = signal<string | undefined>(undefined);
  userPage = signal(1);
  userSize = signal(5);
  creatorEmailFilter = signal<string | undefined>(undefined);
  displayedColumns = [
    'name',
    'status',
    'createdAt',
    'creator',
    'updatedAt',
    'action',
  ];

  statuses: DocumentStatus[] = [
    'DRAFT',
    'REVOKE',
    'READY_FOR_REVIEW',
    'UNDER_REVIEW',
    'APPROVED',
    'DECLINED',
  ];

  constructor(
    private documentService: DocumentService,
    private userService: UserService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.loadDocuments();

    if (!this.isUser) {
      this.loadUsers();
    }
  }

  loadUsers() {
    this.userService.getAllUsers(this.userPage(), this.userSize()).subscribe({
      next: (users) => this.users.set(users)
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

  readonly filteredStatuses = computed(() => {
    return this.isUser
      ? this.statuses
      : this.statuses.filter((status) => status !== 'DRAFT');
  });

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
            console.error('Failed to load documents:', err);
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

  onStatusChange(status: DocumentStatus | '') {
    this.statusFilter.set(status || undefined);
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

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadDocuments();
      }
    });
  }

  get isUser() {
    return this.userService.isUser();
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
      .subscribe({
        next: (res) => {
          this.documents.set(res.results);
          this.total.set(res.count);
        },
        error: (err) => console.error('Failed to sort documents:', err),
      });
  }

  onCreatorChange(creatorId: string | '') {
    this.creatorFilter.set(creatorId || undefined);
    this.creatorEmailFilter.set(undefined);
    this.resetToFirstPage();
    this.loadDocuments();
  }

  onCreatorEmailChange(email: string | '') {
    this.creatorEmailFilter.set(email || undefined);
    this.creatorFilter.set(undefined);
    this.resetToFirstPage();
    this.loadDocuments();
  }

  resetFilters() {
    this.statusFilter.set(undefined);
    this.creatorFilter.set(undefined);
    this.creatorEmailFilter.set(undefined);
    this.resetToFirstPage();
    this.loadDocuments();
  }

  private resetToFirstPage() {
    this.page.set(1);
  }
}
