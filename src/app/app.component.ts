import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { EUI_LANGUAGE_SELECTOR } from '@eui/components/eui-language-selector';
import { EUI_USER_PROFILE } from '@eui/components/eui-user-profile';
import { EUI_ICON } from '@eui/components/eui-icon';
import { EUI_LAYOUT } from '@eui/components/layout';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    imports: [
        TranslateModule,
        ...EUI_LAYOUT,
        ...EUI_ICON,
        ...EUI_USER_PROFILE,
        ...EUI_LANGUAGE_SELECTOR,
    ],
})
export class AppComponent {
}
