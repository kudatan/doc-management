import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DocumentFiltersComponent } from './document-filters.component';
import { DocumentStatus } from '../../interfaces/dashboard.interface';

describe('DocumentFiltersComponent', () => {
  let component: DocumentFiltersComponent;
  let fixture: ComponentFixture<DocumentFiltersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocumentFiltersComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DocumentFiltersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('status filtering', () => {
    it('should emit status change event', () => {
      const status: DocumentStatus = 'APPROVED';
      spyOn(component.statusChange, 'emit');

      component.onStatusChange(status);
      fixture.detectChanges();

      expect(component.statusFilter()).toBe(status);
      expect(component.statusChange.emit).toHaveBeenCalledWith(status);
    });

    it('should handle empty status selection', () => {
      spyOn(component.statusChange, 'emit');

      component.onStatusChange('');
      fixture.detectChanges();

      expect(component.statusFilter()).toBeUndefined();
      expect(component.statusChange.emit).toHaveBeenCalledWith(undefined);
    });
  });

  describe('creator filtering', () => {
    it('should emit creator change event', () => {
      const creatorId = '1';
      spyOn(component.creatorChange, 'emit');

      component.onCreatorChange(creatorId);
      fixture.detectChanges();

      expect(component.creatorFilter()).toBe(creatorId);
      expect(component.creatorEmailFilter()).toBeUndefined();
      expect(component.creatorChange.emit).toHaveBeenCalledWith(creatorId);
    });

    it('should handle empty creator selection', () => {
      spyOn(component.creatorChange, 'emit');

      component.onCreatorChange('');
      fixture.detectChanges();

      expect(component.creatorFilter()).toBeUndefined();
      expect(component.creatorEmailFilter()).toBeUndefined();
      expect(component.creatorChange.emit).toHaveBeenCalledWith(undefined);
    });
  });

  describe('creator email filtering', () => {
    it('should emit creator email change event', () => {
      const email = 'test@example.com';
      spyOn(component.creatorEmailChange, 'emit');

      component.onCreatorEmailChange(email);
      fixture.detectChanges();

      expect(component.creatorEmailFilter()).toBe(email);
      expect(component.creatorFilter()).toBeUndefined();
      expect(component.creatorEmailChange.emit).toHaveBeenCalledWith(email);
    });

    it('should handle empty creator email selection', () => {
      spyOn(component.creatorEmailChange, 'emit');

      component.onCreatorEmailChange('');
      fixture.detectChanges();

      expect(component.creatorEmailFilter()).toBeUndefined();
      expect(component.creatorFilter()).toBeUndefined();
      expect(component.creatorEmailChange.emit).toHaveBeenCalledWith(undefined);
    });
  });

  describe('filter reset', () => {
    it('should reset all filters', () => {
      component.statusFilter.set('APPROVED');
      component.creatorFilter.set('1');
      component.creatorEmailFilter.set('test@example.com');
      spyOn(component.resetFiltersEvent, 'emit');

      component.resetFilters();
      fixture.detectChanges();

      expect(component.statusFilter()).toBeUndefined();
      expect(component.creatorFilter()).toBeUndefined();
      expect(component.creatorEmailFilter()).toBeUndefined();
      expect(component.resetFiltersEvent.emit).toHaveBeenCalled();
    });
  });

  describe('pagination', () => {
    it('should emit next page event', () => {
      spyOn(component.nextUserPageEvent, 'emit');

      component.nextUserPage();
      fixture.detectChanges();

      expect(component.nextUserPageEvent.emit).toHaveBeenCalled();
    });

    it('should emit previous page event', () => {
      spyOn(component.prevUserPageEvent, 'emit');

      component.prevUserPage();
      fixture.detectChanges();

      expect(component.prevUserPageEvent.emit).toHaveBeenCalled();
    });
  });
});
