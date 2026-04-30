import { Component, inject, OnInit, signal } from '@angular/core';
import { UserService } from '../../services/user-service';
import { toast } from 'ngx-sonner';
import { CommonModule, DatePipe } from '@angular/common';

@Component({
  selector: 'app-users',
  imports: [CommonModule],
  providers: [DatePipe],
  templateUrl: './users.html',
  styleUrl: './users.css',
})
export class Users implements OnInit{
  private userService = inject(UserService);
  private datePipe = inject(DatePipe);

  users = signal<any[]>([]);

  ngOnInit(){
    this.getUsers();
  }

  getUsers(){
    this.userService.users().subscribe({
      next : (response:any) => {
        this.users.set(response.data);
      },
      error: (err:any) => {
        console.error(err);
        toast.error('Failed to Load Users');
      }
    });
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
