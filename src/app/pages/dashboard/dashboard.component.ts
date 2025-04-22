import { Component, OnInit, signal } from '@angular/core';
import {NgIf, NgFor, DatePipe} from '@angular/common';
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
import { UserService } from '../../services/user/user.service';
import { FileUploadDialogComponent } from './file-upload-dialog/file-upload-dialog.component';
import {MatTableModule} from '@angular/material/table';
import {MatSortModule, Sort} from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import {RouterLink} from '@angular/router';

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
    RouterLink
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
  displayedColumns = ['name', 'status', 'createdAt', 'creator', 'updatedAt', 'action'];


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
  }

  loadDocuments() {
    this.loading.set(true);
    this.documentService
      .getDocuments({
        page: this.page(),
        size: this.size(),
        status: this.statusFilter() || undefined,
        sort: 'updatedAt,desc',
      })
      .subscribe((res) => {
        this.documents.set(res.results);
        this.total.set(res.count);
        this.loading.set(false);
      });
  }

  onStatusChange(status: DocumentStatus | '') {
    this.statusFilter.set(status || undefined);
    this.page.set(1);
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
    const direction = sort.direction;
    const active = sort.active;

    if (!direction) {
      this.loadDocuments();
      return;
    }

    this.documentService
      .getDocuments({
        page: this.page(),
        size: this.size(),
        status: this.statusFilter() || undefined,
        sort: `${active},${direction}`,
      })
      .subscribe((res) => {
        this.documents.set(res.results);
        this.total.set(res.count);
      });
  }

}
