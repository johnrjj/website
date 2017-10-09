import * as _ from 'lodash';
import * as React from 'react';
import {Link} from 'react-router-dom';
import {Styles} from 'ts/types';

const CUSTOM_DARK_GRAY = '#231F20';
const DEFAULT_STYLE = {
    color: CUSTOM_DARK_GRAY,
};

const styles: Styles = {
    primary: {
        borderRadius: 4,
        border: '2px solid rgb(230, 229, 229)',
        marginTop: 15,
        paddingLeft: 9,
        paddingRight: 9,
    },
};

interface TopBarMenuItemProps {
    title: string;
    path?: string;
    isPrimary?: boolean;
    style?: React.CSSProperties;
    className?: string;
}

interface TopBarMenuItemState {}

export class TopBarMenuItem extends React.Component<TopBarMenuItemProps, TopBarMenuItemState> {
    public static defaultProps: Partial<TopBarMenuItemProps> = {
        isPrimary: false,
        style: DEFAULT_STYLE,
        className: '',
    };
    public render() {
        const primaryStyles = this.props.isPrimary ? styles.primary : {};
        const linkColor = _.isUndefined(this.props.style.color) ?
            CUSTOM_DARK_GRAY :
            this.props.style.color;
        return (
            <div
                className={`center ${this.props.className}`}
                style={{...this.props.style, ...primaryStyles}}
            >
                <Link to={this.props.path} className="text-decoration-none" style={{color: linkColor}}>
                    {this.props.title}
                </Link>
            </div>
        );
    }
}
