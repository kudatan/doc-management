import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgIf, DatePipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { DocumentDto } from '../../interfaces/dashboard.interface';
import { DOCUMENT_TABLE_COLUMNS } from '../../constants/dashboard.constants';

@Component({
  selector: 'app-document-table',
  standalone: true,
  imports: [
    NgIf,
    MatTableModule,
    MatSortModule,
    MatButtonModule,
    DatePipe,
    RouterLink,
  ],
  templateUrl: './document-table.component.html',
  styleUrls: ['./document-table.component.scss'],
})
export class DocumentTableComponent {
  @Input() documents: DocumentDto[] = [];
  @Output() sortChange = new EventEmitter<Sort>();

  displayedColumns = DOCUMENT_TABLE_COLUMNS;

  onSortChange(sort: Sort) {
    this.sortChange.emit(sort);
  }
}
