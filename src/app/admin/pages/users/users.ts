import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { UserService } from '../../services/user-service';
import { toast } from 'ngx-sonner';
import { CommonModule, DatePipe } from '@angular/common';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-users',
  imports: [CommonModule],
  providers: [DatePipe],
  templateUrl: './users.html',
  styleUrl: './users.css',
})
export class Users implements OnInit, OnDestroy{
  private userService = inject(UserService);
  private datePipe = inject(DatePipe);

  rawUsers = signal<any[]>([]);
  searchInputValue = '';
  searchQuery = signal('');
  private searchSubject = new Subject<string>();
  private searchSubscription = this.searchSubject.pipe(
    debounceTime(300),
    distinctUntilChanged()
  ).subscribe((query) => {
    this.searchInputValue = query;
    this.searchQuery.set(query);
  });

  users = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();

    if (!query) {
      return this.rawUsers();
    }

    return this.rawUsers().filter((user) => {
      const searchableText = [
        user.firstName,
        user.lastName,
        user.email,
        user.profession
      ].filter(Boolean).join(' ').toLowerCase();

      return searchableText.includes(query);
    });
  });

  ngOnInit(){
    this.getUsers();
  }

  ngOnDestroy(): void {
    this.searchSubscription.unsubscribe();
  }

  getUsers(){
    this.userService.users().subscribe({
      next : (response:any) => {
        this.rawUsers.set(response.data || []);
      },
      error: (err:any) => {
        console.error(err);
        toast.error('Failed to Load Users');
      }
    });
  }

  queueSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchSubject.next(value);
  }

  clearSearch(): void {
    this.searchInputValue = '';
    this.searchQuery.set('');
  }

  updateStatus(id:number) {
    // Call the API to publish the test
    this.userService.updateUserStatus(id).subscribe({
      next: (response:any) => {
        this.getUsers();
        toast.success('User Updated successfully!');
      },
      error: (err:any) => {
        console.error(err);
        toast.error('Failed to Update User.');
      }
    });
  }

  getStatusBadge(published: boolean) {
    return published 
      ? { color: 'bg-emerald-100 text-green-700', label: 'Active' }
      : { color: 'bg-red-100 text-red-700', label: 'InActive' };
  }

  formatDate(dateStr: string) {
    return this.datePipe.transform(dateStr, 'MMM d, y') || dateStr;
  }


}
