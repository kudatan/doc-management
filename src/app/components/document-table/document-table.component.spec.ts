import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DocumentTableComponent } from './document-table.component';
import { Sort } from '@angular/material/sort';

describe('DocumentTableComponent', () => {
  let component: DocumentTableComponent;
  let fixture: ComponentFixture<DocumentTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocumentTableComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DocumentTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have correct displayed columns', () => {
    expect(component.displayedColumns).toContain('name');
    expect(component.displayedColumns).toContain('status');
    expect(component.displayedColumns).toContain('creator');
    expect(component.displayedColumns).toContain('createdAt');
    expect(component.displayedColumns).toContain('updatedAt');
    expect(component.displayedColumns).toContain('action');
  });

  describe('sorting', () => {
    it('should emit sort change event', () => {
      const sort: Sort = {
        active: 'name',
        direction: 'asc',
      };
      spyOn(component.sortChange, 'emit');

      component.onSortChange(sort);
      fixture.detectChanges();

      expect(component.sortChange.emit).toHaveBeenCalledWith(sort);
    });

    it('should handle sort with no direction', () => {
      const sort: Sort = {
        active: 'name',
        direction: '',
      };
      spyOn(component.sortChange, 'emit');

      component.onSortChange(sort);
      fixture.detectChanges();

      expect(component.sortChange.emit).toHaveBeenCalledWith(sort);
    });
  });
});
