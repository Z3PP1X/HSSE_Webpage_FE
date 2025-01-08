import { APIMetadata } from "../interfaces/api-metadata.interface";
import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";

import { map } from "rxjs";

import { MetadataTransformationService } from "./metadata-transformation.service";

@Injectable({
  providedIn: "root"
})

export class MetadataService{

  private readonly http = inject(HttpClient);
  questionset = inject(MetadataTransformationService)

  private fetchMetadata(url: string){
   return this.http.get<APIMetadata[]>(url).pipe();

  }

  getMetadata(url: string) {
    return this.fetchMetadata(url).pipe(
      map((resData) => this.questionset.convertMetadatatoQuestionModel(resData))

    );
  }

}
