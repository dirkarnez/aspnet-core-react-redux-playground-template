﻿import { AppThunkAction } from '../';
import { AuthApi } from '../../api';
import { addTask } from 'domain-task';
import { ActionType, AuthAction, AuthUser, Credentials } from './types';

export const actionCreators = {
    loginUserRequest: (credentials: Credentials): AppThunkAction<AuthAction> => (dispatch, getState) => {
        const loginTask = AuthApi.loginAsync(credentials).then(data => {
            if (validateLoginResponse(data)) { // SUCCESS
                dispatch({ type: ActionType.LOGIN_SUCCESS, authUser: data });
            } else { // FAIL
                dispatch({ type: ActionType.LOGIN_FAIL });
            }
        });

        // Ensure server-side prerendering waits for this to complete
        addTask(loginTask);
    },
    logoutUserRequest: (handleRouteCallback: Function): AppThunkAction<AuthAction> => (dispatch, getState) => {
        const logoutTask = AuthApi.logoutAsync().then(() => {
            handleRouteCallback();
            dispatch({ type: ActionType.RESET_STATE });
        });

        // Ensure server-side prerendering waits for this to complete
        addTask(logoutTask);
    },
    resetState: (): AuthAction => ({ type: ActionType.RESET_STATE })
};

function validateLoginResponse(authUser: AuthUser): boolean {
    if (!authUser || !authUser.status || authUser.status!.isEmptyOrWhiteSpace() || !authUser.token || authUser.token!.isEmptyOrWhiteSpace()) {
        return false;
    } else if (authUser.status!.toLowerCase().trim() !== 'success') {
        return false;
    }
    return true;
}