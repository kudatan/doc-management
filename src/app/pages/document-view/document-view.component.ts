import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import PSPDFKit from 'pspdfkit';
import { DocumentService } from '../../services/dashboard/document.service';

@Component({
  selector: 'app-document-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './document-view.component.html',
  styleUrls: ['./document-view.component.scss'],
})
export class DocumentViewComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private documentService = inject(DocumentService);

  document = signal<any>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.documentService.getById(id).subscribe(doc => {
      this.document.set(doc);
      this.loadViewer(doc.fileUrl);
    });
  }

  private async loadViewer(fileUrl: string) {
    const container = '#pspdfkit-container';
    await PSPDFKit.load({
      container,
      document: fileUrl,
      baseUrl: location.origin + '/',
    });
  }
}
