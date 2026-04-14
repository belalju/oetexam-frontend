import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-register',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  private fb = inject(FormBuilder);
  protected auth = inject(Auth);
 
  errorMessage = signal<string | null>(null);
  showPassword = signal(false);
 
  professions = [
    'Software Engineer', 'Product Manager', 'Designer', 'Data Scientist',
    'Marketing', 'Sales', 'HR', 'Finance', 'Operations', 'Other'
  ];
 
  form = this.fb.group({
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName:  ['', [Validators.required, Validators.minLength(2)]],
    email:     ['', [Validators.required, Validators.email]],
    password:  ['', [Validators.required, Validators.minLength(6)]],
    profession:['', Validators.required]
  });
 
  get firstName()  { return this.form.get('firstName')!; }
  get lastName()   { return this.form.get('lastName')!; }
  get email()      { return this.form.get('email')!; }
  get password()   { return this.form.get('password')!; }
  get profession() { return this.form.get('profession')!; }
 
  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.errorMessage.set(null);
    this.auth.register(this.form.value as any).subscribe({
      error: (err) => {
        this.errorMessage.set(
          err?.error?.error || 'Registration failed. Please try again.'
        );
      }
    });
  }
}
