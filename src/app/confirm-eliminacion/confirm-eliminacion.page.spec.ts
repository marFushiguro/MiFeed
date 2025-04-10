import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfirmEliminacionPage } from './confirm-eliminacion.page';

describe('ConfirmEliminacionPage', () => {
  let component: ConfirmEliminacionPage;
  let fixture: ComponentFixture<ConfirmEliminacionPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmEliminacionPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
