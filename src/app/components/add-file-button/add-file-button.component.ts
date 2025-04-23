import { Component, EventEmitter, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-add-file-button',
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './add-file-button.component.html',
  styleUrls: ['./add-file-button.component.scss'],
})
export class AddFileButtonComponent {
  @Output() addFile = new EventEmitter<void>();

  onAddFile() {
    this.addFile.emit();
  }
}
