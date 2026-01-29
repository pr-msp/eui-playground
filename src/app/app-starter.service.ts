import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
    CONFIG_TOKEN,
    UserService,
    I18nService,
    EuiAppConfig,
    UserDetails,
    UserPreferences,
    EuiServiceStatus,
} from '@eui/core';
import { catchError, Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class AppStarterService {
    defaultUserPreferences: UserPreferences | undefined;
    private userService: UserService = inject(UserService);
    private i18nService: I18nService = inject(I18nService);
    private config: EuiAppConfig = inject(CONFIG_TOKEN);
    private http: HttpClient = inject(HttpClient);

    start(): Observable<EuiServiceStatus> {
        return this.initUserService().pipe(
            switchMap((userStatus) => {
                console.log(userStatus);
                return this.i18nService.init();
            }),
        );
    }

    /**
     * Fetches user details,
     * create user: UserState object
     * then initialise to the UserService on run time
     */
    initUserService(): Observable<EuiServiceStatus> {
        return this.fetchUserDetails().pipe(
            switchMap((userDetails) => this.userService.init(userDetails))
        );
    }

    /**
     * Fetches user details
     */
    private fetchUserDetails(): Observable<UserDetails> {
        // const url = this.config.modules.your_custom_module.your_custom_endpoint
        const moduleCoreApi= this.config.modules?.['core'];
        const url = `${moduleCoreApi?.['base']}${moduleCoreApi?.['userDetails']}`;
        const user = {
            userId: 'anonymous',
            firstName: 'FirstName',
            lastName: 'LastName',
            fullName: 'FullName',
        };

        if (!url) {
            return of(user);
        }
        return this.http.get<UserDetails>(url)
            .pipe(
                // in case of Http failure return dummy user
                catchError(() => of(user)),
            );
    }
}
