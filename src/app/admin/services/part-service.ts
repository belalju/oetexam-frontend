import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Part } from '../models/part';

@Injectable({
  providedIn: 'root',
})
export class PartService {
  private API_URL = environment.API_URL;

  constructor(private http: HttpClient) {}

  createPart(payload: Part, testId:number) {
    return this.http.post(`${this.API_URL}/admin/tests/${testId}/parts`, payload);
  }

  partList(testId:number) {
    return this.http.get(`${this.API_URL}/admin/tests/${testId}/parts`);
  }

  partById(partId:number) {
    return this.http.get(`${this.API_URL}/admin/parts/${partId}`);
  }

  updatePart(payload: Part, partId:number) {
    return this.http.put(`${this.API_URL}/admin/parts/${partId}`, payload);
  }

  deletePart(partId:number) {
    return this.http.delete(`${this.API_URL}/admin/parts/${partId}`);
  }

  
}
