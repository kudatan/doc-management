import { Component, OnInit, inject, signal } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import { CommonModule } from '@angular/common';
import {FormBuilder, FormsModule} from '@angular/forms';
import PSPDFKit from 'pspdfkit';
import { DocumentService } from '../../services/dashboard/document.service';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {HttpClient} from '@angular/common/http';
import {ToastService} from '../../services/toast/toast.service';
import {AuthService} from '../../services/auth/auth.service';
import {UserService} from '../../services/user/user.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-document-view',
  standalone: true,
  imports: [CommonModule, FormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatProgressSpinnerModule],
  templateUrl: './document-view.component.html',
  styleUrls: ['./document-view.component.scss'],
})
export class DocumentViewComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private documentService = inject(DocumentService);

  document = signal<any>(null);
  name = signal('');
  initialName = signal('');
  loading = signal(true);

  private userService = inject(UserService);
  user = this.userService.user$;

  constructor(
    private toast: ToastService,
  ) {}

  get isUser() {
    return this.userService.isUser();
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.documentService.getById(id).subscribe({
      next: (doc) => {
        this.document.set(doc);
        this.name.set(doc.name);
        this.initialName.set(doc.name);
        this.loadViewer(doc.fileUrl);
        this.loading.set(false);
      },
      error: () => {
        this.toast.show('Failed to load document', 'error');
        this.loading.set(false);
      },
    });
  }

  saveName(): void {
    const id = this.document()?.id;
    const newName = this.name().trim();
    if (!id || !newName) return;

    this.documentService.updateName(id, { name: newName }).subscribe({
      next: () => {
        this.document.update(doc => ({ ...doc, name: newName }));
        this.initialName.set(newName);
        this.toast.show('Name updated successfully', 'success');
      },
      error: () => {
        this.toast.show('Failed to update name', 'error');
      },
    });
  }

  private async loadViewer(fileUrl: string) {
    await PSPDFKit.load({
      container: '#pspdfkit-container',
      document: fileUrl,
      baseUrl: location.origin + '/',
    });
  }
}
