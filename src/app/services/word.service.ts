import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Word } from '../models/Word';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json'
  })
}

@Injectable({
  providedIn: 'root'
})

export class WordService {
  wordsURL:string = 'https://conundrum-api.herokuapp.com/conundrum'

  constructor(private http:HttpClient) { }

  getWord():Observable<Word[]> {
    return this.http.get<Word[]>(`${this.wordsURL}`);
  }

}
