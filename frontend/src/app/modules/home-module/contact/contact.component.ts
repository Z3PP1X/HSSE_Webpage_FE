// frontend/src/app/modules/home-module/contact/contact.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IMPRINT_CONFIG, ImprintConfig } from '../../../config/imprint.config';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css'
})
export class ContactComponent implements OnInit {
  imprintConfig: ImprintConfig = IMPRINT_CONFIG;
  contactForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.contactForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      company: [''],
      phone: [''],
      subject: ['', Validators.required],
      message: ['', Validators.required],
      department: ['general', Validators.required]
    });
  }

  ngOnInit(): void {}

  onSubmit(): void {
    if (this.contactForm.valid) {
      console.log('Contact form submitted:', this.contactForm.value);
      // Here you would typically send the form data to your backend
      alert('Message sent successfully! We will get back to you soon.');
      this.contactForm.reset();
    }
  }

  formatAddress(address: any): string {
    return `${address.street}, ${address.postalCode} ${address.city}, ${address.country}`;
  }
}