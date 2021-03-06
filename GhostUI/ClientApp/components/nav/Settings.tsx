﻿import * as React from 'react';
import { connect } from 'react-redux';
import { Route } from 'react-router-dom';
import { ApplicationState } from '../../store';
import { spaNugetUrls } from '../../config/constants';
import { RoutesConfig } from '../../router/routes-config';
import { actionCreators, reducer } from '../../store/auth';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

type SettingsState = typeof initialState;
type NavProps = ReturnType<typeof reducer> & typeof actionCreators;

const initialState = Object.freeze({
    open: false
});

class Settings extends React.PureComponent<NavProps, SettingsState> {
    private readonly _settingsAnchorRef: React.RefObject<HTMLAnchorElement>;

    constructor(props: NavProps) {
        super(props);
        this.state = initialState;
        this._settingsAnchorRef = React.createRef<HTMLAnchorElement>();
    }

    public componentDidMount(): void {
        document.addEventListener('click', this.handleClick, false);
    }

    public componentWillUnmount(): void {
        document.removeEventListener('click', this.handleClick, false);
    }

    public render(): React.ReactNode {
        return (
            <div className={`fixed-plugin ${this.state.open ? 'fixed-plugin-active' : ''}`} style={{ display: this.props.isAuthenticated ? '' : 'none' }}>
                <div className='dropdown'>
                    <a role='button' ref={this._settingsAnchorRef}>
                        <FontAwesomeIcon icon='cog' size='3x' />
                    </a>
                    { (this.props.isAuthenticated && this.state.open) && this.renderSettingsMenu() }
                </div>
            </div>
        );
    }

    private renderSettingsMenu(): React.ReactNode {
        return (
            <ul className='dropdown-menu'>
                <li className='header-title'>Settings</li>
                <li>
                    <a className='dropdown-item'
                       target='_blank'
                       rel='noopener'
                       href={spaNugetUrls.HEALTH_UI}
                       role='button'>
                        <span className='icon'>
                            <FontAwesomeIcon icon='heart' />
                        </span>
                        <span>Health Checks</span>
                    </a>
                </li>
                <li>
                    <a className='dropdown-item'
                       target='_blank'
                       rel='noopener'
                       href={spaNugetUrls.SWAGGER_DOCS}
                       role='button'>
                        <span className='icon'>
                            <FontAwesomeIcon icon='file' />
                        </span>
                        <span>Swagger API</span>
                    </a>
                </li>
                <li>
                    <Route render={({ history }) => (
                        <a className='dropdown-item'
                           onClick={() => { this.props.logoutUserRequest(() => history.push(RoutesConfig.Login.path)); }}
                           role='button'>
                            <span className='icon'>
                                <FontAwesomeIcon icon={RoutesConfig.Login.icon as IconProp} />
                            </span>
                            <span>{RoutesConfig.Login.displayName}</span>
                        </a>
                    )} />
                </li>
            </ul>
        );
    }

    private handleClick: { (e: MouseEvent): void } = (e: MouseEvent) => {
        // Bind a click event listener to the document obj, and if the target is the cog anchor or immediate child, toggle open - otherwise, set open false
        if (this._settingsAnchorRef.current && this._settingsAnchorRef.current.contains(e.target as HTMLElement)) {
            this.setState({
                open: !this.state.open
            });
        } else if (this.state.open) {
            this.setState({
                open: false
            });
        }
    }
}

// Wire up the React component to the Redux store
export default connect((state: ApplicationState) => state.auth, actionCreators)(Settings);