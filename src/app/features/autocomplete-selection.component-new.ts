/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
// file: autocomplete-selection.component.ts
import { CommonModule } from '@angular/common';
import { Component, forwardRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import {
    ControlValueAccessor,
    FormControl,
    NG_VALUE_ACCESSOR,
    ReactiveFormsModule,
    Validators
} from '@angular/forms';
import { EUI_AUTOCOMPLETE, EuiAutocompleteComponent, EuiAutoCompleteItem } from '@eui/components/eui-autocomplete';
import {
    combineLatest,
    defaultIfEmpty,
    forkJoin,
    isObservable,
    map,
    noop,
    Observable,
    of,
    shareReplay,
    Subject,
    switchMap,
    takeUntil,
    tap
} from 'rxjs';

@Component({
  selector: 'app-autocomplete-selection-new',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    EUI_AUTOCOMPLETE

  ],
  styles: [
    `
      :host.no-left-radius ::ng-deep eui-autocomplete input {
        border-left: none !important;
        border-top-left-radius: 0 !important;
        border-bottom-left-radius: 0 !important;
      }
    `,
  ],
  host: {
    '[class.no-left-radius]': '!includeLeftRadius',
  },
  template: `
    <!-- <form [formGroup]="form"> -->
    <eui-autocomplete
      #autocomplete
      [autocompleteData]="optionsForAutocomplete$ | async"
      [matching]="'contains'"
      [isReadonly]="readonly"
      [hasChips]="false"
      [formControl]="formControl"
      [placeholder]="placeholder"
    >
    </eui-autocomplete>
    <!-- </form> -->
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AutocompleteSelectionComponentNew),
      multi: true,
    },
  ],
})
export class AutocompleteSelectionComponentNew<T> implements ControlValueAccessor, OnInit, OnDestroy {
  @ViewChild('autocomplete') autocomplete: EuiAutocompleteComponent;
  public formControl = new FormControl<EuiAutoCompleteItem<T> | null>(
    { value: null, disabled: false },
    { validators: [Validators.required] },
  );

  ngOnInit(): void {
    this.optionsForAutocomplete$ = this.options$.pipe(
      switchMap((items) =>
        forkJoin(
          items.map((item) => {
            const base: EuiAutoCompleteItem<T> = {
              metadata: item,
              label: item[this.displayField],
            };

            const mapped = this.mapper?.(item, base);

            if (isObservable(mapped)) {
              // async case
              return mapped.pipe(map((extra) => ({ ...base, ...((extra as object) ?? {}) })));
            } else {
              // sync case
              return of({ ...base, ...(mapped ?? {}) });
            }
          }),
        ).pipe(
          defaultIfEmpty([]), // emits [] when forkJoin gets an empty array
        ),
      ),
      shareReplay({ bufferSize: 1, refCount: true }), // needed to avoid multiple executions caused by multiple subscriptions
    );

    this.initSubs();
  }
  @Input() includeLeftRadius = true;
  @Input() options$!: Observable<T[]>;
  @Input() isDisabled!: boolean;
  @Input() mapper?: (item: T, base: EuiAutoCompleteItem<T>) => Partial<EuiAutoCompleteItem<T>>;
  private destroy$ = new Subject<void>();

  private _readonly = false;
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  @Input()
  set readonly(value: boolean) {
    this._readonly = value; // force false always!
  }
  get readonly(): boolean {
    return this._readonly;
  }

  protected optionsForAutocomplete$!: Observable<EuiAutoCompleteItem<T>[]>;
  @Input() valueField = 'id';
  @Input() displayField = 'name';
  @Input() placeholder = 'Select option';

  public writeValueEventsSubject = new Subject<T>();
  writeValueEvents$ = this.writeValueEventsSubject.asObservable();

  onChange: (value: any) => void = () => {};

  onTouched = () => {};

  private initSubs() {
    // here listening for changes from autocomplete
    // and pushing upwards only expected id
    // {userId: 1, name: John}
    // => getting userId (if valueField == userId)
    // and pushing 1 to onChange

    this.formControl.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((matchedOption: EuiAutoCompleteItem<T>) => {
      console.log('new form: internal form control value changed: ', matchedOption);
      const valueProperty = this.getValueFromOption(matchedOption);
      this.onChange(valueProperty);
      this.onTouched();
    });

    // for initial selection
    // when we have value from DTO
    combineLatest([this.writeValueEvents$, this.optionsForAutocomplete$])
      .pipe(
        tap(([writeValueInput, options]) => console.log('new form: combineLatest fired with value: ', writeValueInput, options)),
        map(([writeValueInput, options]) => {
          const matchedOption = this.getMatchedOption(options, writeValueInput);
        //   const assignedOptionValue = this.getValueFromOption(matchedOption);
          // makes no harm to have always true
          const valueReset = true; // assignedOptionValue !== writeValueInput;
          return { matchedOption, valueReset };
        }),
        takeUntil(this.destroy$),
      )
      .subscribe(({ matchedOption, valueReset }) => {
        this.formControl.patchValue(matchedOption, {
          emitEvent: valueReset,
        });
      });

    this.optionsForAutocomplete$.pipe(takeUntil(this.destroy$)).subscribe((options) => {
        console.log('new form: optionsForAutocomplete$ emitted options: ', options);
      const formValue = this.formControl.value;

      if (formValue === null) return;

      const currentValue = this.getValueFromOption(formValue);
      const hasCurrentValue = options.some((option) => this.getValueFromOption(option) === currentValue);
      console.log('new form: checking if has current value: ', hasCurrentValue, currentValue, options);
      if (hasCurrentValue) return;
      console.log('new form: clearing value as no match found');
      this.formControl.setValue(null);
    });
  }

  private _required = false;

  private getMatchedOption(autoCompleteOptions: EuiAutoCompleteItem<T>[], value: T): EuiAutoCompleteItem<T> | null {
    return autoCompleteOptions.find((option) => this.getValueFromOption(option) === value) ?? null;
  }

  private getValueFromOption(option: EuiAutoCompleteItem<T>) {
    return option?.metadata?.[this.valueField] ?? null;
  }

  @Input()
  set required(value: boolean | string) {
    const newVal = value !== false && value !== 'false';
    if (this._required !== newVal) {
      this._required = newVal;
      this.onRequiredChanged(newVal);
    }
  }

  get required(): boolean {
    return this._required;
  }

  private onRequiredChanged(isRequired: boolean): void {
    const autoCompleteControl = this.formControl;
    if (isRequired) {
      autoCompleteControl.setValidators([Validators.required]);
    } else {
      autoCompleteControl.clearValidators();
    }
    autoCompleteControl.updateValueAndValidity({ emitEvent: false });
  }

  writeValue(value: T): void {
    console.log('new form: writeValue called with value: ', value);
    if (undefined === value) {
      //return
    }

    this.writeValueEventsSubject.next(value);
  }
  registerOnChange(fn: (value: any | null) => void): void {
    // workaround to not get errors on destroy
    // its caused by angular forms component and function for cleanup
    // function cleanUpControl(control, dir, validateControlPresenceOnChange = true)
    // @angular/forms/fesm2022/forms.mjs
    // https://github.com/angular/angular/issues/40521
    // https://github.com/angular/angular/pull/39235
    // todo: check in new angular version if thats fixed properly

    if (fn.name === noop.name) {
      this.cleanup();
    } else {
      this.onChange = fn;
    }
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
    this.autocomplete?.setDisabledState(isDisabled);
  }
  private cleanup(): void {
    this.destroy$.next();
  }
}
