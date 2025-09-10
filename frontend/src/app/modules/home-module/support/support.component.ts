// frontend/src/app/modules/home-module/support/support.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IMPRINT_CONFIG, ImprintConfig } from '../../../config/imprint.config';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

@Component({
  selector: 'app-support',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './support.component.html',
  styleUrl: './support.component.css'
})
export class SupportComponent implements OnInit {
  imprintConfig: ImprintConfig = IMPRINT_CONFIG;
  contactForm: FormGroup;
  
  faqItems: FAQItem[] = [
    {
      question: "How do I access the HSSE Portal?",
      answer: "You can access the HSSE Portal through your company credentials. If you don't have access, please contact your administrator or our helpdesk.",
      category: "access"
    },
    {
      question: "What should I do in case of an emergency?",
      answer: "In case of an emergency, immediately call 112 (Emergency Services) or use the emergency contact provided in your location's emergency plan. You can also contact our emergency response team.",
      category: "emergency"
    },
    {
      question: "How do I report a safety incident?",
      answer: "Safety incidents can be reported through the Safety Module in the HSSE Portal. Fill out the incident report form with all relevant details.",
      category: "safety"
    },
    {
      question: "Where can I find my location's emergency plan?",
      answer: "Emergency plans are available in the Safety Module under 'Alarmplan'. Each location has a specific emergency plan tailored to its layout and procedures.",
      category: "emergency"
    },
    {
      question: "How do I update my personal information?",
      answer: "Personal information can be updated in the Account Module. Go to 'Profile Settings' and make the necessary changes.",
      category: "account"
    },
    {
      question: "What browsers are supported?",
      answer: "The HSSE Portal supports the latest versions of Chrome, Firefox, Safari, and Edge. For the best experience, please keep your browser updated.",
      category: "technical"
    }
  ];

  selectedCategory: string = 'all';
  expandedItems: Set<number> = new Set();

  constructor(private fb: FormBuilder) {
    this.contactForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      department: [''],
      priority: ['medium', Validators.required],
      subject: ['', Validators.required],
      message: ['', Validators.required]
    });
  }

  ngOnInit(): void {}

  get filteredFAQ(): FAQItem[] {
    if (this.selectedCategory === 'all') {
      return this.faqItems;
    }
    return this.faqItems.filter(item => item.category === this.selectedCategory);
  }

  get faqCategories(): string[] {
    const categories = [...new Set(this.faqItems.map(item => item.category))];
    return ['all', ...categories];
  }

  toggleFAQItem(index: number): void {
    if (this.expandedItems.has(index)) {
      this.expandedItems.delete(index);
    } else {
      this.expandedItems.add(index);
    }
  }

  isExpanded(index: number): boolean {
    return this.expandedItems.has(index);
  }

  onSubmit(): void {
    if (this.contactForm.valid) {
      console.log('Support request submitted:', this.contactForm.value);
      // Here you would typically send the form data to your backend
      alert('Support request submitted successfully! We will get back to you soon.');
      this.contactForm.reset();
    }
  }

  formatCategoryName(category: string): string {
    if (category === 'all') return 'All Categories';
    return category.charAt(0).toUpperCase() + category.slice(1);
  }
}