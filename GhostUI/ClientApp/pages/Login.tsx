﻿import * as React from 'react';
import { SignalRApi } from '../api';
import { connect } from 'react-redux';
import { ApplicationState } from '../store';
import { toast, ToastId } from 'react-toastify';
import { Checkbox } from '../components/controls';
import { Authenticator } from '../components/loaders';
import { RoutesConfig } from '../router/routes-config';
import { RouteComponentProps } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { renderToastContent } from '../utils/toastify-msg-renderer';
import { actionCreators, AuthStatusEnum, Credentials, reducer } from '../store/auth';

type LoginProps = ReturnType<typeof reducer> & typeof actionCreators & RouteComponentProps<{}>;
type LoginState = typeof initialState;

const initialState = Object.freeze({
    showPassword: false,
    invalidInputs: false,
    authRequestStatus: AuthStatusEnum.None as string,
    credentials: {
        userName: '',
        password: '',
        rememberMe: false
    } as Credentials
});

class Login extends React.PureComponent<LoginProps, LoginState> {
    private toastId: ToastId = '';

    constructor(props: LoginProps) {
        super(props);
        this.state = initialState;
    }

    public componentDidMount(): void {
        SignalRApi.startConnection(); // SignalR connections
    }

    public componentWillReceiveProps(nextProps: LoginProps): void {
        const nextAuthStatus = (nextProps && nextProps.status) ? nextProps.status : '';
        const curAuthStatus = (this.props && this.props.status) ? this.props.status : '';

        if (nextAuthStatus !== curAuthStatus) {
            this.setState({
                authRequestStatus: nextAuthStatus
            });
        }
    }

    public render(): React.ReactNode {
        return (
            <section className='section section-login'>
                <div className='container has-text-centered'>
                    <div className='column is-4 is-offset-4'>
                        <h3 className='title'>Login</h3>
                        <p className='subtitle'>Please login to proceed</p>
                        <div className='box'>
                            <img id='login-img' src={require('../assets/image/based-ghost-crop.png')} alt='' width='190' />
                            <form onSubmit={this.handleLogin}>
                                { this.renderNameInput() }
                                { this.renderPasswordInput() }
                                { this.renderLoginControls() }
                            </form>
                            <Authenticator authStatus={this.state.authRequestStatus}
                                           failDispatcher={() => { this.props.resetState(); this.setState({ authRequestStatus: AuthStatusEnum.None as string }); }}
                                           successDispatcher={() => this.props.history.push(RoutesConfig.Dashboard.path)} />
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    private renderNameInput(): React.ReactNode {
        return (
            <div className='field'>
                <div className='control has-icons-left'>
                    <input className={`input is-large ${this.state.invalidInputs ? 'is-danger' : ''}`}
                           type='text'
                           value={this.state.credentials.userName}
                           onChange={this.updateUserName}
                           autoFocus
                           placeholder='Username' />
                    <span className='icon is-left'>
                        <FontAwesomeIcon icon='user' />
                    </span>
                </div>
            </div>
        );
    }

    private renderPasswordInput(): React.ReactNode {
        return (
            <div className='field'>
                <div className='control has-icons-left has-icons-right'>
                    <input className={`input is-large ${this.state.invalidInputs ? 'is-danger' : ''}`}
                           type={!this.state.showPassword ? 'password' : 'text'}
                           value={this.state.credentials.password}
                           onChange={this.updatePassword}
                           placeholder='Password' />
                    <span className='icon is-left'>
                        <FontAwesomeIcon icon='lock' />
                    </span>
                    <span className='icon is-right icon-clickable'
                          data-tooltip={!this.state.showPassword ? 'Show password' : 'Hide password'}
                          onClick={this.toggleShowPassword}>
                        <FontAwesomeIcon icon={!this.state.showPassword ? 'eye' : 'eye-slash'} />
                    </span>
                </div>
            </div>
        );
    }

    private renderLoginControls(): React.ReactNode {
        return (
            <>
              <Checkbox trailingLabel='Remember me'
                        wrapperClass='remember-me-control'
                        dispatchHandler={this.updateRememberMe}
                        checked={!!this.state.credentials.rememberMe} />
              <button className='button is-info is-large is-fullwidth' type='submit'>
                  <span>Login</span>
                  <span className='icon'>
                      <FontAwesomeIcon icon='sign-in-alt' />
                  </span>
              </button>
            </>
        );
    }

    private handleLogin: React.FormEventHandler<HTMLFormElement> = (e) => {
        e.preventDefault();

        // Prevent multiple login requests onClick
        if (this.state.authRequestStatus === AuthStatusEnum.Process) {
            return;
        }

        if ((this.state.credentials.userName!).isEmptyOrWhiteSpace() || (this.state.credentials.password!).isEmptyOrWhiteSpace()) {
            // Run invalidInputs error and display toast notification (if one is not already active)
            this.setState({ invalidInputs: true });
            if (!toast.isActive(this.toastId)) {
                this.toastId = toast.error(renderToastContent('Enter user name/password', 'exclamation'));
            }
        } else {
            // Clear any toast notifications and prepare state for Login request stub / run login request stub
            toast.dismiss();
            this.setState({ invalidInputs: false, authRequestStatus: AuthStatusEnum.Process as string });

            setTimeout(() => {
                this.props.loginUserRequest(this.state.credentials);
            }, 2500);
        }
    }

    private toggleShowPassword = () => {
        this.setState({
            showPassword: !this.state.showPassword
        });
    }

    private updateRememberMe = (checked: boolean) => {
        this.setState({
            credentials: {
                ...this.state.credentials,
                rememberMe: checked
            }
        });
    }

    private updateUserName: React.ChangeEventHandler<HTMLInputElement> = (e) => {
        this.setState({
            credentials: {
                ...this.state.credentials,
                userName: (e.target.value || '')
            }
        });
    }

    private updatePassword: React.ChangeEventHandler<HTMLInputElement> = (e) => {
        this.setState({
            credentials: {
                ...this.state.credentials,
                password: (e.target.value || '')
            }
        });
    }
}

// Wire up the React component to the Redux store
export default connect((state: ApplicationState) => state.auth, actionCreators)(Login);