import { AutocompleteSelectionComponentNew } from './../autocomplete-selection.component-new';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { EUI_PAGE } from '@eui/components/eui-page';
import { TranslateModule } from '@ngx-translate/core';
import { AutocompleteSelectionComponent } from '../autocomplete-selection.component';
import { BehaviorSubject } from 'rxjs';
import { EUI_CARD } from '@eui/components/eui-card';
import { EUI_LABEL } from '@eui/components/eui-label';

@Component({
  imports: [
    TranslateModule,
    ...EUI_PAGE,
    ...EUI_CARD,
    ...EUI_LABEL,
    AutocompleteSelectionComponent,
    AutocompleteSelectionComponentNew,
    ReactiveFormsModule,
  ],
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit {
  protected formControl1 = new FormControl('id1');
  protected formControl2 = new FormControl('id1');
  formGroup: FormGroup = new FormGroup({
    travel1: this.formControl1,
    travel2: this.formControl2,
  });
  ngOnInit(): void {
    //this.patch1();
    this.formControl1.valueChanges.subscribe((v) => {
      console.log('Parent value control old: ', v);
    });
    this.formControl2.valueChanges.subscribe((v) => {
      console.log('Parent value control new: ', v);
    });
  }
  name = 'Angular';

  private readonly travelOptions = [new Travel('id1', 'name1'), new Travel('id2', 'name2')];

  protected travels$ = new BehaviorSubject<Travel[]>(this.travelOptions);

  patch() {
    this.formGroup.setValue({travel1: 'id1', travel2: 'id1'})
  }

  refreshOptions() {
    this.travels$.next([new Travel('id1', 'name1'), new Travel('id2', 'name2')]);
  }
  setInvalidOptions() {
    this.travels$.next([new Travel('invalidId', 'invalidName')]);
  }
}

export class Travel {
  constructor(
    public id: string,
    public name: string,
  ) {}
}
