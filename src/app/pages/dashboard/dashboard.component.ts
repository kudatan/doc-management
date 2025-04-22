import { Component, OnInit, signal } from '@angular/core';
import { NgIf, NgFor } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import {DocumentDto, DocumentStatus} from '../../interfaces/dashboard.interface';
import {DocumentService} from '../../services/dashboard/document.service';


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    MatFormFieldModule,
    MatSelectModule,
    MatPaginatorModule,
    MatCardModule,
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

  statuses: DocumentStatus[] = [
    'DRAFT',
    'REVOKE',
    'READY_FOR_REVIEW',
    'UNDER_REVIEW',
    'APPROVED',
    'DECLINED',
  ];

  constructor(private documentService: DocumentService) {}

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
}
