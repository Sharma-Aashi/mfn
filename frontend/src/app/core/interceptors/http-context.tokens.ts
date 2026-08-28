import { HttpContextToken } from '@angular/common/http';

/** Set to true on a request's HttpContext to suppress the global error toast
 *  (e.g. login/register forms that display the error inline instead). */
export const SKIP_ERROR_TOAST = new HttpContextToken<boolean>(() => false);
