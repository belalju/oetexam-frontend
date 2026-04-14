import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Auth } from '../../services/auth';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private fb = inject(FormBuilder);
  protected auth = inject(Auth);
 
  errorMessage = signal<string | null>(null);
  showPassword = signal(false);
 
  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });
 
  get email() { return this.form.get('email')!; }
  get password() { return this.form.get('password')!; }
 
  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.errorMessage.set(null);
    this.auth.login(this.form.value as any).subscribe({
      error: (err) => {
        this.errorMessage.set(
          err?.error?.error || 'Login failed. Please check your credentials.'
        );
      }
    });
  }
}
