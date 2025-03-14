import { Injectable } from "@angular/core";
import { QuestionBase } from "../question-base";
import { FormGroupBase } from "../Form/form/form-group-base";

@Injectable({
  providedIn: 'root'
})

export class FormCategoryService {

  categories: string[] = [];

  categoryDict: { [key: string]: { [subKey: string]: any } } = {};

  constructor () {

  }

  formGroups(data: FormGroupBase<any>[] | QuestionBase<any>[], parentCategoryKey?: string){


    let currentCategoryKey = '';

    data.forEach((element: FormGroupBase<any> | QuestionBase<any>) => {

      let isCategoryActive = false;
      if (this.isFormGroup(element)){
        if (element.isCategory) {

          if (!isCategoryActive) {

            this.addCategory(element.key);
            currentCategoryKey = element.key;
            isCategoryActive = true;

          }

          else if (parentCategoryKey) {

            this.addSubcategory(parentCategoryKey, element.key);

          }
          else {

            this.addSubcategory(currentCategoryKey, element.key);
          }
        }
        else {

          if (parentCategoryKey) {

            this.addItemToSubcategory(parentCategoryKey, currentCategoryKey, element.key);
          }
          else if (currentCategoryKey) {
            this.addItemToCategory(currentCategoryKey, element.key);
          }
        }
        this.formGroups(element.fields, element.isCategory ? element.key : currentCategoryKey);
      }
    });
    return this.categoryDict;
  }

  addCategory(key: string) {
    if (!this.categoryDict[key]) {
      this.categoryDict[key] = {};
      if (!this.categories.includes(key)) {
        this.categories.push(key);
      }
    }
  }

  addSubcategory(categoryKey: string, subKey: string) {
    this.addCategory(categoryKey);
    if (!this.categoryDict[categoryKey][subKey]) {
      this.categoryDict[categoryKey][subKey] = {};
    }
  }

  addItemToCategory(categoryKey: string, itemKey: string) {
    this.addCategory(categoryKey);
    this.categoryDict[categoryKey][itemKey] = true;
  }

  addItemToSubcategory(categoryKey: string, subKey: string, itemKey: string) {
    this.addSubcategory(categoryKey, subKey);
    this.categoryDict[categoryKey][subKey][itemKey] = true;
  }


  getCategory(key: string) {
    return this.categoryDict[key] || {};
  }

  getSubcategory(categoryKey: string, subKey: string) {
    const category = this.getCategory(categoryKey);
    return category[subKey] || {};
  }

  isFormGroup<T>(item: QuestionBase<T> | FormGroupBase<T>): item is FormGroupBase<T>{
    return (item as FormGroupBase<T>).fields !== undefined;
  }
}
