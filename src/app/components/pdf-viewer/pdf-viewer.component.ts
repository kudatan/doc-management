import { Component, inject, input, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import NutrientPDFViewer from '@nutrient-sdk/viewer';
import { ToastService } from '../../services/toast/toast.service';

@Component({
  selector: 'app-pdf-viewer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pdf-viewer.component.html',
  styleUrls: ['./pdf-viewer.component.scss'],
})
export class PdfViewerComponent implements OnInit, OnDestroy {
  fileUrl = input('');

  private nutrientPDFInstance: any = null;
  private readonly toast = inject(ToastService);

  ngOnInit() {
    if (this.fileUrl()) {
      this.initViewer();
    }
  }

  async initViewer() {
    if (this.nutrientPDFInstance) {
      await this.nutrientPDFInstance.unload();
      this.nutrientPDFInstance = null;
    }

    try {
      this.nutrientPDFInstance = await NutrientPDFViewer.load({
        container: '#nutrient-container',
        document: this.fileUrl(),
        baseUrl: `${location.protocol}//${location.host}/assets/`,
        theme: NutrientPDFViewer.Theme.DARK,
      });
    } catch (error) {
      this.toast.show('Failed to send document to review', 'error');
    }
  }

  ngOnDestroy() {
    if (this.nutrientPDFInstance) {
      NutrientPDFViewer.unload(this.nutrientPDFInstance);
    }
  }
}
