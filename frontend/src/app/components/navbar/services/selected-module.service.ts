import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

@Injectable({
  providedIn: "root"
})
export class ActiveModuleService {

  private activeState = new BehaviorSubject<string | null>(null);

  selectedModule$ = this.activeState.asObservable();

  setActiveModule(buttonId: string){
    this.activeState.next(buttonId);
  }

  getActiveButton(): string | null {
    return this.activeState.value;
  }

}
