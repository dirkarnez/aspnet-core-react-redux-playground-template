﻿import * as React from 'react';

type DropdownProps = {
    options: any[];
    placeholder?: string;
    disabled?: boolean;
    buttonClass?: string;
    wrapperClass?: string;
    labelKey?: string;
    selectedOptionLabel?: string;
    dispatchHandler: Function;
};

type DropdownState = typeof initialState;

const initialState = Object.freeze({
    open: false,
    isArrayOfObjects: false
});

export default class Dropdown extends React.PureComponent<DropdownProps, DropdownState> {
    static defaultProps = {
        labelKey: 'label',
        wrapperClass: '',
        buttonClass: '',
        placeholder: ''
    };

    // Object that holds cached functions for onClick handler in options list (avoids rebuilding each re-render)
    private _clickHandlerCache: any = {};

    // Element references (ref attribute)
    private readonly _buttonRef: React.RefObject<HTMLButtonElement>;
    private readonly _dropdownDivRef: React.RefObject<HTMLDivElement>;

    constructor(props: DropdownProps) {
        super(props);

        // May want to eval isArrayOfObjects in a getDerivedStateFromProps hook to handle dynamic changes to options prop
        this.state = {
            ...initialState,
            isArrayOfObjects: this.checkIsArrayOfObjects(this.props.options)
        };

        this._buttonRef = React.createRef<HTMLButtonElement>();
        this._dropdownDivRef = React.createRef<HTMLDivElement>();
    }

    public componentDidMount(): void {
        document.addEventListener('click', this.handleClick, false);
    }

    public componentWillUnmount(): void {
        document.removeEventListener('click', this.handleClick, false);
    }

    public render(): React.ReactNode {
        return (
            <div className={`dropdown ${this.props.wrapperClass} ${this.state.open ? 'is-active' : ''}`}>
                <button className={`button ${this.props.buttonClass}`}
                        type='button'
                        disabled={this.props.disabled}
                        ref={this._buttonRef}
                        onKeyDown={this.keyDownHandler}
                        aria-haspopup='true'
                        aria-controls='dropdown-menu'>
                    <span>{this.props.selectedOptionLabel || this.props.placeholder}</span>
                    <span className='caret-select'></span>
                </button>
                <div className='dropdown-menu'
                     role='menu'
                     ref={this._dropdownDivRef}>
                    <ul className='dropdown-content'>
                        { this.props.options.map((option: any) => this.renderListOption(option)) }
                    </ul>
                </div>
            </div>
        );
    }

    private renderListOption(option: any): React.ReactNode {
        const optionLabel = this.getOptionLabelName(option);
        return (
            <li key={optionLabel}>
                <a role='button'
                   className={`dropdown-item ${optionLabel === this.props.selectedOptionLabel ? 'selected-option' : ''}`}
                   onClick={this.getCachedClickHandler(option, optionLabel)}>
                      { optionLabel }
                </a>
            </li>
        );
    }

    private toggleOpenState(newValue: boolean): void {
        this.setState({ open: newValue });
    }

    private checkIsArrayOfObjects(options: any[]): boolean {
        return options && (options[0] === Object(options[0]));
    }

    private getOptionLabelName(option: any): string {
        return this.state.isArrayOfObjects ? (option[this.props.labelKey!] || option[0]) : option;
    }

    // Generate and/or return a click handler, given a unique identifier.
    private getCachedClickHandler(option: any, key: any): any {
        // If no click handler exists for this unique identifier, create one.
        if (!Object.prototype.hasOwnProperty.call(this._clickHandlerCache, key)) {
            this._clickHandlerCache[key] = () => this.props.dispatchHandler(option);
        }
        return this._clickHandlerCache[key];
    }

    private handleClick: { (e: MouseEvent): void } = (e: MouseEvent) => {
        // Bound a mousedown event listener to the doc, and if the target is the button or immediate child, toggle open - otherwise set !open if open
        if (this._buttonRef.current && this._buttonRef.current.contains(e.target as HTMLElement)) {
            this.toggleOpenState(!this.state.open);
        } else if (this.state.open) {
            this.toggleOpenState(false);
        }
    }

    private keyDownHandler: React.KeyboardEventHandler<HTMLButtonElement> = (e) => {
        if (e.keyCode === 38 || e.keyCode === 40) { // up and down keys
            e.preventDefault();
            this.toggleOpenState(!this.state.open);
        } else if (e.keyCode === 27) { // Esc key
            this._buttonRef.current!.focus();
            this.toggleOpenState(false);
        } else if (e.keyCode === 9 && this.state.open) { // Tab key
            this.toggleOpenState(false);
        }
    }
}