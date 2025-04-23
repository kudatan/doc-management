import { TestBed } from '@angular/core/testing';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { ToastService } from './toast.service';

describe('ToastService', () => {
  let service: ToastService;
  let snackBar: jasmine.SpyObj<MatSnackBar>;

  beforeEach(() => {
    const snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    TestBed.configureTestingModule({
      providers: [ToastService, { provide: MatSnackBar, useValue: snackBarSpy }],
    });

    service = TestBed.inject(ToastService);
    snackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('show method', () => {
    it('should call snackBar.open with success configuration by default', () => {
      const message = 'Test message';
      const expectedConfig: MatSnackBarConfig = {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: ['toast-success'],
      };

      service.show(message);

      expect(snackBar.open).toHaveBeenCalledWith(
        message,
        'Close',
        jasmine.objectContaining(expectedConfig),
      );
    });

    it('should call snackBar.open with error configuration when type is error', () => {
      const message = 'Error message';
      const expectedConfig: MatSnackBarConfig = {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: ['toast-error'],
      };

      service.show(message, 'error');

      expect(snackBar.open).toHaveBeenCalledWith(
        message,
        'Close',
        jasmine.objectContaining(expectedConfig),
      );
    });

    it('should call snackBar.open with success configuration when type is success', () => {
      const message = 'Success message';
      const expectedConfig: MatSnackBarConfig = {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: ['toast-success'],
      };

      service.show(message, 'success');

      expect(snackBar.open).toHaveBeenCalledWith(
        message,
        'Close',
        jasmine.objectContaining(expectedConfig),
      );
    });
  });
});
