import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Passage } from '../models/passage';

@Injectable({
  providedIn: 'root',
})
export class PassageService {
  private API_URL = environment.API_URL;

  constructor(private http: HttpClient) {}

  createPassage(payload: Passage, partId:number) {
    return this.http.post(`${this.API_URL}/admin/parts/${partId}/passages`, payload);
  }

  passageList(testId:number) {
    return this.http.get(`${this.API_URL}/admin/tests/${testId}/passages`);
  }

}
